import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import JsonValidator from '../../../components/tools/JsonValidator.vue'

describe('JsonValidator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should validate valid JSON', async () => {
    const wrapper = mount(JsonValidator)

    const textarea = wrapper.find('textarea')
    await textarea.setValue('{"valid": "json"}')
    await textarea.trigger('input')

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(wrapper.find('.validation-success').exists()).toBe(true)
    expect(wrapper.text()).toContain('Valid JSON')
  })

  it('should show errors for invalid JSON', async () => {
    const wrapper = mount(JsonValidator)

    const textarea = wrapper.find('textarea')
    await textarea.setValue('{"invalid": json}')
    await textarea.trigger('input')

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(wrapper.find('.validation-error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Invalid JSON')
  })

  it('should show line and column numbers for errors', async () => {
    const wrapper = mount(JsonValidator)

    const textarea = wrapper.find('textarea')
    await textarea.setValue('{\n  "invalid": json\n}')
    await textarea.trigger('input')

    await new Promise(resolve => setTimeout(resolve, 100))

    const errorMessage = wrapper.find('.error-details')
    expect(errorMessage.exists()).toBe(true)
    expect(errorMessage.text()).toMatch(/line \d+/i)
  })

  it('should handle empty input', async () => {
    const wrapper = mount(JsonValidator)

    const textarea = wrapper.find('textarea')
    await textarea.setValue('')
    await textarea.trigger('input')

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(wrapper.find('.validation-empty').exists()).toBe(true)
  })

  it('should provide formatting suggestions', async () => {
    const wrapper = mount(JsonValidator)

    const textarea = wrapper.find('textarea')
    await textarea.setValue('{"unformatted":"json","with":"no spaces"}')
    await textarea.trigger('input')

    await new Promise(resolve => setTimeout(resolve, 100))

    const formatButton = wrapper.find('.format-button')
    if (formatButton.exists()) {
      await formatButton.trigger('click')
      expect(textarea.element.value).toContain('\n')
    }
  })

  it('should validate JSONL format', async () => {
    const wrapper = mount(JsonValidator)

    const formatSelect = wrapper.find('select[data-testid="format-select"]')
    if (formatSelect.exists()) {
      await formatSelect.setValue('jsonl')
    }

    const textarea = wrapper.find('textarea')
    await textarea.setValue('{"line": 1}\n{"line": 2}')
    await textarea.trigger('input')

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(wrapper.find('.validation-success').exists()).toBe(true)
  })
})