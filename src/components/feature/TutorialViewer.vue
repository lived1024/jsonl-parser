<template>
  <div class="tutorial-viewer">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>튜토리얼을 불러오는 중...</p>
    </div>

    <!-- 오류 상태 -->
    <div v-else-if="error" class="error-state">
      <h2>오류가 발생했습니다</h2>
      <p>{{ error }}</p>
      <button @click="$emit('retry')" class="retry-button">다시 시도</button>
    </div>

    <!-- 튜토리얼 콘텐츠 -->
    <div v-else-if="tutorial" class="tutorial-content">
      <!-- 헤더 -->
      <header class="tutorial-header">
        <div class="tutorial-info">
          <h1>{{ tutorial.metadata.title }}</h1>
          <p class="tutorial-description">{{ tutorial.metadata.description }}</p>
          <div class="tutorial-meta">
            <span class="difficulty" :class="tutorial.metadata.difficulty">
              {{ getDifficultyLabel(tutorial.metadata.difficulty) }}
            </span>
            <span class="duration">{{ tutorial.metadata.estimatedReadTime }}분</span>
            <span v-if="isCompleted" class="completed-badge">✓ 완료</span>
          </div>
        </div>
        
        <div class="tutorial-actions">
          <button 
            v-if="!isCompleted" 
            @click="markAsCompleted"
            class="complete-button"
          >
            완료 표시
          </button>
          <button 
            v-else 
            @click="markAsIncomplete"
            class="incomplete-button"
          >
            완료 취소
          </button>
        </div>
      </header>

      <!-- 진행률 표시 -->
      <div class="progress-section">
        <div class="progress-info">
          <span>진행률: {{ Math.round(readingProgress) }}%</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: readingProgress + '%' }"
          ></div>
        </div>
      </div>

      <!-- 광고 -->
      <AdSenseContainer 
        ad-slot="tutorial-top"
        ad-format="banner"
        class-name="tutorial-ad"
      />

      <!-- 마크다운 콘텐츠 -->
      <article 
        class="markdown-content"
        v-html="renderedContent"
        ref="contentRef"
      ></article>

      <!-- 코드 예제 섹션 -->
      <section v-if="tutorial.metadata.interactiveExamples && tutorial.metadata.interactiveExamples.length > 0" class="examples-section">
        <h2>코드 예제</h2>
        <div class="examples-grid">
          <div 
            v-for="(example, index) in tutorial.metadata.interactiveExamples" 
            :key="index"
            class="example-card"
          >
            <div class="example-header">
              <h3 v-if="example.description">{{ example.description }}</h3>
              <span class="language-tag">{{ example.type }}</span>
            </div>
            <div class="code-container">
              <pre><code 
                :class="`language-${example.type}`"
                v-html="highlightCode(example.data, example.type)"
              ></code></pre>
              <button 
                @click="copyCode(example.data)"
                class="copy-button"
                :class="{ copied: copiedIndex === index }"
              >
                {{ copiedIndex === index ? '복사됨!' : '복사' }}
              </button>
            </div>
            
            <!-- 파서 연동 버튼 (JSON/JSONL 예제인 경우) -->
            <button 
              v-if="isJsonExample(example.type)"
              @click="loadInParser(example.data)"
              class="load-parser-button"
            >
              파서에서 열기
            </button>
          </div>
        </div>
      </section>

      <!-- 하단 광고 -->
      <AdSenseContainer 
        ad-slot="tutorial-bottom"
        ad-format="rectangle"
        class-name="tutorial-ad bottom"
      />

      <!-- 네비게이션 -->
      <nav class="tutorial-navigation">
        <button @click="$emit('back')" class="nav-button back">
          ← 목록으로 돌아가기
        </button>
        <div class="nav-actions">
          <button 
            v-if="!isCompleted" 
            @click="markAsCompleted"
            class="complete-button"
          >
            완료 표시
          </button>
        </div>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import AdSenseContainer from '../common/AdSenseContainer.vue'
import { ContentService, type GuideContent } from '../../services/ContentService'
import hljs from 'highlight.js'

interface Props {
  tutorialId: string
}

