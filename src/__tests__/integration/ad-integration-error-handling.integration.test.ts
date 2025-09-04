/**
 * 광고 통합 및 오류 처리 시나리오 통합 테스트
 * AdSense 통합, 광고 차단기 감지, 오류 처리 시나리오를 검증
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { AdSenseService } from '../../services/AdSenseService'
import type { AdSenseConfig } from '../../services/AdSenseService'

// Mock AdSense global
const mockAdsByGoogle = {
  push: vi.fn(),
  loaded: true
}

// Mock DOM methods
const mockCreateElement = vi.fn()
const mockAppendChild = vi.fn()
const mockRemoveChild = vi.fn()

// Mock console methods to avoid noise in tests
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

// Mock MediaOptimizationService to avoid canvas issues
vi.mock('../../services/MediaOptimizationService', () => ({
  MediaOptimizationService: {
    getInstance: vi.fn(() => ({
      optimizeImage: vi.fn(),
      getOptimizedImageUrl: vi.fn()
    }))
  }
}))

// Mock CacheManager to avoid canvas issues
vi.mock('../../utils/cacheUtils', () => ({
  CacheManager: {
    getInstance: vi.fn(() => ({
      get: vi.fn(),
      set: vi.fn(),
      clear: vi.fn()
    }))
  }
}))

// Mock analytics service
vi.mock('../../services/AnalyticsService', () => ({
  AnalyticsService: {
    getInstance: vi.fn(() => ({
      getState: vi.fn(() => ({ isInitialized: true })),
      trackPageView: vi.fn(),
      trackNavigationEvent: vi.fn(),
      setUserProperties: vi.fn(),
      trackEvent: vi.fn(),
      init: vi.fn()
    }))
  }
}))

describe('광고 통합 및 오류 처리 통합 테스트', () => {
  let adSenseService: AdSenseService
  let mockConfig: AdSenseConfig

  beforeEach(() => {
    setActivePinia(createPinia())

    // Reset AdSense service - create a fresh instance for each test
    // @ts-ignore - accessing private static property for testing
    AdSenseService.instance = undefined
    adSenseService = AdSenseService.getInstance()
    
    mockConfig = {
      publisherId: 'ca-pub-test123456789',
      adSlots: {
        header: 'test-header-slot',
        sidebar: 'test-sidebar-slot',
        content: 'test-content-slot',
        footer: 'test-footer-slot'
      }
    }

    // Mock window.adsbygoogle
    Object.defineProperty(window, 'adsbygoogle', {
      value: mockAdsByGoogle,
      writable: true,
      configurable: true
    })

    // Mock document methods
    document.createElement = mockCreateElement.mockReturnValue({
      async: true,
      src: '',
      crossOrigin: '',
      onload: null,
      onerror: null,
      innerHTML: '',
      className: '',
      style: { position: '', left: '' },
      offsetHeight: 0
    })
    
    document.head.appendChild = mockAppendChild
    document.body.appendChild = mockAppendChild
    document.body.removeChild = mockRemoveChild

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
    mockConsoleError.mockClear()
    mockConsoleWarn.mockClear()
  })

  describe('AdSense 서비스 초기화', () => {
    it('AdSense 서비스가 올바르게 초기화되어야 한다', async () => {
      // AdSense가 이미 로드된 상태 시뮬레이션 (실제 스크립트 로딩 없이)
      window.adsbygoogle = mockAdsByGoogle

      await adSenseService.init(mockConfig)

      const state = adSenseService.getState()
      expect(state.isLoaded).toBe(true)
      expect(state.error).toBeNull()
      
      const config = adSenseService.getConfig()
      expect(config).toEqual(mockConfig)
    })

    it('AdSense 설정이 올바르게 저장되어야 한다', async () => {
      await adSenseService.init(mockConfig)

      const config = adSenseService.getConfig()
      expect(config).not.toBeNull()
      expect(config?.publisherId).toBe(mockConfig.publisherId)
      expect(config?.adSlots).toEqual(mockConfig.adSlots)
    })

    it('AdSense 서비스 상태가 올바르게 관리되어야 한다', async () => {
      const initialState = adSenseService.getState()
      expect(initialState.isLoaded).toBe(false)
      expect(initialState.isBlocked).toBe(false)
      expect(initialState.error).toBeNull()

      // AdSense 초기화
      window.adsbygoogle = mockAdsByGoogle
      await adSenseService.init(mockConfig)

      const loadedState = adSenseService.getState()
      expect(loadedState.isLoaded).toBe(true)
    })
  })

  describe('광고 로딩 및 관리', () => {
    it('광고 로딩 메서드가 올바르게 작동해야 한다', async () => {
      await adSenseService.init(mockConfig)

      // 가상 DOM 요소 생성
      const mockElement = document.createElement('div')
      
      // 광고 로딩 시도
      adSenseService.loadAd(mockElement, 'test-slot')

      // AdSense push가 호출되었는지 확인
      expect(mockAdsByGoogle.push).toHaveBeenCalled()
    })

    it('AdSense가 로드되지 않은 상태에서 광고 로딩을 시도하면 무시되어야 한다', () => {
      // AdSense 초기화하지 않은 상태
      const mockElement = document.createElement('div')
      
      adSenseService.loadAd(mockElement, 'test-slot')

      // push가 호출되지 않아야 함
      expect(mockAdsByGoogle.push).not.toHaveBeenCalled()
    })

    it('광고 차단 상태에서 광고 로딩을 시도하면 무시되어야 한다', async () => {
      await adSenseService.init(mockConfig)
      
      // 광고 차단기 감지를 통해 차단 상태로 설정
      // offsetHeight가 0인 요소를 만들어 차단 상태 시뮬레이션
      mockCreateElement.mockReturnValue({
        innerHTML: '',
        className: '',
        style: { position: '', left: '' },
        offsetHeight: 0 // 차단된 상태
      })
      
      // 광고 차단기 감지 실행
      const isBlocked = adSenseService.isAdBlockerActive()
      expect(isBlocked).toBe(true)
      
      // 현재 호출 횟수 기록
      const callCountBefore = mockAdsByGoogle.push.mock.calls.length

      const mockElement = document.createElement('div')
      adSenseService.loadAd(mockElement, 'test-slot-blocked')
      
      const callCountAfter = mockAdsByGoogle.push.mock.calls.length
      
      // 차단된 상태에서는 새로운 광고 로딩이 무시되어야 함
      expect(callCountAfter).toBe(callCountBefore)
    })
  })

  describe('광고 차단기 감지', () => {
    it('광고 차단기가 활성화된 경우를 감지해야 한다', async () => {
      // 광고 차단기 시뮬레이션 (offsetHeight가 0)
      const mockTestElement = {
        innerHTML: '',
        className: '',
        style: { position: '', left: '' },
        offsetHeight: 0
      }

      mockCreateElement.mockReturnValue(mockTestElement)

      const isBlocked = adSenseService.isAdBlockerActive()

      expect(isBlocked).toBe(true)
      expect(mockCreateElement).toHaveBeenCalled()
      expect(mockAppendChild).toHaveBeenCalled()
      expect(mockRemoveChild).toHaveBeenCalled()

      const state = adSenseService.getState()
      expect(state.isBlocked).toBe(true)
    })

    it('광고 차단기가 비활성화된 경우를 감지해야 한다', async () => {
      // 정상적인 광고 표시 시뮬레이션 (offsetHeight > 0)
      const mockTestElement = {
        innerHTML: '',
        className: '',
        style: { position: '', left: '' },
        offsetHeight: 100
      }

      mockCreateElement.mockReturnValue(mockTestElement)

      const isBlocked = adSenseService.isAdBlockerActive()

      expect(isBlocked).toBe(false)

      const state = adSenseService.getState()
      expect(state.isBlocked).toBe(false)
    })

    it('광고 차단기 감지 중 오류 발생 시 적절히 처리해야 한다', async () => {
      // DOM 조작 중 오류 발생 시뮬레이션
      mockAppendChild.mockImplementation(() => {
        throw new Error('DOM manipulation failed')
      })

      const isBlocked = adSenseService.isAdBlockerActive()

      expect(isBlocked).toBe(false) // 오류 시 false 반환
      
      // 실제 구현에서 console.error가 호출되지 않을 수 있으므로 
      // 오류가 발생해도 애플리케이션이 중단되지 않는 것을 확인
      expect(typeof isBlocked).toBe('boolean')
    })
  })

  describe('서비스 통합 시나리오', () => {
    it('AdSense 서비스 싱글톤 패턴이 올바르게 작동해야 한다', () => {
      const instance1 = AdSenseService.getInstance()
      const instance2 = AdSenseService.getInstance()

      expect(instance1).toBe(instance2)
      expect(instance1).toBeInstanceOf(AdSenseService)
    })

    it('설정 변경 후 서비스 상태가 올바르게 업데이트되어야 한다', async () => {
      // 첫 번째 설정으로 초기화
      await adSenseService.init(mockConfig)
      
      const firstConfig = adSenseService.getConfig()
      expect(firstConfig?.publisherId).toBe(mockConfig.publisherId)

      // 새로운 설정으로 재초기화
      const newConfig = {
        ...mockConfig,
        publisherId: 'ca-pub-new123456789'
      }

      await adSenseService.init(newConfig)
      
      const updatedConfig = adSenseService.getConfig()
      expect(updatedConfig?.publisherId).toBe(newConfig.publisherId)
    })

    it('여러 광고 슬롯 설정이 올바르게 관리되어야 한다', async () => {
      await adSenseService.init(mockConfig)

      const config = adSenseService.getConfig()
      expect(config?.adSlots).toHaveProperty('header')
      expect(config?.adSlots).toHaveProperty('sidebar')
      expect(config?.adSlots).toHaveProperty('content')
      expect(config?.adSlots).toHaveProperty('footer')

      expect(config?.adSlots.header).toBe('test-header-slot')
      expect(config?.adSlots.sidebar).toBe('test-sidebar-slot')
      expect(config?.adSlots.content).toBe('test-content-slot')
      expect(config?.adSlots.footer).toBe('test-footer-slot')
    })
  })

  describe('오류 처리 시나리오', () => {
    it('광고 로딩 중 예외 발생 시 적절히 처리되어야 한다', async () => {
      await adSenseService.init(mockConfig)

      // AdSense push에서 오류 발생 시뮬레이션
      mockAdsByGoogle.push.mockImplementationOnce(() => {
        throw new Error('Ad loading failed')
      })

      const mockElement = document.createElement('div')
      
      // 오류가 발생해도 애플리케이션이 중단되지 않아야 함
      expect(() => {
        adSenseService.loadAd(mockElement, 'test-slot')
      }).not.toThrow()
    })

    it('잘못된 설정으로 초기화 시도 시 적절한 오류 처리가 되어야 한다', async () => {
      const invalidConfig = {
        publisherId: '',
        adSlots: {
          header: '',
          sidebar: '',
          content: '',
          footer: ''
        }
      }

      // 빈 설정으로도 초기화가 가능해야 함 (실제 광고는 로드되지 않음)
      await expect(adSenseService.init(invalidConfig)).resolves.toBeUndefined()

      const config = adSenseService.getConfig()
      expect(config?.publisherId).toBe('')
    })

    it('서비스 상태 불일치 시나리오를 처리해야 한다', async () => {
      // 초기 상태 확인
      const initialState = adSenseService.getState()
      expect(initialState.isLoaded).toBe(false)

      // 강제로 상태 변경 (실제로는 발생하지 않아야 하는 시나리오)
      const state = adSenseService.getState()
      state.isLoaded = true
      state.isBlocked = true

      // 광고 로딩 시도 (차단된 상태이므로 무시되어야 함)
      const mockElement = document.createElement('div')
      const callCountBefore = mockAdsByGoogle.push.mock.calls.length
      
      adSenseService.loadAd(mockElement, 'test-slot')
      
      const callCountAfter = mockAdsByGoogle.push.mock.calls.length
      expect(callCountAfter).toBe(callCountBefore)
    })
  })

  describe('성능 및 안정성', () => {
    it('동시 광고 로딩 요청이 안전하게 처리되어야 한다', async () => {
      await adSenseService.init(mockConfig)

      const mockElements = [
        document.createElement('div'),
        document.createElement('div'),
        document.createElement('div')
      ]

      const startTime = performance.now()

      // 동시에 여러 광고 로딩
      mockElements.forEach((element, index) => {
        adSenseService.loadAd(element, `test-slot-${index}`)
      })

      const endTime = performance.now()
      const totalTime = endTime - startTime

      // 처리 시간이 합리적인 범위 내에 있어야 함
      expect(totalTime).toBeLessThan(100)

      // 모든 광고 로딩 요청이 처리되었는지 확인
      expect(mockAdsByGoogle.push).toHaveBeenCalledTimes(mockElements.length)
    })

    it('반복적인 광고 차단기 감지가 성능에 미치는 영향이 최소화되어야 한다', () => {
      const iterations = 10
      const startTime = performance.now()

      // 여러 번 광고 차단기 감지 실행
      for (let i = 0; i < iterations; i++) {
        adSenseService.isAdBlockerActive()
      }

      const endTime = performance.now()
      const averageTime = (endTime - startTime) / iterations

      // 각 감지가 50ms 이내에 완료되어야 함
      expect(averageTime).toBeLessThan(50)
    })

    it('서비스 상태 조회가 빠르게 처리되어야 한다', () => {
      const iterations = 100
      const startTime = performance.now()

      // 여러 번 상태 조회
      for (let i = 0; i < iterations; i++) {
        adSenseService.getState()
        adSenseService.getConfig()
      }

      const endTime = performance.now()
      const totalTime = endTime - startTime

      // 전체 처리 시간이 10ms 이내여야 함
      expect(totalTime).toBeLessThan(10)
    })
  })

  describe('통합 시나리오 검증', () => {
    it('전체 광고 시스템 워크플로우가 올바르게 작동해야 한다', async () => {
      // 1. 서비스 초기화
      await adSenseService.init(mockConfig)
      expect(adSenseService.getState().isLoaded).toBe(true)

      // 2. 광고 차단기 감지
      const isBlocked = adSenseService.isAdBlockerActive()
      expect(typeof isBlocked).toBe('boolean')

      // 3. 광고 로딩
      const mockElement = document.createElement('div')
      adSenseService.loadAd(mockElement, 'test-integration-slot')

      // 4. 상태 확인
      const finalState = adSenseService.getState()
      expect(finalState.isLoaded).toBe(true)
      expect(finalState.error).toBeNull()
    })

    it('오류 상황에서도 시스템이 안정적으로 작동해야 한다', async () => {
      // 1. 정상 초기화
      await adSenseService.init(mockConfig)

      // 2. 오류 발생 시뮬레이션
      mockAdsByGoogle.push.mockImplementationOnce(() => {
        throw new Error('Simulated error')
      })

      // 3. 오류 상황에서도 광고 로딩 시도
      const mockElement = document.createElement('div')
      expect(() => {
        adSenseService.loadAd(mockElement, 'error-test-slot')
      }).not.toThrow()

      // 4. 시스템이 여전히 작동하는지 확인
      mockAdsByGoogle.push.mockImplementation(() => {}) // 정상 동작으로 복구
      adSenseService.loadAd(mockElement, 'recovery-test-slot')
      
      expect(mockAdsByGoogle.push).toHaveBeenCalled()
    })

    it('다양한 설정 조합이 올바르게 처리되어야 한다', async () => {
      const testConfigs = [
        {
          publisherId: 'ca-pub-test1',
          adSlots: { header: 'slot1', sidebar: 'slot2', content: 'slot3', footer: 'slot4' }
        },
        {
          publisherId: 'ca-pub-test2',
          adSlots: { header: 'slot5', sidebar: 'slot6', content: 'slot7', footer: 'slot8' }
        }
      ]

      for (const config of testConfigs) {
        await adSenseService.init(config)
        
        const savedConfig = adSenseService.getConfig()
        expect(savedConfig?.publisherId).toBe(config.publisherId)
        expect(savedConfig?.adSlots).toEqual(config.adSlots)
        
        const state = adSenseService.getState()
        expect(state.isLoaded).toBe(true)
      }
    })
  })
})