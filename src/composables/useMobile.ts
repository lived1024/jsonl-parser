import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface MobileBreakpoints {
  sm: number
  md: number
  lg: number
  xl: number
}

export interface TouchCapabilities {
  hasTouch: boolean
  hasHover: boolean
  hasPointer: boolean
}

const defaultBreakpoints: MobileBreakpoints = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1200
}

export function useMobile(breakpoints: MobileBreakpoints = defaultBreakpoints) {
  const windowWidth = ref(0)
  const windowHeight = ref(0)
  const orientation = ref<'portrait' | 'landscape'>('portrait')
  
  // Touch capabilities detection
  const touchCapabilities = ref<TouchCapabilities>({
    hasTouch: false,
    hasHover: false,
    hasPointer: false
  })

  // Responsive breakpoint checks
  const isMobileSm = computed(() => windowWidth.value <= breakpoints.sm)
  const isMobileMd = computed(() => windowWidth.value <= breakpoints.md)
  const isTablet = computed(() => windowWidth.value <= breakpoints.lg)
  const isDesktop = computed(() => windowWidth.value > breakpoints.lg)
  
  // Legacy compatibility
  const isMobile = computed(() => isMobileMd.value)

  // Device type detection
  const deviceType = computed(() => {
    if (isMobileSm.value) return 'mobile-sm'
    if (isMobileMd.value) return 'mobile-md'
    if (isTablet.value) return 'tablet'
    return 'desktop'
  })

  // Screen orientation
  const isPortrait = computed(() => orientation.value === 'portrait')
  const isLandscape = computed(() => orientation.value === 'landscape')

  // Touch device detection
  const isTouchDevice = computed(() => touchCapabilities.value.hasTouch)
  const hasHoverCapability = computed(() => touchCapabilities.value.hasHover)

  // Viewport dimensions
  const viewportHeight = computed(() => {
    // Account for mobile browser UI
    if (isMobile.value && typeof window !== 'undefined') {
      return window.innerHeight
    }
    return windowHeight.value
  })

  // Safe area calculations for mobile devices
  const safeAreaInsets = computed(() => {
    if (typeof window === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 }
    
    const style = getComputedStyle(document.documentElement)
    return {
      top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
      bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
      right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0')
    }
  })

  // Update window dimensions
  const updateDimensions = () => {
    if (typeof window !== 'undefined') {
      windowWidth.value = window.innerWidth
      windowHeight.value = window.innerHeight
      
      // Update orientation
      orientation.value = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
    }
  }

  // Detect touch capabilities
  const detectTouchCapabilities = () => {
    if (typeof window === 'undefined') return

    touchCapabilities.value = {
      hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      hasHover: window.matchMedia('(hover: hover)').matches,
      hasPointer: window.matchMedia('(pointer: fine)').matches
    }
  }

  // Prevent zoom on double tap (iOS Safari)
  const preventDoubleTabZoom = (element: HTMLElement) => {
    if (!isTouchDevice.value) return

    let lastTouchEnd = 0
    element.addEventListener('touchend', (event) => {
      const now = new Date().getTime()
      if (now - lastTouchEnd <= 300) {
        event.preventDefault()
      }
      lastTouchEnd = now
    }, { passive: false })
  }

  // Handle viewport height changes (mobile browser UI)
  const handleViewportChange = () => {
    if (typeof window === 'undefined') return

    // Set CSS custom property for mobile viewport height
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
  }

  // Optimize touch scrolling
  const optimizeTouchScrolling = (element: HTMLElement) => {
    if (!isTouchDevice.value) return

    element.style.webkitOverflowScrolling = 'touch'
    element.style.scrollBehavior = 'smooth'
  }

  // Get optimal touch target size
  const getTouchTargetSize = () => {
    if (isMobileSm.value) return 40
    if (isMobileMd.value) return 44
    return 48
  }

  // Get optimal font size for mobile
  const getOptimalFontSize = (baseSize: number) => {
    if (isMobileSm.value) return Math.max(baseSize * 0.9, 14)
    if (isMobileMd.value) return Math.max(baseSize * 0.95, 16)
    return baseSize
  }

  // Check if device supports PWA installation
  const supportsPWA = computed(() => {
    if (typeof window === 'undefined') return false
    return 'serviceWorker' in navigator && 'PushManager' in window
  })

  // Lifecycle
  onMounted(() => {
    updateDimensions()
    detectTouchCapabilities()
    handleViewportChange()

    window.addEventListener('resize', updateDimensions)
    window.addEventListener('orientationchange', () => {
      setTimeout(updateDimensions, 100) // Delay to get accurate dimensions
    })
    window.addEventListener('resize', handleViewportChange)

    // Initial setup
    if (isMobile.value) {
      // Prevent zoom on form inputs
      const metaViewport = document.querySelector('meta[name="viewport"]')
      if (metaViewport) {
        metaViewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        )
      }
    }
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', updateDimensions)
      window.removeEventListener('resize', handleViewportChange)
    }
  })

  return {
    // Dimensions
    windowWidth,
    windowHeight,
    viewportHeight,
    
    // Breakpoints
    isMobileSm,
    isMobileMd,
    isTablet,
    isDesktop,
    isMobile, // Legacy compatibility
    
    // Device info
    deviceType,
    orientation,
    isPortrait,
    isLandscape,
    
    // Touch capabilities
    isTouchDevice,
    hasHoverCapability,
    touchCapabilities,
    
    // Safe areas
    safeAreaInsets,
    
    // PWA support
    supportsPWA,
    
    // Utility functions
    preventDoubleTabZoom,
    optimizeTouchScrolling,
    getTouchTargetSize,
    getOptimalFontSize,
    
    // Manual updates
    updateDimensions,
    detectTouchCapabilities
  }
}

// Global mobile utilities
export const mobileUtils = {
  // Check if running on iOS
  isIOS: () => {
    if (typeof navigator === 'undefined') return false
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
  },

  // Check if running on Android
  isAndroid: () => {
    if (typeof navigator === 'undefined') return false
    return /Android/.test(navigator.userAgent)
  },

  // Check if running in standalone mode (PWA)
  isStandalone: () => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true
  },

  // Get device pixel ratio
  getDevicePixelRatio: () => {
    if (typeof window === 'undefined') return 1
    return window.devicePixelRatio || 1
  },

  // Check if device has notch (iPhone X and newer)
  hasNotch: () => {
    if (typeof window === 'undefined') return false
    return window.CSS?.supports('padding: max(0px)') || false
  },

  // Vibrate device (if supported)
  vibrate: (pattern: number | number[] = 100) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern)
    }
  }
}