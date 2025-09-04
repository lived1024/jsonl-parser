import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AdSenseService } from '../../services/AdSenseService'

// Mock global objects
Object.defineProperty(window, 'adsbygoogle', {
  value: [],
  writable: true
})

Object.defineProperty(document, 'createElement', {
  value: vi.fn(() => ({
    setAttribute: vi.fn(),
    style: {},
    appendChild: vi.fn()
  }))
})

Object.defineProperty(document.head, 'appendChild', {
  value: vi.fn()
})

describe('AdSenseService', () => {
  let adSenseService: AdSenseService

  beforeEach(() => {
    vi.clearAllMocks()
    adSenseService = AdSenseService.getInstance()
    
    // Reset singleton instance for testing
    ;(AdSenseService as any).instance = null
    adSenseService = AdSenseService.getInstance()
  })

  it('should be a singleton', () => {
    const instance1 = AdSenseService.getInstance()
    const instance2 = AdSenseService.getInstance()
    expect(instance1).toBe(instance2)
  })

  it('should initialize with config', async () => {
    const config = {
      publisherId: 'ca-pub-test',
      adSlots: {
        header: 'header-slot',
        sidebar: 'sidebar-slot',
        content: 'content-slot',
        footer: 'footer-slot'
      }
    }

    await adSenseService.init(config)
    expect(adSenseService.isInitialized()).toBe(true)
  })

  it('should detect ad blocker', () => {
    // Mock ad blocker detection
    const mockElement = {
      offsetHeight: 0,
      offsetWidth: 0,
      style: {},
      remove: vi.fn()
    }
    
    vi.spyOn(document, 'createElement').mockReturnValue(mockElement as any)
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockElement as any)

    const isBlocked = adSenseService.isAdBlockerActive()
    expect(typeof isBlocked).toBe('boolean')
  })

  it('should load ad into element', () => {
    const mockElement = document.createElement('div')
    const adSlot = 'test-slot'

    adSenseService.loadAd(mockElement, adSlot)

    expect(mockElement.getAttribute('data-ad-client')).toBeTruthy()
    expect(mockElement.getAttribute('data-ad-slot')).toBe(adSlot)
  })

  it('should handle ad load errors gracefully', () => {
    const mockElement = document.createElement('div')
    const adSlot = 'invalid-slot'

    expect(() => {
      adSenseService.loadAd(mockElement, adSlot)
    }).not.toThrow()
  })

  it('should track ad performance metrics', () => {
    const metrics = adSenseService.getPerformanceMetrics()
    
    expect(metrics).toHaveProperty('totalAdsLoaded')
    expect(metrics).toHaveProperty('adBlockerDetected')
    expect(metrics).toHaveProperty('loadErrors')
  })

  it('should handle multiple ad loads', () => {
    const element1 = document.createElement('div')
    const element2 = document.createElement('div')

    adSenseService.loadAd(element1, 'slot-1')
    adSenseService.loadAd(element2, 'slot-2')

    const metrics = adSenseService.getPerformanceMetrics()
    expect(metrics.totalAdsLoaded).toBeGreaterThan(0)
  })
})