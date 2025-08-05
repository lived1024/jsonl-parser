<template>
  <div class="default-layout">
    <header class="app-header" role="banner">
      <div class="header-background">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>
      
      <div class="header-content">
        <div class="header-brand">
          <div class="brand-icon">
            <div class="icon-inner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <path d="M12 18v-6"/>
                <path d="M9 15l3 3 3-3"/>
              </svg>
            </div>
            <div class="icon-glow"></div>
          </div>
          <div class="brand-text">
            <h1 class="brand-title">{{ t('header.title') }}</h1>
            <p class="brand-subtitle">{{ t('header.subtitle') }}</p>
          </div>
        </div>
        
        <div class="header-info">
          <div class="header-actions">
            <LanguageSelector />
            <KeyboardShortcuts />
          </div>
        </div>
      </div>
    </header>
    
    <main class="app-main" :style="mainStyle" role="main" :aria-label="t('accessibility.mainArea')">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from '../composables/useApp'
import { useJsonTreeStore } from '../stores'
import { useI18n } from '../composables/useI18n'
import KeyboardShortcuts from '../components/common/KeyboardShortcuts.vue'
import LanguageSelector from '../components/ui/LanguageSelector.vue'

const { mainStyle } = useApp()
const store = useJsonTreeStore()
const { t } = useI18n()

// 총 노드 개수 계산
const nodeCount = computed(() => {
  const countNodes = (nodes: any[]): number => {
    let count = 0
    for (const node of nodes) {
      count++
      if (node.children) {
        count += countNodes(node.children)
      }
    }
    return count
  }

  return countNodes(store.parsedData)
})
</script>

<style scoped>
.default-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-header {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  color: white;
  padding: 1.5rem 2rem;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  z-index: 100;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.3;
  animation: float 6s ease-in-out infinite;
}

.orb-1 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, #ff6b6b, #ee5a24);
  top: -100px;
  left: -50px;
  animation-delay: 0s;
}

.orb-2 {
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, #4ecdc4, #45b7aa);
  top: -75px;
  right: -25px;
  animation-delay: 2s;
}

.orb-3 {
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, #feca57, #ff9ff3);
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.05);
  }
}

.header-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  z-index: 10;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 1rem;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.brand-icon:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.icon-inner {
  position: relative;
  z-index: 2;
  color: white;
  transition: transform 0.3s ease;
}

.brand-icon:hover .icon-inner {
  transform: scale(1.1);
}

.icon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2rem;
  height: 2rem;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3), transparent);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.brand-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: -0.025em;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-subtitle {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.025em;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2rem;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
}

.status-indicator:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  background: #4ade80;
  border-radius: 50%;
  animation: statusPulse 2s ease-in-out infinite;
  box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
}

@keyframes statusPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(74, 222, 128, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
  }
}

.status-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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
    padding: 1rem;
  }
  
  .header-brand {
    gap: 0.75rem;
  }
  
  .brand-icon {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .brand-title {
    font-size: 1.25rem;
  }
  
  .brand-subtitle {
    font-size: 0.75rem;
  }
  
  .header-info {
    gap: 1rem;
  }
  
  .header-actions {
    gap: 0.5rem;
  }
  
  .status-indicator {
    padding: 0.375rem 0.75rem;
  }
  
  .status-text {
    font-size: 0.75rem;
  }
  
  .gradient-orb {
    filter: blur(30px);
  }
  
  .orb-1 {
    width: 150px;
    height: 150px;
  }
  
  .orb-2 {
    width: 100px;
    height: 100px;
  }
  
  .orb-3 {
    width: 80px;
    height: 80px;
  }
}

/* 태블릿 */
@media (max-width: 1024px) and (min-width: 769px) {
  .app-header {
    padding: 1.25rem 1.5rem;
  }
  
  .brand-title {
    font-size: 1.5rem;
  }
  
  .brand-icon {
    width: 3rem;
    height: 3rem;
  }
}

/* 다크 모드 대응 */
@media (prefers-color-scheme: dark) {
  .app-header {
    background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #581c87 100%);
  }
  
  .brand-title {
    background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

/* 접근성 개선 */
@media (prefers-reduced-motion: reduce) {
  .gradient-orb,
  .icon-glow,
  .status-dot {
    animation: none;
  }
  
  .brand-icon,
  .status-indicator {
    transition: none;
  }
}
</style>