import { ref, onUnmounted } from 'vue'

export interface AriaLiveRegion {
  id: string
  element: HTMLElement
  priority: 'polite' | 'assertive'
}

export function useAria() {
  const liveRegions = ref<Map<string, AriaLiveRegion>>(new Map())
  const cleanupFunctions = ref<(() => void)[]>([])

  // ARIA Live Region 생성 및 관리
  const createLiveRegion = (priority: 'polite' | 'assertive' = 'polite'): string => {
    const id = `aria-live-${Math.random().toString(36).substr(2, 9)}`
    
    const element = document.createElement('div')
    element.id = id
    element.setAttribute('aria-live', priority)
    element.setAttribute('aria-atomic', 'true')
    element.className = 'sr-only'
    element.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `

    document.body.appendChild(element)

    const region: AriaLiveRegion = { id, element, priority }
    liveRegions.value.set(id, region)

    return id
  }

  // Live Region에 메시지 전달
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // 기존 Live Region 찾기 또는 새로 생성
    let regionId = Array.from(liveRegions.value.values())
      .find(region => region.priority === priority)?.id

    if (!regionId) {
      regionId = createLiveRegion(priority)
    }

    const region = liveRegions.value.get(regionId)
    if (region) {
      // 메시지 설정
      region.element.textContent = message

      // 메시지 전달 후 정리
      setTimeout(() => {
        region.element.textContent = ''
      }, 1000)
    }
  }

  // ARIA 속성 동적 관리
  const setAriaLabel = (element: HTMLElement, label: string) => {
    element.setAttribute('aria-label', label)
  }

  const setAriaDescription = (element: HTMLElement, description: string): () => void => {
    const descId = `desc-${Math.random().toString(36).substr(2, 9)}`
    
    const descElement = document.createElement('div')
    descElement.id = descId
    descElement.className = 'sr-only'
    descElement.textContent = description
    
    document.body.appendChild(descElement)
    element.setAttribute('aria-describedby', descId)

    const cleanup = () => {
      if (document.body.contains(descElement)) {
        document.body.removeChild(descElement)
      }
      element.removeAttribute('aria-describedby')
    }

    cleanupFunctions.value.push(cleanup)
    return cleanup
  }

  const setAriaExpanded = (element: HTMLElement, expanded: boolean) => {
    element.setAttribute('aria-expanded', expanded.toString())
  }

  const setAriaSelected = (element: HTMLElement, selected: boolean) => {
    element.setAttribute('aria-selected', selected.toString())
  }

  const setAriaChecked = (element: HTMLElement, checked: boolean | 'mixed') => {
    element.setAttribute('aria-checked', checked.toString())
  }

  const setAriaDisabled = (element: HTMLElement, disabled: boolean) => {
    element.setAttribute('aria-disabled', disabled.toString())
    if (disabled) {
      element.setAttribute('tabindex', '-1')
    } else {
      element.removeAttribute('tabindex')
    }
  }

  const setAriaHidden = (element: HTMLElement, hidden: boolean) => {
    if (hidden) {
      element.setAttribute('aria-hidden', 'true')
      element.setAttribute('tabindex', '-1')
    } else {
      element.removeAttribute('aria-hidden')
      element.removeAttribute('tabindex')
    }
  }

  // 복합 위젯을 위한 ARIA 패턴
  const setupTreeView = (container: HTMLElement) => {
    container.setAttribute('role', 'tree')
    container.setAttribute('aria-label', 'JSON 트리 구조')
    
    // 트리 아이템들 설정
    const items = container.querySelectorAll('[role="treeitem"]')
    items.forEach((item, index) => {
      const element = item as HTMLElement
      element.setAttribute('tabindex', index === 0 ? '0' : '-1')
      
      // 레벨 설정
      const depth = parseInt(element.dataset.depth || '0')
      element.setAttribute('aria-level', (depth + 1).toString())
      
      // 확장 상태 설정
      const hasChildren = element.querySelector('[role="treeitem"]') !== null
      if (hasChildren) {
        const isExpanded = element.classList.contains('expanded')
        element.setAttribute('aria-expanded', isExpanded.toString())
      }
    })
  }

  const setupTabList = (container: HTMLElement) => {
    container.setAttribute('role', 'tablist')
    
    const tabs = container.querySelectorAll('[role="tab"]')
    const panels = container.querySelectorAll('[role="tabpanel"]')
    
    tabs.forEach((tab, index) => {
      const tabElement = tab as HTMLElement
      const panelElement = panels[index] as HTMLElement
      
      const tabId = `tab-${index}`
      const panelId = `panel-${index}`
      
      tabElement.id = tabId
      tabElement.setAttribute('aria-controls', panelId)
      tabElement.setAttribute('tabindex', index === 0 ? '0' : '-1')
      
      if (panelElement) {
        panelElement.id = panelId
        panelElement.setAttribute('aria-labelledby', tabId)
        panelElement.setAttribute('tabindex', '0')
      }
    })
  }

  const setupCombobox = (input: HTMLElement, listbox: HTMLElement) => {
    const comboboxId = `combobox-${Math.random().toString(36).substr(2, 9)}`
    const listboxId = `listbox-${Math.random().toString(36).substr(2, 9)}`
    
    input.setAttribute('role', 'combobox')
    input.setAttribute('aria-expanded', 'false')
    input.setAttribute('aria-autocomplete', 'list')
    input.setAttribute('aria-controls', listboxId)
    input.id = comboboxId
    
    listbox.setAttribute('role', 'listbox')
    listbox.setAttribute('aria-labelledby', comboboxId)
    listbox.id = listboxId
    
    const options = listbox.querySelectorAll('[role="option"]')
    options.forEach((option, index) => {
      const optionElement = option as HTMLElement
      optionElement.setAttribute('aria-selected', 'false')
      optionElement.id = `${listboxId}-option-${index}`
    })
  }

  // 폼 접근성 개선
  const enhanceFormAccessibility = (form: HTMLElement) => {
    const inputs = form.querySelectorAll('input, select, textarea')
    
    inputs.forEach(input => {
      const inputElement = input as HTMLElement
      const label = form.querySelector(`label[for="${inputElement.id}"]`)
      
      if (!label && !inputElement.getAttribute('aria-label')) {
        // 레이블이 없는 경우 placeholder나 name으로 레이블 생성
        const placeholder = inputElement.getAttribute('placeholder')
        const name = inputElement.getAttribute('name')
        
        if (placeholder) {
          inputElement.setAttribute('aria-label', placeholder)
        } else if (name) {
          inputElement.setAttribute('aria-label', name)
        }
      }
      
      // 필수 필드 표시
      if (inputElement.hasAttribute('required')) {
        inputElement.setAttribute('aria-required', 'true')
      }
      
      // 오류 상태 처리
      if (inputElement.classList.contains('error') || inputElement.getAttribute('aria-invalid') === 'true') {
        inputElement.setAttribute('aria-invalid', 'true')
        
        // 오류 메시지 연결
        const errorMessage = form.querySelector(`[data-error-for="${inputElement.id}"]`)
        if (errorMessage) {
          const errorId = `error-${inputElement.id}`
          errorMessage.id = errorId
          inputElement.setAttribute('aria-describedby', errorId)
        }
      }
    })
  }

  // 테이블 접근성 개선
  const enhanceTableAccessibility = (table: HTMLElement) => {
    table.setAttribute('role', 'table')
    
    const headers = table.querySelectorAll('th')
    headers.forEach((header, index) => {
      const headerElement = header as HTMLElement
      headerElement.setAttribute('role', 'columnheader')
      headerElement.id = `header-${index}`
    })
    
    const rows = table.querySelectorAll('tbody tr')
    rows.forEach(row => {
      const rowElement = row as HTMLElement
      rowElement.setAttribute('role', 'row')
      
      const cells = row.querySelectorAll('td')
      cells.forEach((cell, cellIndex) => {
        const cellElement = cell as HTMLElement
        cellElement.setAttribute('role', 'cell')
        
        // 헤더와 연결
        const correspondingHeader = headers[cellIndex]
        if (correspondingHeader) {
          cellElement.setAttribute('aria-describedby', correspondingHeader.id)
        }
      })
    })
  }

  // 모달 접근성 설정
  const setupModal = (modal: HTMLElement, trigger?: HTMLElement) => {
    modal.setAttribute('role', 'dialog')
    modal.setAttribute('aria-modal', 'true')
    modal.setAttribute('tabindex', '-1')
    
    // 제목 연결
    const title = modal.querySelector('h1, h2, h3, .modal-title')
    if (title) {
      const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`
      title.id = titleId
      modal.setAttribute('aria-labelledby', titleId)
    }
    
    // 설명 연결
    const description = modal.querySelector('.modal-description, .modal-body p:first-child')
    if (description) {
      const descId = `modal-desc-${Math.random().toString(36).substr(2, 9)}`
      description.id = descId
      modal.setAttribute('aria-describedby', descId)
    }
    
    // 포커스 관리
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    if (focusableElements.length > 0) {
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
      
      // 포커스 트랩
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
        }
      }
      
      modal.addEventListener('keydown', handleTabKey)
      
      // 모달 열릴 때 첫 번째 요소에 포커스
      setTimeout(() => {
        firstElement.focus()
      }, 100)
      
      // 정리 함수
      const cleanup = () => {
        modal.removeEventListener('keydown', handleTabKey)
        if (trigger) {
          trigger.focus()
        }
      }
      
      cleanupFunctions.value.push(cleanup)
      return cleanup
    }
  }

  // 진행률 표시기 설정
  const setupProgressIndicator = (element: HTMLElement, value: number, max: number = 100, label?: string) => {
    element.setAttribute('role', 'progressbar')
    element.setAttribute('aria-valuenow', value.toString())
    element.setAttribute('aria-valuemin', '0')
    element.setAttribute('aria-valuemax', max.toString())
    
    if (label) {
      element.setAttribute('aria-label', label)
    }
    
    // 백분율 계산
    const percentage = Math.round((value / max) * 100)
    element.setAttribute('aria-valuetext', `${percentage}% 완료`)
  }

  // 상태 메시지 설정
  const setupStatusMessage = (element: HTMLElement, live: boolean = true) => {
    element.setAttribute('role', 'status')
    if (live) {
      element.setAttribute('aria-live', 'polite')
      element.setAttribute('aria-atomic', 'true')
    }
  }

  // 경고 메시지 설정
  const setupAlertMessage = (element: HTMLElement) => {
    element.setAttribute('role', 'alert')
    element.setAttribute('aria-live', 'assertive')
    element.setAttribute('aria-atomic', 'true')
  }

  // 정리 함수
  const cleanup = () => {
    // Live Region 정리
    liveRegions.value.forEach(region => {
      if (document.body.contains(region.element)) {
        document.body.removeChild(region.element)
      }
    })
    liveRegions.value.clear()

    // 기타 정리 함수들 실행
    cleanupFunctions.value.forEach(fn => fn())
    cleanupFunctions.value = []
  }

  onUnmounted(() => {
    cleanup()
  })

  return {
    // Live Region 관리
    createLiveRegion,
    announce,
    
    // ARIA 속성 설정
    setAriaLabel,
    setAriaDescription,
    setAriaExpanded,
    setAriaSelected,
    setAriaChecked,
    setAriaDisabled,
    setAriaHidden,
    
    // 복합 위젯 설정
    setupTreeView,
    setupTabList,
    setupCombobox,
    setupModal,
    setupProgressIndicator,
    setupStatusMessage,
    setupAlertMessage,
    
    // 폼 및 테이블 개선
    enhanceFormAccessibility,
    enhanceTableAccessibility,
    
    // 정리
    cleanup
  }
}