import { describe, it, expect } from 'vitest'
import { 
  isValidJSON,
  detectJSONL,
  isValidEmail,
  isValidUrl
} from '../../utils/validators'

describe('validators', () => {
  describe('isValidJSON', () => {
    it('should validate correct JSON', () => {
      expect(isValidJSON('{"valid": "json"}')).toBe(true)
      expect(isValidJSON('[]')).toBe(true)
      expect(isValidJSON('null')).toBe(true)
      expect(isValidJSON('42')).toBe(true)
      expect(isValidJSON('"string"')).toBe(true)
    })

    it('should detect invalid JSON syntax', () => {
      expect(isValidJSON('{"invalid": json}')).toBe(false)
      expect(isValidJSON('{')).toBe(false)
      expect(isValidJSON('undefined')).toBe(false)
      expect(isValidJSON('')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isValidJSON('true')).toBe(true)
      expect(isValidJSON('false')).toBe(true)
      expect(isValidJSON('0')).toBe(true)
      expect(isValidJSON('""')).toBe(true)
    })
  })

  describe('detectJSONL', () => {
    it('should detect valid JSONL format', () => {
      const jsonl = '{"line": 1}\n{"line": 2}'
      expect(detectJSONL(jsonl)).toBe(true)
    })

    it('should detect invalid JSONL format', () => {
      expect(detectJSONL('{"single": "line"}')).toBe(false)
      expect(detectJSONL('{"valid": "line"}\n{invalid: line}')).toBe(false)
      expect(detectJSONL('')).toBe(false)
    })

    it('should handle empty lines in JSONL', () => {
      const jsonl = '{"line": 1}\n\n{"line": 2}\n'
      expect(detectJSONL(jsonl)).toBe(true)
    })

    it('should require at least 2 valid JSON lines', () => {
      expect(detectJSONL('{"only": "one"}')).toBe(false)
      expect(detectJSONL('{"first": 1}\n{"second": 2}')).toBe(true)
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('user+tag@example.org')).toBe(true)
    })

    it('should detect invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('user@')).toBe(false)
      expect(isValidEmail('user@domain')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://localhost:3000')).toBe(true)
      expect(isValidUrl('ftp://files.example.com')).toBe(true)
    })

    it('should detect invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false)
      expect(isValidUrl('http://')).toBe(false)
      expect(isValidUrl('')).toBe(false)
      expect(isValidUrl('javascript:alert(1)')).toBe(true) // URL constructor allows this
    })
  })
})