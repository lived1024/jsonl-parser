/**
 * useI18n Composable 단위 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useI18n } from '../../composables/useI18n'
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

describe('useI18n', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    documentElementMock.lang = 'en'
  })

  describe('기본 기능', () => {
    it('번역 함수를 제공해야 한다', () => {
      const { t } = useI18n()
      
      expect(typeof t).toBe('function')
    })

    it('현재 언어를 반환해야 한다', () => {
      const { currentLanguage } = useI18n()
      
      expect(currentLanguage.value).toBe(Language.EN)
    })

    it('언어 변경 함수를 제공해야 한다', () => {
      const { changeLanguage } = useI18n()
      
      expect(typeof changeLanguage).toBe('function')
    })

    it('사용 가능한 언어 목록을 제공해야 한다', () => {
      const { availableLanguages } = useI18n()
      
      expect(Array.isArray(availableLanguages)).toBe(true)
      expect(availableLanguages).toHaveLength(2)
    })

    it('로딩 상태를 제공해야 한다', () => {
      const { isLoading } = useI18n()
      
      expect(typeof isLoading.value).toBe('boolean')
    })
  })

  describe('번역 기능', () => {
    it('기본 번역을 올바르게 반환해야 한다', async () => {
      const { t } = useI18n()
      
      const translation = t('header.title')
      expect(typeof translation).toBe('string')
    })

    it('매개변수가 있는 번역을 올바르게 처리해야 한다', async () => {
      const { t } = useI18n()
      
      const translation = t('output.error.location.line', { line: 10 })
      expect(translation).toContain('10')
    })

    it('존재하지 않는 키에 대해 키 자체를 반환해야 한다', async () => {
      const { t } = useI18n()
      
      const translation = t('nonexistent.key')
      expect(translation).toBe('nonexistent.key')
    })
  })

  describe('언어 변경', () => {
    it('언어를 성공적으로 변경해야 한다', async () => {
      const { changeLanguage, currentLanguage } = useI18n()
      
      await changeLanguage(Language.KO)
      
      expect(currentLanguage.value).toBe(Language.KO)
    })

    it('언어 변경 시 오류를 적절히 처리해야 한다', async () => {
      const { changeLanguage } = useI18n()
      
      // 잘못된 언어로 변경 시도
      await expect(changeLanguage('invalid' as Language)).rejects.toThrow()
    })
  })

  describe('헬퍼 함수', () => {
    it('특정 언어인지 확인하는 함수를 제공해야 한다', () => {
      const { isLanguage, currentLanguage } = useI18n()
      
      expect(isLanguage(currentLanguage.value)).toBe(true)
      expect(isLanguage(Language.KO)).toBe(false)
    })

    it('현재 언어 정보를 제공해야 한다', () => {
      const { getCurrentLanguageInfo } = useI18n()
      
      expect(getCurrentLanguageInfo.value).toBeDefined()
      expect(getCurrentLanguageInfo.value?.code).toBe(Language.EN)
      expect(getCurrentLanguageInfo.value?.name).toBe('English')
    })

    it('번역 키 존재 여부를 확인하는 함수를 제공해야 한다', () => {
      const { hasTranslation } = useI18n()
      
      expect(typeof hasTranslation).toBe('function')
      expect(hasTranslation('header.title')).toBe(true)
      expect(hasTranslation('nonexistent.key')).toBe(false)
    })

    it('복수형 번역 함수를 제공해야 한다', () => {
      const { tn } = useI18n()
      
      expect(typeof tn).toBe('function')
      
      // 단수형 테스트
      const singular = tn('output.stats.nodes', 1)
      expect(typeof singular).toBe('string')
      
      // 복수형 테스트
      const plural = tn('output.stats.nodes', 5)
      expect(typeof plural).toBe('string')
    })
  })

  describe('반응형 업데이트', () => {
    it('언어 변경 시 현재 언어가 반응적으로 업데이트되어야 한다', async () => {
      const { changeLanguage, currentLanguage } = useI18n()
      
      const initialLanguage = currentLanguage.value
      await changeLanguage(Language.KO)
      
      expect(currentLanguage.value).not.toBe(initialLanguage)
      expect(currentLanguage.value).toBe(Language.KO)
    })

    it('언어 변경 시 번역 결과가 반응적으로 업데이트되어야 한다', async () => {
      const { changeLanguage, t } = useI18n()
      
      const englishTitle = t('header.title')
      await changeLanguage(Language.KO)
      const koreanTitle = t('header.title')
      
      expect(englishTitle).not.toBe(koreanTitle)
      expect(koreanTitle).toBe('JSON 트리 뷰어')
    })
  })
})

describe('전역 i18n 함수', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('$t 함수가 올바르게 작동해야 한다', async () => {
    const { $t } = await import('../../composables/useI18n')
    
    const translation = $t('header.title')
    expect(typeof translation).toBe('string')
  })

  it('$tn 함수가 올바르게 작동해야 한다', async () => {
    const { $tn } = await import('../../composables/useI18n')
    
    const translation = $tn('output.stats.nodes', 5)
    expect(typeof translation).toBe('string')
  })
})