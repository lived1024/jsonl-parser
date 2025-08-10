/**
 * 다국어 지원을 위한 상수 정의
 */

import { Language, type LanguageInfo } from '../types/i18n'

// 기본 언어 설정
export const DEFAULT_LANGUAGE = Language.EN

// localStorage 키
export const I18N_STORAGE_KEY = 'jsonTreeViewer_i18n_settings'

// 지원하는 언어 목록
export const AVAILABLE_LANGUAGES: LanguageInfo[] = [
  {
    code: Language.EN,
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  {
    code: Language.KO,
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷'
  }
]

// 언어별 설정
export const LANGUAGE_CONFIG = {
  [Language.EN]: {
    direction: 'ltr' as const,
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  [Language.KO]: {
    direction: 'ltr' as const,
    fontFamily: 'system-ui, -apple-system, "Malgun Gothic", "맑은 고딕", sans-serif'
  }
} as const

// 번역 키 분리자
export const TRANSLATION_KEY_SEPARATOR = '.'

// 개발 모드에서 누락된 번역 키 표시 여부
export const SHOW_MISSING_KEYS = import.meta.env.DEV