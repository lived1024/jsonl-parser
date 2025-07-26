<template>
  <div id="app">
    <header class="app-header" role="banner">
      <div class="header-content">
        <div class="header-brand">
          <div class="brand-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <h1 class="brand-title">JSON Tree Viewer</h1>
        </div>
        <div class="header-actions">
          <KeyboardShortcuts />
        </div>
      </div>
    </header>
    
    <main class="app-main" :style="mainStyle" role="main" aria-label="JSON 트리 뷰어 메인 영역">
      <section 
        class="input-panel-container" 
        :style="inputPanelStyle"
        role="region"
        aria-label="JSON 입력 영역"
      >
        <InputPanel />
      </section>
      
      <PanelResizer 
        v-if="!isMobile" 
        @resize="handlePanelResize"
        role="separator"
        aria-label="패널 크기 조정"
      />
      
      <section 
        class="output-panel-container"
        role="region"
        aria-label="JSON 트리 출력 영역"
      >
        <OutputPanel />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useJsonTreeStore } from './stores'
import PanelResizer from './components/PanelResizer.vue'
import InputPanel from './components/InputPanel.vue'
import OutputPanel from './components/OutputPanel.vue'
import KeyboardShortcuts from './components/KeyboardShortcuts.vue'

const store = useJsonTreeStore()

// 반응형 상태 관리
const windowWidth = ref(window.innerWidth)
const leftPanelWidth = ref(Math.floor(window.innerWidth / 2))

const isMobile = computed(() => windowWidth.value <= 768)

const mainStyle = computed(() => {
  if (isMobile.value) {
    return {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gridTemplateRows: '1fr 1fr'
    }
  }
  return {
    display: 'flex'
  }
})

const inputPanelStyle = computed(() => {
  if (isMobile.value) {
    return {}
  }
  return {
    width: `${leftPanelWidth.value}px`,
    flexShrink: 0
  }
})

// 패널 크기 조정 핸들러
const handlePanelResize = (width: number) => {
  leftPanelWidth.value = width
}

// 윈도우 리사이즈 핸들러
const handleWindowResize = () => {
  windowWidth.value = window.innerWidth
  
  // 모바일로 전환될 때 패널 너비 재조정
  if (windowWidth.value <= 768) {
    leftPanelWidth.value = Math.floor(windowWidth.value / 2)
  } else if (leftPanelWidth.value > windowWidth.value - 300) {
    leftPanelWidth.value = Math.floor(windowWidth.value / 2)
  }
}

// 전역 키보드 단축키 처리
const handleGlobalKeydown = (event: KeyboardEvent) => {
  // Ctrl/Cmd + K: 입력 영역에 포커스
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault()
    const textarea = document.querySelector('.editor-textarea') as HTMLTextAreaElement
    if (textarea) {
      textarea.focus()
    }
  }
  
  // Ctrl/Cmd + Enter: 파싱 실행
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault()
    if (store.inputText.trim()) {
      store.parseInput()
    }
  }
  
  // Escape: 현재 포커스 해제
  if (event.key === 'Escape') {
    const activeElement = document.activeElement as HTMLElement
    if (activeElement && activeElement.blur) {
      activeElement.blur()
    }
  }
}

// 앱 시작 시 로컬 스토리지에서 데이터 로드
onMounted(() => {
  store.loadFromLocalStorage()
  window.addEventListener('resize', handleWindowResize)
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResize)
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style scoped>
#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-md);
  color: white;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.brand-title {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.header-actions {
  display: flex;
  align-items: center;
}

.app-main {
  flex: 1;
  overflow: hidden;
  padding: 1rem;
  gap: 1rem;
  background: var(--color-surface);
}

.input-panel,
.output-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.input-panel-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.output-panel-container {
  background: var(--color-background);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.panel-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6c757d;
}

.panel-placeholder h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 500;
}

.panel-placeholder p {
  margin: 0;
  font-size: 0.875rem;
}

/* 반응형 디자인 - 모바일 */
@media (max-width: 768px) {
  .app-main {
    padding: 0.75rem;
    gap: 0.75rem;
  }
  
  .input-panel-container,
  .output-panel-container {
    border-radius: var(--radius-md);
  }
  
  .app-header {
    padding: 0.75rem 1rem;
  }
  
  .header-brand {
    gap: 0.5rem;
  }
  
  .brand-icon {
    width: 2rem;
    height: 2rem;
  }
  
  .brand-title {
    font-size: var(--text-lg);
  }
}

/* 태블릿 */
@media (max-width: 1024px) and (min-width: 769px) {
  .app-header {
    padding: 0.875rem 1.5rem;
  }
  
  .brand-title {
    font-size: var(--text-lg);
  }
}
</style>