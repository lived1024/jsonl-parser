/**
 * useI18n Composable - 다국어 지원을 위한 컴포저블
 */

import { computed } from 'vue'
import { useI18nStore } from '../stores/i18nStore'
import { AVAILABLE_LANGUAGES } from '../constants/i18n'
import type { 
  Language, 
  UseI18nReturn, 
  TranslationFunction, 
  LanguageChangeFunction 
} from '../types/i18n'

/**
 * i18n 기능을 제공하는 컴포저블
 */
export function useI18n(): UseI18nReturn {
  const i18nStore = useI18nStore()

  /**
   * 번역 함수
   * @param key - 번역 키 (점으로 구분된 중첩 키 지원)
   * @param params - 번역 문자열에 삽입할 매개변수
   * @returns 번역된 문자열
   */
  const t: TranslationFunction = (key: string, params?: Record<string, any>): string => {
    return i18nStore.getTranslation(key, params)
  }

  /**
   * 현재 언어 (읽기 전용)
   */
  const currentLanguage = computed(() => i18nStore.currentLanguage)

  /**
   * 언어 변경 함수
   * @param language - 변경할 언어
   */
  const changeLanguage: LanguageChangeFunction = async (language: Language): Promise<void> => {
    try {
      await i18nStore.changeLanguage(language)
    } catch (error) {
      console.error('Failed to change language:', error)
      throw error
    }
  }

  /**
   * 사용 가능한 언어 목록
   */
  const availableLanguages = AVAILABLE_LANGUAGES

  /**
   * 현재 언어가 로딩 중인지 여부
   */
  const isLoading = computed(() => i18nStore.isLoading)

  /**
   * 특정 언어인지 확인하는 헬퍼 함수
   */
  const isLanguage = (language: Language): boolean => {
    return currentLanguage.value === language
  }

  /**
   * 현재 언어의 정보를 가져오는 헬퍼 함수
   */
  const getCurrentLanguageInfo = computed(() => {
    return availableLanguages.find(lang => lang.code === currentLanguage.value)
  })

  /**
   * 번역 키가 존재하는지 확인하는 헬퍼 함수
   */
  const hasTranslation = (key: string): boolean => {
    const translation = i18nStore.getTranslation(key)
    return translation !== key // 키 자체가 반환되면 번역이 없음
  }

  /**
   * 복수형 처리를 위한 헬퍼 함수
   * @param key - 번역 키
   * @param count - 개수
   * @param params - 추가 매개변수
   */
  const tn = (key: string, count: number, params?: Record<string, any>): string => {
    const pluralKey = count === 1 ? `${key}.singular` : `${key}.plural`
    const fallbackKey = key
    
    // 복수형 키가 있으면 사용, 없으면 기본 키 사용
    const translation = hasTranslation(pluralKey) 
      ? i18nStore.getTranslation(pluralKey, { count, ...params })
      : i18nStore.getTranslation(fallbackKey, { count, ...params })
    
    return translation
  }

  return {
    // 핵심 기능
    t,
    currentLanguage,
    changeLanguage,
    availableLanguages,
    
    // 추가 유틸리티
    isLoading,
    isLanguage,
    getCurrentLanguageInfo,
    hasTranslation,
    tn
  }
}

/**
 * 전역 i18n 인스턴스 (싱글톤 패턴)
 */
let globalI18n: UseI18nReturn | null = null

/**
 * 전역 i18n 인스턴스를 가져오는 함수
 */
export function getGlobalI18n(): UseI18nReturn {
  if (!globalI18n) {
    globalI18n = useI18n()
  }
  return globalI18n
}

/**
 * 컴포넌트 외부에서 사용할 수 있는 번역 함수
 */
export function $t(key: string, params?: Record<string, any>): string {
  return getGlobalI18n().t(key, params)
}

/**
 * 컴포넌트 외부에서 사용할 수 있는 복수형 번역 함수
 */
export function $tn(key: string, count: number, params?: Record<string, any>): string {
  return getGlobalI18n().tn(key, count, params)
}