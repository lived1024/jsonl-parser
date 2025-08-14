<template>
  <DefaultLayout>
    <PageLayout 
      title="샘플 데이터 라이브러리" 
      description="다양한 실제 사용 사례의 JSON/JSONL 샘플 데이터를 탐색하고 파서에서 바로 테스트해보세요."
    >
    <template #sidebar>
      <FilterSidebar 
        v-model="filters"
        :filter-sections="filterSections"
      >
        <template #additional>
          <SearchBar 
            v-model="searchQuery"
            placeholder="샘플 검색..."
          />
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
        :items="filteredSamples"
        :loading="loading"
        :error="error"
        loading-text="샘플 데이터를 불러오는 중..."
        error-text="샘플 데이터를 불러오는 중 오류가 발생했습니다."
        empty-text="선택한 조건에 맞는 샘플이 없습니다."
        reset-button-text="필터 초기화"
        :show-ad="true"
        :ad-after-index="2"
        :on-retry="loadSamples"
        :on-reset="resetFilters"
      >
        <template #item="{ item: sample }">
          <ItemCard
            :title="sample.name"
            :description="sample.description"
            :icon="getSampleIcon(sample.category)"
            :meta="[
              { 
                key: 'category', 
                label: getCategoryLabel(sample.category),
                type: `category-${sample.category}`
              },
              { 
                key: 'difficulty', 
                label: getDifficultyLabel(sample.difficulty),
                type: `difficulty-${sample.difficulty}`
              },
              { 
                key: 'size', 
                label: getSizeLabel(sample.size),
                type: `size-${sample.size}`
              }
            ]"
            @click="previewSample(sample)"
          >
            <template #actions>
              <button 
                class="btn btn--primary"
                @click.stop="loadInParser(sample)"
              >
                파서에 로드
              </button>
              <button 
                class="btn btn--secondary"
                @click.stop="previewSample(sample)"
              >
                미리보기
              </button>
            </template>
          </ItemCard>
        </template>

        <template #ad>
          <SafeAdContainer 
            ad-slot="content-rectangle"
            ad-format="rectangle"
            class-name="content-ad"
          />
        </template>
      </ItemGrid>

      <!-- 샘플 미리보기 모달 -->
      <Teleport to="body">
        <div v-if="selectedSample" class="modal-overlay" @click="closePreview">
          <div class="modal" @click.stop>
            <SampleDataViewer
              :sample="selectedSample"
              @load-in-parser="loadInParser"
              @close="closePreview"
            />
          </div>
        </div>
      </Teleport>
    </template>
    </PageLayout>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, Teleport } from 'vue'
import { useRouter } from 'vue-router'
import { Database, Settings, FileText, Layers } from 'lucide-vue-next'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import PageLayout from '../components/common/PageLayout.vue'
import FilterSidebar, { type FilterSection } from '../components/common/FilterSidebar.vue'
import SearchBar from '../components/common/SearchBar.vue'
import ItemGrid from '../components/common/ItemGrid.vue'
import ItemCard from '../components/common/ItemCard.vue'
import SafeAdContainer from '../components/tools/SafeAdContainer.vue'
import SampleDataViewer from '../components/feature/SampleDataViewer.vue'
import { useSampleLibraryStore } from '../stores/sampleLibraryStore'
import type { SampleData } from '../types'

const router = useRouter()
const sampleStore = useSampleLibraryStore()

// 상태 관리
const loading = ref(true)
const error = ref(false)
const searchQuery = ref('')
const selectedSample = ref<SampleData | null>(null)

// 필터 상태
const filters = ref({
  // 카테고리 필터
  api: true,
  config: true,
  data: true,
  complex: true,
  // 복잡도 필터
  simple: true,
  medium: true,
  complex_difficulty: true,
  // 크기 필터
  small: true,
  medium_size: true,
  large: true
})

