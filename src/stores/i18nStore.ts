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

  // localStorage에서 언어 설정 로드
  const loadLanguageFromStorage = (): Language => {
    try {
      const stored = localStorage.getItem(I18N_STORAGE_KEY)
      if (stored) {
        const settings: I18nSettings = JSON.parse(stored)
        if (Object.values(Language).includes(settings.language)) {
          return settings.language
        }
      }
    } catch (error) {
      console.warn('Failed to load language from localStorage:', error)
    }
    return DEFAULT_LANGUAGE
  }

  // localStorage에 언어 설정 저장
  const saveLanguageToStorage = (language: Language): void => {
    try {
      const settings: I18nSettings = {
        language,
        lastUpdated: Date.now()
      }
      localStorage.setItem(I18N_STORAGE_KEY, JSON.stringify(settings))
    } catch (error) {
      console.warn('Failed to save language to localStorage:', error)
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

    try {
      // 번역 데이터 로드
      await loadTranslations(language)
      
      // 언어 변경
      currentLanguage.value = language
      
      // localStorage에 저장
      saveLanguageToStorage(language)
      
      // HTML lang 속성 업데이트
      document.documentElement.lang = language
      
    } catch (error) {
      console.error('Failed to change language:', error)
      throw error
    }
  }

  // 초기화
  const initialize = async (): Promise<void> => {
    try {
      // localStorage에서 언어 설정 로드
      const savedLanguage = loadLanguageFromStorage()
      
      // 번역 데이터 로드
      await loadTranslations(savedLanguage)
      
      // 언어 설정
      currentLanguage.value = savedLanguage
      
      // HTML lang 속성 설정
      document.documentElement.lang = savedLanguage
      
    } catch (error) {
      console.error('Failed to initialize i18n store:', error)
      // 실패 시 기본 언어로 폴백
      currentLanguage.value = DEFAULT_LANGUAGE
      document.documentElement.lang = DEFAULT_LANGUAGE
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
    initialize
  }
})