import { ref, onMounted, onUnmounted } from 'vue'

export default function useKeyboardShortcuts() {
  const isVisible = ref(false)

  // Alt+H 단축키로 도움말 토글
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.altKey && event.key === 'h') {
      event.preventDefault()
      isVisible.value = !isVisible.value
    }
    
    // Escape로 도움말 닫기
    if (event.key === 'Escape' && isVisible.value) {
      isVisible.value = false
    }
  }

  // 패널 외부 클릭 시 닫기
  const handleClickOutside = (event: MouseEvent) => {
    if (!isVisible.value) return
    
    const target = event.target as Element
    const panel = document.querySelector('.shortcuts-panel')
    const toggle = document.querySelector('.shortcuts-toggle')
    
    if (panel && toggle && !panel.contains(target) && !toggle.contains(target)) {
      isVisible.value = false
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
    document.addEventListener('click', handleClickOutside)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
    document.removeEventListener('click', handleClickOutside)
  })

  return {
    isVisible
  }
}