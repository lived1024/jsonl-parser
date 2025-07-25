import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import StatusIndicator from '../../components/StatusIndicator.vue'
import { useJsonTreeStore } from '../../stores/jsonTreeStore'
import { DataType, InputType } from '../../types'

// Mock store
vi.mock('../../stores/jsonTreeStore', () => ({
  useJsonTreeStore: vi.fn()
}))

describe('StatusIndicator', () => {
  let mockStore: any
  
  beforeEach(() => {
    setActivePinia(createPinia())
    
    mockStore = {
      isLoading: false,
      hasError: false,
      hasData: false,
      parseError: null,
      parsedData: [],
      inputType: InputType.JSON
    }
    
    vi.mocked(useJsonTreeStore).mockReturnValue(mockStore)
  })

  describe('로딩 상태', () => {
    it('로딩 중일 때 스피너를 표시해야 한다', () => {
      mockStore.isLoading = true
      
      const wrapper = mount(StatusIndicator)
      
      expect(wrapper.find('.loading').exists()).toBe(true)
      expect(wrapper.find('.spinner').exists()).toBe(true)
      expect(wrapper.find('.status-text').text()).toBe('파싱 중...')
    })
  })

  describe('오류 상태', () => {
    it('오류가 있을 때 오류 메시지를 표시해야 한다', () => {
      mockStore.hasError = true
      mockStore.parseError = {
        message: 'JSON Parse Error: Unexpected token'
      }
      
      const wrapper = mount(StatusIndicator)
      
      expect(wrapper.find('.error').exists()).toBe(true)
      expect(wrapper.find('.status-text').text()).toBe('파싱 오류')
      expect(wrapper.find('.error-message').text()).toBe('JSON Parse Error: Unexpected token')
    })

    it('오류 위치 정보를 표시해야 한다', () => {
      mockStore.hasError = true
      mockStore.parseError = {
        message: 'JSON Parse Error',
        line: 5,
        column: 10,
        position: 123
      }
      
      const wrapper = mount(StatusIndicator)
      
      expect(wrapper.find('.error-location').exists()).toBe(true)
      expect(wrapper.text()).toContain('줄 5')
      expect(wrapper.text()).toContain('열 10')
      expect(wrapper.text()).toContain('위치 123')
    })

    it('위치 정보가 없을 때는 위치 정보를 표시하지 않아야 한다', () => {
      mockStore.hasError = true
      mockStore.parseError = {
        message: 'JSON Parse Error'
      }
      
      const wrapper = mount(StatusIndicator)
      
      expect(wrapper.find('.error-location').exists()).toBe(false)
    })
  })

  describe('부분적 성공 상태', () => {
    it('데이터와 오류가 모두 있을 때 경고 상태를 표시해야 한다', () => {
      mockStore.hasData = true
      mockStore.hasError = true
      mockStore.parseError = {
        message: '2개 줄에서 오류가 발생했습니다. 3개 줄이 성공적으로 파싱되었습니다.'
      }
      mockStore.parsedData = [
        { id: '1', type: DataType.OBJECT, children: [{ id: '1-1' }] },
        { id: '2', type: DataType.OBJECT, children: [{ id: '2-1' }] },
        { id: '3', type: DataType.OBJECT, children: [] }
      ]
      mockStore.inputType = InputType.JSONL
      
      const wrapper = mount(StatusIndicator)
      
      expect(wrapper.find('.warning').exists()).toBe(true)
      expect(wrapper.find('.status-text').text()).toBe('부분적 파싱 완료')
      expect(wrapper.find('.warning-message').text()).toContain('2개 줄에서 오류가 발생했습니다')
      expect(wrapper.text()).toContain('3개 노드 성공')
      expect(wrapper.text()).toContain('3줄 처리됨')
    })
  })

  describe('성공 상태', () => {
    it('성공적으로 파싱된 데이터가 있을 때 성공 상태를 표시해야 한다', () => {
      mockStore.hasData = true
      mockStore.parsedData = [
        { 
          id: '1', 
          type: DataType.OBJECT, 
          children: [
            { id: '1-1', children: [] },
            { id: '1-2', children: [] }
          ] 
        }
      ]
      
      const wrapper = mount(StatusIndicator)
      
      expect(wrapper.find('.success').exists()).toBe(true)
      expect(wrapper.find('.status-text').text()).toBe('파싱 완료')
      expect(wrapper.text()).toContain('3개 노드')
    })

    it('JSONL 타입일 때 줄 수를 표시해야 한다', () => {
      mockStore.hasData = true
      mockStore.inputType = InputType.JSONL
      mockStore.parsedData = [
        { id: '1', children: [] },
        { id: '2', children: [] }
      ]
      
      const wrapper = mount(StatusIndicator)
      
      expect(wrapper.text()).toContain('2줄')
    })

    it('JSON 타입일 때는 줄 수를 표시하지 않아야 한다', () => {
      mockStore.hasData = true
      mockStore.inputType = InputType.JSON
      mockStore.parsedData = [
        { id: '1', children: [] }
      ]
      
      const wrapper = mount(StatusIndicator)
      
      expect(wrapper.text()).not.toContain('줄')
    })
  })

  describe('대기 상태', () => {
    it('데이터와 오류가 모두 없을 때 대기 상태를 표시해야 한다', () => {
      const wrapper = mount(StatusIndicator)
      
      expect(wrapper.find('.idle').exists()).toBe(true)
      expect(wrapper.find('.status-text').text()).toBe('JSON 또는 JSONL 데이터를 입력하세요')
    })
  })

  describe('노드 개수 계산', () => {
    it('중첩된 노드의 개수를 올바르게 계산해야 한다', () => {
      mockStore.hasData = true
      mockStore.parsedData = [
        {
          id: '1',
          children: [
            { id: '1-1', children: [] },
            { 
              id: '1-2', 
              children: [
                { id: '1-2-1', children: [] },
                { id: '1-2-2', children: [] }
              ] 
            }
          ]
        }
      ]
      
      const wrapper = mount(StatusIndicator)
      
      // 총 5개 노드: 1 + 1-1 + 1-2 + 1-2-1 + 1-2-2
      expect(wrapper.text()).toContain('5개 노드')
    })

    it('빈 자식 배열을 가진 노드를 올바르게 처리해야 한다', () => {
      mockStore.hasData = true
      mockStore.parsedData = [
        { id: '1', children: [] },
        { id: '2' } // children 속성이 없는 경우
      ]
      
      const wrapper = mount(StatusIndicator)
      
      expect(wrapper.text()).toContain('2개 노드')
    })
  })

  describe('접근성', () => {
    it('올바른 ARIA 속성을 가져야 한다', () => {
      const wrapper = mount(StatusIndicator)
      
      const statusIndicator = wrapper.find('.status-indicator')
      expect(statusIndicator.attributes('role')).toBe('status')
      expect(statusIndicator.attributes('aria-live')).toBe('polite')
      expect(statusIndicator.attributes('aria-atomic')).toBe('true')
    })

    it('오류 메시지에 alert 역할을 가져야 한다', () => {
      mockStore.hasError = true
      mockStore.parseError = {
        message: 'Test error'
      }
      
      const wrapper = mount(StatusIndicator)
      
      expect(wrapper.find('.error-message').attributes('role')).toBe('alert')
    })

    it('아이콘이 스크린 리더에서 숨겨져야 한다', () => {
      mockStore.isLoading = true
      
      const wrapper = mount(StatusIndicator)
      
      expect(wrapper.find('.status-icon').attributes('aria-hidden')).toBe('true')
    })
  })
})