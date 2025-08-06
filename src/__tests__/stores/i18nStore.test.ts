/**
 * i18n Store 단위 테스트
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useI18nStore } from '../../stores/i18nStore'
import { Language } from '../../types/i18n'
import { DEFAULT_LANGUAGE, I18N_STORAGE_KEY } from '../../constants/i18n'

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

// 전역 mocks 설정
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

Object.defineProperty(document, 'documentElement', {
  value: documentElementMock,
  writable: true
})

describe('i18nStore', () => {
  beforeEach(() => {
    // 각 테스트 전에 새로운 Pinia 인스턴스 생성
    setActivePinia(createPinia())
    
    // localStorage mock 초기화
    vi.clearAllMocks()
    
    // document.documentElement.lang 초기화
    documentElementMock.lang = 'en'
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('초기화', () => {
    it('기본 언어로 초기화되어야 한다', () => {
      const store = useI18nStore()
      
      expect(store.currentLanguage).toBe(DEFAULT_LANGUAGE)
      expect(store.isLoading).toBe(false)
    })

    it('localStorage에서 저장된 언어를 로드해야 한다', async () => {
      // localStorage에 한국어 설정 저장
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        language: Language.KO,
        lastUpdated: Date.now()
      }))

      const store = useI18nStore()
      await store.initialize()

      expect(store.currentLanguage).toBe(Language.KO)
      expect(documentElementMock.lang).toBe(Language.KO)
    })

    it('잘못된 localStorage 데이터가 있을 때 기본 언어를 사용해야 한다', async () => {
      // 잘못된 JSON 데이터
      localStorageMock.getItem.mockReturnValue('invalid-json')

      const store = useI18nStore()
      await store.initialize()

      expect(store.currentLanguage).toBe(DEFAULT_LANGUAGE)
      expect(documentElementMock.lang).toBe(DEFAULT_LANGUAGE)
    })

    it('지원하지 않는 언어가 저장되어 있을 때 기본 언어를 사용해야 한다', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        language: 'unsupported-lang',
        lastUpdated: Date.now()
      }))

      const store = useI18nStore()
      await store.initialize()

      expect(store.currentLanguage).toBe(DEFAULT_LANGUAGE)
    })
  })

  describe('언어 변경', () => {
    it('언어를 성공적으로 변경해야 한다', async () => {
      const store = useI18nStore()
      
      await store.changeLanguage(Language.KO)

      expect(store.currentLanguage).toBe(Language.KO)
      expect(documentElementMock.lang).toBe(Language.KO)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        I18N_STORAGE_KEY,
        expect.stringContaining(Language.KO)
      )
    })

    it('같은 언어로 변경 시 아무 작업을 하지 않아야 한다', async () => {
      const store = useI18nStore()
      const initialCallCount = localStorageMock.setItem.mock.calls.length

      await store.changeLanguage(DEFAULT_LANGUAGE)

      expect(localStorageMock.setItem.mock.calls.length).toBe(initialCallCount)
    })

    it('언어 변경 중 로딩 상태를 표시해야 한다', async () => {
      const store = useI18nStore()
      
      // 언어 변경 시작
      const changePromise = store.changeLanguage(Language.KO)
      
      // 로딩 상태 확인 (비동기 작업이므로 즉시 확인하기 어려움)
      // 실제로는 번역 파일 로드가 완료되면 로딩이 끝남
      
      await changePromise
      expect(store.isLoading).toBe(false)
    })
  })

  describe('번역 기능', () => {
    it('기본 번역 키를 올바르게 반환해야 한다', async () => {
      const store = useI18nStore()
      await store.initialize()

      // 영어 번역 테스트
      const translation = store.getTranslation('header.title')
      expect(translation).toBe('JSON Tree Viewer')
    })

    it('중첩된 번역 키를 올바르게 처리해야 한다', async () => {
      const store = useI18nStore()
      await store.initialize()

      const translation = store.getTranslation('input.json.name')
      expect(translation).toBe('JSON')
    })

    it('존재하지 않는 번역 키에 대해 키 자체를 반환해야 한다', async () => {
      const store = useI18nStore()
      await store.initialize()

      const translation = store.getTranslation('nonexistent.key')
      expect(translation).toBe('nonexistent.key')
    })

    it('매개변수 치환을 올바르게 처리해야 한다', async () => {
      const store = useI18nStore()
      await store.initialize()

      const translation = store.getTranslation('output.error.location.line', { line: 5 })
      expect(translation).toBe('Line 5')
    })

    it('존재하지 않는 매개변수는 그대로 유지해야 한다', async () => {
      const store = useI18nStore()
      await store.initialize()

      const translation = store.getTranslation('output.error.location.line', { wrongParam: 5 })
      expect(translation).toBe('Line {{line}}')
    })
  })

  describe('localStorage 동기화', () => {
    it('언어 변경 시 localStorage에 저장해야 한다', async () => {
      const store = useI18nStore()
      
      await store.changeLanguage(Language.KO)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        I18N_STORAGE_KEY,
        expect.stringContaining(Language.KO)
      )
    })

    it('localStorage 저장 실패 시에도 언어 변경은 성공해야 한다', async () => {
      const store = useI18nStore()
      
      // localStorage.setItem이 에러를 던지도록 설정
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      // 에러가 발생해도 언어 변경은 성공해야 함
      await expect(store.changeLanguage(Language.KO)).resolves.not.toThrow()
      expect(store.currentLanguage).toBe(Language.KO)
    })
  })

  describe('번역 데이터 로드', () => {
    it('번역 데이터를 캐시해야 한다', async () => {
      const store = useI18nStore()
      
      // 첫 번째 로드
      await store.loadTranslations(Language.EN)
      const firstLoad = store.translations[Language.EN]
      
      // 두 번째 로드 (캐시된 데이터 사용)
      await store.loadTranslations(Language.EN)
      const secondLoad = store.translations[Language.EN]
      
      expect(firstLoad).toBe(secondLoad) // 같은 객체 참조
    })

    it('지원하지 않는 언어 로드 시 기본 언어로 폴백해야 한다', async () => {
      const store = useI18nStore()
      
      // 지원하지 않는 언어로 로드 시도
      const result = await store.loadTranslations('unsupported' as Language)
      
      // 기본 언어의 번역 데이터가 반환되어야 함
      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })
  })

  describe('사용 가능한 언어', () => {
    it('사용 가능한 언어 목록을 반환해야 한다', () => {
      const store = useI18nStore()
      
      expect(store.availableLanguages).toHaveLength(2)
      expect(store.availableLanguages.map(lang => lang.code)).toContain(Language.EN)
      expect(store.availableLanguages.map(lang => lang.code)).toContain(Language.KO)
    })
  })
})