<template>
  <DefaultLayout>
    <PageLayout 
      title-key="pages.learn.title"
      description-key="pages.learn.description"
      :breadcrumbs="[
        { name: t('pages.learn.title') }
      ]"
    >
    <template #sidebar>
      <FilterSidebar 
        v-model="filters"
        :filter-sections="filterSections"
      >
        <template #additional>
          <div class="progress-section">
            <h3>학습 진행률</h3>
            <div class="progress-stats">
              <div class="stat">
                <span class="stat-number">{{ completedCount }}</span>
                <span class="stat-label">완료</span>
              </div>
              <div class="stat">
                <span class="stat-number">{{ totalCount }}</span>
                <span class="stat-label">전체</span>
              </div>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: progressPercentage + '%' }"
              ></div>
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
        :items="filteredTutorials"
        :loading="loading"
        :error="error"
        loading-text="튜토리얼을 불러오는 중..."
        error-text="튜토리얼을 불러오는 중 오류가 발생했습니다."
        empty-text="선택한 조건에 맞는 튜토리얼이 없습니다."
        reset-button-text="필터 초기화"
        :show-ad="true"
        :ad-after-index="2"
        :on-retry="loadTutorials"
        :on-reset="resetFilters"
      >
        <template #item="{ item: tutorial }">
          <ItemCard
            :title="tutorial.title"
            :description="tutorial.description"
            :icon="getTutorialIcon(tutorial.id)"
            :is-completed="isCompleted(tutorial.id)"
            :badge="getBadgeForTutorial(tutorial.id)"
            :meta="[
              { 
                key: 'difficulty', 
                label: getDifficultyLabel(tutorial.difficulty),
                type: `difficulty-${tutorial.difficulty}`
              },
              { 
                key: 'duration', 
                label: `${tutorial.estimatedReadTime}분`,
                type: 'duration'
              },
              { 
                key: 'progress', 
                label: getProgressLabel(tutorial.id),
                type: getProgressType(tutorial.id)
              }
            ]"
            @click="openTutorial(tutorial.id)"
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
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
  HardDrive
} from 'lucide-vue-next'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import PageLayout from '../components/common/PageLayout.vue'
import FilterSidebar, { type FilterSection } from '../components/common/FilterSidebar.vue'
import ItemGrid from '../components/common/ItemGrid.vue'
import ItemCard from '../components/common/ItemCard.vue'
import SafeAdContainer from '../components/tools/SafeAdContainer.vue'
import { ContentService, type Tutorial } from '../services/ContentService'
import { useSEO } from '../composables/useSEO'
import { useI18n } from '../composables/useI18n'

const router = useRouter()
const contentService = ContentService.getInstance()
const { t } = useI18n()

// SEO 메타데이터 설정
const { generateBreadcrumbStructuredData, setMetadata } = useSEO({
  title: t('seo.learn.title'),
  description: t('seo.learn.description'),
  keywords: ['JSON', 'JSONL', 'tutorial', 'learning', 'guide', 'education', 'developer', 'training'],
  ogType: 'website'
})

// 상태 관리
const tutorials = ref<Tutorial[]>([])
const loading = ref(true)
const error = ref(false)

// 필터 상태
const filters = ref({
  // 난이도 필터
  beginner: true,
  intermediate: true,
  advanced: true,
  // 카테고리 필터
  basics: true,
  parsing: true,
  validation: true,
  advanced_topics: true
})

// 필터 섹션 정의
const filterSections: FilterSection[] = [
  {
    key: 'difficulty',
    title: '난이도',
    options: [
      { key: 'beginner', label: '초급' },
      { key: 'intermediate', label: '중급' },
      { key: 'advanced', label: '고급' }
    ]
  },
  {
    key: 'category',
    title: '카테고리',
    options: [
      { key: 'basics', label: '기초' },
      { key: 'parsing', label: '파싱' },
      { key: 'validation', label: '검증' },
      { key: 'advanced_topics', label: '고급 주제' }
    ]
  }
]

// 학습 진행 상황 (localStorage에서 관리)
const PROGRESS_KEY = 'jsonl-parser-learning-progress'

