import { onMounted, onUnmounted, ref } from 'vue'
import { useAnalytics } from './useAnalytics'
import type { UserProperties } from '../types/analytics'

/**
 * Composable for tracking user behavior and interactions
 */
export function useUserTracking() {
  const { setUserProperties, trackEvent, trackTiming, trackException } = useAnalytics()
  
  const sessionStartTime = ref<number>(Date.now())
  const pageStartTime = ref<number>(Date.now())
  const interactionCount = ref<number>(0)

  /**
   * Initialize user tracking
   */
  const initializeUserTracking = () => {
    // Set initial user properties
    const userProps: UserProperties = {
      user_language: navigator.language || 'unknown',
      user_theme: getThemePreference(),
      session_count: getSessionCount()
    }
    
    setUserProperties(userProps)
    
    // Track session start
    trackEvent({
      category: 'user_interaction',
      action: 'session_start',
      customParameters: {
        timestamp: sessionStartTime.value,
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`
      }
    })
  }

  /**
   * Track page engagement time
   */
  const trackPageEngagement = () => {
    const engagementTime = Date.now() - pageStartTime.value
    
    if (engagementTime > 1000) { // Only track if user spent more than 1 second
      trackTiming('page_engagement', engagementTime, 'user_behavior', window.location.pathname)
    }
  }

  /**
   * Track user interactions (clicks, scrolls, etc.)
   */
  const trackInteraction = (interactionType: string, target?: string, customParams?: Record<string, any>) => {
    interactionCount.value++
    
    trackEvent({
      category: 'user_interaction',
      action: interactionType,
      label: target,
      value: interactionCount.value,
      customParameters: {
        interaction_count: interactionCount.value,
        timestamp: Date.now(),
        ...customParams
      }
    })
  }

  /**
   * Track scroll depth
   */
  const trackScrollDepth = () => {
    const scrollPercentage = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    )
    
    // Track at 25%, 50%, 75%, and 100% scroll depths
    const milestones = [25, 50, 75, 100]
    const milestone = milestones.find(m => scrollPercentage >= m && scrollPercentage < m + 5)
    
    if (milestone) {
      trackEvent({
        category: 'user_interaction',
        action: 'scroll_depth',
        label: `${milestone}%`,
        value: milestone,
        customParameters: {
          page_path: window.location.pathname,
          scroll_percentage: scrollPercentage
        }
      })
    }
  }

  /**
   * Track form interactions
   */
  const trackFormInteraction = (formName: string, action: 'focus' | 'blur' | 'submit' | 'error', fieldName?: string) => {
    trackEvent({
      category: 'user_interaction',
      action: `form_${action}`,
      label: formName,
      customParameters: {
        form_name: formName,
        field_name: fieldName,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Track search interactions
   */
  const trackSearch = (searchTerm: string, resultsCount?: number, searchType?: string) => {
    trackEvent({
      category: 'user_interaction',
      action: 'search',
      label: searchTerm,
      value: resultsCount,
      customParameters: {
        search_term: searchTerm,
        search_type: searchType || 'general',
        results_count: resultsCount,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Track file operations
   */
  const trackFileOperation = (operation: 'upload' | 'download' | 'copy' | 'share', fileName?: string, fileSize?: number) => {
    trackEvent({
      category: 'user_interaction',
      action: `file_${operation}`,
      label: fileName,
      value: fileSize,
      customParameters: {
        file_name: fileName,
        file_size: fileSize,
        operation,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Track errors and exceptions
   */
  const trackError = (errorType: string, errorMessage: string, fatal: boolean = false, context?: Record<string, any>) => {
    trackException(`${errorType}: ${errorMessage}`, fatal)
    
    trackEvent({
      category: 'user_interaction',
      action: 'error',
      label: errorType,
      customParameters: {
        error_message: errorMessage,
        error_type: errorType,
        fatal,
        context,
        timestamp: Date.now(),
        page_path: window.location.pathname
      }
    })
  }

  /**
   * Track performance metrics
   */
  const trackPerformance = (metricName: string, value: number, unit: string = 'ms') => {
    trackTiming(metricName, value, 'performance', unit)
    
    trackEvent({
      category: 'user_interaction',
      action: 'performance_metric',
      label: metricName,
      value,
      customParameters: {
        metric_name: metricName,
        metric_value: value,
        unit,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Get theme preference
   */
  const getThemePreference = (): string => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }

  /**
   * Get session count from localStorage
   */
  const getSessionCount = (): number => {
    const sessionCount = localStorage.getItem('analytics_session_count')
    const newCount = sessionCount ? parseInt(sessionCount) + 1 : 1
    localStorage.setItem('analytics_session_count', newCount.toString())
    return newCount
  }

  /**
   * Set up automatic event listeners
   */
  const setupEventListeners = () => {
    // Track scroll depth
    let scrollTimeout: number
    const handleScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = window.setTimeout(trackScrollDepth, 100)
    }
    
    // Track clicks
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const tagName = target.tagName.toLowerCase()
      const className = target.className
      const id = target.id
      
      trackInteraction('click', tagName, {
        element_class: className,
        element_id: id,
        x: event.clientX,
        y: event.clientY
      })
    }

    // Track visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackPageEngagement()
        trackEvent({
          category: 'user_interaction',
          action: 'page_hidden',
          customParameters: {
            engagement_time: Date.now() - pageStartTime.value
          }
        })
      } else {
        pageStartTime.value = Date.now()
        trackEvent({
          category: 'user_interaction',
          action: 'page_visible'
        })
      }
    }

    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('click', handleClick)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup function
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('click', handleClick)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearTimeout(scrollTimeout)
    }
  }

  // Lifecycle hooks
  onMounted(() => {
    pageStartTime.value = Date.now()
    initializeUserTracking()
    const cleanup = setupEventListeners()
    
    onUnmounted(() => {
      trackPageEngagement()
      cleanup()
    })
  })

  return {
    // Tracking functions
    trackInteraction,
    trackFormInteraction,
    trackSearch,
    trackFileOperation,
    trackError,
    trackPerformance,
    
    // State
    interactionCount: interactionCount.value,
    sessionStartTime: sessionStartTime.value
  }
}