import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  formatFileSize,
  debounce,
  throttle
} from '../../utils/helpers'

describe('helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1048576)).toBe('1 MB')
      expect(formatFileSize(1073741824)).toBe('1 GB')
    })

    it('should handle decimal values', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(2621440)).toBe('2.5 MB')
    })

    it('should handle large numbers', () => {
      expect(formatFileSize(5368709120)).toBe('5 GB')
    })
  })

  describe('debounce', () => {
    it('should delay function execution', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)
      
      debouncedFn()
      debouncedFn()
      debouncedFn()
      
      expect(fn).not.toHaveBeenCalled()
      
      vi.advanceTimersByTime(100)
      
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should reset delay on subsequent calls', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)
      
      debouncedFn()
      vi.advanceTimersByTime(50)
      debouncedFn()
      vi.advanceTimersByTime(50)
      
      expect(fn).not.toHaveBeenCalled()
      
      vi.advanceTimersByTime(50)
      
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should pass arguments correctly', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)
      
      debouncedFn('arg1', 'arg2')
      vi.advanceTimersByTime(100)
      
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
    })
  })

  describe('throttle', () => {
    it('should limit function calls', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 100)
      
      throttledFn()
      throttledFn()
      throttledFn()
      
      expect(fn).toHaveBeenCalledTimes(1)
      
      vi.advanceTimersByTime(100)
      throttledFn()
      
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should execute immediately on first call', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 100)
      
      throttledFn()
      
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })
})