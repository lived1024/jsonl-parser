import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  generateCacheKey,
  memoize,
  createDebouncedInvalidator,
  CacheWarmingScheduler
} from '../../utils/cacheUtils'

describe('cacheUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('generateCacheKey', () => {
    it('should generate basic cache key', () => {
      const key = generateCacheKey('tutorial', 'json-basics')
      expect(key).toBe('tutorial:json-basics')
    })

    it('should include version in cache key', () => {
      const key = generateCacheKey('tutorial', 'json-basics', '1.0')
      expect(key).toBe('tutorial:json-basics:v1.0')
    })

    it('should include parameters in cache key', () => {
      const key = generateCacheKey('tutorial', 'json-basics', undefined, { 
        lang: 'ko', 
        format: 'html' 
      })
      expect(key).toContain('tutorial:json-basics:')
      expect(key).toMatch(/tutorial:json-basics:[A-Za-z0-9+/=]+/)
    })

    it('should sort parameters consistently', () => {
      const key1 = generateCacheKey('tutorial', 'test', undefined, { b: '2', a: '1' })
      const key2 = generateCacheKey('tutorial', 'test', undefined, { a: '1', b: '2' })
      expect(key1).toBe(key2)
    })
  })

  describe('memoize', () => {
    it('should cache function results', () => {
      const expensiveFn = vi.fn((x: number) => x * 2)
      const memoizedFn = memoize(expensiveFn)
      
      const result1 = memoizedFn(5)
      const result2 = memoizedFn(5)
      
      expect(result1).toBe(10)
      expect(result2).toBe(10)
      expect(expensiveFn).toHaveBeenCalledTimes(1)
    })

    it('should handle different arguments', () => {
      const expensiveFn = vi.fn((x: number) => x * 2)
      const memoizedFn = memoize(expensiveFn)
      
      memoizedFn(5)
      memoizedFn(10)
      memoizedFn(5) // Should use cache
      
      expect(expensiveFn).toHaveBeenCalledTimes(2)
    })

    it('should use custom key generator', () => {
      const expensiveFn = vi.fn((obj: { id: number; name: string }) => obj.id * 2)
      const memoizedFn = memoize(expensiveFn, (obj) => `${obj.id}`)
      
      memoizedFn({ id: 1, name: 'first' })
      memoizedFn({ id: 1, name: 'second' }) // Should use cache despite different name
      
      expect(expensiveFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('createDebouncedInvalidator', () => {
    it('should debounce invalidation calls', () => {
      const invalidateFn = vi.fn()
      const debouncedInvalidator = createDebouncedInvalidator(invalidateFn, 100)
      
      debouncedInvalidator('pattern1')
      debouncedInvalidator('pattern2')
      debouncedInvalidator('pattern3')
      
      expect(invalidateFn).not.toHaveBeenCalled()
      
      vi.advanceTimersByTime(100)
      
      expect(invalidateFn).toHaveBeenCalledTimes(3)
      expect(invalidateFn).toHaveBeenCalledWith('pattern1')
      expect(invalidateFn).toHaveBeenCalledWith('pattern2')
      expect(invalidateFn).toHaveBeenCalledWith('pattern3')
    })

    it('should reset timer on new calls', () => {
      const invalidateFn = vi.fn()
      const debouncedInvalidator = createDebouncedInvalidator(invalidateFn, 100)
      
      debouncedInvalidator('pattern1')
      vi.advanceTimersByTime(50)
      debouncedInvalidator('pattern2')
      vi.advanceTimersByTime(50)
      
      expect(invalidateFn).not.toHaveBeenCalled()
      
      vi.advanceTimersByTime(50)
      
      expect(invalidateFn).toHaveBeenCalledTimes(2)
    })

    it('should deduplicate patterns', () => {
      const invalidateFn = vi.fn()
      const debouncedInvalidator = createDebouncedInvalidator(invalidateFn, 100)
      
      debouncedInvalidator('pattern1')
      debouncedInvalidator('pattern1')
      debouncedInvalidator('pattern2')
      
      vi.advanceTimersByTime(100)
      
      expect(invalidateFn).toHaveBeenCalledTimes(2)
      expect(invalidateFn).toHaveBeenCalledWith('pattern1')
      expect(invalidateFn).toHaveBeenCalledWith('pattern2')
    })
  })

  describe('CacheWarmingScheduler', () => {
    it('should create scheduler instance', () => {
      const scheduler = new CacheWarmingScheduler()
      expect(scheduler).toBeDefined()
      expect(typeof scheduler.schedule).toBe('function')
      expect(typeof scheduler.unschedule).toBe('function')
      expect(typeof scheduler.unscheduleAll).toBe('function')
    })

    it('should handle basic scheduling operations', () => {
      const scheduler = new CacheWarmingScheduler()
      const warmupFn = vi.fn().mockResolvedValue(undefined)
      
      // Should not throw
      expect(() => {
        scheduler.schedule('test-warmup', warmupFn, 1000)
        scheduler.unschedule('test-warmup')
        scheduler.unscheduleAll()
      }).not.toThrow()
    })
  })
})