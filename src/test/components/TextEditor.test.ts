import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import TextEditor from '../../components/TextEditor.vue'
import { useJsonTreeStore } from '../../stores/jsonTreeStore'
import { InputType } from '../../types'

// Mock store
vi.mock('../../stores/jsonTreeStore', () => ({
  useJsonTreeStore: vi.fn()
}))

describe('TextEditor', () => {
  let mockStore: any
  
  beforeEach(() => {
    setActivePinia(createPinia())
    
    mockStore = {
      inputText: '',
      inputType: InputType.JSON,
      setInputText: vi.fn(),
      parseInput: vi.fn()
    }
    
    vi.mocked(useJsonTreeStore).mockReturnValue(mockStore)
  })

  describe('렌더링', () => {
    it('텍스트 에디터를 렌더링해야 한다', () => {
      const wrapper = mount(TextEditor)
      
      expect(wrapper.find('.editor-textarea').exists()).toBe(true)
      expect(wrapper.find('.editor-info').exists()).toBe(true)
    })

    it('JSON 타입일 때 올바른 플레이스홀더를 표시해야 한다', () => {
      mockStore.inputType = InputType.JSON
      
      const wrapper = mount(TextEditor)
      
      const textarea = wrapper.find('.editor-textarea')
      expect(textarea.attributes('placeholder')).toContain('JSON 데이터를 입력하세요')
      expect(textarea.attributes('placeholder')).toContain('{"name": "홍길동"')
    })

    it('JSONL 타입일 때 올바른 플레이스홀더를 표시해야 한다', () => {
      mockStore.inputType = InputType.JSONL
      
      const wrapper = mount(TextEditor)
      
      const textarea = wrapper.find('.editor-textarea')
      expect(textarea.attributes('placeholder')).toContain('JSONL 데이터를 입력하세요')
      expect(textarea.attributes('placeholder')).toContain('한 줄에 하나의 JSON')
    })
  })

  describe('입력 처리', () => {
    it('텍스트 입력 시 스토어를 업데이트해야 한다', async () => {
      const wrapper = mount(TextEditor)
      const textarea = wrapper.find('.editor-textarea')
      
      await textarea.setValue('{"name": "test"}')
      
      expect(mockStore.setInputText).toHaveBeenCalledWith('{"name": "test"}')
    })

    it('입력 후 디바운싱된 파싱을 실행해야 한다', async () => {
      vi.useFakeTimers()
      
      const wrapper = mount(TextEditor)
      const textarea = wrapper.find('.editor-textarea')
      
      await textarea.setValue('{"name": "test"}')
      await textarea.trigger('input')
      
      // 디바운싱 전에는 파싱이 호출되지 않아야 함
      expect(mockStore.parseInput).not.toHaveBeenCalled()
      
      // 300ms 후 파싱이 호출되어야 함
      vi.advanceTimersByTime(300)
      
      expect(mockStore.parseInput).toHaveBeenCalled()
      
      vi.useRealTimers()
    })

    it('빈 입력에 대해서는 파싱을 실행하지 않아야 한다', async () => {
      vi.useFakeTimers()
      
      const wrapper = mount(TextEditor)
      const textarea = wrapper.find('.editor-textarea')
      
      await textarea.setValue('   ')
      await textarea.trigger('input')
      
      vi.advanceTimersByTime(300)
      
      expect(mockStore.parseInput).not.toHaveBeenCalled()
      
      vi.useRealTimers()
    })
  })

  describe('키보드 단축키', () => {
    it('Ctrl+A로 전체 선택을 해야 한다', async () => {
      const wrapper = mount(TextEditor)
      const textarea = wrapper.find('.editor-textarea')
      
      // Mock select method
      const mockSelect = vi.fn()
      textarea.element.select = mockSelect
      
      await textarea.trigger('keydown', { 
        key: 'a', 
        ctrlKey: true 
      })
      
      expect(mockSelect).toHaveBeenCalled()
    })

    it('Ctrl+Enter로 강제 파싱을 실행해야 한다', async () => {
      const wrapper = mount(TextEditor)
      const textarea = wrapper.find('.editor-textarea')
      
      await textarea.trigger('keydown', { 
        key: 'Enter', 
        ctrlKey: true 
      })
      
      expect(mockStore.parseInput).toHaveBeenCalled()
    })

    it('Tab 키로 들여쓰기를 추가해야 한다', async () => {
      const wrapper = mount(TextEditor)
      const textarea = wrapper.find('.editor-textarea') as any
      
      // Mock textarea properties
      Object.defineProperty(textarea.element, 'selectionStart', {
        value: 0,
        writable: true
      })
      Object.defineProperty(textarea.element, 'selectionEnd', {
        value: 0,
        writable: true
      })
      Object.defineProperty(textarea.element, 'value', {
        value: 'test',
        writable: true
      })
      
      await textarea.trigger('keydown', { key: 'Tab' })
      
      expect(mockStore.setInputText).toHaveBeenCalledWith('  test')
    })

    it('Shift+Tab으로 들여쓰기를 제거해야 한다', async () => {
      const wrapper = mount(TextEditor)
      const textarea = wrapper.find('.editor-textarea') as any
      
      // Mock textarea properties
      Object.defineProperty(textarea.element, 'selectionStart', {
        value: 2,
        writable: true
      })
      Object.defineProperty(textarea.element, 'selectionEnd', {
        value: 2,
        writable: true
      })
      Object.defineProperty(textarea.element, 'value', {
        value: '  test',
        writable: true
      })
      
      await textarea.trigger('keydown', { 
        key: 'Tab', 
        shiftKey: true 
      })
      
      expect(mockStore.setInputText).toHaveBeenCalledWith('test')
    })
  })

  describe('문자 및 줄 수 계산', () => {
    it('문자 수를 올바르게 계산해야 한다', async () => {
      mockStore.inputText = 'Hello World'
      
      const wrapper = mount(TextEditor)
      
      expect(wrapper.find('.char-count').text()).toBe('11 문자')
    })

    it('줄 수를 올바르게 계산해야 한다', async () => {
      mockStore.inputText = 'Line 1\nLine 2\nLine 3'
      
      const wrapper = mount(TextEditor)
      
      expect(wrapper.find('.line-count').text()).toBe('3 줄')
    })

    it('한 줄일 때는 줄 수를 표시하지 않아야 한다', async () => {
      mockStore.inputText = 'Single line'
      
      const wrapper = mount(TextEditor)
      
      expect(wrapper.find('.line-count').exists()).toBe(false)
    })

    it('빈 입력일 때 0 문자를 표시해야 한다', async () => {
      mockStore.inputText = ''
      
      const wrapper = mount(TextEditor)
      
      expect(wrapper.find('.char-count').text()).toBe('0 문자')
      expect(wrapper.find('.line-count').exists()).toBe(false)
    })
  })

  describe('입력 타입 변경 감지', () => {
    it('입력 타입이 변경되면 파싱을 재실행해야 한다', async () => {
      mockStore.inputText = '{"name": "test"}'
      
      const wrapper = mount(TextEditor)
      
      // 입력 타입 변경 시뮬레이션
      mockStore.inputType = InputType.JSONL
      await wrapper.vm.$nextTick()
      
      expect(mockStore.parseInput).toHaveBeenCalled()
    })

    it('빈 입력일 때는 타입 변경 시 파싱하지 않아야 한다', async () => {
      mockStore.inputText = ''
      
      const wrapper = mount(TextEditor)
      
      // 입력 타입 변경 시뮬레이션
      mockStore.inputType = InputType.JSONL
      await wrapper.vm.$nextTick()
      
      expect(mockStore.parseInput).not.toHaveBeenCalled()
    })
  })

  describe('접근성', () => {
    it('올바른 ARIA 속성을 가져야 한다', () => {
      const wrapper = mount(TextEditor)
      const textarea = wrapper.find('.editor-textarea')
      
      expect(textarea.attributes('role')).toBe('textbox')
      expect(textarea.attributes('aria-label')).toBe('JSON 데이터 입력')
      expect(textarea.attributes('aria-multiline')).toBe('true')
    })

    it('JSON 타입일 때 올바른 describedby를 가져야 한다', () => {
      mockStore.inputType = InputType.JSON
      
      const wrapper = mount(TextEditor)
      const textarea = wrapper.find('.editor-textarea')
      
      expect(textarea.attributes('aria-describedby')).toBe('json-description')
    })

    it('JSONL 타입일 때 올바른 describedby를 가져야 한다', () => {
      mockStore.inputType = InputType.JSONL
      
      const wrapper = mount(TextEditor)
      const textarea = wrapper.find('.editor-textarea')
      
      expect(textarea.attributes('aria-describedby')).toBe('jsonl-description')
    })

    it('에디터 정보가 live region이어야 한다', () => {
      const wrapper = mount(TextEditor)
      const editorInfo = wrapper.find('.editor-info')
      
      expect(editorInfo.attributes('role')).toBe('status')
      expect(editorInfo.attributes('aria-live')).toBe('polite')
    })

    it('숨겨진 설명 텍스트가 있어야 한다', () => {
      const wrapper = mount(TextEditor)
      
      expect(wrapper.find('#json-description').exists()).toBe(true)
      expect(wrapper.find('#jsonl-description').exists()).toBe(true)
      expect(wrapper.find('#json-description').classes()).toContain('sr-only')
      expect(wrapper.find('#jsonl-description').classes()).toContain('sr-only')
    })
  })
})