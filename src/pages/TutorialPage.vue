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

// 진행률 추적을 위한 상수
const PROGRESS_KEY = 'jsonl-parser-learning-progress'

interface LearningProgress {
  completedTutorials: string[]
  tutorialProgress: Record<string, number>
  lastAccessed: Date
}

// 진행률 로드
const loadProgress = (): LearningProgress => {
  try {
    const saved = localStorage.getItem(PROGRESS_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        completedTutorials: parsed.completedTutorials || [],
        tutorialProgress: parsed.tutorialProgress || {},
        lastAccessed: new Date(parsed.lastAccessed || Date.now())
      }
    }
  } catch (err) {
    console.error('Failed to load progress:', err)
  }
  
  return {
    completedTutorials: [],
    tutorialProgress: {},
    lastAccessed: new Date()
  }
}

// 진행률 저장
const saveProgress = (progress: LearningProgress) => {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
  } catch (err) {
    console.error('Failed to save progress:', err)
  }
}

// 튜토리얼 완료 처리
const handleTutorialComplete = (completedTutorialId: string) => {
  const progress = loadProgress()
  if (!progress.completedTutorials.includes(completedTutorialId)) {
    progress.completedTutorials.push(completedTutorialId)
    progress.tutorialProgress[completedTutorialId] = 100
    progress.lastAccessed = new Date()
    saveProgress(progress)
  }
}

// 진행률 업데이트 처리
const handleProgressUpdate = (tutorialId: string, progressPercent: number) => {
  const progress = loadProgress()
  progress.tutorialProgress[tutorialId] = progressPercent
  progress.lastAccessed = new Date()
  
  // 90% 이상 진행 시 자동으로 완료 처리
  if (progressPercent >= 90 && !progress.completedTutorials.includes(tutorialId)) {
    progress.completedTutorials.push(tutorialId)
  }
  
  saveProgress(progress)
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