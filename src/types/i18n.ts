/**
 * 다국어 지원을 위한 TypeScript 타입 정의
 */

import type { Ref } from 'vue'

// 지원하는 언어 열거형
export enum Language {
  EN = 'en',
  KO = 'ko'
}

// 언어 정보 인터페이스
export interface LanguageInfo {
  code: Language
  name: string
  nativeName: string
  flag: string
}

// 번역 데이터 구조 인터페이스
export interface TranslationMap {
  [key: string]: string | TranslationMap
}

// i18n Store 상태 인터페이스
export interface I18nState {
  currentLanguage: Language
  translations: Record<Language, TranslationMap>
  isLoading: boolean
}

// localStorage에 저장되는 i18n 설정
export interface I18nSettings {
  language: Language
  lastUpdated: number
}

// 번역 함수 타입
export type TranslationFunction = (key: string, params?: Record<string, any>) => string

// 언어 변경 함수 타입
export type LanguageChangeFunction = (language: Language) => Promise<void>

// useI18n composable 반환 타입
export interface UseI18nReturn {
  t: TranslationFunction
  currentLanguage: Readonly<Ref<Language>>
  changeLanguage: LanguageChangeFunction
  availableLanguages: LanguageInfo[]
  isLoading: Readonly<Ref<boolean>>
  isLanguage: (language: Language) => boolean
  getCurrentLanguageInfo: Readonly<Ref<LanguageInfo | undefined>>
  hasTranslation: (key: string) => boolean
  tn: (key: string, count: number, params?: Record<string, any>) => string
}