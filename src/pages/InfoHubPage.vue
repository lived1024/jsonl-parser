<template>
  <DefaultLayout>
    <PageLayout 
      title-key="pages.info.title"
      description-key="pages.info.description"
      :breadcrumbs="[
        { name: t('pages.info.title') }
      ]"
    >
      <template #sidebar>
        <FilterSidebar 
          v-model="filters"
          :filter-sections="filterSections"
        >
          <template #additional>
            <div class="search-section">
              <h3>검색</h3>
              <div class="search-box">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="가이드 검색..."
                  class="search-input"
                />
              </div>
            </div>
            
            <div class="stats-section">
              <h3>가이드 통계</h3>
              <div class="stats-grid">
                <div class="stat">
                  <span class="stat-number">{{ totalCount }}</span>
                  <span class="stat-label">전체</span>
                </div>
                <div class="stat">
                  <span class="stat-number">{{ categoryCount }}</span>
                  <span class="stat-label">카테고리</span>
                </div>
              </div>
              <div class="difficulty-breakdown">
                <div class="difficulty-item">
                  <span class="difficulty-dot beginner"></span>
                  <span class="difficulty-label">초급 {{ beginnerCount }}개</span>
                </div>
                <div class="difficulty-item">
                  <span class="difficulty-dot intermediate"></span>
                  <span class="difficulty-label">중급 {{ intermediateCount }}개</span>
                </div>
                <div class="difficulty-item">
                  <span class="difficulty-dot advanced"></span>
                  <span class="difficulty-label">고급 {{ advancedCount }}개</span>
                </div>
              </div>
            </div>
          </template>
        </FilterSidebar>
      </template>

      <template #default>
        <!-- 상단 광고 -->
        <SafeAdContainer 
          ad-slot="header-banner"
          ad-format="banner"
          class-name="header-ad"
        />

        <ItemGrid
          :items="filteredGuides"
          :loading="loading"
          :error="error"
          loading-text="가이드를 불러오는 중..."
          error-text="가이드를 불러오는 중 오류가 발생했습니다."
          empty-text="선택한 조건에 맞는 가이드가 없습니다."
          reset-button-text="필터 초기화"
          :show-ad="true"
          :ad-after-index="3"
          :on-retry="loadGuides"
          :on-reset="resetFilters"
        >
          <template #item="{ item: guide }">
            <ItemCard
              :title="guide.title"
              :description="guide.description"
              :icon="getGuideIcon(guide.id)"
              :meta="[
                { 
                  key: 'difficulty', 
                  label: getDifficultyLabel(guide.difficulty),
                  type: `difficulty-${guide.difficulty}`
                },
                { 
                  key: 'duration', 
                  label: `${guide.estimatedReadTime}분`,
                  type: 'duration'
                },
                { 
                  key: 'category', 
                  label: getCategoryLabel(guide.category),
                  type: `category-${guide.category}`
                }
              ]"
              @click="navigateToGuide(guide.id)"
            />
          </template>

          <template #ad>
            <SafeAdContainer 
              ad-slot="content-rectangle"
              ad-format="rectangle"
              class-name="content-ad"
            />
          </template>
        </ItemGrid>


      </template>
    </PageLayout>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../composables/useI18n'
import { 
  BookOpen, 
  FileText, 
  Settings, 
  Database, 
  Zap, 
  Shield, 
  Layers,
  Code,
  GitBranch,
  HardDrive,
  Globe,
  Users,
  TrendingUp
} from 'lucide-vue-next'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import PageLayout from '../components/common/PageLayout.vue'
import FilterSidebar, { type FilterSection } from '../components/common/FilterSidebar.vue'
import ItemGrid from '../components/common/ItemGrid.vue'
import ItemCard from '../components/common/ItemCard.vue'
import SafeAdContainer from '../components/tools/SafeAdContainer.vue'
import { ContentService, type GuideContent } from '../services/ContentService'

interface GuideInfo {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedReadTime: number
  lastUpdated: Date
  tags: string[]
  relatedTools?: string[]
}



const router = useRouter()
const contentService = ContentService.getInstance()
const { t } = useI18n()

// 상태 관리
const guides = ref<GuideInfo[]>([])
const loading = ref(true)
const error = ref(false)
const searchQuery = ref('')

// 필터 상태
const filters = ref({
  // 카테고리 필터
  'getting-started': true,
  'api-development': true,
  'data-processing': true,
  'performance': true,
  // 난이도 필터
  beginner: true,
  intermediate: true,
  advanced: true
})

