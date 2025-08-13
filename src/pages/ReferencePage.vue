<template>
  <DefaultLayout>
    <div class="reference-page">
      <div class="reference-container">
        <!-- 뒤로가기 버튼 -->
        <div class="breadcrumb">
          <button @click="goBack" class="back-button">
            <ArrowLeft :size="16" />
            참조 자료로 돌아가기
          </button>
        </div>
        
        <!-- 참조 자료 컴포넌트 렌더링 -->
        <div class="reference-content">
          <Suspense v-if="currentReference">
            <template #default>
              <component 
                :is="currentReference.component" 
                :key="referenceId"
              />
            </template>
            <template #fallback>
              <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>참조 자료를 로딩 중입니다...</p>
              </div>
            </template>
          </Suspense>
          <div v-else class="reference-not-found">
            <h2>참조 자료를 찾을 수 없습니다</h2>
            <p>요청하신 참조 자료가 존재하지 않거나 아직 구현되지 않았습니다.</p>
            <button @click="goBack" class="primary-button">
              참조 자료로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import DefaultLayout from '../layouts/DefaultLayout.vue'

// 참조 자료 컴포넌트들을 비동기 컴포넌트로 정의
const referenceComponents = {
  'json-cheatsheet': defineAsyncComponent(() => import('../components/reference/JsonCheatsheet.vue')),
  'error-guide': defineAsyncComponent(() => import('../components/reference/ErrorGuide.vue')),
  'performance-guide': defineAsyncComponent(() => import('../components/reference/PerformanceGuide.vue')),
  'api-guide': defineAsyncComponent(() => import('../components/reference/ApiGuide.vue'))
}

const route = useRoute()
const router = useRouter()

const referenceId = computed(() => route.params.referenceId as string)

const currentReference = computed(() => {
  const id = referenceId.value
  if (id && referenceComponents[id as keyof typeof referenceComponents]) {
    return {
      component: referenceComponents[id as keyof typeof referenceComponents]
    }
  }
  return null
})

const goBack = () => {
  router.push('/reference')
}
</script>

<style scoped>
.reference-page {
  min-height: 100%;
  background: var(--color-background-primary);
  padding: 2rem 0;
}

.reference-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.breadcrumb {
  margin-bottom: 2rem;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.5rem 0;
  transition: color 0.2s;
}

.back-button:hover {
  color: var(--color-primary-dark);
}

.reference-content {
  background: var(--color-background-secondary);
  border-radius: 8px;
  padding: 2rem;
  min-height: 400px;
}

.reference-not-found {
  text-align: center;
  padding: 3rem 1rem;
  background: var(--color-background-secondary);
  border-radius: 8px;
  margin-top: 2rem;
}

.reference-not-found h2 {
  color: var(--color-text-primary);
  margin-bottom: 1rem;
}

.reference-not-found p {
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
}

.primary-button {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.primary-button:hover {
  background: var(--color-primary-dark);
}

.loading-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-secondary);
  background: var(--color-background-secondary);
  border-radius: 8px;
  margin-top: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 1200px) {
  .reference-container {
    max-width: 1200px;
    padding: 0 1.5rem;
  }
}

@media (max-width: 768px) {
  .reference-page {
    padding: 1rem 0;
  }
  
  .reference-container {
    padding: 0 1rem;
  }
  
  .reference-content {
    padding: 1.5rem;
  }
}
</style>