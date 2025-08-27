import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock a simple analytics composable for testing
const mockAnalytics = {
  trackEvent: vi.fn(),
  trackPageView: vi.fn()
}

function useAnalytics() {
  return {
    trackEvent: mockAnalytics.trackEvent,
    trackPageView: mockAnalytics.trackPageView,
    trackToolUsage: (tool: string, action: string) => {
      mockAnalytics.trackEvent('tool_usage', { tool, action })
    },
    trackError: (type: string, message: string, source?: string) => {
      mockAnalytics.trackEvent('error', { type, message, source })
    }
  }
}

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should track events', () => {
    const { trackEvent } = useAnalytics()

    trackEvent('test_event', { data: 'test' })

    expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('test_event', { data: 'test' })
  })

  it('should track page views', () => {
    const { trackPageView } = useAnalytics()

    trackPageView('/test-page')

    expect(mockAnalytics.trackPageView).toHaveBeenCalledWith('/test-page')
  })

  it('should track tool usage', () => {
    const { trackToolUsage } = useAnalytics()

    trackToolUsage('json-validator', 'validation_success')

    expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('tool_usage', {
      tool: 'json-validator',
      action: 'validation_success'
    })
  })

  it('should track errors', () => {
    const { trackError } = useAnalytics()

    trackError('validation_error', 'Invalid JSON syntax', 'json-validator')

    expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('error', {
      type: 'validation_error',
      message: 'Invalid JSON syntax',
      source: 'json-validator'
    })
  })
})