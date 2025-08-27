import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AdSenseContainer from '../../../components/common/AdSenseContainer.vue'
import { AdSenseService } from '../../../services/AdSenseService'

// Mock AdSenseService
vi.mock('../../../services/AdSenseService', () => ({
  AdSenseService: {
    getInstance: vi.fn(() => ({
      loadAd: vi.fn(),
      isAdBlockerActive: vi.fn(() => false),
      init: vi.fn()
    }))
  }
}))

describe('AdSenseContainer', () => {
  let mockAdSenseService: any

  beforeEach(() => {
    mockAdSenseService = {
      loadAd: vi.fn(),
      isAdBlockerActive: vi.fn(() => false),
      init: vi.fn()
    }
    vi.mocked(AdSenseService.getInstance).mockReturnValue(mockAdSenseService)
  })

  it('should render ad container with correct slot', () => {
    const wrapper = mount(AdSenseContainer, {
      props: {
        adSlot: 'test-slot',
        adFormat: 'auto'
      }
    })

    expect(wrapper.find('.ad-container').exists()).toBe(true)
    expect(wrapper.find('[data-ad-slot="test-slot"]').exists()).toBe(true)
  })

  it('should load ad on mount', async () => {
    mount(AdSenseContainer, {
      props: {
        adSlot: 'test-slot',
        adFormat: 'auto'
      }
    })

    await new Promise(resolve => setTimeout(resolve, 100))
    expect(mockAdSenseService.loadAd).toHaveBeenCalled()
  })

  it('should show fallback content when ad blocker is detected', async () => {
    mockAdSenseService.isAdBlockerActive.mockReturnValue(true)

    const wrapper = mount(AdSenseContainer, {
      props: {
        adSlot: 'test-slot',
        adFormat: 'auto'
      }
    })

    await new Promise(resolve => setTimeout(resolve, 100))
    expect(wrapper.find('.ad-blocked-message').exists()).toBe(true)
  })

  it('should handle different ad formats', () => {
    const wrapper = mount(AdSenseContainer, {
      props: {
        adSlot: 'test-slot',
        adFormat: 'rectangle'
      }
    })

    expect(wrapper.find('.ad-rectangle').exists()).toBe(true)
  })

  it('should emit error event on ad load failure', async () => {
    mockAdSenseService.loadAd.mockRejectedValue(new Error('Ad load failed'))

    const wrapper = mount(AdSenseContainer, {
      props: {
        adSlot: 'test-slot',
        adFormat: 'auto'
      }
    })

    await new Promise(resolve => setTimeout(resolve, 100))
    expect(wrapper.emitted('error')).toBeTruthy()
  })
})