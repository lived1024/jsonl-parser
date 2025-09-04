import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AnalyticsService } from '../../services/AnalyticsService'

// Mock gtag
const mockGtag = vi.fn()
Object.defineProperty(window, 'gtag', {
  value: mockGtag,
  writable: true
})

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset singleton instance for testing
    ;(AnalyticsService as any).instance = null
    analyticsService = AnalyticsService.getInstance()
  })

  it('should be a singleton', () => {
    const instance1 = AnalyticsService.getInstance()
    const instance2 = AnalyticsService.getInstance()
    expect(instance1).toBe(instance2)
  })

  it('should initialize with tracking ID', () => {
    const trackingId = 'GA_MEASUREMENT_ID'
    analyticsService.init(trackingId)

    expect(mockGtag).toHaveBeenCalledWith('config', trackingId)
  })

  it('should track page views', () => {
    analyticsService.init('GA_MEASUREMENT_ID')
    
    analyticsService.trackPageView('/test-page', 'Test Page')

    expect(mockGtag).toHaveBeenCalledWith('config', 'GA_MEASUREMENT_ID', {
      page_title: 'Test Page',
      page_location: expect.stringContaining('/test-page')
    })
  })

  it('should track custom events', () => {
    analyticsService.init('GA_MEASUREMENT_ID')
    
    analyticsService.trackEvent('tutorial_completed', {
      tutorial_id: 'json-basics',
      category: 'education'
    })

    expect(mockGtag).toHaveBeenCalledWith('event', 'tutorial_completed', {
      tutorial_id: 'json-basics',
      category: 'education'
    })
  })

  it('should track tool usage', () => {
    analyticsService.init('GA_MEASUREMENT_ID')
    
    analyticsService.trackToolUsage('json-validator', 'validation_success')

    expect(mockGtag).toHaveBeenCalledWith('event', 'tool_usage', {
      tool_name: 'json-validator',
      action: 'validation_success',
      event_category: 'tools'
    })
  })

  it('should track user engagement', () => {
    analyticsService.init('GA_MEASUREMENT_ID')
    
    analyticsService.trackEngagement('scroll', { scroll_depth: 75 })

    expect(mockGtag).toHaveBeenCalledWith('event', 'engagement', {
      engagement_type: 'scroll',
      scroll_depth: 75,
      event_category: 'user_interaction'
    })
  })

  it('should handle errors gracefully when gtag is not available', () => {
    // Remove gtag
    delete (window as any).gtag

    expect(() => {
      analyticsService.trackEvent('test_event', {})
    }).not.toThrow()
  })

  it('should track ad interactions', () => {
    analyticsService.init('GA_MEASUREMENT_ID')
    
    analyticsService.trackAdInteraction('click', 'header-ad', 'tech-tools')

    expect(mockGtag).toHaveBeenCalledWith('event', 'ad_interaction', {
      interaction_type: 'click',
      ad_unit: 'header-ad',
      ad_category: 'tech-tools',
      event_category: 'advertising'
    })
  })

  it('should get performance metrics', () => {
    const metrics = analyticsService.getPerformanceMetrics()
    
    expect(metrics).toHaveProperty('pageViews')
    expect(metrics).toHaveProperty('events')
    expect(metrics).toHaveProperty('toolUsage')
    expect(metrics).toHaveProperty('adInteractions')
  })
})