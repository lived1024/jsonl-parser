<template>
  <div class="keyboard-shortcuts">
    <button 
      class="shortcuts-toggle"
      @click="isVisible = !isVisible"
      :aria-expanded="isVisible"
      aria-label="키보드 단축키 도움말"
      title="키보드 단축키 (Ctrl+?)"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8S12.42 0 8 0zM7 3h2v6H7V3zm0 8h2v2H7v-2z"/>
      </svg>
    </button>
    
    <div v-if="isVisible" class="shortcuts-panel">
      <div class="shortcuts-header">
        <h3>키보드 단축키</h3>
        <button 
          class="close-button"
          @click="isVisible = false"
          aria-label="닫기"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M14 1.41L12.59 0 7 5.59 1.41 0 0 1.41 5.59 7 0 12.59 1.41 14 7 8.41 12.59 14 14 12.59 8.41 7z"/>
          </svg>
        </button>
      </div>
      
      <div class="shortcuts-content">
        <div class="shortcut-section">
          <h4>전역</h4>
          <div class="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>K</kbd>
            <span>입력 영역에 포커스</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>Enter</kbd>
            <span>파싱 실행</span>
          </div>
          <div class="shortcut-item">
            <kbd>Esc</kbd>
            <span>포커스 해제</span>
          </div>
        </div>
        
        <div class="shortcut-section">
          <h4>텍스트 에디터</h4>
          <div class="shortcut-item">
            <kbd>Tab</kbd>
            <span>들여쓰기 추가</span>
          </div>
          <div class="shortcut-item">
            <kbd>Shift</kbd> + <kbd>Tab</kbd>
            <span>들여쓰기 제거</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>A</kbd>
            <span>전체 선택</span>
          </div>
        </div>
        
        <div class="shortcut-section">
          <h4>트리 네비게이션</h4>
          <div class="shortcut-item">
            <kbd>Enter</kbd> / <kbd>Space</kbd>
            <span>노드 확장/축소</span>
          </div>
          <div class="shortcut-item">
            <kbd>→</kbd>
            <span>노드 확장 또는 다음 노드</span>
          </div>
          <div class="shortcut-item">
            <kbd>←</kbd>
            <span>노드 축소 또는 이전 노드</span>
          </div>
          <div class="shortcut-item">
            <kbd>↑</kbd> / <kbd>↓</kbd>
            <span>노드 간 이동</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isVisible = ref(false)

// Ctrl+? 단축키로 도움말 토글
const handleKeydown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === '?') {
    event.preventDefault()
    isVisible.value = !isVisible.value
  }
  
  // Escape로 도움말 닫기
  if (event.key === 'Escape' && isVisible.value) {
    isVisible.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.keyboard-shortcuts {
  position: relative;
}

.shortcuts-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--color-background-alt);
  border-radius: 0.375rem;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.shortcuts-toggle:hover {
  background: var(--color-border);
  color: var(--color-text);
}

.shortcuts-panel {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  width: 320px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.shortcuts-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.shortcuts-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: 0.25rem;
  transition: all 0.15s ease;
}

.close-button:hover {
  background: var(--color-background-alt);
  color: var(--color-text);
}

.shortcuts-content {
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.shortcut-section {
  margin-bottom: 1.5rem;
}

.shortcut-section:last-child {
  margin-bottom: 0;
}

.shortcut-section h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.shortcut-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.875rem;
}

.shortcut-item span {
  color: var(--color-text);
}

kbd {
  display: inline-block;
  padding: 0.125rem 0.375rem;
  font-size: 0.75rem;
  font-family: monospace;
  background: var(--color-background-alt);
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  color: var(--color-text);
  margin: 0 0.125rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 모바일에서는 패널 크기 조정 */
@media (max-width: 768px) {
  .shortcuts-panel {
    width: 280px;
    right: -140px;
  }
  
  .shortcuts-content {
    padding: 0.75rem;
  }
  
  .shortcut-item {
    font-size: 0.8125rem;
  }
  
  kbd {
    font-size: 0.6875rem;
    padding: 0.1rem 0.3rem;
  }
}
</style>