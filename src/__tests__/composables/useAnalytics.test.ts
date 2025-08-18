import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAnalytics } from '../../composables/useAnalytics'
import { AnalyticsService } from '../../services/AnalyticsService'

// Mock the AnalyticsService
vi.mock('../../services/AnalyticsService', () => ({
  AnalyticsService: {
    getInstance: vi.fn(() => ({
      trackPageView: vi.fn(),
      trackEvent: vi.fn(),
      trackTutorialEvent: vi.fn(),
      trackToolEvent: vi.fn(),
      trackSampleEvent: vi.fn(),
      trackNavigationEvent: vi.fn(),
      setUserProperties: vi.fn(),
      trackTiming: vi.fn(),
      trackException: vi.fn(),
      setEnabled: vi.fn(),
      getState: vi.fn(() => ({
        isInitialized: true,
        isEnabled: true,
        error: null,
        debugMode: false
      }))
    }))
  }
}))

describe('useAnalytics', () => {
  let mockAnalyticsService: any
  
  beforeEach(() => {
    mockAnalyticsService = AnalyticsService.getInstance()
    vi.clearAllMocks()
  })

  describe('Basic Tracking', () => {
    it('should track page views', () => {
      const { trackPageView } = useAnalytics()
      
      trackPageView('/test', 'Test Page', { custom: 'param' })
      
      expect(mockAnalyticsService.trackPageView).toHaveBeenCalledWith({
        path: '/test',
        title: 'Test Page',
        referrer: document.referrer,
        customParameters: { custom: 'param' }
      })
    })

    it('should track custom events', () => {
      const { trackEvent } = useAnalytics()
      
      const event = {
        category: 'user_interaction' as const,
        action: 'click',
        label: 'test_button'
      }
      
      trackEvent(event)
      
      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith(event)
    })
  })

  describe('Tutorial Tracking', () => {
    it('should track tutorial start', () => {
      const { trackTutorial } = useAnalytics()
      
      trackTutorial.start('json-basics', { difficulty: 'beginner' })
      
      expect(mockAnalyticsService.trackTutorialEvent).toHaveBeenCalledWith({
        category: 'tutorial',
        action: 'start',
        tutorial_id: 'json-basics',
        customParameters: { difficulty: 'beginner' }
      })
    })

    it('should track tutorial completion', () => {
      const { trackTutorial } = useAnalytics()
      
      trackTutorial.complete('json-basics')
      
      expect(mockAnalyticsService.trackTutorialEvent).toHaveBeenCalledWith({
        category: 'tutorial',
        action: 'complete',
        tutorial_id: 'json-basics',
        customParameters: undefined
      })
    })

    it('should track tutorial progress', () => {
      const { trackTutorial } = useAnalytics()
      
      trackTutorial.progress('json-basics', 50)
      
      expect(mockAnalyticsService.trackTutorialEvent).toHaveBeenCalledWith({
        category: 'tutorial',
        action: 'progress',
        tutorial_id: 'json-basics',
        progress_percentage: 50,
        customParameters: undefined
      })
    })

    it('should track tutorial abandonment', () => {
      const { trackTutorial } = useAnalytics()
      
      trackTutorial.abandon('json-basics', 25)
      
      expect(mockAnalyticsService.trackTutorialEvent).toHaveBeenCalledWith({
        category: 'tutorial',
        action: 'abandon',
        tutorial_id: 'json-basics',
        progress_percentage: 25,
        customParameters: undefined
      })
    })
  })

  describe('Tool Tracking', () => {
    it('should track tool usage', () => {
      const { trackTool } = useAnalytics()
      
      trackTool.use('json_validator', 'medium', { input_type: 'json' })
      
      expect(mockAnalyticsService.trackToolEvent).toHaveBeenCalledWith({
        category: 'tool',
        action: 'use',
        tool_name: 'json_validator',
        input_size: 'medium',
        customParameters: { input_type: 'json' }
      })
    })

    it('should track tool success', () => {
      const { trackTool } = useAnalytics()
      
      trackTool.success('json_validator', 150)
      
      expect(mockAnalyticsService.trackToolEvent).toHaveBeenCalledWith({
        category: 'tool',
        action: 'success',
        tool_name: 'json_validator',
        processing_time: 150,
        customParameters: undefined
      })
    })

    it('should track tool errors', () => {
      const { trackTool } = useAnalytics()
      
      trackTool.error('json_validator', 'syntax_error')
      
      expect(mockAnalyticsService.trackToolEvent).toHaveBeenCalledWith({
        category: 'tool',
        action: 'error',
        tool_name: 'json_validator',
        customParameters: {
          error_type: 'syntax_error'
        }
      })
    })
  })

  describe('Sample Tracking', () => {
    it('should track sample loading', () => {
      const { trackSample } = useAnalytics()
      
      trackSample.load('api-response-1', 'api', 'medium')
      
      expect(mockAnalyticsService.trackSampleEvent).toHaveBeenCalledWith({
        category: 'sample',
        action: 'load',
        sample_id: 'api-response-1',
        sample_category: 'api',
        sample_complexity: 'medium',
        customParameters: undefined
      })
    })

    it('should track sample downloads', () => {
      const { trackSample } = useAnalytics()
      
      trackSample.download('api-response-1', 'json')
      
      expect(mockAnalyticsService.trackSampleEvent).toHaveBeenCalledWith({
        category: 'sample',
        action: 'download',
        sample_id: 'api-response-1',
        customParameters: {
          download_format: 'json'
        }
      })
    })
  })

  describe('Navigation Tracking', () => {
    it('should track page navigation', () => {
      const { trackNavigation } = useAnalytics()
      
      trackNavigation.pageView('/home', '/tools')
      
      expect(mockAnalyticsService.trackNavigationEvent).toHaveBeenCalledWith({
        category: 'navigation',
        action: 'page_view',
        from_page: '/home',
        to_page: '/tools',
        customParameters: undefined
      })
    })

    it('should track search', () => {
      const { trackNavigation } = useAnalytics()
      
      trackNavigation.search('json validation', 5)
      
      expect(mockAnalyticsService.trackNavigationEvent).toHaveBeenCalledWith({
        category: 'navigation',
        action: 'search',
        search_term: 'json validation',
        customParameters: {
          results_count: 5
        }
      })
    })
  })

  describe('Utility Functions', () => {
    it('should track JSON parser usage', () => {
      const { trackJsonParserUsage } = useAnalytics()
      
      trackJsonParserUsage('json', 'large', true, 250)
      
      expect(mockAnalyticsService.trackToolEvent).toHaveBeenCalledWith({
        category: 'tool',
        action: 'use',
        tool_name: 'json_parser',
        input_size: 'large',
        customParameters: {
          input_type: 'json',
          success: true,
          processing_time: 250
        }
      })
    })

    it('should track feature usage', () => {
      const { trackFeatureUsage } = useAnalytics()
      
      trackFeatureUsage('dark_mode', 'toggle', { previous_theme: 'light' })
      
      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith({
        category: 'user_interaction',
        action: 'dark_mode_toggle',
        customParameters: { previous_theme: 'light' }
      })
    })
  })

  describe('Analytics Management', () => {
    it('should enable/disable analytics', () => {
      const { setAnalyticsEnabled } = useAnalytics()
      
      setAnalyticsEnabled(false)
      
      expect(mockAnalyticsService.setEnabled).toHaveBeenCalledWith(false)
    })

    it('should get analytics state', () => {
      const { getAnalyticsState } = useAnalytics()
      
      const state = getAnalyticsState()
      
      expect(mockAnalyticsService.getState).toHaveBeenCalled()
      expect(state).toEqual({
        isInitialized: true,
        isEnabled: true,
        error: null,
        debugMode: false
      })
    })
  })
})