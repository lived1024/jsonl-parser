<template>
  <DefaultLayout>
    <PageLayout 
      title="개인정보 설정" 
      description="개인정보 보호 및 데이터 사용 설정을 관리하세요"
    >
      <template #sidebar>
        <FilterSidebar 
          v-model="filters"
          :filter-sections="filterSections"
        >
          <template #additional>
            <div class="privacy-summary">
              <h3>개인정보 요약</h3>
              <div class="privacy-status-list">
                <div class="privacy-status-item" :class="{ active: trackingEnabled }">
                  <div class="status-indicator"></div>
                  <span class="status-label">추적</span>
                  <span class="status-value">{{ trackingEnabled ? '활성' : '비활성' }}</span>
                </div>
                <div class="privacy-status-item" :class="{ active: analyticsEnabled }">
                  <div class="status-indicator"></div>
                  <span class="status-label">분석</span>
                  <span class="status-value">{{ analyticsEnabled ? '활성' : '비활성' }}</span>
                </div>
                <div class="privacy-status-item" :class="{ active: personalizationEnabled }">
                  <div class="status-indicator"></div>
                  <span class="status-label">개인화</span>
                  <span class="status-value">{{ personalizationEnabled ? '활성' : '비활성' }}</span>
                </div>
              </div>
              
              <div class="data-retention-info">
                <h4>데이터 보존</h4>
                <p>{{ dataRetentionDays }}일 후 자동 삭제</p>
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

        <PrivacySettings />
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
import PrivacySettings from '../components/common/PrivacySettings.vue'
import { useUserPreferenceStore } from '../stores/userPreferenceStore'
import { useI18n } from '../composables/useI18n'

const { t } = useI18n()
const userPreferenceStore = useUserPreferenceStore()

// Set page title
document.title = 'Privacy Settings - JSONL Parser'

// 필터 상태 (설정 섹션 표시/숨김 제어)
const filters = ref({
  tracking: true,
  dataRetention: true,
  cookies: true,
  dataManagement: true,
  compliance: true
})

// 필터 섹션 정의
const filterSections: FilterSection[] = [
  {
    key: 'sections',
    title: '설정 섹션',
    options: [
      { key: 'tracking', label: '추적 설정' },
      { key: 'dataRetention', label: '데이터 보존' },
      { key: 'cookies', label: '쿠키 설정' },
      { key: 'dataManagement', label: '데이터 관리' },
      { key: 'compliance', label: '규정 준수' }
    ]
  }
]

// 개인정보 상태 계산
const trackingEnabled = computed(() => userPreferenceStore.trackingEnabled)
const analyticsEnabled = computed(() => userPreferenceStore.analyticsEnabled)
const personalizationEnabled = computed(() => userPreferenceStore.personalizedContentEnabled)
const dataRetentionDays = computed(() => userPreferenceStore.privacySettings.dataRetentionDays)

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

/* 개인정보 요약 섹션 */
.privacy-summary {
  border-top: 1px solid var(--color-border);
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

.privacy-summary h3 {
  margin-bottom: 1rem;
  color: var(--color-text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.privacy-status-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.privacy-status-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--color-background-secondary);
  border-radius: 6px;
  border: 1px solid var(--color-border);
  transition: all 0.2s ease;
}

.privacy-status-item.active {
  border-color: var(--color-success, #22c55e);
  background: var(--color-success-bg, #f0f9f0);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-text-secondary);
  flex-shrink: 0;
}

.privacy-status-item.active .status-indicator {
  background: var(--color-success, #22c55e);
}

.status-label {
  font-size: 0.875rem;
  color: var(--color-text-primary);
  font-weight: 500;
  flex: 1;
}

.status-value {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.privacy-status-item.active .status-value {
  color: var(--color-success, #22c55e);
}

.data-retention-info {
  padding: 1rem;
  background: var(--color-background-secondary);
  border-radius: 6px;
  border: 1px solid var(--color-border);
}

.data-retention-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.data-retention-info p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .header-ad {
    margin: 1rem 0;
    padding: 0.5rem;
  }
  
  .privacy-status-list {
    gap: 0.5rem;
  }
  
  .privacy-status-item {
    padding: 0.5rem;
  }
  
  .data-retention-info {
    padding: 0.75rem;
  }
}
</style>