<template>
  <div 
    class="panel-resizer"
    @mousedown="startResize"
    @touchstart="startResize"
  >
    <div class="resizer-handle"></div>
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

onUnmounted(() => {
  stopResize()
})
</script>

<style scoped>
.panel-resizer {
  width: 4px;
  background: var(--color-border);
  cursor: col-resize;
  position: relative;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
}

.panel-resizer:hover {
  background: var(--color-secondary);
}

.resizer-handle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 40px;
  background: var(--color-text-muted);
  border-radius: 10px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.panel-resizer:hover .resizer-handle {
  opacity: 0.6;
}

/* 모바일에서는 리사이저 숨김 */
@media (max-width: 768px) {
  .panel-resizer {
    display: none;
  }
}
</style>