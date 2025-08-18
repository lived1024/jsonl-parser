import { AnalyticsService } from '../services/AnalyticsService'
import type {
  AnalyticsEvent,
  PageView,
  UserProperties,
  TutorialEvent,
  ToolEvent,
  SampleEvent,
  NavigationEvent
} from '../types/analytics'

/**
 * Composable for Google Analytics integration
 * Provides easy access to analytics tracking throughout the application
 */
export function useAnalytics() {
  const analyticsService = AnalyticsService.getInstance()

  /**
   * Track page views
   */
  const trackPageView = (path: string, title: string, customParameters?: Record<string, any>) => {
    const pageView: PageView = {
      path,
      title,
      referrer: document.referrer,
      customParameters
    }
    analyticsService.trackPageView(pageView)
  }

  /**
   * Track custom events
   */
  const trackEvent = (event: AnalyticsEvent) => {
    analyticsService.trackEvent(event)
  }

  /**
   * Track tutorial events
   */
  const trackTutorial = {
    start: (tutorialId: string, customParams?: Record<string, any>) => {
      const event: TutorialEvent = {
        category: 'tutorial',
        action: 'start',
        tutorial_id: tutorialId,
        customParameters: customParams
      }
      analyticsService.trackTutorialEvent(event)
    },

    complete: (tutorialId: string, customParams?: Record<string, any>) => {
      const event: TutorialEvent = {
        category: 'tutorial',
        action: 'complete',
        tutorial_id: tutorialId,
        customParameters: customParams
      }
      analyticsService.trackTutorialEvent(event)
    },

    progress: (tutorialId: string, progressPercentage: number, customParams?: Record<string, any>) => {
      const event: TutorialEvent = {
        category: 'tutorial',
        action: 'progress',
        tutorial_id: tutorialId,
        progress_percentage: progressPercentage,
        customParameters: customParams
      }
      analyticsService.trackTutorialEvent(event)
    },

    abandon: (tutorialId: string, progressPercentage: number, customParams?: Record<string, any>) => {
      const event: TutorialEvent = {
        category: 'tutorial',
        action: 'abandon',
        tutorial_id: tutorialId,
        progress_percentage: progressPercentage,
        customParameters: customParams
      }
      analyticsService.trackTutorialEvent(event)
    }
  }

  /**
   * Track tool usage events
   */
  const trackTool = {
    use: (toolName: string, inputSize?: 'small' | 'medium' | 'large', customParams?: Record<string, any>) => {
      const event: ToolEvent = {
        category: 'tool',
        action: 'use',
        tool_name: toolName,
        input_size: inputSize,
        customParameters: customParams
      }
      analyticsService.trackToolEvent(event)
    },

    success: (toolName: string, processingTime?: number, customParams?: Record<string, any>) => {
      const event: ToolEvent = {
        category: 'tool',
        action: 'success',
        tool_name: toolName,
        processing_time: processingTime,
        customParameters: customParams
      }
      analyticsService.trackToolEvent(event)
    },

    error: (toolName: string, errorType?: string, customParams?: Record<string, any>) => {
      const event: ToolEvent = {
        category: 'tool',
        action: 'error',
        tool_name: toolName,
        customParameters: {
          error_type: errorType,
          ...customParams
        }
      }
      analyticsService.trackToolEvent(event)
    },

    share: (toolName: string, shareMethod?: string, customParams?: Record<string, any>) => {
      const event: ToolEvent = {
        category: 'tool',
        action: 'share',
        tool_name: toolName,
        customParameters: {
          share_method: shareMethod,
          ...customParams
        }
      }
      analyticsService.trackToolEvent(event)
    }
  }

  /**
   * Track sample data events
   */
  const trackSample = {
    load: (sampleId: string, category?: string, complexity?: string, customParams?: Record<string, any>) => {
      const event: SampleEvent = {
        category: 'sample',
        action: 'load',
        sample_id: sampleId,
        sample_category: category,
        sample_complexity: complexity,
        customParameters: customParams
      }
      analyticsService.trackSampleEvent(event)
    },

    download: (sampleId: string, format?: string, customParams?: Record<string, any>) => {
      const event: SampleEvent = {
        category: 'sample',
        action: 'download',
        sample_id: sampleId,
        customParameters: {
          download_format: format,
          ...customParams
        }
      }
      analyticsService.trackSampleEvent(event)
    },

    copy: (sampleId: string, customParams?: Record<string, any>) => {
      const event: SampleEvent = {
        category: 'sample',
        action: 'copy',
        sample_id: sampleId,
        customParameters: customParams
      }
      analyticsService.trackSampleEvent(event)
    },

    view: (sampleId: string, viewDuration?: number, customParams?: Record<string, any>) => {
      const event: SampleEvent = {
        category: 'sample',
        action: 'view',
        sample_id: sampleId,
        customParameters: {
          view_duration: viewDuration,
          ...customParams
        }
      }
      analyticsService.trackSampleEvent(event)
    }
  }

  /**
   * Track navigation events
   */
  const trackNavigation = {
    pageView: (fromPage: string, toPage: string, customParams?: Record<string, any>) => {
      const event: NavigationEvent = {
        category: 'navigation',
        action: 'page_view',
        from_page: fromPage,
        to_page: toPage,
        customParameters: customParams
      }
      analyticsService.trackNavigationEvent(event)
    },

    sectionChange: (section: string, customParams?: Record<string, any>) => {
      const event: NavigationEvent = {
        category: 'navigation',
        action: 'section_change',
        customParameters: {
          section,
          ...customParams
        }
      }
      analyticsService.trackNavigationEvent(event)
    },

    menuClick: (menuItem: string, customParams?: Record<string, any>) => {
      const event: NavigationEvent = {
        category: 'navigation',
        action: 'menu_click',
        customParameters: {
          menu_item: menuItem,
          ...customParams
        }
      }
      analyticsService.trackNavigationEvent(event)
    },

    search: (searchTerm: string, resultsCount?: number, customParams?: Record<string, any>) => {
      const event: NavigationEvent = {
        category: 'navigation',
        action: 'search',
        search_term: searchTerm,
        customParameters: {
          results_count: resultsCount,
          ...customParams
        }
      }
      analyticsService.trackNavigationEvent(event)
    }
  }

  /**
   * Set user properties
   */
  const setUserProperties = (properties: UserProperties) => {
    analyticsService.setUserProperties(properties)
  }

  /**
   * Track performance timing
   */
  const trackTiming = (name: string, value: number, category?: string, label?: string) => {
    analyticsService.trackTiming(name, value, category, label)
  }

  /**
   * Track exceptions/errors
   */
  const trackException = (description: string, fatal: boolean = false) => {
    analyticsService.trackException(description, fatal)
  }

  /**
   * Enable/disable analytics
   */
  const setAnalyticsEnabled = (enabled: boolean) => {
    analyticsService.setEnabled(enabled)
  }

  /**
   * Get analytics state
   */
  const getAnalyticsState = () => {
    return analyticsService.getState()
  }

  /**
   * Utility function to track JSON parser usage
   */
  const trackJsonParserUsage = (inputType: 'json' | 'jsonl', inputSize: 'small' | 'medium' | 'large', success: boolean, processingTime?: number) => {
    trackTool.use('json_parser', inputSize, {
      input_type: inputType,
      success,
      processing_time: processingTime
    })
  }

  /**
   * Utility function to track feature usage
   */
  const trackFeatureUsage = (featureName: string, action: string, customParams?: Record<string, any>) => {
    trackEvent({
      category: 'user_interaction',
      action: `${featureName}_${action}`,
      customParameters: customParams
    })
  }

  return {
    // Core tracking functions
    trackPageView,
    trackEvent,
    
    // Specialized tracking
    trackTutorial,
    trackTool,
    trackSample,
    trackNavigation,
    
    // User and performance tracking
    setUserProperties,
    trackTiming,
    trackException,
    
    // Utility functions
    trackJsonParserUsage,
    trackFeatureUsage,
    
    // Analytics management
    setAnalyticsEnabled,
    getAnalyticsState
  }
}