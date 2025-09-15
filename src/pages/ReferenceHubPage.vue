<template>
  <DefaultLayout>
    <PageLayout 
      title-key="pages.reference.title"
      description-key="pages.reference.description"
      :breadcrumbs="[
        { name: t('pages.reference.title') }
      ]"
    >
    <template #sidebar>
      <FilterSidebar 
        v-model="filters"
        :filter-sections="filterSections"
      />
    </template>

    <template #default>
      <!-- 상단 광고 -->
      <SafeAdContainer 
        ad-slot="header-banner"
        ad-format="banner"
        class-name="header-ad"
      />
      
      <!-- 검색 기능 -->
      <SearchBar 
        v-model="searchQuery"
        placeholder="참조 자료 검색..."
      />

      <ItemGrid
        :items="filteredReferences"
        :loading="false"
        :error="false"
        empty-text="선택한 조건에 맞는 참조 자료가 없습니다."
        reset-button-text="필터 초기화"
        :show-ad="true"
        :ad-after-index="2"
        :on-reset="resetFilters"
      >
        <template #item="{ item: reference }">
          <ItemCard
            :title="reference.name"
            :description="reference.description"
            :icon="reference.icon"
            :meta="[
              { 
                key: 'category', 
                label: getCategoryLabel(reference.category),
                type: `category-${reference.category}`
              }
            ]"
            @click="openReference(reference.id)"
          />
        </template>

        <template #ad>
          <SafeAdContainer 
            ad-slot="content-rectangle"
            ad-format="rectangle"
            class-name="content-ad-card"
          />
        </template>
      </ItemGrid>
    </template>
    </PageLayout>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../composables/useI18n'
import { BookOpen, AlertTriangle, Zap, FileText } from 'lucide-vue-next'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import PageLayout from '../components/common/PageLayout.vue'
import FilterSidebar, { type FilterSection } from '../components/common/FilterSidebar.vue'
import SearchBar from '../components/common/SearchBar.vue'
import ItemGrid from '../components/common/ItemGrid.vue'
import ItemCard from '../components/common/ItemCard.vue'
import SafeAdContainer from '../components/tools/SafeAdContainer.vue'

interface Reference {
  id: string
  name: string
  description: string
  category: 'cheatsheet' | 'troubleshooting' | 'performance' | 'guide'
  icon: any
}

const router = useRouter()
const { t } = useI18n()

const filters = ref({
  cheatsheet: true,
  troubleshooting: true,
  performance: true,
  guide: true
})

const searchQuery = ref('')

// 필터 섹션 정의
const filterSections: FilterSection[] = [
  {
    key: 'category',
    title: '카테고리',
    options: [
      { key: 'cheatsheet', label: '치트시트' },
      { key: 'troubleshooting', label: '문제 해결' },
      { key: 'performance', label: '성능 최적화' },
      { key: 'guide', label: '가이드' }
    ]
  }
]

// 참조 자료 목록
const references = ref<Reference[]>([
  {
    id: 'json-cheatsheet',
    name: 'JSON 치트시트',
    description: '대화형 JSON 구문 참조 및 예제',
    category: 'cheatsheet',
    icon: BookOpen
  },
  {
    id: 'error-guide',
    name: '오류 해결 가이드',
    description: '일반적인 JSON 오류와 해결책',
    category: 'troubleshooting',
    icon: AlertTriangle
  },
  {
    id: 'performance-guide',
    name: '성능 최적화 가이드',
    description: 'JSON 처리 모범 사례 및 최적화 팁',
    category: 'performance',
    icon: Zap
  },
  {
    id: 'api-guide',
    name: 'API 설계 가이드',
    description: 'RESTful API JSON 응답 설계 가이드',
    category: 'guide',
    icon: FileText
  }
])

const filteredReferences = computed(() => {
  return references.value.filter(reference => {
    const matchesCategory = filters.value[reference.category]
    const matchesSearch = searchQuery.value === '' || 
      reference.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      reference.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    return matchesCategory && matchesSearch
  })
})

const getCategoryLabel = (category: string) => {
  const labels = {
    cheatsheet: '치트시트',
    troubleshooting: '문제 해결',
    performance: '성능 최적화',
    guide: '가이드'
  }
  return labels[category as keyof typeof labels] || category
}

const openReference = (referenceId: string) => {
  router.push(`/reference/${referenceId}`)
}

// 필터 초기화
const resetFilters = () => {
  filters.value = {
    cheatsheet: true,
    troubleshooting: true,
    performance: true,
    guide: true
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

.content-ad-card {
  background: var(--color-background-secondary);
  padding: 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 250px;
  border: 1px solid var(--color-border);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .header-ad {
    margin: 1rem 0;
    padding: 0.5rem;
  }
  
  .content-ad-card {
    margin: 1rem 0;
    padding: 1rem;
    min-height: 200px;
  }
}
</style>