interface LearningProgress {
  completedTutorials: string[]
  tutorialProgress: Record<string, number>
  lastAccessed: Date
}

const progress = ref<LearningProgress>({
  completedTutorials: [],
  tutorialProgress: {},
  lastAccessed: new Date()
})

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  // Structured data 설정
  const structuredData = generateBreadcrumbStructuredData([
    { name: t('breadcrumb.home'), url: '/' },
    { name: t('pages.learn.title'), url: '/learn' }
  ])
  
  setMetadata({
    title: t('seo.learn.title'),
    description: t('seo.learn.description'),
    structuredData
  })
  
  await loadTutorials()
  loadProgress()
  
  // localStorage 변경 감지 (다른 탭에서 진행률 업데이트 시)
  window.addEventListener('storage', handleStorageChange)
  
  // 같은 탭에서 진행률 업데이트 감지를 위한 주기적 체크
  const progressCheckInterval = setInterval(() => {
    loadProgress()
  }, 2000) // 2초마다 체크
  
  // 컴포넌트 언마운트 시 정리
  onUnmounted(() => {
    window.removeEventListener('storage', handleStorageChange)
    clearInterval(progressCheckInterval)
  })
})

// localStorage 변경 처리
const handleStorageChange = (event: StorageEvent) => {
  if (event.key === PROGRESS_KEY) {
    loadProgress()
  }
}

// 튜토리얼 로드
const loadTutorials = async () => {
  try {
    loading.value = true
    error.value = false
    tutorials.value = await contentService.getTutorials()
  } catch (err) {
    console.error('Failed to load tutorials:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

// 진행 상황 로드
const loadProgress = () => {
  try {
    const saved = localStorage.getItem(PROGRESS_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      progress.value = {
        completedTutorials: parsed.completedTutorials || [],
        tutorialProgress: parsed.tutorialProgress || {},
        lastAccessed: new Date(parsed.lastAccessed || Date.now())
      }
    }
  } catch (err) {
    console.error('Failed to load progress:', err)
  }
}

// 진행 상황 저장
const saveProgress = () => {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress.value))
  } catch (err) {
    console.error('Failed to save progress:', err)
  }
}

// 카테고리 매핑 (실제 구현에서는 튜토리얼 메타데이터에서 가져올 수 있음)
const getCategoryForTutorial = (tutorialId: string): string => {
  const categoryMap: Record<string, string> = {
    'json-basics': 'basics',
    'jsonl-introduction': 'basics',
    'json-parsing-advanced': 'parsing',
    'json-validation': 'validation',
    'performance-optimization': 'advanced_topics'
  }
  return categoryMap[tutorialId] || 'basics'
}

// 필터링된 튜토리얼
const filteredTutorials = computed(() => {
  return tutorials.value.filter(tutorial => {
    // 난이도 필터
    const difficultyMatch = filters.value[tutorial.difficulty]
    
    // 카테고리 필터
    const category = getCategoryForTutorial(tutorial.id)
    const categoryMatch = filters.value[category as keyof typeof filters.value]
    
    return difficultyMatch && categoryMatch
  })
})

// 진행률 계산
const completedCount = computed(() => progress.value.completedTutorials.length)
const totalCount = computed(() => tutorials.value.length)
const progressPercentage = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((completedCount.value / totalCount.value) * 100)
})

// 완료 상태 확인
const isCompleted = (tutorialId: string): boolean => {
  return progress.value.completedTutorials.includes(tutorialId)
}

// 진행률 라벨 생성
const getProgressLabel = (tutorialId: string): string => {
  if (isCompleted(tutorialId)) {
    return '완료'
  }
  
  const progressPercent = progress.value.tutorialProgress[tutorialId] || 0
  if (progressPercent > 0) {
    return `${Math.round(progressPercent)}%`
  }
  
  return '시작 전'
}

// 진행률 타입 생성
const getProgressType = (tutorialId: string): string => {
  if (isCompleted(tutorialId)) {
    return 'progress-completed'
  }
  
  const progressPercent = progress.value.tutorialProgress[tutorialId] || 0
  if (progressPercent > 0) {
    return 'progress-in-progress'
  }
  
  return 'progress-not-started'
}

