<template>
  <DefaultLayout>
    <PageLayout 
      title="샘플 데이터 라이브러리" 
      description="다양한 실제 사용 사례의 JSON/JSONL 샘플 데이터 컬렉션"
    >
    <template #sidebar>
      <FilterSidebar 
        v-model="allFilters"
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

      <ItemGrid
        :items="filteredSamples"
        :loading="false"
        :error="false"
        empty-text="선택한 조건에 맞는 샘플이 없습니다."
        reset-button-text="필터 초기화"
        :show-ad="true"
        :ad-after-index="0"
        :on-reset="resetFilters"
      >
        <template #item="{ item: sample }">
          <div class="sample-card">
            <div class="sample-header">
              <h3>{{ sample.name }}</h3>
              <div class="sample-badges">
                <span class="category-badge" :class="sample.category">
                  {{ getCategoryLabel(sample.category) }}
                </span>
                <span class="complexity-badge" :class="sample.difficulty">
                  {{ sample.difficulty }}
                </span>
              </div>
            </div>
            
            <p class="sample-description">{{ sample.description }}</p>
            
            <div class="sample-meta">
              <div class="meta-item">
                <strong>사용 사례:</strong> {{ sample.metadata.useCase }}
              </div>
              <div class="meta-item">
                <strong>특징:</strong> {{ sample.metadata.features.join(', ') }}
              </div>
            </div>
            
            <div class="sample-preview">
              <pre><code>{{ getPreview(sample.data) }}</code></pre>
            </div>
            
            <div class="sample-actions">
              <button @click="loadIntoParser(sample)" class="btn-primary">
                파서에 로드
              </button>
              <button @click="viewFullSample(sample)" class="btn-secondary">
                전체 보기
              </button>
            </div>
          </div>
        </template>

        <template #ad>
          <SafeAdContainer 
            ad-slot="content-rectangle"
            ad-format="rectangle"
            class-name="content-ad-sample"
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
import DefaultLayout from '../layouts/DefaultLayout.vue'
import PageLayout from '../components/common/PageLayout.vue'
import FilterSidebar, { type FilterSection } from '../components/common/FilterSidebar.vue'
import ItemGrid from '../components/common/ItemGrid.vue'
import SafeAdContainer from '../components/tools/SafeAdContainer.vue'

interface SampleMetadata {
  source: string
  useCase: string
  features: string[]
  learningPoints: string[]
}

interface SampleData {
  id: string
  name: string
  description: string
  category: 'api' | 'config' | 'data' | 'complex'
  difficulty: 'simple' | 'medium' | 'complex'
  size: 'small' | 'medium' | 'large'
  data: string
  metadata: SampleMetadata
}

const router = useRouter()

const allFilters = ref({
  api: true,
  config: true,
  data: true,
  complex: true,
  simple: true,
  medium: true,
  complex_difficulty: true
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
    key: 'complexity',
    title: '복잡도',
    options: [
      { key: 'simple', label: '간단' },
      { key: 'medium', label: '보통' },
      { key: 'complex_difficulty', label: '복잡' }
    ]
  }
]

// Placeholder samples - will be replaced with actual sample data
const samples = ref<SampleData[]>([
  {
    id: 'user-profile-api',
    name: '사용자 프로필 API',
    description: '일반적인 사용자 프로필 API 응답 예제',
    category: 'api',
    difficulty: 'simple',
    size: 'small',
    data: JSON.stringify({
      id: 12345,
      username: "john_doe",
      email: "john@example.com",
      profile: {
        firstName: "John",
        lastName: "Doe",
        avatar: "https://example.com/avatar.jpg"
      },
      preferences: {
        theme: "dark",
        notifications: true
      }
    }, null, 2),
    metadata: {
      source: 'REST API',
      useCase: '사용자 인증 후 프로필 정보 조회',
      features: ['중첩 객체', '다양한 데이터 타입'],
      learningPoints: ['API 응답 구조', '사용자 데이터 모델링']
    }
  },
  {
    id: 'app-config',
    name: '애플리케이션 설정',
    description: '웹 애플리케이션 설정 파일 예제',
    category: 'config',
    difficulty: 'medium',
    size: 'medium',
    data: JSON.stringify({
      app: {
        name: "MyApp",
        version: "1.2.3",
        environment: "production"
      },
      database: {
        host: "localhost",
        port: 5432,
        name: "myapp_db",
        ssl: true
      },
      features: {
        authentication: true,
        analytics: false,
        beta_features: ["new_ui", "advanced_search"]
      },
      logging: {
        level: "info",
        outputs: ["console", "file"]
      }
    }, null, 2),
    metadata: {
      source: '설정 파일',
      useCase: '애플리케이션 초기화 및 환경 설정',
      features: ['계층적 구조', '배열과 불린 값'],
      learningPoints: ['설정 파일 구조', '환경별 설정 관리']
    }
  },
  {
    id: 'ecommerce-data',
    name: '전자상거래 주문 데이터',
    description: '온라인 쇼핑몰 주문 정보 내보내기',
    category: 'data',
    difficulty: 'complex',
    size: 'large',
    data: JSON.stringify({
      order_id: "ORD-2024-001",
      customer: {
        id: 67890,
        name: "김철수",
        email: "kim@example.com",
        shipping_address: {
          street: "서울시 강남구 테헤란로 123",
          city: "서울",
          postal_code: "06142",
          country: "KR"
        }
      },
      items: [
        {
          product_id: "PROD-001",
          name: "무선 이어폰",
          quantity: 2,
          unit_price: 89000,
          total_price: 178000
        },
        {
          product_id: "PROD-002", 
          name: "스마트폰 케이스",
          quantity: 1,
          unit_price: 25000,
          total_price: 25000
        }
      ],
      payment: {
        method: "credit_card",
        status: "completed",
        transaction_id: "TXN-ABC123"
      },
      totals: {
        subtotal: 203000,
        tax: 20300,
        shipping: 3000,
        total: 226300
      }
    }, null, 2),
    metadata: {
      source: '전자상거래 시스템',
      useCase: '주문 데이터 분석 및 보고서 생성',
      features: ['복잡한 중첩', '배열 처리', '계산된 값'],
      learningPoints: ['비즈니스 데이터 모델링', '관계형 데이터 표현']
    }
  }
])

