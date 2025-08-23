import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface AccessibilityPreferences {
  reduceMotion: boolean
  highContrast: boolean
  largeText: boolean
  screenReader: boolean
  keyboardNavigation: boolean
}

export function useAccessibility() {
  // 접근성 설정 상태
  const preferences = ref<AccessibilityPreferences>({
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    screenReader: false,
    keyboardNavigation: true
  })

  // 시스템 설정 감지
  const systemPreferences = ref({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    prefersLargeText: false
  })

  // 포커스 관리
  const focusHistory = ref<HTMLElement[]>([])
  const currentFocusIndex = ref(-1)

  // 스크린 리더 감지
  const detectScreenReader = (): boolean => {
    // 일반적인 스크린 리더 감지 방법들
    const userAgent = navigator.userAgent.toLowerCase()
    const hasScreenReader = 
      userAgent.includes('nvda') ||
      userAgent.includes('jaws') ||
      userAgent.includes('dragon') ||
      userAgent.includes('voiceover') ||
      // Windows Narrator 감지
      navigator.userAgent.includes('Windows NT') && 'speechSynthesis' in window ||
      // 접근성 API 사용 여부 확인
      'getComputedAccessibleNode' in document ||
      // 고대비 모드 감지 (스크린 리더와 함께 사용되는 경우가 많음)
      window.matchMedia('(prefers-contrast: high)').matches

    return hasScreenReader
  }

  // 시스템 설정 감지 및 적용
  const detectSystemPreferences = () => {
    // 브라우저 환경에서만 실행
    if (typeof window === 'undefined' || !window.matchMedia) {
      return
    }

    try {
      // 애니메이션 감소 설정
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      systemPreferences.value.prefersReducedMotion = reducedMotionQuery.matches
      preferences.value.reduceMotion = reducedMotionQuery.matches

      // 고대비 설정
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
      systemPreferences.value.prefersHighContrast = highContrastQuery.matches
      preferences.value.highContrast = highContrastQuery.matches

      // 큰 텍스트 설정 (일부 브라우저에서 지원)
      const largeTextQuery = window.matchMedia('(prefers-reduced-data: reduce)')
      systemPreferences.value.prefersLargeText = largeTextQuery.matches

      // 스크린 리더 감지
      preferences.value.screenReader = detectScreenReader()

      // 미디어 쿼리 변경 감지
      reducedMotionQuery.addEventListener('change', (e) => {
        systemPreferences.value.prefersReducedMotion = e.matches
        preferences.value.reduceMotion = e.matches
        applyAccessibilitySettings()
      })

      highContrastQuery.addEventListener('change', (e) => {
        systemPreferences.value.prefersHighContrast = e.matches
        preferences.value.highContrast = e.matches
        applyAccessibilitySettings()
      })
    } catch (error) {
      console.warn('Failed to detect system accessibility preferences:', error)
    }
  }

  // 접근성 설정 적용
  const applyAccessibilitySettings = () => {
    const root = document.documentElement

    // 애니메이션 감소
    if (preferences.value.reduceMotion) {
      root.style.setProperty('--animation-duration', '0s')
      root.style.setProperty('--transition-duration', '0s')
      root.classList.add('reduce-motion')
    } else {
      root.style.removeProperty('--animation-duration')
      root.style.removeProperty('--transition-duration')
      root.classList.remove('reduce-motion')
    }

    // 고대비 모드
    if (preferences.value.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // 큰 텍스트
    if (preferences.value.largeText) {
      root.classList.add('large-text')
    } else {
      root.classList.remove('large-text')
    }

    // 스크린 리더 최적화
    if (preferences.value.screenReader) {
      root.classList.add('screen-reader-optimized')
    } else {
      root.classList.remove('screen-reader-optimized')
    }
  }

  // 키보드 네비게이션 관리
  const handleKeyboardNavigation = (event: KeyboardEvent) => {
    // Tab 키 네비게이션 개선
    if (event.key === 'Tab') {
      const focusableElements = getFocusableElements()
      const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
      
      if (event.shiftKey) {
        // Shift+Tab: 이전 요소
        if (currentIndex <= 0) {
          event.preventDefault()
          focusableElements[focusableElements.length - 1]?.focus()
        }
      } else {
        // Tab: 다음 요소
        if (currentIndex >= focusableElements.length - 1) {
          event.preventDefault()
          focusableElements[0]?.focus()
        }
      }
    }

    // 스킵 링크 (Alt + S)
    if (event.altKey && event.key === 's') {
      event.preventDefault()
      skipToMainContent()
    }

    // 도움말 (Alt + H)
    if (event.altKey && event.key === 'h') {
      event.preventDefault()
      showKeyboardShortcuts()
    }
  }

  // 포커스 가능한 요소들 찾기
  const getFocusableElements = (): HTMLElement[] => {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="option"]',
      '[role="tab"]',
      '[role="treeitem"]'
    ].join(', ')

    return Array.from(document.querySelectorAll(selector)) as HTMLElement[]
  }

  // 메인 콘텐츠로 스킵
  const skipToMainContent = () => {
    const mainContent = document.querySelector('main, [role="main"], #main-content')
    if (mainContent) {
      (mainContent as HTMLElement).focus()
      // 스크린 리더에게 알림
      announceToScreenReader('메인 콘텐츠로 이동했습니다')
    }
  }

  // 키보드 단축키 도움말 표시
  const showKeyboardShortcuts = () => {
    // 키보드 단축키 모달 표시 (구현 필요)
    announceToScreenReader('키보드 단축키 도움말을 표시합니다')
  }

  // 스크린 리더에게 메시지 전달
  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // 메시지 전달 후 제거
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  // 포커스 트랩 (모달 등에서 사용)
  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

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

    container.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }

  // ARIA 레이블 동적 업데이트
  const updateAriaLabel = (element: HTMLElement, label: string) => {
    element.setAttribute('aria-label', label)
  }

  const updateAriaDescription = (element: HTMLElement, description: string) => {
    const descId = `desc-${Math.random().toString(36).substr(2, 9)}`
    
    // 설명 요소 생성
    const descElement = document.createElement('div')
    descElement.id = descId
    descElement.className = 'sr-only'
    descElement.textContent = description
    
    document.body.appendChild(descElement)
    element.setAttribute('aria-describedby', descId)

    return () => {
      document.body.removeChild(descElement)
      element.removeAttribute('aria-describedby')
    }
  }

  // 접근성 설정 저장/로드
  const savePreferences = () => {
    try {
      localStorage.setItem('accessibility-preferences', JSON.stringify(preferences.value))
    } catch (error) {
      console.warn('Failed to save accessibility preferences:', error)
    }
  }

  const loadPreferences = () => {
    try {
      const saved = localStorage.getItem('accessibility-preferences')
      if (saved) {
        const parsed = JSON.parse(saved)
        preferences.value = { ...preferences.value, ...parsed }
      }
    } catch (error) {
      console.warn('Failed to load accessibility preferences:', error)
    }
  }

  // 접근성 검사
  const checkAccessibility = () => {
    const issues: string[] = []

    // 이미지 alt 텍스트 검사
    const images = document.querySelectorAll('img:not([alt])')
    if (images.length > 0) {
      issues.push(`${images.length}개의 이미지에 alt 텍스트가 없습니다`)
    }

    // 폼 레이블 검사
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])')
    const unlabeledInputs = Array.from(inputs).filter(input => {
      const labels = document.querySelectorAll(`label[for="${input.id}"]`)
      return labels.length === 0
    })
    if (unlabeledInputs.length > 0) {
      issues.push(`${unlabeledInputs.length}개의 입력 필드에 레이블이 없습니다`)
    }

    // 색상 대비 검사 (간단한 버전)
    const lowContrastElements = document.querySelectorAll('[style*="color"]')
    // 실제 구현에서는 더 정교한 색상 대비 계산이 필요

    return issues
  }

  // 컴포넌트 마운트 시 초기화
  onMounted(() => {
    loadPreferences()
    detectSystemPreferences()
    applyAccessibilitySettings()
    
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyboardNavigation)
    }
  })

  onUnmounted(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', handleKeyboardNavigation)
    }
  })

  return {
    preferences,
    systemPreferences,
    applyAccessibilitySettings,
    announceToScreenReader,
    trapFocus,
    updateAriaLabel,
    updateAriaDescription,
    skipToMainContent,
    showKeyboardShortcuts,
    getFocusableElements,
    savePreferences,
    loadPreferences,
    checkAccessibility
  }
}