interface Emits {
  (e: 'complete', tutorialId: string): void
  (e: 'progress', tutorialId: string, progress: number): void
  (e: 'back'): void
  (e: 'retry'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const router = useRouter()

const contentService = ContentService.getInstance()

// 상태 관리
const tutorial = ref<GuideContent | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const readingProgress = ref(0)
const copiedIndex = ref<number | null>(null)
const contentRef = ref<HTMLElement | null>(null)

// 스크롤 이벤트 정리를 위한 변수
let scrollCleanup: (() => void) | null = null
let intersectionObserver: IntersectionObserver | null = null

// 진행 상황 관리
const PROGRESS_KEY = 'jsonl-parser-learning-progress'

interface LearningProgress {
  completedTutorials: string[]
  tutorialProgress: Record<string, number>
  lastAccessed: Date
}

const progress = ref<LearningProgress>({
  completedTutorials: [],
  tutorialProgress: {},
  lastAccessed: new Date()
})

// 컴포넌트 마운트
onMounted(async () => {
  await loadTutorial()
  loadProgress()
  await nextTick()
  setupScrollTracking()
  setupIntersectionObserver()
})

// 컴포넌트 언마운트
onUnmounted(() => {
  saveProgress()
  if (scrollCleanup) {
    scrollCleanup()
  }
  if (intersectionObserver) {
    intersectionObserver.disconnect()
  }
})

// 튜토리얼 로드
const loadTutorial = async () => {
  try {
    loading.value = true
    error.value = null
    tutorial.value = await contentService.getGuide(props.tutorialId)
    
    if (!tutorial.value) {
      error.value = '튜토리얼을 찾을 수 없습니다.'
    }
  } catch (err) {
    console.error('Failed to load tutorial:', err)
    error.value = '튜토리얼을 불러오는 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

// 진행 상황 로드
const loadProgress = () => {
  try {
    const saved = localStorage.getItem(PROGRESS_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      progress.value = {
        completedTutorials: parsed.completedTutorials || [],
        tutorialProgress: parsed.tutorialProgress || {},
        lastAccessed: new Date(parsed.lastAccessed || Date.now())
      }
      
      // 저장된 읽기 진행률 복원
      if (progress.value.tutorialProgress && progress.value.tutorialProgress[props.tutorialId]) {
        readingProgress.value = progress.value.tutorialProgress[props.tutorialId]
      }
    }
  } catch (err) {
    console.error('Failed to load progress:', err)
  }
}

// 진행 상황 저장
const saveProgress = () => {
  try {
    progress.value.lastAccessed = new Date()
    progress.value.tutorialProgress[props.tutorialId] = readingProgress.value
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress.value))
    

  } catch (err) {
    console.error('Failed to save progress:', err)
  }
}

// 스크롤 추적 설정
const setupScrollTracking = () => {
  nextTick(() => {
    // 페이지 레벨에서 스크롤 이벤트 리스닝
    const handleScroll = () => {
      updateReadingProgress()
    }
    
    // 다양한 스크롤 컨테이너 시도
    const scrollContainer = 
      document.querySelector('.page-content') || 
      document.querySelector('.tutorial-container') || 
      document.querySelector('main') ||
      document.documentElement ||
      window
    
    if (scrollContainer && scrollContainer !== window) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
      
      // 정리 함수 저장
      scrollCleanup = () => {
        scrollContainer.removeEventListener('scroll', handleScroll)
      }
    } else {
      // window 스크롤 이벤트 사용
      window.addEventListener('scroll', handleScroll, { passive: true })
      
      scrollCleanup = () => {
        window.removeEventListener('scroll', handleScroll)
      }
    }
    
    // 초기 진행률 계산
    updateReadingProgress()
  })
}

// 읽기 진행률 업데이트
const updateReadingProgress = () => {
  // 다양한 스크롤 컨테이너 시도
  const scrollContainer = 
    document.querySelector('.page-content') || 
    document.querySelector('.tutorial-container') || 
    document.querySelector('main')
  
  let scrollTop = 0
  let scrollHeight = 0
  let clientHeight = 0
  
  if (scrollContainer) {
    scrollTop = scrollContainer.scrollTop
    scrollHeight = scrollContainer.scrollHeight
    clientHeight = scrollContainer.clientHeight
  } else {
    // window 스크롤 사용
    scrollTop = window.pageYOffset || document.documentElement.scrollTop
    scrollHeight = document.documentElement.scrollHeight
    clientHeight = window.innerHeight
  }
  
  const maxScroll = scrollHeight - clientHeight
  
  if (maxScroll > 0) {
    const newProgress = Math.min((scrollTop / maxScroll) * 100, 100)
    
    // 진행률이 실제로 변경된 경우에만 업데이트
    if (Math.abs(newProgress - readingProgress.value) > 0.5) {
      readingProgress.value = newProgress
      
      // 진행률 변경 이벤트 발생
      emit('progress', props.tutorialId, newProgress)
      
      // 주기적으로 진행 상황 저장 (5% 이상 변경 시)
      const savedProgress = progress.value.tutorialProgress[props.tutorialId] || 0
      if (Math.abs(newProgress - savedProgress) > 5) {
        saveProgress()
      }
      

    }
  }
}

// 마크다운 렌더링
const renderedContent = computed(() => {
  if (!tutorial.value) return ''
  return tutorial.value.renderedContent || contentService.renderMarkdown(tutorial.value.content)
})

// 완료 상태 확인
const isCompleted = computed(() => {
  return progress.value.completedTutorials.includes(props.tutorialId)
})

// 난이도 라벨
const getDifficultyLabel = (difficulty: string): string => {
  const labels: Record<string, string> = {
    beginner: '초급',
    intermediate: '중급',
    advanced: '고급'
  }
  return labels[difficulty] || difficulty
}

// 완료 표시
const markAsCompleted = () => {
  if (!progress.value.completedTutorials.includes(props.tutorialId)) {
    progress.value.completedTutorials.push(props.tutorialId)
    progress.value.tutorialProgress[props.tutorialId] = 100
    readingProgress.value = 100
    saveProgress()
    emit('complete', props.tutorialId)
  }
}

// 완료 취소
const markAsIncomplete = () => {
  const index = progress.value.completedTutorials.indexOf(props.tutorialId)
  if (index > -1) {
    progress.value.completedTutorials.splice(index, 1)
    saveProgress()
  }
}

// 코드 하이라이팅
const highlightCode = (code: string, language: string): string => {
  try {
    if (hljs.getLanguage(language)) {
      return hljs.highlight(code, { language }).value
    }
    return hljs.highlightAuto(code).value
  } catch (err) {
    console.warn('Code highlighting failed:', err)
    return code
  }
}

// 코드 복사
const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    const index = tutorial.value?.metadata.interactiveExamples?.findIndex((ex: any) => ex.data === code) ?? -1
    copiedIndex.value = index
    setTimeout(() => {
      copiedIndex.value = null
    }, 2000)
  } catch (err) {
    console.error('Failed to copy code:', err)
  }
}