const filteredSamples = computed(() => {
  return samples.value.filter(sample => {
    const categoryMatch = allFilters.value[sample.category]
    const complexityKey = sample.difficulty === 'complex' ? 'complex_difficulty' : sample.difficulty
    const complexityMatch = allFilters.value[complexityKey]
    return categoryMatch && complexityMatch
  })
})

const getCategoryLabel = (category: string) => {
  const labels = {
    api: 'API',
    config: '설정',
    data: '데이터',
    complex: '복잡'
  }
  return labels[category as keyof typeof labels] || category
}

const getPreview = (data: string) => {
  const lines = data.split('\n')
  if (lines.length > 8) {
    return lines.slice(0, 8).join('\n') + '\n  ...'
  }
  return data
}

const loadIntoParser = (sample: SampleData) => {
  // This will be implemented to load the sample into the main parser
  router.push({
    path: '/',
    query: { sample: sample.id }
  })
}

const viewFullSample = (sample: SampleData) => {
  router.push(`/samples/${sample.id}`)
}

// 필터 초기화
const resetFilters = () => {
  allFilters.value = {
    api: true,
    config: true,
    data: true,
    complex: true,
    simple: true,
    medium: true,
    complex_difficulty: true
  }
}
</script>

<style scoped>

.sample-card {
  background: var(--color-background-secondary);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.sample-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.sample-header h3 {
  color: var(--color-text-primary);
  margin: 0;
}

.sample-badges {
  display: flex;
  gap: 0.5rem;
}

.category-badge,
.complexity-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.category-badge.api {
  background: #e3f2fd;
  color: #1565c0;
}

.category-badge.config {
  background: #f3e5f5;
  color: #7b1fa2;
}

.category-badge.data {
  background: #e8f5e8;
  color: #2d5a2d;
}

.category-badge.complex {
  background: #fff3cd;
  color: #856404;
}

.complexity-badge.simple {
  background: #e8f5e8;
  color: #2d5a2d;
}

.complexity-badge.medium {
  background: #fff3cd;
  color: #856404;
}

.complexity-badge.complex {
  background: #f8d7da;
  color: #721c24;
}

.sample-description {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.sample-meta {
  margin-bottom: 1rem;
}

.meta-item {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.meta-item strong {
  color: var(--color-text-primary);
}

.sample-preview {
  background: var(--color-background-tertiary);
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  overflow-x: auto;
}

.sample-preview pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  color: var(--color-text-primary);
}

.sample-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
}

.btn-secondary {
  background: var(--color-background-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-background-primary);
}

/* 광고 스타일 */
.header-ad {
  margin: 2rem 0;
  padding: 1rem;
  background: var(--color-background-secondary);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.content-ad-sample {
  background: var(--color-background-secondary);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 250px;
}

@media (max-width: 768px) {
  .sample-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .sample-actions {
    flex-direction: column;
  }
  
  .header-ad {
    margin: 1rem 0;
    padding: 0.5rem;
  }
  
  .content-ad-sample {
    margin: 1rem 0;
    padding: 1rem;
    min-height: 200px;
  }
}
</style>