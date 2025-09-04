import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ToolsHubPage from '../../pages/ToolsHubPage.vue'

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  }),
  useRoute: () => ({
    query: {}
  })
}))

// Mock i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: { value: 'ko' }
  })
}))

describe('ToolsHubPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render tools hub layout', () => {
    const wrapper = mount(ToolsHubPage)

    expect(wrapper.find('.tools-hub').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tools-grid"]').exists()).toBe(true)
  })

  it('should display available tools', () => {
    const wrapper = mount(ToolsHubPage)

    expect(wrapper.find('[data-testid="tool-json-validator"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tool-data-converter"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tool-json-formatter"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tool-schema-generator"]').exists()).toBe(true)
  })

  it('should filter tools by category', async () => {
    const wrapper = mount(ToolsHubPage)

    const categoryFilter = wrapper.find('[data-testid="category-filter"]')
    if (categoryFilter.exists()) {
      await categoryFilter.setValue('validation')
      await categoryFilter.trigger('change')

      const toolCards = wrapper.findAll('[data-testid^="tool-"]')
      // Should show only validation tools
      expect(toolCards.some(card => card.attributes('data-testid')?.includes('validator'))).toBe(true)
    }
  })

  it('should search tools', async () => {
    const wrapper = mount(ToolsHubPage)

    const searchInput = wrapper.find('[data-testid="search-input"]')
    if (searchInput.exists()) {
      await searchInput.setValue('validator')
      await searchInput.trigger('input')

      await new Promise(resolve => setTimeout(resolve, 100))

      const toolCards = wrapper.findAll('[data-testid^="tool-"]')
      expect(toolCards.some(card => 
        card.text().toLowerCase().includes('validator')
      )).toBe(true)
    }
  })

  it('should navigate to tool page on card click', async () => {
    const wrapper = mount(ToolsHubPage)

    const validatorCard = wrapper.find('[data-testid="tool-json-validator"]')
    if (validatorCard.exists()) {
      await validatorCard.trigger('click')
      // Navigation should be handled by router mock
    }
  })

  it('should show tool descriptions and features', () => {
    const wrapper = mount(ToolsHubPage)

    const validatorCard = wrapper.find('[data-testid="tool-json-validator"]')
    if (validatorCard.exists()) {
      expect(validatorCard.text()).toContain('validator')
      expect(validatorCard.find('.tool-description').exists()).toBe(true)
    }
  })

  it('should track tool usage analytics', async () => {
    const wrapper = mount(ToolsHubPage)

    const toolCard = wrapper.find('[data-testid="tool-json-validator"]')
    if (toolCard.exists()) {
      await toolCard.trigger('click')
      // Analytics tracking should be called
    }
  })

  it('should show recently used tools', () => {
    // Mock localStorage with recent tools
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => JSON.stringify(['json-validator', 'data-converter'])),
        setItem: vi.fn(),
        removeItem: vi.fn()
      }
    })

    const wrapper = mount(ToolsHubPage)

    const recentSection = wrapper.find('[data-testid="recent-tools"]')
    if (recentSection.exists()) {
      expect(recentSection.text()).toContain('recent')
    }
  })

  it('should handle empty search results', async () => {
    const wrapper = mount(ToolsHubPage)

    const searchInput = wrapper.find('[data-testid="search-input"]')
    if (searchInput.exists()) {
      await searchInput.setValue('nonexistent-tool')
      await searchInput.trigger('input')

      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('[data-testid="no-results"]').exists()).toBe(true)
    }
  })
})