import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { AnalyticsService } from '../../services/AnalyticsService'
import type { AnalyticsConfig } from '../../types/analytics'

// Mock gtag and dataLayer
const mockGtag = vi.fn()
const mockDataLayer: any[] = []

Object.defineProperty(window, 'gtag', {
  value: mockGtag,
  writable: true
})

Object.defineProperty(window, 'dataLayer', {
  value: mockDataLayer,
  writable: true
})

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService
  let mockConfig: AnalyticsConfig

  beforeEach(() => {
    // Reset singleton instance
    ;(AnalyticsService as any).instance = undefined
    analyticsService = AnalyticsService.getInstance()
    
    mockConfig = {
      measurementId: 'G-TEST123456',
      enableDebug: true,
      customDimensions: {
        app_version: '1.0.0'
      }
    }

    // Clear mocks
    mockGtag.mockClear()
    mockDataLayer.length = 0
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AnalyticsService.getInstance()
      const instance2 = AnalyticsService.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('Initialization', () => {
    it('should initialize with config', async () => {
      await analyticsService.init(mockConfig)
      
      const state = analyticsService.getState()
      expect(state.isInitialized).toBe(true)
      expect(state.error).toBeNull()
      expect(state.debugMode).toBe(true)
    })

    it('should configure gtag with measurement ID', async () => {
      await analyticsService.init(mockConfig)
      
      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123456', expect.objectContaining({
        enhanced_measurement: true,
        debug_mode: true,
        anonymize_ip: true,
        allow_google_signals: false,
        send_page_view: false
      }))
    })

    it('should handle initialization errors', async () => {
      // Mock gtag to throw error
      mockGtag.mockImplementation(() => {
        throw new Error('Test error')
      })

      await analyticsService.init(mockConfig)
      
      const state = analyticsService.getState()
      expect(state.error).toBe('Test error')
      expect(state.isInitialized).toBe(false)
    })
  })

  describe('Page View Tracking', () => {
    beforeEach(async () => {
      await analyticsService.init(mockConfig)
    })

    it('should track page views', () => {
      const pageView = {
        path: '/test',
        title: 'Test Page',
        referrer: 'https://example.com'
      }

      analyticsService.trackPageView(pageView)

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', expect.objectContaining({
        page_title: 'Test Page',
        page_path: '/test',
        page_referrer: 'https://example.com'
      }))
    })

    it('should track page views with custom parameters', () => {
      const pageView = {
        path: '/test',
        title: 'Test Page',
        customParameters: {
          custom_param: 'test_value'
        }
      }

      analyticsService.trackPageView(pageView)

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', expect.objectContaining({
        page_title: 'Test Page',
        page_path: '/test',
        custom_param: 'test_value'
      }))
    })
  })

  describe('Event Tracking', () => {
    beforeEach(async () => {
      await analyticsService.init(mockConfig)
    })

    it('should track custom events', () => {
      const event = {
        category: 'user_interaction' as const,
        action: 'click',
        label: 'test_button',
        value: 1
      }

      analyticsService.trackEvent(event)

      expect(mockGtag).toHaveBeenCalledWith('event', 'click', expect.objectContaining({
        event_category: 'user_interaction',
        event_label: 'test_button',
        value: 1
      }))
    })

    it('should track tutorial events', () => {
      const tutorialEvent = {
        category: 'tutorial' as const,
        action: 'start' as const,
        tutorial_id: 'json-basics',
        customParameters: {
          difficulty: 'beginner'
        }
      }

      analyticsService.trackTutorialEvent(tutorialEvent)

      expect(mockGtag).toHaveBeenCalledWith('event', 'start', expect.objectContaining({
        event_category: 'tutorial',
        tutorial_id: 'json-basics',
        difficulty: 'beginner'
      }))
    })

    it('should track tool events', () => {
      const toolEvent = {
        category: 'tool' as const,
        action: 'use' as const,
        tool_name: 'json_validator',
        input_size: 'medium' as const,
        processing_time: 150
      }

      analyticsService.trackToolEvent(toolEvent)

      expect(mockGtag).toHaveBeenCalledWith('event', 'use', expect.objectContaining({
        event_category: 'tool',
        tool_name: 'json_validator',
        input_size: 'medium',
        processing_time: 150
      }))
    })
  })

  describe('User Properties', () => {
    beforeEach(async () => {
      await analyticsService.init(mockConfig)
    })

    it('should set user properties', () => {
      const userProperties = {
        user_language: 'en',
        user_theme: 'dark',
        session_count: 5
      }

      analyticsService.setUserProperties(userProperties)

      expect(mockGtag).toHaveBeenCalledWith('set', 'user_properties', userProperties)
    })
  })

  describe('Timing and Performance', () => {
    beforeEach(async () => {
      await analyticsService.init(mockConfig)
    })

    it('should track timing events', () => {
      analyticsService.trackTiming('page_load', 1500, 'performance', 'homepage')

      expect(mockGtag).toHaveBeenCalledWith('event', 'timing_complete', {
        name: 'page_load',
        value: 1500,
        event_category: 'performance',
        event_label: 'homepage'
      })
    })

    it('should track exceptions', () => {
      analyticsService.trackException('Test error', true)

      expect(mockGtag).toHaveBeenCalledWith('event', 'exception', {
        description: 'Test error',
        fatal: true
      })
    })
  })

  describe('Analytics Control', () => {
    beforeEach(async () => {
      await analyticsService.init(mockConfig)
    })

    it('should enable and disable analytics', () => {
      analyticsService.setEnabled(false)
      expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
        analytics_storage: 'denied'
      })

      analyticsService.setEnabled(true)
      expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
        analytics_storage: 'granted'
      })
    })

    it('should not track events when disabled', () => {
      analyticsService.setEnabled(false)
      mockGtag.mockClear()

      analyticsService.trackEvent({
        category: 'user_interaction',
        action: 'test'
      })

      expect(mockGtag).not.toHaveBeenCalledWith('event', 'test', expect.anything())
    })
  })

  describe('Debug Mode', () => {
    it('should enable debug mode', async () => {
      await analyticsService.init({ ...mockConfig, enableDebug: true })
      
      const state = analyticsService.getState()
      expect(state.debugMode).toBe(true)
    })

    it('should toggle debug mode', async () => {
      await analyticsService.init(mockConfig)
      
      analyticsService.disableDebugMode()
      expect(analyticsService.getState().debugMode).toBe(false)
      
      analyticsService.enableDebugMode()
      expect(analyticsService.getState().debugMode).toBe(true)
    })
  })
})