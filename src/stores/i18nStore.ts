/**
 * i18n Pinia Store - 다국어 상태 관리
 */

import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { 
  Language, 
  type I18nState, 
  type TranslationMap, 
  type I18nSettings 
} from '../types/i18n'
import { 
  DEFAULT_LANGUAGE, 
  I18N_STORAGE_KEY, 
  AVAILABLE_LANGUAGES,
  SHOW_MISSING_KEYS,
  TRANSLATION_KEY_SEPARATOR
} from '../constants/i18n'

export const useI18nStore = defineStore('i18n', () => {
  // 상태
  const currentLanguage = ref<Language>(DEFAULT_LANGUAGE)
  const translations = ref<Record<Language, TranslationMap>>({} as Record<Language, TranslationMap>)
  const isLoading = ref(false)

  // Getters
  const currentTranslations = computed(() => translations.value[currentLanguage.value] || {})
  
  const availableLanguages = computed(() => AVAILABLE_LANGUAGES)

  // 브라우저 언어 감지
  const detectBrowserLanguage = (): Language => {
    try {
      // navigator.languages 배열을 우선 확인 (사용자 선호도 순)
      const languages = navigator.languages || [navigator.language]
      
      for (const lang of languages) {
        // 언어 코드 정규화 (예: 'ko-KR' -> 'ko', 'en-US' -> 'en')
        const normalizedLang = lang.toLowerCase().split('-')[0]
        
        // 지원하는 언어인지 확인
        if (Object.values(Language).includes(normalizedLang as Language)) {
          return normalizedLang as Language
        }
      }
    } catch (error) {
      console.warn('Failed to detect browser language:', error)
    }
    
    return DEFAULT_LANGUAGE
  }

  // localStorage에서 언어 설정 로드
  const loadLanguageFromStorage = (): Language | null => {
    try {
      const stored = localStorage.getItem(I18N_STORAGE_KEY)
      if (stored) {
        const settings: I18nSettings = JSON.parse(stored)
        
        // 설정 유효성 검사
        if (settings.language && Object.values(Language).includes(settings.language)) {
          // 설정이 너무 오래된 경우 (30일 이상) 브라우저 언어 재감지
          const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
          if (settings.lastUpdated && settings.lastUpdated < thirtyDaysAgo) {
            console.info('Language setting is older than 30 days, will re-detect browser language')
            return null
          }
          
          return settings.language
        }
      }
    } catch (error) {
      console.warn('Failed to load language from localStorage:', error)
    }
    return null
  }

  // 초기 언어 결정 (우선순위: localStorage > 브라우저 언어 > 기본 언어)
  const determineInitialLanguage = (): Language => {
    // 1. localStorage에서 저장된 언어 확인
    const storedLanguage = loadLanguageFromStorage()
    if (storedLanguage) {
      return storedLanguage
    }
    
    // 2. 브라우저 언어 감지
    const browserLanguage = detectBrowserLanguage()
    
    // 3. 브라우저 언어가 기본 언어와 다르면 로그 출력
    if (browserLanguage !== DEFAULT_LANGUAGE) {
      console.info(`Detected browser language: ${browserLanguage}, using as initial language`)
    }
    
    return browserLanguage
  }

  // localStorage에 언어 설정 저장
  const saveLanguageToStorage = (language: Language): boolean => {
    try {
      const settings: I18nSettings = {
        language,
        lastUpdated: Date.now()
      }
      localStorage.setItem(I18N_STORAGE_KEY, JSON.stringify(settings))
      return true
    } catch (error) {
      console.warn('Failed to save language to localStorage:', error)
      return false
    }
  }

  // localStorage 설정 검증 및 복구
  const validateAndRepairStorage = (): void => {
    try {
      const stored = localStorage.getItem(I18N_STORAGE_KEY)
      if (stored) {
        const settings = JSON.parse(stored)
        
        // 필수 필드 검증
        if (!settings.language || !settings.lastUpdated) {
          console.warn('Invalid i18n settings in localStorage, repairing...')
          saveLanguageToStorage(currentLanguage.value)
        }
        
        // 언어 코드 유효성 검증
        if (!Object.values(Language).includes(settings.language)) {
          console.warn('Invalid language code in localStorage, repairing...')
          saveLanguageToStorage(currentLanguage.value)
        }
      }
    } catch (error) {
      console.warn('Failed to validate localStorage settings:', error)
      // 손상된 데이터 제거 후 현재 언어로 재저장
      try {
        localStorage.removeItem(I18N_STORAGE_KEY)
        saveLanguageToStorage(currentLanguage.value)
      } catch (repairError) {
        console.error('Failed to repair localStorage settings:', repairError)
      }
    }
  }

  // 번역 데이터 로드
  const loadTranslations = async (language: Language): Promise<TranslationMap> => {
    try {
      isLoading.value = true
      
      // 이미 로드된 번역이 있으면 반환
      if (translations.value[language]) {
        return translations.value[language]
      }

      // 동적 import로 번역 파일 로드
      let translationModule
      switch (language) {
        case Language.EN:
          translationModule = await import('../locales/en')
          break
        case Language.KO:
          translationModule = await import('../locales/ko')
          break
        default:
          throw new Error(`Unsupported language: ${language}`)
      }

      const translationData = translationModule.default
      translations.value[language] = translationData
      
      return translationData
    } catch (error) {
      console.error(`Failed to load translations for ${language}:`, error)
      
      // 폴백: 기본 언어로 시도
      if (language !== DEFAULT_LANGUAGE) {
        return loadTranslations(DEFAULT_LANGUAGE)
      }
      
      // 기본 언어도 실패하면 빈 객체 반환
      return {}
    } finally {
      isLoading.value = false
    }
  }

  // 번역 키로 텍스트 가져오기
  const getTranslation = (key: string, params?: Record<string, any>): string => {
    const keys = key.split(TRANSLATION_KEY_SEPARATOR)
    let value: any = currentTranslations.value

    // 중첩된 객체에서 값 찾기
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // 번역 키를 찾을 수 없음
        if (SHOW_MISSING_KEYS) {
          console.warn(`Missing translation key: ${key} for language: ${currentLanguage.value}`)
        }
        return key // 키 자체를 반환
      }
    }

    if (typeof value !== 'string') {
      if (SHOW_MISSING_KEYS) {
        console.warn(`Translation key "${key}" does not resolve to a string`)
      }
      return key
    }

    // 매개변수 치환
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? String(params[paramKey]) : match
      })
    }

    return value
  }

  // 언어 변경
  const changeLanguage = async (language: Language): Promise<void> => {
    if (language === currentLanguage.value) {
      return
    }

    const previousLanguage = currentLanguage.value

    try {
      // 번역 데이터 로드
      await loadTranslations(language)
      
      // 언어 변경
      currentLanguage.value = language
      
      // localStorage에 저장 (실패해도 언어 변경은 유지)
      const saved = saveLanguageToStorage(language)
      if (!saved) {
        console.warn('Language changed but failed to persist to localStorage')
      }
      
      // HTML lang 속성 업데이트
      document.documentElement.lang = language
      
      // 성공 로그
      console.info(`Language changed from ${previousLanguage} to ${language}`)
      
    } catch (error) {
      console.error('Failed to change language:', error)
      
      // 언어 변경 실패 시 이전 언어로 롤백
      currentLanguage.value = previousLanguage
      document.documentElement.lang = previousLanguage
      
      throw error
    }
  }

  // 초기화
  const initialize = async (): Promise<void> => {
    try {
      // 초기 언어 결정 (localStorage > 브라우저 언어 > 기본 언어)
      const initialLanguage = determineInitialLanguage()
      
      // 번역 데이터 로드
      await loadTranslations(initialLanguage)
      
      // 언어 설정
      currentLanguage.value = initialLanguage
      
      // HTML lang 속성 설정
      document.documentElement.lang = initialLanguage
      
      // localStorage 설정 검증 및 저장
      validateAndRepairStorage()
      
      // 브라우저 언어가 감지되었고 localStorage에 저장되지 않은 경우 저장
      const storedLanguage = loadLanguageFromStorage()
      if (!storedLanguage && initialLanguage !== DEFAULT_LANGUAGE) {
        saveLanguageToStorage(initialLanguage)
        console.info(`Saved detected browser language (${initialLanguage}) to localStorage`)
      }
      
      console.info(`i18n initialized with language: ${initialLanguage}`)
      
    } catch (error) {
      console.error('Failed to initialize i18n store:', error)
      
      // 실패 시 기본 언어로 폴백
      try {
        currentLanguage.value = DEFAULT_LANGUAGE
        document.documentElement.lang = DEFAULT_LANGUAGE
        
        // 기본 언어 번역 로드 시도
        await loadTranslations(DEFAULT_LANGUAGE)
        
        // 기본 언어 설정 저장 시도
        saveLanguageToStorage(DEFAULT_LANGUAGE)
        
        console.warn(`i18n initialized with fallback language: ${DEFAULT_LANGUAGE}`)
        
      } catch (fallbackError) {
        console.error('Failed to initialize with fallback language:', fallbackError)
        // 최후의 수단: 빈 번역으로 계속 진행
        currentLanguage.value = DEFAULT_LANGUAGE
        document.documentElement.lang = DEFAULT_LANGUAGE
      }
    }
  }

  // 언어 설정 상태 확인
  const getLanguageStatus = () => {
    const storedLanguage = loadLanguageFromStorage()
    const browserLanguage = detectBrowserLanguage()
    
    return {
      current: currentLanguage.value,
      stored: storedLanguage,
      browser: browserLanguage,
      isStoredLanguage: storedLanguage === currentLanguage.value,
      isBrowserLanguage: browserLanguage === currentLanguage.value,
      hasStoredSettings: storedLanguage !== null
    }
  }

  // 언어 설정 재설정 (개발/디버깅용)
  const resetLanguageSettings = async (): Promise<void> => {
    try {
      localStorage.removeItem(I18N_STORAGE_KEY)
      await initialize()
      console.info('Language settings reset and re-initialized')
    } catch (error) {
      console.error('Failed to reset language settings:', error)
      throw error
    }
  }

  return {
    // State
    currentLanguage: readonly(currentLanguage),
    translations: readonly(translations),
    isLoading: readonly(isLoading),
    
    // Getters
    currentTranslations,
    availableLanguages,
    
    // Actions
    getTranslation,
    changeLanguage,
    loadTranslations,
    initialize,
    
    // Utilities
    getLanguageStatus,
    resetLanguageSettings,
    detectBrowserLanguage,
    validateAndRepairStorage
  }
})