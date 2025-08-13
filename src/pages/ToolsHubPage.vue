<template>
  <DefaultLayout>
    <PageLayout 
      title="도구 모음" 
      description="JSON 처리를 위한 다양한 유틸리티와 변환 도구"
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
        placeholder="도구 검색..."
      />

      <ItemGrid
        :items="filteredTools"
        :loading="false"
        :error="false"
        empty-text="선택한 조건에 맞는 도구가 없습니다."
        reset-button-text="필터 초기화"
        :show-ad="true"
        :ad-after-index="2"
        :on-reset="resetFilters"
      >
        <template #item="{ item: tool }">
          <ItemCard
            :title="tool.name"
            :description="tool.description"
            :icon="tool.icon"
            :meta="[
              { 
                key: 'category', 
                label: getCategoryLabel(tool.category),
                type: `category-${tool.category}`
              }
            ]"
            @click="openTool(tool.id)"
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
import { CheckCircle, RefreshCw, AlignLeft, FileText } from 'lucide-vue-next'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import PageLayout from '../components/common/PageLayout.vue'
import FilterSidebar, { type FilterSection } from '../components/common/FilterSidebar.vue'
import SearchBar from '../components/common/SearchBar.vue'
import ItemGrid from '../components/common/ItemGrid.vue'
import ItemCard from '../components/common/ItemCard.vue'
import SafeAdContainer from '../components/tools/SafeAdContainer.vue'

interface Tool {
  id: string
  name: string
  description: string
  category: 'validation' | 'conversion' | 'formatting' | 'generation'
  icon: any
}

const router = useRouter()

const filters = ref({
  validation: true,
  conversion: true,
  formatting: true,
  generation: true
})

const searchQuery = ref('')

// 필터 섹션 정의
const filterSections: FilterSection[] = [
  {
    key: 'category',
    title: '카테고리',
    options: [
      { key: 'validation', label: '검증' },
      { key: 'conversion', label: '변환' },
      { key: 'formatting', label: '포맷팅' },
      { key: 'generation', label: '생성' }
    ]
  }
]

// Placeholder tools - will be replaced with actual tool components
const tools = ref<Tool[]>([
  {
    id: 'json-validator',
    name: 'JSON 검증기',
    description: '실시간 JSON 검증 및 오류 표시',
    category: 'validation',
    icon: CheckCircle
  },
  {
    id: 'data-converter',
    name: '데이터 변환기',
    description: 'JSON을 CSV, XML, YAML로 변환',
    category: 'conversion',
    icon: RefreshCw
  },
  {
    id: 'json-formatter',
    name: 'JSON 포맷터',
    description: 'JSON 압축 및 정리 도구',
    category: 'formatting',
    icon: AlignLeft
  },
  {
    id: 'schema-generator',
    name: '스키마 생성기',
    description: 'JSON 스키마 자동 생성',
    category: 'generation',
    icon: FileText
  }
])

const filteredTools = computed(() => {
  return tools.value.filter(tool => {
    const matchesCategory = filters.value[tool.category]
    const matchesSearch = searchQuery.value === '' || 
      tool.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    return matchesCategory && matchesSearch
  })
})

const getCategoryLabel = (category: string) => {
  const labels = {
    validation: '검증',
    conversion: '변환',
    formatting: '포맷팅',
    generation: '생성'
  }
  return labels[category as keyof typeof labels] || category
}

const openTool = (toolId: string) => {
  router.push(`/tools/${toolId}`)
}

// 필터 초기화
const resetFilters = () => {
  filters.value = {
    validation: true,
    conversion: true,
    formatting: true,
    generation: true
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