// JSON 예제 확인
const isJsonExample = (language: string): boolean => {
  return ['json', 'jsonl'].includes(language.toLowerCase())
}

// 파서에서 열기
const loadInParser = (code: string) => {
  // 메인 파서 페이지로 이동하면서 데이터 전달
  router.push({
    path: '/',
    query: { data: encodeURIComponent(code) }
  })
}

// IntersectionObserver 설정 (추가적인 진행률 추적)
const setupIntersectionObserver = () => {
  if (!contentRef.value || typeof IntersectionObserver === 'undefined') return
  
  try {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 콘텐츠가 화면에 보이면 진행률 업데이트
            updateReadingProgress()
          }
        })
      },
      {
        threshold: [0.1, 0.5, 0.9],
        rootMargin: '0px 0px -10% 0px'
      }
    )
    
    intersectionObserver.observe(contentRef.value)
  } catch (error) {
    console.warn('IntersectionObserver not supported:', error)
  }
}
</script>

<style scoped>
.tutorial-viewer {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 100%;
}

/* 로딩 및 오류 상태 */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-button {
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
}

.retry-button:hover {
  background: var(--color-primary-dark);
}

/* 튜토리얼 헤더 */
.tutorial-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--color-border);
}

.tutorial-info h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.tutorial-description {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  line-height: 1.6;
}

