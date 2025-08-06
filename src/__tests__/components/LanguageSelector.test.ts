/**
 * LanguageSelector 컴포넌트 단위 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import LanguageSelector from '../../components/ui/LanguageSelector.vue'
import { Language } from '../../types/i18n'

// localStorage mock
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// document.documentElement mock
const documentElementMock = {
  lang: 'en'
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

Object.defineProperty(document, 'documentElement', {
  value: documentElementMock,
  writable: true
})

describe('LanguageSelector', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    documentElementMock.lang = 'en'
  })

  describe('렌더링', () => {
    it('기본 상태로 렌더링되어야 한다', () => {
      const wrapper = mount(LanguageSelector)
      
      expect(wrapper.find('.language-selector').exists()).toBe(true)
      expect(wrapper.find('.language-button').exists()).toBe(true)
      expect(wrapper.find('.language-dropdown').exists()).toBe(false)
    })

    it('현재 언어를 올바르게 표시해야 한다', () => {
      const wrapper = mount(LanguageSelector)
      
      const button = wrapper.find('.language-button')
      expect(button.find('.language-code').text()).toBe('EN')
      expect(button.find('.language-flag').text()).toBe('🇺🇸')
    })

    it('올바른 접근성 속성을 가져야 한다', () => {
      const wrapper = mount(LanguageSelector)
      
      const button = wrapper.find('.language-button')
      expect(button.attributes('aria-expanded')).toBe('false')
      expect(button.attributes('aria-haspopup')).toBe('true')
      expect(button.attributes('aria-label')).toBeDefined()
    })
  })

  describe('드롭다운 토글', () => {
    it('버튼 클릭 시 드롭다운이 열려야 한다', async () => {
      const wrapper = mount(LanguageSelector)
      
      await wrapper.find('.language-button').trigger('click')
      
      expect(wrapper.find('.language-dropdown').exists()).toBe(true)
      expect(wrapper.find('.language-button').attributes('aria-expanded')).toBe('true')
    })

    it('드롭다운이 열린 상태에서 버튼 클릭 시 닫혀야 한다', async () => {
      const wrapper = mount(LanguageSelector)
      
      // 드롭다운 열기
      await wrapper.find('.language-button').trigger('click')
      expect(wrapper.find('.language-dropdown').exists()).toBe(true)
      
      // 드롭다운 닫기
      await wrapper.find('.language-button').trigger('click')
      expect(wrapper.find('.language-dropdown').exists()).toBe(false)
    })

    it('외부 클릭 시 드롭다운이 닫혀야 한다', async () => {
      const wrapper = mount(LanguageSelector, {
        attachTo: document.body
      })
      
      // 드롭다운 열기
      await wrapper.find('.language-button').trigger('click')
      expect(wrapper.find('.language-dropdown').exists()).toBe(true)
      
      // 외부 클릭 시뮬레이션
      document.body.click()
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.language-dropdown').exists()).toBe(false)
      
      wrapper.unmount()
    })
  })

  describe('언어 선택', () => {
    it('언어 옵션들을 올바르게 표시해야 한다', async () => {
      const wrapper = mount(LanguageSelector)
      
      await wrapper.find('.language-button').trigger('click')
      
      const options = wrapper.findAll('.language-option')
      expect(options).toHaveLength(2)
      
      // 영어 옵션 확인
      const englishOption = options.find(option => 
        option.find('.option-name').text() === 'English'
      )
      expect(englishOption).toBeDefined()
      expect(englishOption?.find('.option-native').text()).toBe('English')
      expect(englishOption?.find('.option-flag').text()).toBe('🇺🇸')
      
      // 한국어 옵션 확인
      const koreanOption = options.find(option => 
        option.find('.option-name').text() === 'Korean'
      )
      expect(koreanOption).toBeDefined()
      expect(koreanOption?.find('.option-native').text()).toBe('한국어')
      expect(koreanOption?.find('.option-flag').text()).toBe('🇰🇷')
    })

    it('현재 선택된 언어에 체크 표시가 있어야 한다', async () => {
      const wrapper = mount(LanguageSelector)
      
      await wrapper.find('.language-button').trigger('click')
      
      const activeOption = wrapper.find('.language-option--active')
      expect(activeOption.exists()).toBe(true)
      expect(activeOption.find('.option-check').exists()).toBe(true)
    })

    it('언어 옵션 클릭 시 언어가 변경되어야 한다', async () => {
      const wrapper = mount(LanguageSelector)
      
      await wrapper.find('.language-button').trigger('click')
      
      // 한국어 옵션 찾기 및 클릭
      const options = wrapper.findAll('.language-option')
      const koreanOption = options.find(option => 
        option.find('.option-name').text() === 'Korean'
      )
      
      expect(koreanOption).toBeDefined()
      await koreanOption?.trigger('click')
      
      // 언어 변경 후 드롭다운이 닫혀야 함
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.language-dropdown').exists()).toBe(false)
    })

    it('같은 언어 선택 시 드롭다운만 닫혀야 한다', async () => {
      const wrapper = mount(LanguageSelector)
      
      await wrapper.find('.language-button').trigger('click')
      
      // 현재 언어(영어) 옵션 클릭
      const activeOption = wrapper.find('.language-option--active')
      await activeOption.trigger('click')
      
      // 드롭다운이 닫혀야 함
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.language-dropdown').exists()).toBe(false)
    })
  })

  describe('키보드 네비게이션', () => {
    it('Enter 키로 드롭다운을 열 수 있어야 한다', async () => {
      const wrapper = mount(LanguageSelector)
      
      await wrapper.find('.language-button').trigger('keydown', { key: 'Enter' })
      
      expect(wrapper.find('.language-dropdown').exists()).toBe(true)
    })

    it('Space 키로 드롭다운을 열 수 있어야 한다', async () => {
      const wrapper = mount(LanguageSelector)
      
      await wrapper.find('.language-button').trigger('keydown', { key: ' ' })
      
      expect(wrapper.find('.language-dropdown').exists()).toBe(true)
    })

    it('ArrowDown 키로 드롭다운을 열 수 있어야 한다', async () => {
      const wrapper = mount(LanguageSelector)
      
      await wrapper.find('.language-button').trigger('keydown', { key: 'ArrowDown' })
      
      expect(wrapper.find('.language-dropdown').exists()).toBe(true)
    })

    it('Escape 키로 드롭다운을 닫을 수 있어야 한다', async () => {
      const wrapper = mount(LanguageSelector)
      
      // 드롭다운 열기
      await wrapper.find('.language-button').trigger('click')
      expect(wrapper.find('.language-dropdown').exists()).toBe(true)
      
      // Escape 키로 닫기
      await wrapper.find('.language-button').trigger('keydown', { key: 'Escape' })
      expect(wrapper.find('.language-dropdown').exists()).toBe(false)
    })

    it('옵션에서 Enter 키로 언어를 선택할 수 있어야 한다', async () => {
      const wrapper = mount(LanguageSelector)
      
      await wrapper.find('.language-button').trigger('click')
      
      const options = wrapper.findAll('.language-option')
      const koreanOption = options.find(option => 
        option.find('.option-name').text() === 'Korean'
      )
      
      await koreanOption?.trigger('keydown', { key: 'Enter' })
      
      // 드롭다운이 닫혀야 함
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.language-dropdown').exists()).toBe(false)
    })
  })

  describe('로딩 상태', () => {
    it('로딩 중일 때 스피너를 표시해야 한다', async () => {
      const wrapper = mount(LanguageSelector)
      
      // 로딩 상태 시뮬레이션을 위해 컴포넌트 데이터 직접 수정
      await wrapper.setData({ isChangingLanguage: true })
      
      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
      expect(wrapper.find('.dropdown-icon').exists()).toBe(false)
    })

    it('로딩 중일 때 버튼이 비활성화되어야 한다', async () => {
      const wrapper = mount(LanguageSelector)
      
      await wrapper.setData({ isChangingLanguage: true })
      
      const button = wrapper.find('.language-button')
      expect(button.attributes('disabled')).toBeDefined()
      expect(button.classes()).toContain('language-button--loading')
    })
  })

  describe('접근성', () => {
    it('올바른 ARIA 속성을 가져야 한다', async () => {
      const wrapper = mount(LanguageSelector)
      
      const button = wrapper.find('.language-button')
      expect(button.attributes('aria-expanded')).toBe('false')
      expect(button.attributes('aria-haspopup')).toBe('true')
      expect(button.attributes('aria-label')).toBeDefined()
      
      await button.trigger('click')
      
      expect(button.attributes('aria-expanded')).toBe('true')
      
      const dropdown = wrapper.find('.language-dropdown')
      expect(dropdown.attributes('role')).toBe('listbox')
      expect(dropdown.attributes('aria-label')).toBeDefined()
      
      const options = wrapper.findAll('.language-option')
      options.forEach(option => {
        expect(option.attributes('role')).toBe('option')
        expect(option.attributes('aria-selected')).toBeDefined()
      })
    })

    it('활성 옵션이 올바른 aria-selected 값을 가져야 한다', async () => {
      const wrapper = mount(LanguageSelector)
      
      await wrapper.find('.language-button').trigger('click')
      
      const activeOption = wrapper.find('.language-option--active')
      expect(activeOption.attributes('aria-selected')).toBe('true')
      
      const inactiveOptions = wrapper.findAll('.language-option:not(.language-option--active)')
      inactiveOptions.forEach(option => {
        expect(option.attributes('aria-selected')).toBe('false')
      })
    })
  })
})