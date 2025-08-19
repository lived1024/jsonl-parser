import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useAnalytics } from './useAnalytics'
import { useUserPreferenceStore } from '../stores/userPreferenceStore'
import { UserPreferenceService } from '../services/UserPreferenceService'
import type { UserProperties } from '../types/analytics'

/**
 * Enhanced composable for tracking user behavior and interactions
 * Integrates with user preference store for comprehensive tracking
 */
export function useUserTracking() {
  const { setUserProperties, trackEvent, trackTiming, trackException } = useAnalytics()
  const userPreferenceStore = useUserPreferenceStore()
  const userPreferenceService = UserPreferenceService.getInstance()
  
  const sessionStartTime = ref<number>(Date.now())
  const pageStartTime = ref<number>(Date.now())
  const interactionCount = ref<number>(0)
  const scrollDepth = ref<number>(0)
  const maxScrollDepth = ref<number>(0)
  const isActive = ref<boolean>(true)
  const lastActivityTime = ref<number>(Date.now())

  // Computed properties
  const sessionDuration = computed(() => Date.now() - sessionStartTime.value)
  const pageEngagementTime = computed(() => Date.now() - pageStartTime.value)
  const trackingEnabled = computed(() => userPreferenceStore.trackingEnabled)

  /**
   * Initialize enhanced user tracking
   */
  const initializeUserTracking = async () => {
    if (!trackingEnabled.value) return

    try {
      // Initialize user preference service
      await userPreferenceService.initialize()
      
      // Set initial user properties
      const userProps: UserProperties = {
        user_language: navigator.language || 'unknown',
        user_theme: getThemePreference(),
        session_count: getSessionCount()
      }
      
      setUserProperties(userProps)
      
      // Track session start in both analytics and preference store
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

      // Track page view in preference store
      userPreferenceStore.trackPageView(
        window.location.pathname,
        document.title,
        document.referrer
      )

      // Set up enhanced tracking listeners
      setupEnhancedTracking()
      
    } catch (error) {
      console.warn('Failed to initialize enhanced user tracking:', error)
    }
  }

  /**
   * Track enhanced page engagement
   */
  const trackPageEngagement = () => {
    if (!trackingEnabled.value) return

    const engagementTime = Date.now() - pageStartTime.value
    
    if (engagementTime > 1000) { // Only track if user spent more than 1 second
      trackTiming('page_engagement', engagementTime, 'user_behavior', window.location.pathname)
      
      // Track in preference store with additional context
      userPreferenceStore.trackContentEngagement(
        window.location.pathname,
        getContentTypeFromPath(window.location.pathname),
        engagementTime,
        calculateCompletionRate(),
        interactionCount.value
      )
    }
  }

  /**
   * Track enhanced user interactions
   */
  const trackInteraction = (interactionType: string, target?: string, customParams?: Record<string, any>) => {
    if (!trackingEnabled.value) return

    interactionCount.value++
    lastActivityTime.value = Date.now()
    
    trackEvent({
      category: 'user_interaction',
      action: interactionType,
      label: target,
      value: interactionCount.value,
      customParameters: {
        interaction_count: interactionCount.value,
        timestamp: Date.now(),
        session_duration: sessionDuration.value,
        page_engagement_time: pageEngagementTime.value,
        scroll_depth: scrollDepth.value,
        ...customParams
      }
    })

    // Track in preference store
    if (target) {
      const element = document.querySelector(target) as HTMLElement
      if (element) {
        userPreferenceStore.trackClick(
          target,
          element.tagName.toLowerCase(),
          { x: 0, y: 0 }, // Would need actual coordinates from event
          getContentTypeFromPath(window.location.pathname)
        )
      }
    }
  }

  /**
   * Track enhanced scroll behavior
   */
  const trackScrollDepth = () => {
    if (!trackingEnabled.value) return

    const scrollPercentage = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    )
    
    scrollDepth.value = scrollPercentage
    maxScrollDepth.value = Math.max(maxScrollDepth.value, scrollPercentage)
    
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
          scroll_percentage: scrollPercentage,
          max_scroll_depth: maxScrollDepth.value,
          scroll_speed: calculateScrollSpeed(),
          engagement_time: pageEngagementTime.value
        }
      })

      // Track scroll behavior in preference store
      userPreferenceStore.trackScrollBehavior(
        maxScrollDepth.value,
        calculateScrollSpeed(),
        getScrollPausePoints()
      )
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
   * Track enhanced file operations
   */
  const trackFileOperation = (operation: 'upload' | 'download' | 'copy' | 'share', fileName?: string, fileSize?: number) => {
    if (!trackingEnabled.value) return

    trackEvent({
      category: 'user_interaction',
      action: `file_${operation}`,
      label: fileName,
      value: fileSize,
      customParameters: {
        file_name: fileName,
        file_size: fileSize,
        operation,
        timestamp: Date.now(),
        session_context: getSessionContext()
      }
    })

    // Track file operation in preference store
    userPreferenceService.trackInteraction(
      document.body, // fallback element
      `file_${operation}`,
      {
        fileName,
        fileSize,
        operation
      }
    )
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

  /**
   * Track enhanced tool usage
   */
  const trackToolUsage = (
    toolName: string,
    action: 'start' | 'success' | 'error' | 'cancel',
    metadata?: {
      inputSize?: 'small' | 'medium' | 'large'
      processingTime?: number
      errorType?: string
      outputSize?: number
      memoryUsage?: number
    }
  ) => {
    if (!trackingEnabled.value) return

    const toolData = {
      toolName,
      action,
      metadata: metadata || {},
      timestamp: Date.now(),
      sessionContext: getSessionContext()
    }

    // Track in analytics
    trackEvent({
      category: 'tool_usage',
      action: `tool_${action}`,
      label: toolName,
      customParameters: toolData
    })

    // Track in preference store
    if (metadata) {
      userPreferenceStore.trackToolUsage(
        toolName,
        metadata.inputSize || 'medium',
        metadata.processingTime || 0,
        action === 'success',
        metadata.errorType,
        getContentTypeFromPath(window.location.pathname)
      )

      // Track feature usage
      userPreferenceStore.trackFeatureUsage(
        toolName,
        action,
        metadata.processingTime || 0,
        action === 'success'
      )
    }
  }

  /**
   * Track tutorial progress
   */
  const trackTutorialProgress = (tutorialId: string, progress: number, action: 'start' | 'progress' | 'complete' | 'abandon') => {
    if (!trackingEnabled.value) return

    // Track in analytics
    trackEvent({
      category: 'tutorial',
      action,
      label: tutorialId,
      value: progress,
      customParameters: {
        tutorial_id: tutorialId,
        progress_percentage: progress,
        timestamp: Date.now()
      }
    })

    // Update preference store
    userPreferenceStore.updateTutorialProgress(tutorialId, progress)

    // Track content engagement
    userPreferenceStore.trackContentEngagement(
      tutorialId,
      'tutorial',
      pageEngagementTime.value,
      progress / 100,
      interactionCount.value
    )
  }

  /**
   * Track accessibility usage
   */
  const trackAccessibilityUsage = (feature: string, enabled: boolean) => {
    if (!trackingEnabled.value) return

    trackEvent({
      category: 'accessibility',
      action: enabled ? 'enable' : 'disable',
      label: feature,
      customParameters: {
        feature,
        enabled,
        timestamp: Date.now()
      }
    })

    // Update preferences
    if (feature === 'high_contrast') {
      userPreferenceStore.updatePreference('accessibility', {
        ...userPreferenceStore.preferences.accessibility,
        highContrast: enabled
      })
    } else if (feature === 'reduced_motion') {
      userPreferenceStore.updatePreference('accessibility', {
        ...userPreferenceStore.preferences.accessibility,
        reducedMotion: enabled
      })
    } else if (feature === 'keyboard_navigation') {
      userPreferenceStore.updatePreference('accessibility', {
        ...userPreferenceStore.preferences.accessibility,
        keyboardNavigation: enabled
      })
    }
  }

  // Helper functions
  const getContentTypeFromPath = (path: string): 'tutorial' | 'reference' | 'sample' | 'guide' => {
    if (path.includes('/learn') || path.includes('/tutorial')) return 'tutorial'
    if (path.includes('/reference')) return 'reference'
    if (path.includes('/samples')) return 'sample'
    return 'guide'
  }

  const calculateCompletionRate = (): number => {
    // Simple completion rate based on scroll depth and time spent
    const timeWeight = Math.min(pageEngagementTime.value / 60000, 1) // Max 1 minute for full time score
    const scrollWeight = maxScrollDepth.value / 100
    return (timeWeight * 0.4 + scrollWeight * 0.6) * 100
  }

  const calculateScrollSpeed = (): number => {
    // Calculate average scroll speed (pixels per second)
    const timeSpent = pageEngagementTime.value / 1000 // seconds
    return timeSpent > 0 ? window.scrollY / timeSpent : 0
  }

  const getScrollPausePoints = (): number[] => {
    // This would need to be tracked over time, returning empty array for now
    return []
  }

  const getSessionContext = (): Record<string, any> => {
    return {
      path: window.location.pathname,
      referrer: document.referrer,
      timestamp: Date.now(),
      scrollPosition: window.scrollY,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      sessionDuration: sessionDuration.value,
      interactionCount: interactionCount.value
    }
  }

  /**
   * Set up enhanced tracking listeners
   */
  const setupEnhancedTracking = () => {
    // Track user activity for idle detection
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    const handleActivity = () => {
      lastActivityTime.value = Date.now()
      isActive.value = true
    }

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    // Check for idle state every 30 seconds
    const idleCheckInterval = setInterval(() => {
      const idleTime = Date.now() - lastActivityTime.value
      const wasActive = isActive.value
      
      isActive.value = idleTime < 30000 // 30 seconds idle threshold
      
      if (wasActive && !isActive.value) {
        trackEvent({
          category: 'user_interaction',
          action: 'idle_start',
          customParameters: {
            idle_time: idleTime,
            timestamp: Date.now()
          }
        })
      } else if (!wasActive && isActive.value) {
        trackEvent({
          category: 'user_interaction',
          action: 'idle_end',
          customParameters: {
            timestamp: Date.now()
          }
        })
      }
    }, 30000)

    // Cleanup function
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
      clearInterval(idleCheckInterval)
    }
  }

  // Lifecycle hooks
  onMounted(async () => {
    pageStartTime.value = Date.now()
    await initializeUserTracking()
    const cleanup = setupEventListeners()
    const enhancedCleanup = setupEnhancedTracking()
    
    onUnmounted(() => {
      trackPageEngagement()
      
      // Save session data before unmounting
      if (trackingEnabled.value) {
        userPreferenceStore.saveSessionData()
      }
      
      cleanup()
      enhancedCleanup()
    })
  })

  return {
    // Enhanced tracking functions
    trackInteraction,
    trackFormInteraction,
    trackSearch,
    trackFileOperation,
    trackError,
    trackPerformance,
    trackToolUsage,
    trackTutorialProgress,
    trackAccessibilityUsage,
    
    // State
    interactionCount: interactionCount.value,
    sessionStartTime: sessionStartTime.value,
    sessionDuration,
    pageEngagementTime,
    scrollDepth,
    maxScrollDepth,
    isActive,
    trackingEnabled
  }
}