// 배지 정보 생성
const getBadgeForTutorial = (tutorialId: string) => {
  if (isCompleted(tutorialId)) {
    return { text: '✓ 완료', type: 'success' }
  }
  
  const progressPercent = progress.value.tutorialProgress[tutorialId] || 0
  if (progressPercent > 0) {
    return { text: `${Math.round(progressPercent)}%`, type: 'progress' }
  }
  
  return undefined
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

// 튜토리얼 아이콘 매핑
const getTutorialIcon = (tutorialId: string) => {
  const iconMap: Record<string, any> = {
    'json-basics': BookOpen,
    'jsonl-introduction': FileText,
    'parser-overview': Settings,
    'rest-api-design': Code,
    'json-schema-guide': Shield,
    'api-versioning': GitBranch,
    'large-datasets': Database,
    'data-transformation': Layers,
    'error-handling': Shield,
    'optimization-tips': Zap,
    'caching-strategies': HardDrive
  }
  return iconMap[tutorialId] || BookOpen
}

// 튜토리얼 열기
const openTutorial = (tutorialId: string) => {
  // 마지막 접근 시간 업데이트
  progress.value.lastAccessed = new Date()
  saveProgress()
  
  router.push(`/learn/${tutorialId}`)
}

// 튜토리얼 완료 처리
const handleTutorialComplete = (tutorialId: string) => {
  if (!progress.value.completedTutorials.includes(tutorialId)) {
    progress.value.completedTutorials.push(tutorialId)
    saveProgress()
  }
}

// 튜토리얼 진행률 업데이트 처리
const handleTutorialProgress = (tutorialId: string, progressPercent: number) => {
  if (!progress.value.tutorialProgress) {
    progress.value.tutorialProgress = {}
  }
  progress.value.tutorialProgress[tutorialId] = progressPercent
  
  // 90% 이상 진행 시 자동으로 완료 처리
  if (progressPercent >= 90 && !progress.value.completedTutorials.includes(tutorialId)) {
    handleTutorialComplete(tutorialId)
  }
  
  saveProgress()
}

// 사용하지 않는 import 제거를 위한 참조
console.log('Unused imports:', handleTutorialProgress)

// 필터 초기화
const resetFilters = () => {
  filters.value = {
    beginner: true,
    intermediate: true,
    advanced: true,
    basics: true,
    parsing: true,
    validation: true,
    advanced_topics: true
  }
}
</script>

<style scoped>
/* 진행률 섹션 */
.progress-section {
  border-top: 1px solid var(--color-border);
  padding-top: 1.5rem;
}

.progress-section h3 {
  margin-bottom: 1rem;
  color: var(--color-text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.progress-stats {
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

.progress-bar {
  height: 8px;
  background: var(--color-background-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  transition: width 0.3s ease;
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

/* 메타 정보 버튼 스타일 개선 */
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

/* 난이도별 색상 - TutorialViewer와 동일한 스타일 */
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

/* 시간 표시 스타일 */
:deep(.meta-item.duration) {
  background: var(--color-background-tertiary) !important;
  color: var(--color-text-secondary) !important;
  border-color: var(--color-border) !important;
}

/* 진행률 상태별 스타일 */
:deep(.meta-item.progress-completed) {
  background: var(--color-success) !important;
  color: white !important;
  border-color: var(--color-success) !important;
  min-width: 50px !important;
  text-align: center !important;
}

:deep(.meta-item.progress-in-progress) {
  background: #f3e5f5 !important;
  color: #6a1b9a !important;
  border-color: #ce93d8 !important;
  min-width: 50px !important;
  text-align: center !important;
}

:deep(.meta-item.progress-not-started) {
  background: var(--color-background-tertiary) !important;
  color: var(--color-text-secondary) !important;
  border-color: var(--color-border) !important;
  min-width: 60px !important;
  text-align: center !important;
  padding: 0.25rem 0.5rem !important;
}

/* 배지 스타일 */
:deep(.badge.progress) {
  background: #9C27B0;
  color: white;
}

:deep(.badge.success) {
  background: #4CAF50;
  color: white;
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
  
  .progress-stats {
    gap: 1rem;
  }
}
</style>