.tutorial-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.difficulty {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
}

.difficulty.beginner {
  background: #e8f5e8;
  color: #2d5a2d;
}

.difficulty.intermediate {
  background: #fff3cd;
  color: #856404;
}

.difficulty.advanced {
  background: #f8d7da;
  color: #721c24;
}

.duration {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.completed-badge {
  background: var(--color-success);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

/* 액션 버튼 */
.tutorial-actions {
  display: flex;
  gap: 0.5rem;
}

.complete-button,
.incomplete-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.complete-button {
  background: var(--color-success);
  color: white;
}

.complete-button:hover {
  background: var(--color-success-dark);
}

.incomplete-button {
  background: var(--color-background-tertiary);
  color: var(--color-text-secondary);
}

.incomplete-button:hover {
  background: var(--color-border);
}

/* 진행률 섹션 */
.progress-section {
  margin-bottom: 2rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.progress-bar {
  height: 6px;
  background: var(--color-background-tertiary);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  transition: width 0.3s ease;
}

/* 마크다운 콘텐츠 */
.markdown-content {
  line-height: 1.7;
  color: var(--color-text-primary);
  margin-bottom: 3rem;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
}

.markdown-content :deep(h1) {
  font-size: 2rem;
  border-bottom: 2px solid var(--color-border);
  padding-bottom: 0.5rem;
}

.markdown-content :deep(h2) {
  font-size: 1.5rem;
}

.markdown-content :deep(h3) {
  font-size: 1.25rem;
}

.markdown-content :deep(p) {
  margin-bottom: 1rem;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 2rem;
}

.markdown-content :deep(li) {
  margin-bottom: 0.5rem;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid var(--color-primary);
  padding-left: 1rem;
  margin: 1rem 0;
  color: var(--color-text-secondary);
  font-style: italic;
}

.markdown-content :deep(code) {
  background: var(--color-background-secondary);
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.markdown-content :deep(pre) {
  background: var(--color-background-secondary);
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1rem 0;
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
}

/* 예제 섹션 */
.examples-section {
  margin: 3rem 0;
}

.examples-section h2 {
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
}

.examples-grid {
  display: grid;
  gap: 2rem;
}

.example-card {
  background: var(--color-background-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
}

.example-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.example-header h3 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 1.1rem;
}

.language-tag {
  background: var(--color-primary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.code-container {
  position: relative;
  margin-bottom: 1rem;
}

.code-container pre {
  background: var(--color-background-tertiary);
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0;
}

.code-container code {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
}

.copy-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: var(--color-background-primary);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.copy-button:hover {
  background: var(--color-background-secondary);
}

.copy-button.copied {
  background: var(--color-success);
  color: white;
  border-color: var(--color-success);
}

.load-parser-button {
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
}

.load-parser-button:hover {
  background: var(--color-primary-dark);
}

/* 광고 */
.tutorial-ad {
  margin: 2rem 0;
  padding: 1rem;
  background: var(--color-background-secondary);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  text-align: center;
}

.tutorial-ad.bottom {
  margin-top: 3rem;
}

/* 네비게이션 */
.tutorial-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
  margin-top: 3rem;
}

.nav-button {
  padding: 0.75rem 1.5rem;
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--color-text-primary);
  text-decoration: none;
  transition: all 0.2s;
}

.nav-button:hover {
  background: var(--color-background-tertiary);
}

.nav-actions {
  display: flex;
  gap: 0.5rem;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .tutorial-viewer {
    padding: 1rem 0.5rem;
  }
  
  .tutorial-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .tutorial-info h1 {
    font-size: 2rem;
  }
  
  .tutorial-meta {
    flex-wrap: wrap;
  }
  
  .tutorial-actions {
    align-self: flex-end;
  }
  
  .tutorial-navigation {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .nav-actions {
    justify-content: center;
  }
  
  .example-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .language-tag {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .tutorial-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .code-container pre {
    padding: 0.75rem;
    font-size: 0.8rem;
  }
  
  .copy-button {
    position: static;
    margin-top: 0.5rem;
    align-self: flex-start;
  }
}
</style>