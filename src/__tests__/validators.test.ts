import { describe, it, expect } from 'vitest'
import { isValidJSON, detectJSONL } from '../utils/validators'

describe('validators', () => {
  describe('isValidJSON', () => {
    it('should return true for valid JSON', () => {
      expect(isValidJSON('{"name": "test"}')).toBe(true)
      expect(isValidJSON('[1, 2, 3]')).toBe(true)
      expect(isValidJSON('"string"')).toBe(true)
      expect(isValidJSON('123')).toBe(true)
      expect(isValidJSON('true')).toBe(true)
      expect(isValidJSON('null')).toBe(true)
    })

    it('should return false for invalid JSON', () => {
      expect(isValidJSON('{"name": test}')).toBe(false)
      expect(isValidJSON('[1, 2, 3')).toBe(false)
      expect(isValidJSON('undefined')).toBe(false)
      expect(isValidJSON('')).toBe(false)
    })
  })

  describe('detectJSONL', () => {
    it('should return true for valid JSONL format', () => {
      const validJsonl = `{"name": "홍길동", "age": 30}
{"name": "김철수", "age": 25}
{"name": "이영희", "age": 28}`
      expect(detectJSONL(validJsonl)).toBe(true)
    })

    it('should return true for JSONL with empty lines', () => {
      const jsonlWithEmptyLines = `{"name": "홍길동", "age": 30}

{"name": "김철수", "age": 25}

{"name": "이영희", "age": 28}`
      expect(detectJSONL(jsonlWithEmptyLines)).toBe(true)
    })

    it('should return false for single line JSON', () => {
      expect(detectJSONL('{"name": "test"}')).toBe(false)
    })

    it('should return false for invalid JSONL (one invalid line)', () => {
      const invalidJsonl = `{"name": "홍길동", "age": 30}
{"name": "김철수", age: 25}
{"name": "이영희", "age": 28}`
      expect(detectJSONL(invalidJsonl)).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(detectJSONL('')).toBe(false)
      expect(detectJSONL('   ')).toBe(false)
    })

    it('should return false for single valid JSON line', () => {
      expect(detectJSONL('{"name": "test"}')).toBe(false)
    })

    it('should return true for multiple valid JSON objects', () => {
      const multipleJson = `{"id": 1, "name": "Alice"}
{"id": 2, "name": "Bob"}
{"id": 3, "name": "Charlie"}`
      expect(detectJSONL(multipleJson)).toBe(true)
    })

    it('should return true for arrays in JSONL format', () => {
      const arrayJsonl = `[1, 2, 3]
[4, 5, 6]
[7, 8, 9]`
      expect(detectJSONL(arrayJsonl)).toBe(true)
    })

    it('should return true for mixed types in JSONL format', () => {
      const mixedJsonl = `{"type": "object"}
[1, 2, 3]
"string value"
123
true`
      expect(detectJSONL(mixedJsonl)).toBe(true)
    })
  })
})