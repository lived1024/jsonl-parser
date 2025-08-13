<template>
  <DefaultLayout>
    <div class="tool-page">
      <div class="tool-container">
        <!-- 뒤로가기 버튼 -->
        <div class="breadcrumb">
          <button @click="goBack" class="back-button">
            <ArrowLeft :size="16" />
            도구 모음으로 돌아가기
          </button>
        </div>
        
        <!-- 도구 컴포넌트 렌더링 -->
        <div class="tool-content">
          <Suspense v-if="currentTool">
            <template #default>
              <component 
                :is="currentTool.component" 
                :key="toolId"
              />
            </template>
            <template #fallback>
              <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>도구를 로딩 중입니다...</p>
              </div>
            </template>
          </Suspense>
          <div v-else class="tool-not-found">
            <h2>도구를 찾을 수 없습니다</h2>
            <p>요청하신 도구가 존재하지 않거나 아직 구현되지 않았습니다.</p>
            <button @click="goBack" class="primary-button">
              도구 모음으로 돌아가기
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

// 도구 컴포넌트들을 비동기 컴포넌트로 정의
const toolComponents = {
  'json-validator': defineAsyncComponent(() => import('../components/tools/JsonValidator.vue')),
  'data-converter': defineAsyncComponent(() => import('../components/tools/DataConverter.vue')),
  'json-formatter': defineAsyncComponent(() => import('../components/tools/JsonFormatter.vue')),
  'schema-generator': defineAsyncComponent(() => import('../components/tools/SchemaGenerator.vue'))
}

const route = useRoute()
const router = useRouter()

const toolId = computed(() => route.params.toolId as string)

const currentTool = computed(() => {
  const id = toolId.value
  if (id && toolComponents[id as keyof typeof toolComponents]) {
    return {
      component: toolComponents[id as keyof typeof toolComponents]
    }
  }
  return null
})

const goBack = () => {
  router.push('/tools')
}
</script>

<style scoped>
.tool-page {
  min-height: 100%;
  background: var(--color-background-primary);
  padding: 2rem 0;
}

.tool-container {
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

.tool-content {
  background: var(--color-background-secondary);
  border-radius: 8px;
  padding: 2rem;
  min-height: 400px;
}

.tool-not-found {
  text-align: center;
  padding: 3rem 1rem;
  background: var(--color-background-secondary);
  border-radius: 8px;
  margin-top: 2rem;
}

.tool-not-found h2 {
  color: var(--color-text-primary);
  margin-bottom: 1rem;
}

.tool-not-found p {
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
  .tool-container {
    max-width: 1200px;
    padding: 0 1.5rem;
  }
}

@media (max-width: 768px) {
  .tool-page {
    padding: 1rem 0;
  }
  
  .tool-container {
    padding: 0 1rem;
  }
  
  .tool-content {
    padding: 1.5rem;
  }
}
</style>