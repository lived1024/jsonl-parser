<template>
  <DefaultLayout>
    <PageLayout 
      title="사용자 선호도" 
      description="사용 패턴과 개인화된 인사이트를 확인하고 설정을 관리하세요"
    >
      <template #sidebar>
        <FilterSidebar 
          v-model="filters"
          :filter-sections="filterSections"
        >
          <template #additional>
            <div class="quick-stats">
              <h3>빠른 통계</h3>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-number">{{ sessionCount }}</span>
                  <span class="stat-label">총 세션</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ completedTutorials }}</span>
                  <span class="stat-label">완료된 튜토리얼</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ favoriteTools }}</span>
                  <span class="stat-label">즐겨찾는 도구</span>
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

        <UserPreferenceDashboard />
      </template>
    </PageLayout>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import PageLayout from '../components/common/PageLayout.vue'
import FilterSidebar, { type FilterSection } from '../components/common/FilterSidebar.vue'
import SafeAdContainer from '../components/tools/SafeAdContainer.vue'
import UserPreferenceDashboard from '../components/common/UserPreferenceDashboard.vue'
import { useUserPreferenceStore } from '../stores/userPreferenceStore'

// Set page title
document.title = 'User Preferences - JSONL Parser'

const userPreferenceStore = useUserPreferenceStore()

// 필터 상태 (대시보드 섹션 표시/숨김 제어)
const filters = ref({
  analytics: true,
  recommendations: true,
  activity: true,
  learning: true,
  insights: true,
  privacy: true
})

// 필터 섹션 정의
const filterSections: FilterSection[] = [
  {
    key: 'sections',
    title: '표시할 섹션',
    options: [
      { key: 'analytics', label: '사용 분석' },
      { key: 'recommendations', label: '맞춤 추천' },
      { key: 'activity', label: '최근 활동' },
      { key: 'learning', label: '학습 진행도' },
      { key: 'insights', label: '행동 인사이트' },
      { key: 'privacy', label: '개인정보 상태' }
    ]
  }
]

// 빠른 통계 계산
const sessionCount = computed(() => {
  return userPreferenceStore.analytics?.dataPoints || 0
})

const completedTutorials = computed(() => {
  return userPreferenceStore.preferences.completedTutorials.length
})

const favoriteTools = computed(() => {
  return userPreferenceStore.preferences.favoriteTools.length
})

// 컴포넌트 마운트 시 초기화
onMounted(async () => {
  if (!userPreferenceStore.isInitialized) {
    await userPreferenceStore.initialize()
  }
})
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

/* 빠른 통계 섹션 */
.quick-stats {
  border-top: 1px solid var(--color-border);
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

.quick-stats h3 {
  margin-bottom: 1rem;
  color: var(--color-text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--color-background-secondary);
  border-radius: 6px;
  border: 1px solid var(--color-border);
}

.stat-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .header-ad {
    margin: 1rem 0;
    padding: 0.5rem;
  }
  
  .stats-grid {
    gap: 0.5rem;
  }
  
  .stat-item {
    padding: 0.5rem;
  }
}
</style>