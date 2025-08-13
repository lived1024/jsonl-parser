<template>
  <DefaultLayout>
    <PageLayout 
      title="학습 센터" 
      description="JSON과 JSONL 처리 기술을 향상시키는 튜토리얼과 가이드"
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
            :is-completed="isCompleted(tutorial.id)"
            :badge="isCompleted(tutorial.id) ? { text: '✓ 완료', type: 'success' } : undefined"
            :meta="[
              { 
                key: 'difficulty', 
                label: getDifficultyLabel(tutorial.difficulty),
                type: `difficulty-${tutorial.difficulty}`
              },
              { 
                key: 'duration', 
                label: `${tutorial.estimatedTime}분`,
                type: 'duration'
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import PageLayout from '../components/common/PageLayout.vue'
import FilterSidebar, { type FilterSection } from '../components/common/FilterSidebar.vue'
import ItemGrid from '../components/common/ItemGrid.vue'
import ItemCard from '../components/common/ItemCard.vue'
import SafeAdContainer from '../components/tools/SafeAdContainer.vue'
import { ContentService, type Tutorial } from '../services/ContentService'

const router = useRouter()
const contentService = ContentService.getInstance()

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
  lastAccessed: Date
}

const progress = ref<LearningProgress>({
  completedTutorials: [],
  lastAccessed: new Date()
})

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  await loadTutorials()
  loadProgress()
})

// 튜토리얼 로드
const loadTutorials = async () => {
  try {
    loading.value = true
    error.value = false
    tutorials.value = await contentService.getAllTutorials()
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
        ...parsed,
        lastAccessed: new Date(parsed.lastAccessed)
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

// 난이도 라벨 변환
const getDifficultyLabel = (difficulty: string): string => {
  const labels: Record<string, string> = {
    beginner: '초급',
    intermediate: '중급',
    advanced: '고급'
  }
  return labels[difficulty] || difficulty
}

// 튜토리얼 열기
const openTutorial = (tutorialId: string) => {
  // 마지막 접근 시간 업데이트
  progress.value.lastAccessed = new Date()
  saveProgress()
  
  router.push(`/learn/${tutorialId}`)
}

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