<template>
  <div 
    class="panel-resizer"
    :class="{ 'panel-resizer--active': isResizing }"
    @mousedown="startResize"
    @touchstart="startResize"
    role="separator"
    aria-orientation="vertical"
    aria-label="패널 크기 조정"
    tabindex="0"
    @keydown="handleKeydown"
  >
    <div class="resizer-track">
      <div class="resizer-handle">
        <div class="handle-dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{
  resize: [width: number]
}>()

const isResizing = ref(false)
const startX = ref(0)
const startWidth = ref(0)

const startResize = (event: MouseEvent | TouchEvent) => {
  isResizing.value = true
  
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  startX.value = clientX
  
  // 현재 왼쪽 패널의 너비 가져오기
  const leftPanel = document.querySelector('.input-panel') as HTMLElement
  if (leftPanel) {
    startWidth.value = leftPanel.offsetWidth
  }
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.addEventListener('touchmove', handleResize)
  document.addEventListener('touchend', stopResize)
  
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  
  event.preventDefault()
}

const handleResize = (event: MouseEvent | TouchEvent) => {
  if (!isResizing.value) return
  
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const deltaX = clientX - startX.value
  const newWidth = startWidth.value + deltaX
  
  // 최소/최대 너비 제한
  const minWidth = 300
  const maxWidth = window.innerWidth - 300
  const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
  
  emit('resize', clampedWidth)
}

const stopResize = () => {
  isResizing.value = false
  
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('touchmove', handleResize)
  document.removeEventListener('touchend', stopResize)
  
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// 키보드로 리사이즈
const handleKeydown = (event: KeyboardEvent) => {
  const step = 50
  const leftPanel = document.querySelector('.input-panel') as HTMLElement
  if (!leftPanel) return
  
  let newWidth = leftPanel.offsetWidth
  
  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      newWidth -= step
      break
    case 'ArrowRight':
      event.preventDefault()
      newWidth += step
      break
    default:
      return
  }
  
  const minWidth = 300
  const maxWidth = window.innerWidth - 300
  const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
  
  emit('resize', clampedWidth)
}

onUnmounted(() => {
  stopResize()
})
</script>

<style scoped>
.panel-resizer {
  width: 1rem;
  cursor: col-resize;
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  z-index: 10;
}

.panel-resizer:hover {
  background: rgba(99, 102, 241, 0.05);
}

.panel-resizer:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  background: rgba(99, 102, 241, 0.1);
}

.panel-resizer--active {
  background: rgba(99, 102, 241, 0.1);
}

.resizer-track {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.resizer-track::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--color-border);
  transform: translateX(-50%);
  transition: all var(--transition-fast);
}

.panel-resizer:hover .resizer-track::before,
.panel-resizer--active .resizer-track::before {
  background: var(--color-primary);
  width: 2px;
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.3);
}

.resizer-handle {
  position: relative;
  width: 1.5rem;
  height: 3rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8);
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.panel-resizer:hover .resizer-handle,
.panel-resizer:focus-visible .resizer-handle,
.panel-resizer--active .resizer-handle {
  opacity: 1;
  transform: scale(1);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.handle-dots {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
}

.dot {
  width: 0.25rem;
  height: 0.25rem;
  background: var(--color-text-muted);
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.panel-resizer:hover .dot,
.panel-resizer:focus-visible .dot,
.panel-resizer--active .dot {
  background: var(--color-primary);
  transform: scale(1.2);
}

/* 애니메이션 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.panel-resizer--active .dot {
  animation: pulse 1s ease-in-out infinite;
}

/* 모바일에서는 리사이저 숨김 */
@media (max-width: 768px) {
  .panel-resizer {
    display: none;
  }
}

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  .panel-resizer,
  .resizer-track::before,
  .resizer-handle,
  .dot {
    transition: none;
  }
  
  .panel-resizer--active .dot {
    animation: none;
  }
}

/* 고대비 모드 */
@media (prefers-contrast: high) {
  .resizer-track::before {
    background: var(--color-text);
    width: 2px;
  }
  
  .resizer-handle {
    border-width: 2px;
  }
  
  .dot {
    background: var(--color-text);
  }
}
</style>