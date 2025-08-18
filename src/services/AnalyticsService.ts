import type {
  AnalyticsConfig,
  AnalyticsEvent,
  AnalyticsState,
  PageView,
  UserProperties,
  TutorialEvent,
  ToolEvent,
  SampleEvent,
  NavigationEvent
} from '../types/analytics'

export class AnalyticsService {
  private static instance: AnalyticsService
  private config: AnalyticsConfig | null = null
  private state: AnalyticsState = {
    isInitialized: false,
    isEnabled: true,
    error: null,
    debugMode: false
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }

  /**
   * Initialize Google Analytics 4
   */
  async init(config: AnalyticsConfig): Promise<void> {
    this.config = config
    this.state.debugMode = config.enableDebug || false

    try {
      // Check if gtag is already available
      if (typeof window.gtag === 'function') {
        this.configureAnalytics()
        this.state.isInitialized = true
        this.state.error = null
        
        if (this.state.debugMode) {
          console.log('Analytics initialized with existing gtag')
        }
        return
      }

      // Load Google Analytics script if not already loaded
      await this.loadAnalyticsScript()
      this.configureAnalytics()
      
      this.state.isInitialized = true
      this.state.error = null
      
      if (this.state.debugMode) {
        console.log('Analytics initialized successfully')
      }
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Failed to initialize Analytics'
      console.error('Analytics initialization failed:', error)
    }
  }

  /**
   * Load Google Analytics script dynamically
   */
  private loadAnalyticsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.config) {
        reject(new Error('Analytics config not set'))
        return
      }

      // Initialize dataLayer if not exists
      window.dataLayer = window.dataLayer || []
      
      // Define gtag function
      window.gtag = function() {
        window.dataLayer.push(arguments)
      }

      // Set initial timestamp
      window.gtag('js', new Date())

      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.measurementId}`
      
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Analytics script'))
      
      document.head.appendChild(script)
    })
  }

  /**
   * Configure Google Analytics with custom settings
   */
  private configureAnalytics(): void {
    if (!this.config || !window.gtag) return

    // Configure GA4
    window.gtag('config', this.config.measurementId, {
      // Enhanced measurement settings
      enhanced_measurement: true,
      
      // Custom configuration
      custom_map: this.config.customDimensions || {},
      
      // Debug mode
      debug_mode: this.state.debugMode,
      
      // Privacy settings
      anonymize_ip: true,
      allow_google_signals: false,
      
      // Performance settings
      send_page_view: false // We'll handle page views manually
    })

    if (this.state.debugMode) {
      console.log('Analytics configured with measurement ID:', this.config.measurementId)
    }
  }

  /**
   * Track page views
   */
  trackPageView(pageView: PageView): void {
    if (!this.isReady()) return

    const eventData = {
      page_title: pageView.title,
      page_location: window.location.href,
      page_path: pageView.path,
      ...pageView.customParameters
    }

    if (pageView.referrer) {
      eventData.page_referrer = pageView.referrer
    }

    window.gtag('event', 'page_view', eventData)

    if (this.state.debugMode) {
      console.log('Page view tracked:', eventData)
    }
  }

  /**
   * Track custom events
   */
  trackEvent(event: AnalyticsEvent): void {
    if (!this.isReady()) return

    const eventData = {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.customParameters
    }

    window.gtag('event', event.action, eventData)

    if (this.state.debugMode) {
      console.log('Event tracked:', event.action, eventData)
    }
  }

  /**
   * Track tutorial-specific events
   */
  trackTutorialEvent(event: TutorialEvent): void {
    const enhancedEvent: AnalyticsEvent = {
      ...event,
      customParameters: {
        tutorial_id: event.tutorial_id,
        progress_percentage: event.progress_percentage,
        ...event.customParameters
      }
    }

    this.trackEvent(enhancedEvent)
  }

  /**
   * Track tool usage events
   */
  trackToolEvent(event: ToolEvent): void {
    const enhancedEvent: AnalyticsEvent = {
      ...event,
      customParameters: {
        tool_name: event.tool_name,
        input_size: event.input_size,
        processing_time: event.processing_time,
        ...event.customParameters
      }
    }

    this.trackEvent(enhancedEvent)
  }

  /**
   * Track sample data events
   */
  trackSampleEvent(event: SampleEvent): void {
    const enhancedEvent: AnalyticsEvent = {
      ...event,
      customParameters: {
        sample_id: event.sample_id,
        sample_category: event.sample_category,
        sample_complexity: event.sample_complexity,
        ...event.customParameters
      }
    }

    this.trackEvent(enhancedEvent)
  }

  /**
   * Track navigation events
   */
  trackNavigationEvent(event: NavigationEvent): void {
    const enhancedEvent: AnalyticsEvent = {
      ...event,
      customParameters: {
        from_page: event.from_page,
        to_page: event.to_page,
        search_term: event.search_term,
        ...event.customParameters
      }
    }

    this.trackEvent(enhancedEvent)
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: UserProperties): void {
    if (!this.isReady()) return

    window.gtag('set', 'user_properties', properties)

    if (this.state.debugMode) {
      console.log('User properties set:', properties)
    }
  }

  /**
   * Track timing events (for performance monitoring)
   */
  trackTiming(name: string, value: number, category?: string, label?: string): void {
    if (!this.isReady()) return

    window.gtag('event', 'timing_complete', {
      name,
      value,
      event_category: category || 'performance',
      event_label: label
    })

    if (this.state.debugMode) {
      console.log('Timing tracked:', { name, value, category, label })
    }
  }

  /**
   * Track exceptions/errors
   */
  trackException(description: string, fatal: boolean = false): void {
    if (!this.isReady()) return

    window.gtag('event', 'exception', {
      description,
      fatal
    })

    if (this.state.debugMode) {
      console.log('Exception tracked:', { description, fatal })
    }
  }

  /**
   * Enable or disable analytics tracking
   */
  setEnabled(enabled: boolean): void {
    this.state.isEnabled = enabled
    
    if (!enabled && window.gtag) {
      // Disable Google Analytics
      window.gtag('consent', 'update', {
        analytics_storage: 'denied'
      })
    } else if (enabled && window.gtag) {
      // Enable Google Analytics
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      })
    }

    if (this.state.debugMode) {
      console.log('Analytics tracking', enabled ? 'enabled' : 'disabled')
    }
  }

  /**
   * Check if analytics is ready to use
   */
  private isReady(): boolean {
    if (!this.state.isInitialized || !this.state.isEnabled) {
      if (this.state.debugMode) {
        console.warn('Analytics not ready:', {
          initialized: this.state.isInitialized,
          enabled: this.state.isEnabled
        })
      }
      return false
    }

    if (!window.gtag) {
      if (this.state.debugMode) {
        console.warn('gtag function not available')
      }
      return false
    }

    return true
  }

  /**
   * Get current analytics state
   */
  getState(): AnalyticsState {
    return { ...this.state }
  }

  /**
   * Get current configuration
   */
  getConfig(): AnalyticsConfig | null {
    return this.config
  }

  /**
   * Enable debug mode
   */
  enableDebugMode(): void {
    this.state.debugMode = true
    if (window.gtag && this.config) {
      window.gtag('config', this.config.measurementId, {
        debug_mode: true
      })
    }
  }

  /**
   * Disable debug mode
   */
  disableDebugMode(): void {
    this.state.debugMode = false
    if (window.gtag && this.config) {
      window.gtag('config', this.config.measurementId, {
        debug_mode: false
      })
    }
  }
}