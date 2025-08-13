import { describe, it, expect } from 'vitest'
import { ErrorPatternService } from '../../services/ErrorPatternService'

describe('ErrorPatternService', () => {
  const service = new ErrorPatternService()

  describe('analyzeError', () => {
    it('should identify unexpected token errors', () => {
      const errorMessage = 'Unexpected token , in JSON at position 25'
      const results = service.analyzeError(errorMessage)
      
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].errorGuide.id).toBe('trailing-comma')
      expect(results[0].confidence).toBeGreaterThan(0.7)
    })

    it('should identify unexpected end errors', () => {
      const errorMessage = 'Unexpected end of JSON input'
      const results = service.analyzeError(errorMessage)
      
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].errorGuide.id).toBe('unexpected-end')
      expect(results[0].confidence).toBeGreaterThan(0.9)
    })

    it('should identify comment-related errors', () => {
      const errorMessage = 'Unexpected token // comment in JSON'
      const results = service.analyzeError(errorMessage)
      
      expect(results.length).toBeGreaterThan(0)
      // Should find unexpected-token error with high confidence due to comment pattern
      const unexpectedTokenError = results.find(r => r.errorGuide.id === 'unexpected-token')
      expect(unexpectedTokenError).toBeDefined()
      expect(unexpectedTokenError?.confidence).toBeGreaterThan(0.8)
    })

    it('should return multiple matches sorted by confidence', () => {
      const errorMessage = 'Unexpected token in JSON'
      const results = service.analyzeError(errorMessage)
      
      expect(results.length).toBeGreaterThan(1)
      
      // Check that results are sorted by confidence (descending)
      for (let i = 1; i < results.length; i++) {
        expect(results[i-1].confidence).toBeGreaterThanOrEqual(results[i].confidence)
      }
    })

    it('should provide suggested fixes for trailing comma errors', () => {
      const errorMessage = 'Unexpected token , in JSON at position 25'
      const jsonContent = '{"name": "John", "age": 30,}'
      const results = service.analyzeError(errorMessage, jsonContent)
      
      expect(results[0].suggestedFix).toBeDefined()
      expect(results[0].suggestedFix).toBe('{"name": "John", "age": 30}')
    })
  })

  describe('getAllErrorGuides', () => {
    it('should return all error guides', () => {
      const guides = service.getAllErrorGuides()
      
      expect(guides.length).toBeGreaterThan(5)
      expect(guides[0]).toHaveProperty('id')
      expect(guides[0]).toHaveProperty('title')
      expect(guides[0]).toHaveProperty('description')
    })
  })

  describe('getErrorGuidesByCategory', () => {
    it('should filter error guides by category', () => {
      const syntaxErrors = service.getErrorGuidesByCategory('syntax')
      const structureErrors = service.getErrorGuidesByCategory('structure')
      
      expect(syntaxErrors.length).toBeGreaterThan(0)
      expect(structureErrors.length).toBeGreaterThan(0)
      
      syntaxErrors.forEach(error => {
        expect(error.category).toBe('syntax')
      })
      
      structureErrors.forEach(error => {
        expect(error.category).toBe('structure')
      })
    })
  })

  describe('getErrorGuideById', () => {
    it('should return specific error guide by id', () => {
      const error = service.getErrorGuideById('unexpected-token')
      
      expect(error).toBeDefined()
      expect(error?.id).toBe('unexpected-token')
      expect(error?.title).toContain('Unexpected token')
    })

    it('should return undefined for non-existent id', () => {
      const error = service.getErrorGuideById('non-existent')
      
      expect(error).toBeUndefined()
    })
  })

  describe('getRelatedErrors', () => {
    it('should return related errors for a given error id', () => {
      const relatedErrors = service.getRelatedErrors('unexpected-token')
      
      expect(relatedErrors.length).toBeGreaterThan(0)
      expect(relatedErrors[0]).toHaveProperty('id')
      expect(relatedErrors[0]).toHaveProperty('title')
    })

    it('should return empty array for error with no related errors', () => {
      const relatedErrors = service.getRelatedErrors('non-existent')
      
      expect(relatedErrors).toEqual([])
    })
  })

  describe('keyword analysis', () => {
    it('should match errors based on keywords in error message', () => {
      const errorMessage = 'JSON parsing failed due to invalid string escape format'
      const results = service.analyzeError(errorMessage)
      
      expect(results.length).toBeGreaterThan(0)
      
      // Should find errors with reasonable confidence
      expect(results[0].confidence).toBeGreaterThan(0.2)
    })

    it('should handle Korean error messages', () => {
      const errorMessage = '문자열 형식이 잘못되었습니다'
      const results = service.analyzeError(errorMessage)
      
      // Should still find relevant errors even with Korean text
      expect(results.length).toBeGreaterThan(0)
    })
  })

  describe('confidence scoring', () => {
    it('should assign higher confidence to exact pattern matches', () => {
      const exactMatch = 'Unexpected end of JSON input'
      const keywordMatch = 'JSON string format error'
      
      const exactResults = service.analyzeError(exactMatch)
      const keywordResults = service.analyzeError(keywordMatch)
      
      if (exactResults.length > 0 && keywordResults.length > 0) {
        expect(exactResults[0].confidence).toBeGreaterThan(keywordResults[0].confidence)
      }
    })

    it('should limit keyword-based confidence to maximum threshold', () => {
      const results = service.analyzeError('some error message')
      
      results.forEach(result => {
        if (result.matchedPattern === 'keyword-analysis') {
          expect(result.confidence).toBeLessThanOrEqual(0.8)
        }
      })
    })
  })
})