/**
 * Locales index file
 */

import { Language } from '../types/i18n'

// 동적 import를 위한 locale 로더
export const loadLocale = async (language: Language) => {
  switch (language) {
    case Language.EN:
      return (await import('./en')).default
    case Language.KO:
      return (await import('./ko')).default
    default:
      throw new Error(`Unsupported language: ${language}`)
  }
}

// 타입 추론을 위한 기본 export
export { default as en } from './en'
export { default as ko } from './ko'