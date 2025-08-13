<template>
  <DefaultLayout>
    <div class="tutorial-page">
      <div class="tutorial-container">
        <!-- 뒤로가기 버튼 -->
        <div class="breadcrumb">
          <button @click="goBack" class="back-button">
            <ArrowLeft :size="16" />
            학습 센터로 돌아가기
          </button>
        </div>
        
        <!-- 튜토리얼 컴포넌트 렌더링 -->
        <div class="tutorial-content">
          <TutorialViewer 
            :tutorial-id="tutorialId"
            @complete="handleTutorialComplete"
            @progress="handleProgressUpdate"
            @back="goBack"
            @retry="retryLoad"
          />
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import TutorialViewer from '../components/feature/TutorialViewer.vue'

const route = useRoute()
const router = useRouter()

// 라우트에서 튜토리얼 ID 추출
const tutorialId = computed(() => route.params.id as string)

// 튜토리얼 완료 처리
const handleTutorialComplete = (completedTutorialId: string) => {
  console.log('Tutorial completed:', completedTutorialId)
  // 추가적인 완료 처리 로직 (예: 분석 이벤트 전송)
}

// 진행률 업데이트 처리
const handleProgressUpdate = (tutorialId: string, progress: number) => {
  console.log('Progress updated:', tutorialId, progress)
  // 추가적인 진행률 처리 로직 (예: 분석 이벤트 전송)
}

// 뒤로 가기
const goBack = () => {
  router.push('/learn')
}

// 재시도
const retryLoad = () => {
  // 페이지 새로고침으로 재시도
  window.location.reload()
}
</script>

<style scoped>
.tutorial-page {
  min-height: 100%;
  background: var(--color-background-primary);
  padding: 2rem 0;
}

.tutorial-container {
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

.tutorial-content {
  background: var(--color-background-secondary);
  border-radius: 8px;
  padding: 2rem;
  min-height: 400px;
}

@media (max-width: 1200px) {
  .tutorial-container {
    max-width: 1200px;
    padding: 0 1.5rem;
  }
}

@media (max-width: 768px) {
  .tutorial-page {
    padding: 1rem 0;
  }
  
  .tutorial-container {
    padding: 0 1rem;
  }
}
</style>