<template>
  <DefaultLayout>
    <div class="tutorial-page">
      <div class="tutorial-container">
        <!-- 브레드크럼 네비게이션 -->
        <nav class="breadcrumb-nav" :aria-label="t('accessibility.breadcrumbNavigation')">
          <div class="breadcrumb-content">
            <ol class="breadcrumb-list">
              <li class="breadcrumb-item">
                <router-link to="/" class="breadcrumb-link">
                  {{ t('breadcrumb.home') }}
                </router-link>
              </li>
              <li class="breadcrumb-item">
                <span class="breadcrumb-separator" :aria-hidden="true">{{ t('breadcrumb.separator') }}</span>
                <router-link to="/learn" class="breadcrumb-link">
                  {{ t('pages.learn.title') }}
                </router-link>
              </li>
              <li class="breadcrumb-item">
                <span class="breadcrumb-separator" :aria-hidden="true">{{ t('breadcrumb.separator') }}</span>
                <span class="breadcrumb-current" aria-current="page">
                  {{ t('pages.tutorial.title') }}
                </span>
              </li>
            </ol>
          </div>
        </nav>
        
        <!-- 뒤로가기 버튼 -->
        <div class="back-navigation">
          <button @click="goBack" class="back-button">
            <ArrowLeft :size="16" />
            {{ t('pages.learn.title') }}{{ t('navigation.backTo') }}
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
import { useI18n } from '../composables/useI18n'
import { ArrowLeft } from 'lucide-vue-next'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import TutorialViewer from '../components/feature/TutorialViewer.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

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

.breadcrumb-nav {
  background: var(--color-background-primary);
  border-bottom: 1px solid var(--color-border);
  padding: 0.75rem 0;
  margin-bottom: 1rem;
}

.breadcrumb-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 0.875rem;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-link {
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

.breadcrumb-separator {
  margin: 0 0.5rem;
  color: var(--color-text-tertiary);
}

.breadcrumb-current {
  color: var(--color-text-primary);
  font-weight: 500;
}

.back-navigation {
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