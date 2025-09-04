import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DataConverter from '../../../components/tools/DataConverter.vue'

describe('DataConverter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should convert JSON to CSV', async () => {
    const wrapper = mount(DataConverter)

    const inputTextarea = wrapper.find('[data-testid="input-data"]')
    await inputTextarea.setValue('[{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]')

    const formatSelect = wrapper.find('[data-testid="output-format"]')
    await formatSelect.setValue('csv')

    const convertButton = wrapper.find('[data-testid="convert-button"]')
    await convertButton.trigger('click')

    await new Promise(resolve => setTimeout(resolve, 100))

    const output = wrapper.find('[data-testid="output-data"]')
    expect(output.element.value).toContain('name,age')
    expect(output.element.value).toContain('John,30')
    expect(output.element.value).toContain('Jane,25')
  })

  it('should convert JSON to XML', async () => {
    const wrapper = mount(DataConverter)

    const inputTextarea = wrapper.find('[data-testid="input-data"]')
    await inputTextarea.setValue('{"root": {"item": "value"}}')

    const formatSelect = wrapper.find('[data-testid="output-format"]')
    await formatSelect.setValue('xml')

    const convertButton = wrapper.find('[data-testid="convert-button"]')
    await convertButton.trigger('click')

    await new Promise(resolve => setTimeout(resolve, 100))

    const output = wrapper.find('[data-testid="output-data"]')
    expect(output.element.value).toContain('<root>')
    expect(output.element.value).toContain('<item>value</item>')
  })

  it('should convert JSON to YAML', async () => {
    const wrapper = mount(DataConverter)

    const inputTextarea = wrapper.find('[data-testid="input-data"]')
    await inputTextarea.setValue('{"key": "value", "number": 42}')

    const formatSelect = wrapper.find('[data-testid="output-format"]')
    await formatSelect.setValue('yaml')

    const convertButton = wrapper.find('[data-testid="convert-button"]')
    await convertButton.trigger('click')

    await new Promise(resolve => setTimeout(resolve, 100))

    const output = wrapper.find('[data-testid="output-data"]')
    expect(output.element.value).toContain('key: value')
    expect(output.element.value).toContain('number: 42')
  })

  it('should handle conversion errors gracefully', async () => {
    const wrapper = mount(DataConverter)

    const inputTextarea = wrapper.find('[data-testid="input-data"]')
    await inputTextarea.setValue('invalid json')

    const convertButton = wrapper.find('[data-testid="convert-button"]')
    await convertButton.trigger('click')

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(wrapper.find('.error-message').exists()).toBe(true)
  })

  it('should allow downloading converted data', async () => {
    const wrapper = mount(DataConverter)

    const inputTextarea = wrapper.find('[data-testid="input-data"]')
    await inputTextarea.setValue('{"test": "data"}')

    const formatSelect = wrapper.find('[data-testid="output-format"]')
    await formatSelect.setValue('csv')

    const convertButton = wrapper.find('[data-testid="convert-button"]')
    await convertButton.trigger('click')

    await new Promise(resolve => setTimeout(resolve, 100))

    const downloadButton = wrapper.find('[data-testid="download-button"]')
    expect(downloadButton.exists()).toBe(true)
    expect(downloadButton.attributes('disabled')).toBeFalsy()
  })

  it('should handle JSONL input format', async () => {
    const wrapper = mount(DataConverter)

    const inputFormatSelect = wrapper.find('[data-testid="input-format"]')
    await inputFormatSelect.setValue('jsonl')

    const inputTextarea = wrapper.find('[data-testid="input-data"]')
    await inputTextarea.setValue('{"name": "John"}\n{"name": "Jane"}')

    const formatSelect = wrapper.find('[data-testid="output-format"]')
    await formatSelect.setValue('csv')

    const convertButton = wrapper.find('[data-testid="convert-button"]')
    await convertButton.trigger('click')

    await new Promise(resolve => setTimeout(resolve, 100))

    const output = wrapper.find('[data-testid="output-data"]')
    expect(output.element.value).toContain('name')
    expect(output.element.value).toContain('John')
    expect(output.element.value).toContain('Jane')
  })
})