// 필터 섹션 정의
const filterSections: FilterSection[] = [
  {
    key: 'category',
    title: '카테고리',
    options: [
      { key: 'getting-started', label: '시작하기' },
      { key: 'api-development', label: 'API 개발' },
      { key: 'data-processing', label: '데이터 처리' },
      { key: 'performance', label: '성능 최적화' }
    ]
  },
  {
    key: 'difficulty',
    title: '난이도',
    options: [
      { key: 'beginner', label: '초급' },
      { key: 'intermediate', label: '중급' },
      { key: 'advanced', label: '고급' }
    ]
  }
]

// 관련 도구 정의
const relatedTools: RelatedTool[] = [
  { 
    id: 'json-validator', 
    name: 'JSON 검증기',
    description: 'JSON 구문과 구조를 검증합니다',
    icon: Shield 
  },
  { 
    id: 'data-converter', 
    name: '데이터 변환기',
    description: 'JSON을 다양한 형식으로 변환합니다',
    icon: Settings 
  },
  { 
    id: 'schema-generator', 
    name: '스키마 생성기',
    description: 'JSON 스키마를 자동으로 생성합니다',
    icon: Database 
  },
  { 
    id: 'api-tester', 
    name: 'API 테스터',
    description: 'REST API를 테스트하고 검증합니다',
    icon: Globe 
  }
]

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  await loadGuides()
})