// 필터 섹션 정의
const filterSections: FilterSection[] = [
  {
    key: 'category',
    title: '카테고리',
    options: [
      { key: 'api', label: 'API 응답' },
      { key: 'config', label: '설정 파일' },
      { key: 'data', label: '데이터 내보내기' },
      { key: 'complex', label: '복잡한 구조' }
    ]
  },
  {
    key: 'difficulty',
    title: '복잡도',
    options: [
      { key: 'simple', label: '간단' },
      { key: 'medium', label: '보통' },
      { key: 'complex_difficulty', label: '복잡' }
    ]
  },
  {
    key: 'size',
    title: '크기',
    options: [
      { key: 'small', label: '작음' },
      { key: 'medium_size', label: '보통' },
      { key: 'large', label: '큼' }
    ]
  }
]

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  await loadSamples()
})

// 샘플 로드
const loadSamples = async () => {
  try {
    loading.value = true
    error.value = false
    await sampleStore.loadSamples()
  } catch (err) {
    console.error('Failed to load samples:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

// 필터링된 샘플
const filteredSamples = computed(() => {
  return sampleStore.samples.filter(sample => {
    // 카테고리 필터
    const categoryMatch = filters.value[sample.category as keyof typeof filters.value]
    
    // 복잡도 필터 (difficulty와 complex_difficulty 매핑)
    const difficultyKey = sample.difficulty === 'complex' ? 'complex_difficulty' : sample.difficulty
    const difficultyMatch = filters.value[difficultyKey as keyof typeof filters.value]
    
    // 크기 필터 (medium과 medium_size 매핑)
    const sizeKey = sample.size === 'medium' ? 'medium_size' : sample.size
    const sizeMatch = filters.value[sizeKey as keyof typeof filters.value]
    
    // 검색 필터
    const searchMatch = searchQuery.value === '' || 
      sample.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      sample.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    return categoryMatch && difficultyMatch && sizeMatch && searchMatch
  })
})

// 샘플 아이콘 매핑
const getSampleIcon = (category: string) => {
  const iconMap: Record<string, any> = {
    api: Database,
    config: Settings,
    data: FileText,
    complex: Layers
  }
  return iconMap[category] || FileText
}

// 라벨 변환 함수들
const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    api: 'API 응답',
    config: '설정 파일',
    data: '데이터 내보내기',
    complex: '복잡한 구조'
  }
  return labels[category] || category
}

const getDifficultyLabel = (difficulty: string): string => {
  const labels: Record<string, string> = {
    simple: '간단',
    medium: '보통',
    complex: '복잡'
  }
  return labels[difficulty] || difficulty
}

const getSizeLabel = (size: string): string => {
  const labels: Record<string, string> = {
    small: '작음',
    medium: '보통',
    large: '큼'
  }
  return labels[size] || size
}

// 샘플 관련 메서드
const previewSample = (sample: SampleData) => {
  selectedSample.value = sample
}

const closePreview = () => {
  selectedSample.value = null
}

const loadInParser = (sample: SampleData) => {
  sampleStore.loadSampleInParser(sample)
  router.push('/')
  closePreview()
}

// 필터 초기화
const resetFilters = () => {
  filters.value = {
    api: true,
    config: true,
    data: true,
    complex: true,
    simple: true,
    medium: true,
    complex_difficulty: true,
    small: true,
    medium_size: true,
    large: true
  }
}
</script>

<style scoped>
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

/* 버튼 스타일 */
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn--primary {
  background: var(--color-primary);
  color: white;
}

.btn--primary:hover {
  background: #2563eb;
}

.btn--secondary {
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn--secondary:hover {
  background: var(--color-background-tertiary);
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.modal {
  background: var(--color-background-primary, #ffffff);
  border-radius: 12px;
  max-width: 1000px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  border: 1px solid var(--color-border, #e5e7eb);
  animation: modalFadeIn 0.2s ease-out;
  position: relative;
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .modal {
    background: var(--color-background-primary, #1f2937);
    border: 1px solid var(--color-border, #374151);
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.05);
  }
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
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

  .modal-overlay {
    padding: 0.5rem;
  }

  .modal {
    max-height: calc(100vh - 1rem);
    max-width: calc(100vw - 1rem);
    border-radius: 8px;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 0.25rem;
  }

  .modal {
    max-height: calc(100vh - 0.5rem);
    max-width: calc(100vw - 0.5rem);
    border-radius: 6px;
  }
}
</style>