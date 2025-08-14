import { ref, onUnmounted } from 'vue'

export default function usePanelResizer(emit: (event: 'resize', width: number) => void) {

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
    document.addEventListener('touchmove', handleResize, { passive: false })
    document.addEventListener('touchend', stopResize)
    
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
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

  return {
    isResizing,
    startResize,
    handleKeydown
  }
}