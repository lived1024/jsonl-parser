import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAccessibility } from './useAccessibility'

export interface KeyboardShortcut {
  key: string
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[]
  description: string
  action: () => void
  context?: string
}

export function useKeyboardNavigation() {
  const { announceToScreenReader } = useAccessibility()
  
  // 키보드 단축키 등록
  const shortcuts = ref<KeyboardShortcut[]>([])
  const isShowingHelp = ref(false)

  // 기본 단축키들
  const defaultShortcuts: KeyboardShortcut[] = [
    {
      key: 'i',
      modifiers: ['alt'],
      description: '입력 영역에 포커스',
      action: () => focusInputArea(),
      context: 'global'
    },
    {
      key: 'Enter',
      modifiers: ['alt'],
      description: 'JSON 파싱 실행',
      action: () => triggerParsing(),
      context: 'global'
    },
    {
      key: 'e',
      modifiers: ['alt'],
      description: '모든 노드 펼치기',
      action: () => expandAllNodes(),
      context: 'tree'
    },
    {
      key: 'w',
      modifiers: ['alt'],
      description: '모든 노드 접기',
      action: () => collapseAllNodes(),
      context: 'tree'
    },
    {
      key: 's',
      modifiers: ['alt'],
      description: '메인 콘텐츠로 스킵',
      action: () => skipToMainContent(),
      context: 'global'
    },
    {
      key: 'h',
      modifiers: ['alt'],
      description: '키보드 단축키 도움말',
      action: () => toggleKeyboardHelp(),
      context: 'global'
    },
    {
      key: '/',
      modifiers: [],
      description: '검색 시작',
      action: () => focusSearch(),
      context: 'global'
    },
    {
      key: 'Escape',
      modifiers: [],
      description: '현재 작업 취소/포커스 해제',
      action: () => handleEscape(),
      context: 'global'
    }
  ]

  // 레벨별 펼치기 단축키 (Alt + 1-9)
  for (let i = 1; i <= 9; i++) {
    defaultShortcuts.push({
      key: i.toString(),
      modifiers: ['alt'],
      description: `레벨 ${i}까지 펼치기`,
      action: () => expandToLevel(i - 1),
      context: 'tree'
    })
  }

  // 단축키 등록
  const registerShortcut = (shortcut: KeyboardShortcut) => {
    shortcuts.value.push(shortcut)
  }

  // 단축키 제거
  const unregisterShortcut = (key: string, modifiers?: string[]) => {
    shortcuts.value = shortcuts.value.filter(s => 
      !(s.key === key && JSON.stringify(s.modifiers) === JSON.stringify(modifiers))
    )
  }

  // 키보드 이벤트 처리
  const handleKeyDown = (event: KeyboardEvent) => {
    const activeElement = document.activeElement as HTMLElement
    const isInputElement = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.contentEditable === 'true'
    )

    // 입력 요소에서는 일부 단축키만 허용
    if (isInputElement && !event.altKey && !event.ctrlKey && !event.metaKey) {
      return
    }

    // 등록된 단축키 확인
    const allShortcuts = [...defaultShortcuts, ...shortcuts.value]
    
    for (const shortcut of allShortcuts) {
      if (matchesShortcut(event, shortcut)) {
        event.preventDefault()
        shortcut.action()
        
        // 스크린 리더에게 알림
        announceToScreenReader(`${shortcut.description} 실행됨`)
        return
      }
    }
  }

  // 단축키 매칭 확인
  const matchesShortcut = (event: KeyboardEvent, shortcut: KeyboardShortcut): boolean => {
    if (event.key !== shortcut.key) return false

    const modifiers = shortcut.modifiers || []
    const hasCtrl = modifiers.includes('ctrl')
    const hasAlt = modifiers.includes('alt')
    const hasShift = modifiers.includes('shift')
    const hasMeta = modifiers.includes('meta')

    return (
      event.ctrlKey === hasCtrl &&
      event.altKey === hasAlt &&
      event.shiftKey === hasShift &&
      event.metaKey === hasMeta
    )
  }

  // 트리 네비게이션
  const navigateTree = (direction: 'up' | 'down' | 'left' | 'right') => {
    const treeNodes = Array.from(document.querySelectorAll('[role="treeitem"]')) as HTMLElement[]
    const currentIndex = treeNodes.indexOf(document.activeElement as HTMLElement)
    
    if (currentIndex === -1) {
      // 첫 번째 노드에 포커스
      treeNodes[0]?.focus()
      return
    }

    let nextIndex = currentIndex

    switch (direction) {
      case 'up':
        nextIndex = Math.max(0, currentIndex - 1)
        break
      case 'down':
        nextIndex = Math.min(treeNodes.length - 1, currentIndex + 1)
        break
      case 'left':
        // 부모 노드로 이동 또는 접기
        const currentNode = treeNodes[currentIndex]
        const isExpanded = currentNode.getAttribute('aria-expanded') === 'true'
        if (isExpanded) {
          // 노드 접기
          currentNode.click()
        } else {
          // 부모 노드 찾기
          const level = parseInt(currentNode.getAttribute('aria-level') || '1')
          for (let i = currentIndex - 1; i >= 0; i--) {
            const nodeLevel = parseInt(treeNodes[i].getAttribute('aria-level') || '1')
            if (nodeLevel < level) {
              nextIndex = i
              break
            }
          }
        }
        break
      case 'right':
        // 자식 노드로 이동 또는 펼치기
        const node = treeNodes[currentIndex]
        const hasChildren = node.getAttribute('aria-expanded') !== null
        const expanded = node.getAttribute('aria-expanded') === 'true'
        
        if (hasChildren && !expanded) {
          // 노드 펼치기
          node.click()
        } else if (expanded && currentIndex < treeNodes.length - 1) {
          // 첫 번째 자식으로 이동
          nextIndex = currentIndex + 1
        }
        break
    }

    if (nextIndex !== currentIndex && treeNodes[nextIndex]) {
      treeNodes[nextIndex].focus()
    }
  }

  // 액션 함수들
  const focusInputArea = () => {
    const textarea = document.querySelector('.editor-textarea') as HTMLTextAreaElement
    if (textarea) {
      textarea.focus()
    }
  }

  const triggerParsing = () => {
    const parseButton = document.querySelector('[data-action="parse"]') as HTMLButtonElement
    if (parseButton) {
      parseButton.click()
    } else {
      // 스토어에서 직접 파싱 실행
      const event = new CustomEvent('trigger-parsing')
      document.dispatchEvent(event)
    }
  }

  const expandAllNodes = () => {
    const event = new CustomEvent('expand-all-nodes')
    document.dispatchEvent(event)
  }

  const collapseAllNodes = () => {
    const event = new CustomEvent('collapse-all-nodes')
    document.dispatchEvent(event)
  }

  const expandToLevel = (level: number) => {
    const event = new CustomEvent('expand-to-level', { detail: { level } })
    document.dispatchEvent(event)
  }

  const skipToMainContent = () => {
    const mainContent = document.querySelector('main, [role="main"], #main-content') as HTMLElement
    if (mainContent) {
      mainContent.focus()
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const focusSearch = () => {
    const searchInput = document.querySelector('input[type="search"], .search-input') as HTMLInputElement
    if (searchInput) {
      searchInput.focus()
    }
  }

  const handleEscape = () => {
    const activeElement = document.activeElement as HTMLElement
    
    // 모달이 열려있으면 닫기
    const modal = document.querySelector('[role="dialog"][aria-modal="true"]')
    if (modal) {
      const closeButton = modal.querySelector('[data-action="close"], .modal-close') as HTMLButtonElement
      if (closeButton) {
        closeButton.click()
        return
      }
    }

    // 드롭다운이 열려있으면 닫기
    const openDropdown = document.querySelector('[aria-expanded="true"]')
    if (openDropdown) {
      (openDropdown as HTMLElement).click()
      return
    }

    // 현재 포커스 해제
    if (activeElement && activeElement.blur) {
      activeElement.blur()
    }
  }

  const toggleKeyboardHelp = () => {
    isShowingHelp.value = !isShowingHelp.value
    
    if (isShowingHelp.value) {
      showKeyboardHelpModal()
    } else {
      hideKeyboardHelpModal()
    }
  }

  const showKeyboardHelpModal = () => {
    // 키보드 도움말 모달 생성
    const modal = document.createElement('div')
    modal.id = 'keyboard-help-modal'
    modal.setAttribute('role', 'dialog')
    modal.setAttribute('aria-modal', 'true')
    modal.setAttribute('aria-labelledby', 'keyboard-help-title')
    modal.className = 'keyboard-help-modal'

    const shortcuts = [...defaultShortcuts, ...shortcuts.value]
    const globalShortcuts = shortcuts.filter(s => s.context === 'global' || !s.context)
    const treeShortcuts = shortcuts.filter(s => s.context === 'tree')

    modal.innerHTML = `
      <div class="modal-backdrop" data-action="close"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2 id="keyboard-help-title">키보드 단축키</h2>
          <button class="modal-close" data-action="close" aria-label="도움말 닫기">×</button>
        </div>
        <div class="modal-body">
          <div class="shortcut-section">
            <h3>전역 단축키</h3>
            <div class="shortcut-list">
              ${globalShortcuts.map(s => `
                <div class="shortcut-item">
                  <kbd class="shortcut-key">${formatShortcut(s)}</kbd>
                  <span class="shortcut-desc">${s.description}</span>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="shortcut-section">
            <h3>트리 네비게이션</h3>
            <div class="shortcut-list">
              ${treeShortcuts.map(s => `
                <div class="shortcut-item">
                  <kbd class="shortcut-key">${formatShortcut(s)}</kbd>
                  <span class="shortcut-desc">${s.description}</span>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="shortcut-section">
            <h3>트리 내 네비게이션</h3>
            <div class="shortcut-list">
              <div class="shortcut-item">
                <kbd class="shortcut-key">↑/↓</kbd>
                <span class="shortcut-desc">이전/다음 노드</span>
              </div>
              <div class="shortcut-item">
                <kbd class="shortcut-key">←/→</kbd>
                <span class="shortcut-desc">노드 접기/펼치기</span>
              </div>
              <div class="shortcut-item">
                <kbd class="shortcut-key">Enter/Space</kbd>
                <span class="shortcut-desc">노드 토글</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    // 모달 이벤트 리스너
    const closeButtons = modal.querySelectorAll('[data-action="close"]')
    closeButtons.forEach(button => {
      button.addEventListener('click', hideKeyboardHelpModal)
    })

    // 첫 번째 포커스 가능한 요소에 포커스
    const firstFocusable = modal.querySelector('button') as HTMLElement
    firstFocusable?.focus()

    // 포커스 트랩
    const focusableElements = modal.querySelectorAll('button, [tabindex]:not([tabindex="-1"])')
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      } else if (event.key === 'Escape') {
        event.preventDefault()
        hideKeyboardHelpModal()
      }
    }

    modal.addEventListener('keydown', handleTabKey)
  }

  const hideKeyboardHelpModal = () => {
    const modal = document.getElementById('keyboard-help-modal')
    if (modal) {
      document.body.removeChild(modal)
      isShowingHelp.value = false
    }
  }

  const formatShortcut = (shortcut: KeyboardShortcut): string => {
    const modifiers = shortcut.modifiers || []
    const parts = []

    if (modifiers.includes('ctrl')) parts.push('Ctrl')
    if (modifiers.includes('alt')) parts.push('Alt')
    if (modifiers.includes('shift')) parts.push('Shift')
    if (modifiers.includes('meta')) parts.push('Cmd')

    parts.push(shortcut.key.toUpperCase())

    return parts.join(' + ')
  }

  // 컴포넌트 마운트 시 이벤트 리스너 등록
  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
    
    // 트리 네비게이션 이벤트 리스너
    document.addEventListener('keydown', (event) => {
      const activeElement = document.activeElement as HTMLElement
      if (activeElement && activeElement.getAttribute('role') === 'treeitem') {
        switch (event.key) {
          case 'ArrowUp':
            event.preventDefault()
            navigateTree('up')
            break
          case 'ArrowDown':
            event.preventDefault()
            navigateTree('down')
            break
          case 'ArrowLeft':
            event.preventDefault()
            navigateTree('left')
            break
          case 'ArrowRight':
            event.preventDefault()
            navigateTree('right')
            break
        }
      }
    })
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
    hideKeyboardHelpModal()
  })

  return {
    shortcuts: computed(() => shortcuts.value),
    isShowingHelp,
    registerShortcut,
    unregisterShortcut,
    navigateTree,
    toggleKeyboardHelp,
    showKeyboardHelpModal,
    hideKeyboardHelpModal
  }
}