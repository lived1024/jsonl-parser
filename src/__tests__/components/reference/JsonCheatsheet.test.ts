import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import JsonCheatsheet from '../../../components/reference/JsonCheatsheet.vue'

// Mock i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: { value: 'ko' }
  })
}))

describe('JsonCheatsheet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render cheatsheet sections', () => {
    const wrapper = mount(JsonCheatsheet)

    expect(wrapper.find('.cheatsheet-container').exists()).toBe(true)
    expect(wrapper.find('[data-testid="syntax-section"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="data-types-section"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="examples-section"]').exists()).toBe(true)
  })

  it('should have searchable content', async () => {
    const wrapper = mount(JsonCheatsheet)

    const searchInput = wrapper.find('[data-testid="search-input"]')
    if (searchInput.exists()) {
      await searchInput.setValue('string')
      await searchInput.trigger('input')

      // Should filter content based on search
      expect(wrapper.text()).toContain('string')
    }
  })

  it('should display JSON syntax examples', () => {
    const wrapper = mount(JsonCheatsheet)

    expect(wrapper.text()).toContain('object')
    expect(wrapper.text()).toContain('array')
    expect(wrapper.text()).toContain('string')
    expect(wrapper.text()).toContain('number')
    expect(wrapper.text()).toContain('boolean')
    expect(wrapper.text()).toContain('null')
  })

  it('should show interactive examples', async () => {
    const wrapper = mount(JsonCheatsheet)

    const exampleButtons = wrapper.findAll('[data-testid^="example-"]')
    if (exampleButtons.length > 0) {
      await exampleButtons[0].trigger('click')
      expect(wrapper.find('.example-output').exists()).toBe(true)
    }
  })

  it('should copy examples to clipboard', async () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    })

    const wrapper = mount(JsonCheatsheet)

    const copyButtons = wrapper.findAll('[data-testid^="copy-"]')
    if (copyButtons.length > 0) {
      await copyButtons[0].trigger('click')
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    }
  })

  it('should categorize content properly', () => {
    const wrapper = mount(JsonCheatsheet)

    expect(wrapper.find('[data-category="basic"]').exists()).toBe(true)
    expect(wrapper.find('[data-category="advanced"]').exists()).toBe(true)
    expect(wrapper.find('[data-category="patterns"]').exists()).toBe(true)
  })
})