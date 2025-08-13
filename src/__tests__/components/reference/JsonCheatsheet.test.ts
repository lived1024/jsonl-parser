import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import JsonCheatsheet from '../../../components/reference/JsonCheatsheet.vue'

// Mock the SafeAdContainer component
const SafeAdContainerMock = {
  name: 'SafeAdContainer',
  template: '<div class="mock-ad">Mock Ad</div>',
  props: ['adSlot', 'adFormat', 'className']
}

describe('JsonCheatsheet', () => {
  it('renders the cheatsheet title and description', () => {
    const wrapper = mount(JsonCheatsheet, {
      global: {
        components: {
          SafeAdContainer: SafeAdContainerMock
        }
      }
    })

    expect(wrapper.find('h2').text()).toBe('JSON 치트시트')
    expect(wrapper.text()).toContain('JSON 구문과 데이터 타입에 대한 빠른 참조 가이드')
  })

  it('renders search input', () => {
    const wrapper = mount(JsonCheatsheet, {
      global: {
        components: {
          SafeAdContainer: SafeAdContainerMock
        }
      }
    })

    const searchInput = wrapper.find('input[placeholder="구문 검색... (Ctrl+K)"]')
    expect(searchInput.exists()).toBe(true)
  })

  it('renders cheatsheet sections', () => {
    const wrapper = mount(JsonCheatsheet, {
      global: {
        components: {
          SafeAdContainer: SafeAdContainerMock
        }
      }
    })

    expect(wrapper.text()).toContain('기본 데이터 타입')
    expect(wrapper.text()).toContain('객체 (Objects)')
    expect(wrapper.text()).toContain('배열 (Arrays)')
    expect(wrapper.text()).toContain('특수 경우')
  })

  it('filters sections based on search query', async () => {
    const wrapper = mount(JsonCheatsheet, {
      global: {
        components: {
          SafeAdContainer: SafeAdContainerMock
        }
      }
    })

    const searchInput = wrapper.find('input[placeholder="구문 검색... (Ctrl+K)"]')
    await searchInput.setValue('문자열')

    // Should show sections containing "문자열"
    expect(wrapper.text()).toContain('문자열 (String)')
  })

  it('shows copy buttons for syntax items', () => {
    const wrapper = mount(JsonCheatsheet, {
      global: {
        components: {
          SafeAdContainer: SafeAdContainerMock
        }
      }
    })

    const copyButtons = wrapper.findAll('.copy-button')
    expect(copyButtons.length).toBeGreaterThan(0)
  })
})