// 가이드 로드
const loadGuides = async () => {
  try {
    loading.value = true
    error.value = false
    
    // ContentService에서 튜토리얼 데이터를 가이드로 사용 (학습 센터와 동일한 데이터)
    const tutorials = await contentService.getTutorials()
    guides.value = tutorials.map(tutorial => ({
      id: tutorial.id,
      title: tutorial.title,
      description: tutorial.description,
      category: tutorial.category,
      difficulty: tutorial.difficulty,
      estimatedReadTime: tutorial.estimatedReadTime,
      lastUpdated: tutorial.lastUpdated,
      tags: tutorial.tags,
      relatedTools: [] // 기본값
    }))
  } catch (err) {
    console.error('Failed to load guides:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

// 필터링된 가이드
const filteredGuides = computed(() => {
  let filtered = guides.value

  // 카테고리 필터 적용
  const selectedCategories = Object.keys(filters.value)
    .filter(key => key.includes('-') && filters.value[key as keyof typeof filters.value])
  
  if (selectedCategories.length > 0) {
    filtered = filtered.filter(guide => selectedCategories.includes(guide.category))
  }

  // 난이도 필터 적용
  const selectedDifficulties = ['beginner', 'intermediate', 'advanced']
    .filter(difficulty => filters.value[difficulty as keyof typeof filters.value])
  
  if (selectedDifficulties.length > 0) {
    filtered = filtered.filter(guide => selectedDifficulties.includes(guide.difficulty))
  }

  // 검색 필터 적용
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(guide => 
      guide.title.toLowerCase().includes(query) ||
      guide.description.toLowerCase().includes(query) ||
      guide.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  return filtered
})

// 통계 계산
const totalCount = computed(() => guides.value.length)
const categoryCount = computed(() => {
  const categories = new Set(guides.value.map(guide => guide.category))
  return categories.size
})
const beginnerCount = computed(() => guides.value.filter(guide => guide.difficulty === 'beginner').length)
const intermediateCount = computed(() => guides.value.filter(guide => guide.difficulty === 'intermediate').length)
const advancedCount = computed(() => guides.value.filter(guide => guide.difficulty === 'advanced').length)

// 카테고리 라벨 변환
const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    'getting-started': '시작하기',
    'api-development': 'API 개발',
    'data-processing': '데이터 처리',
    'performance': '성능 최적화'
  }
  return labels[category] || category
}

// 난이도 라벨 변환
const getDifficultyLabel = (difficulty: string): string => {
  const labels: Record<string, string> = {
    beginner: '초급',
    intermediate: '중급',
    advanced: '고급'
  }
  return labels[difficulty] || difficulty
}

// 가이드 아이콘 매핑
const getGuideIcon = (guideId: string) => {
  const iconMap: Record<string, any> = {
    'json-basics': BookOpen,
    'jsonl-introduction': FileText,
    'parser-overview': Settings,
    'rest-api-design': Globe,
    'json-schema-guide': Shield,
    'api-versioning': GitBranch,
    'large-datasets': Database,
    'data-transformation': Layers,
    'error-handling': Shield,
    'optimization-tips': Zap,
    'caching-strategies': HardDrive,
    'graphql-vs-rest': Code,
    'microservices-api': Users,
    'api-security': Shield,
    'performance-monitoring': TrendingUp
  }
  return iconMap[guideId] || BookOpen
}

// 날짜 포맷팅
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

// 가이드로 이동
const navigateToGuide = (guideId: string) => {
  router.push(`/info/${guideId}`)
}

// 필터 초기화
const resetFilters = () => {
  filters.value = {
    'getting-started': true,
    'api-development': true,
    'data-processing': true,
    'performance': true,
    beginner: true,
    intermediate: true,
    advanced: true
  }
  searchQuery.value = ''
}
</script>

<style scoped>
/* 검색 섹션 */
.search-section {
  border-top: 1px solid var(--color-border);
  padding-top: 1.5rem;
}

.search-section h3 {
  margin-bottom: 1rem;
  color: var(--color-text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.search-box {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.search-input::placeholder {
  color: var(--color-text-secondary);
}

/* 통계 섹션 */
.stats-section {
  border-top: 1px solid var(--color-border);
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

.stats-section h3 {
  margin-bottom: 1rem;
  color: var(--color-text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.stats-grid {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-primary);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.difficulty-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.difficulty-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.difficulty-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.difficulty-dot.beginner {
  background: #2d5a2d;
}

.difficulty-dot.intermediate {
  background: #856404;
}

.difficulty-dot.advanced {
  background: #721c24;
}

.difficulty-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

/* 광고 스타일 */
.header-ad {
  margin: 2rem 0;
  padding: 1rem;
  background: var(--color-background-secondary);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.content-ad {
  grid-column: 1 / -1;
  margin: 2rem 0;
  display: flex;
  justify-content: center;
}

/* 가이드 태그 스타일 */
.guide-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.tag {
  padding: 0.25rem 0.5rem;
  background: var(--color-background-tertiary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.tag-more {
  padding: 0.25rem 0.5rem;
  background: var(--color-primary);
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}



/* 메타 정보 스타일 개선 */
:deep(.card-meta) {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

:deep(.meta-item) {
  padding: 0.4rem 0.8rem !important;
  border-radius: 16px !important;
  font-size: 0.85rem !important;
  font-weight: 600 !important;
  display: inline-block !important;
  white-space: nowrap !important;
  flex-shrink: 0 !important;
  min-width: fit-content !important;
  width: auto !important;
  max-width: none !important;
}

/* 카테고리별 색상 */
:deep(.meta-item.category-getting-started) {
  background: #e8f5e8 !important;
  color: #2d5a2d !important;
  border-color: #c3e6cb !important;
}

:deep(.meta-item.category-api-development) {
  background: #e3f2fd !important;
  color: #1565c0 !important;
  border-color: #bbdefb !important;
}

:deep(.meta-item.category-data-processing) {
  background: #f3e5f5 !important;
  color: #7b1fa2 !important;
  border-color: #e1bee7 !important;
}

:deep(.meta-item.category-performance) {
  background: #fff3e0 !important;
  color: #ef6c00 !important;
  border-color: #ffcc02 !important;
}

/* 난이도별 색상 */
:deep(.meta-item.difficulty-beginner) {
  background: #e8f5e8 !important;
  color: #2d5a2d !important;
  border-color: #c3e6cb !important;
}

:deep(.meta-item.difficulty-intermediate) {
  background: #fff3cd !important;
  color: #856404 !important;
  border-color: #ffeaa7 !important;
}

:deep(.meta-item.difficulty-advanced) {
  background: #f8d7da !important;
  color: #721c24 !important;
  border-color: #f5c6cb !important;
}

/* 기타 메타 정보 스타일 */
:deep(.meta-item.duration) {
  background: var(--color-background-tertiary) !important;
  color: var(--color-text-secondary) !important;
  border-color: var(--color-border) !important;
}

:deep(.meta-item.updated) {
  background: var(--color-background-tertiary) !important;
  color: var(--color-text-secondary) !important;
  border-color: var(--color-border) !important;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .header-ad {
    margin: 1rem 0;
    padding: 0.5rem;
  }
  
  .content-ad {
    margin: 1rem 0;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
  }
  
  .tool-card {
    padding: 1rem;
  }
  
  .tool-icon {
    width: 2rem;
    height: 2rem;
  }
}
</style>