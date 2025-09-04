import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  preloadChunk,
  getChunkSize,
  analyzeChunkPerformance,
  createChunkLoader
} from '../../utils/chunkUtils'

// Mock useChunkLoading composable
vi.mock('../../composables/useChunkLoading', () => ({
  useChunkLoading: () => ({
    startChunkLoading: vi.fn(),
    finishChunkLoading: vi.fn()
  })
}))

describe('chunkUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('preloadChunk', () => {
    it('should preload chunk successfully', async () => {
      const mockImport = vi.fn().mockResolvedValue({ default: 'component' })
      
      await preloadChunk(mockImport, 'test-chunk')
      
      expect(mockImport).toHaveBeenCalledTimes(1)
    })

    it('should handle preload errors gracefully', async () => {
      const mockImport = vi.fn().mockRejectedValue(new Error('Load failed'))
      
      // Should not throw
      await expect(preloadChunk(mockImport, 'test-chunk')).resolves.toBeUndefined()
      expect(mockImport).toHaveBeenCalledTimes(1)
    })
  })

  describe('getChunkSize', () => {
    it('should return chunk size from performance entries', () => {
      // Mock performance API
      const mockEntries = [
        {
          name: 'https://example.com/chunk-test-chunk.js',
          transferSize: 1024
        }
      ]
      
      vi.spyOn(performance, 'getEntriesByType').mockReturnValue(mockEntries as any)
      
      const size = getChunkSize('test-chunk')
      expect(size).toBe(1024)
    })

    it('should return 0 if chunk not found', () => {
      vi.spyOn(performance, 'getEntriesByType').mockReturnValue([])
      
      const size = getChunkSize('nonexistent-chunk')
      expect(size).toBe(0)
    })

    it('should return 0 if performance API not available', () => {
      const originalPerformance = global.performance
      delete (global as any).performance
      
      const size = getChunkSize('test-chunk')
      expect(size).toBe(0)
      
      global.performance = originalPerformance
    })
  })

  describe('analyzeChunkPerformance', () => {
    it('should analyze chunk performance with valid data', () => {
      const mockEntries = [
        {
          name: 'https://example.com/chunk-1.js',
          duration: 500
        },
        {
          name: 'https://example.com/chunk-2.js',
          duration: 1500
        },
        {
          name: 'https://example.com/main.js',
          duration: 300
        }
      ]
      
      vi.spyOn(performance, 'getEntriesByType').mockReturnValue(mockEntries as any)
      
      const analysis = analyzeChunkPerformance()
      
      expect(analysis.totalChunks).toBe(3)
      expect(analysis.averageLoadTime).toBeCloseTo(766.67, 2) // (500 + 1500 + 300) / 3
      expect(analysis.slowChunks).toHaveLength(1)
      expect(analysis.slowChunks[0].loadTime).toBe(1500)
      expect(analysis.recommendations).toContain('1 chunks are loading slowly (>1s)')
    })

    it('should handle no chunks', () => {
      vi.spyOn(performance, 'getEntriesByType').mockReturnValue([])
      
      const analysis = analyzeChunkPerformance()
      
      expect(analysis.totalChunks).toBe(0)
      expect(analysis.averageLoadTime).toBe(0)
      expect(analysis.slowChunks).toHaveLength(0)
    })

    it('should provide recommendations based on performance', () => {
      const mockEntries = [
        { name: 'chunk-1.js', duration: 600 },
        { name: 'chunk-2.js', duration: 700 }
      ]
      
      vi.spyOn(performance, 'getEntriesByType').mockReturnValue(mockEntries as any)
      
      const analysis = analyzeChunkPerformance()
      
      expect(analysis.recommendations).toContain(
        'Consider further code splitting for better performance'
      )
    })

    it('should handle performance API not available', () => {
      const originalPerformance = global.performance
      delete (global as any).performance
      
      const analysis = analyzeChunkPerformance()
      
      expect(analysis.totalChunks).toBe(0)
      expect(analysis.recommendations).toContain('Performance API not available')
      
      global.performance = originalPerformance
    })
  })

  describe('createChunkLoader', () => {
    it('should create a chunk loader with group name', () => {
      const loader = createChunkLoader('feature')
      expect(typeof loader).toBe('function')
    })

    it('should load component with correct chunk name', async () => {
      const mockImport = vi.fn().mockResolvedValue({ default: 'component' })
      const loader = createChunkLoader('feature')
      
      const result = await loader('TestComponent', mockImport)
      
      expect(result).toEqual({ default: 'component' })
      expect(mockImport).toHaveBeenCalledTimes(1)
    })
  })
})