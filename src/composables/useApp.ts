import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useJsonTreeStore } from '../stores'

export function useApp() {
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

    // Ctrl/Cmd + E: 모든 노드 펼치기
    if ((event.ctrlKey || event.metaKey) && event.key === 'e' && store.hasData) {
      event.preventDefault()
      store.expandAllNodes()
    }

    // Ctrl/Cmd + W: 모든 노드 접기
    if ((event.ctrlKey || event.metaKey) && event.key === 'w' && store.hasData) {
      event.preventDefault()
      store.collapseAllNodes()
    }

    // Ctrl/Cmd + 1-9: 레벨별 펼치기
    if ((event.ctrlKey || event.metaKey) && /^[1-9]$/.test(event.key) && store.hasData) {
      event.preventDefault()
      const level = parseInt(event.key) - 1
      store.expandToLevel(level)
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

  return {
    isMobile,
    mainStyle,
    inputPanelStyle,
    handlePanelResize
  }
}