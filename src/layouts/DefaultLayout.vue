<template>
  <div class="default-layout">
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
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useApp } from '../composables/useApp'
import KeyboardShortcuts from '../components/common/KeyboardShortcuts.vue'

const { mainStyle } = useApp()
</script>

<style scoped>
.default-layout {
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
  flex-shrink: 0;
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
  min-height: 0;
}

/* 반응형 디자인 - 모바일 */
@media (max-width: 768px) {
  .app-main {
    padding: 0.75rem;
    gap: 0.75rem;
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