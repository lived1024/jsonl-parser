import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MainNavigation from '../../../components/common/MainNavigation.vue'

// Mock vue-router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  }),
  useRoute: () => ({
    path: '/'
  })
}))

// Mock i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: { value: 'ko' }
  })
}))

describe('MainNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render navigation items', () => {
    const wrapper = mount(MainNavigation)

    expect(wrapper.find('.main-navigation').exists()).toBe(true)
    expect(wrapper.find('[data-testid="nav-home"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="nav-learn"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="nav-tools"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="nav-reference"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="nav-samples"]').exists()).toBe(true)
  })

  it('should handle mobile menu toggle', async () => {
    const wrapper = mount(MainNavigation)

    const mobileToggle = wrapper.find('.mobile-menu-toggle')
    if (mobileToggle.exists()) {
      await mobileToggle.trigger('click')
      expect(wrapper.find('.mobile-menu.open').exists()).toBe(true)
    }
  })

  it('should navigate to correct routes', async () => {
    const wrapper = mount(MainNavigation)

    const learnLink = wrapper.find('[data-testid="nav-learn"]')
    await learnLink.trigger('click')

    expect(mockPush).toHaveBeenCalledWith('/learn')
  })

  it('should highlight active route', () => {
    const wrapper = mount(MainNavigation)

    // Check if active class is applied correctly
    const homeLink = wrapper.find('[data-testid="nav-home"]')
    expect(homeLink.classes()).toContain('active')
  })

  it('should be responsive on mobile', () => {
    const wrapper = mount(MainNavigation)

    expect(wrapper.find('.mobile-navigation').exists()).toBe(true)
    expect(wrapper.find('.desktop-navigation').exists()).toBe(true)
  })
})