import { ref, onMounted, onUnmounted } from 'vue'

export default function useKeyboardShortcuts() {
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

  return {
    isVisible
  }
}