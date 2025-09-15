import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useI18nStore } from '../../stores/i18nStore'
import { errorMessageService } from '../../services/errorMessageService'

describe('ErrorMessageService', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    
    // Initialize i18n store
    const i18nStore = useI18nStore()
    await i18nStore.initialize()
  })

  describe('Korean translations', () => {
    beforeEach(async () => {
      const i18nStore = useI18nStore()
      await i18nStore.changeLanguage('ko')
    })

    it('should create localized JSON syntax error', () => {
      const error = new SyntaxError('Unexpected token')
      const parseError = errorMessageService.createParseError(error, '{"test": }', 'json')
      
      expect(parseError.message).toContain('JSON 구문 오류')
      expect(parseError.message).toContain('Unexpected token')
    })

    it('should create localized validation errors', () => {
      const error = errorMessageService.createValidationError('jsonlRequired')
      expect(error.message).toBe('JSONL 형식에는 최소 한 줄의 JSON 데이터가 필요합니다')
    })

    it('should create localized JSONL line errors', () => {
      const error = errorMessageService.createJsonlLineError(5, new Error('Invalid JSON'), 100)
      expect(error.message).toContain('5번째 줄')
      expect(error.message).toContain('Invalid JSON')
      expect(error.line).toBe(5)
      expect(error.position).toBe(100)
    })

    it('should create localized partial success messages', () => {
      const firstError = { message: 'test', line: 1, column: 0, position: 0 }
      const error = errorMessageService.createPartialSuccessError(2, 5, firstError)
      
      expect(error.message).toContain('2개 줄에서 오류가 발생했습니다')
      expect(error.message).toContain('5개 줄이 성공적으로 파싱되었습니다')
    })

    it('should create localized line labels', () => {
      const label = errorMessageService.getLineLabel(3)
      expect(label).toBe('3번째 줄')
    })
  })

  describe('English translations', () => {
    beforeEach(async () => {
      const i18nStore = useI18nStore()
      await i18nStore.changeLanguage('en')
    })

    it('should create localized JSON syntax error', () => {
      const error = new SyntaxError('Unexpected token')
      const parseError = errorMessageService.createParseError(error, '{"test": }', 'json')
      
      expect(parseError.message).toContain('JSON Syntax Error')
      expect(parseError.message).toContain('Unexpected token')
    })

    it('should create localized validation errors', () => {
      const error = errorMessageService.createValidationError('jsonlRequired')
      expect(error.message).toBe('JSONL format requires at least one line of JSON data')
    })

    it('should create localized JSONL line errors', () => {
      const error = errorMessageService.createJsonlLineError(5, new Error('Invalid JSON'), 100)
      expect(error.message).toContain('Line 5')
      expect(error.message).toContain('Invalid JSON')
      expect(error.line).toBe(5)
      expect(error.position).toBe(100)
    })

    it('should create localized partial success messages', () => {
      const firstError = { message: 'test', line: 1, column: 0, position: 0 }
      const error = errorMessageService.createPartialSuccessError(2, 5, firstError)
      
      expect(error.message).toContain('2 lines had errors')
      expect(error.message).toContain('5 lines were successfully parsed')
    })

    it('should create localized line labels', () => {
      const label = errorMessageService.getLineLabel(3)
      expect(label).toBe('Line 3')
    })
  })
})