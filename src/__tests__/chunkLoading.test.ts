import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useChunkLoading } from '../composables/useChunkLoading'
import { importChunk, analyzeChunkPerformance } from '../utils/chunkUtils'

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  getEntriesByType: vi.fn(() => [
    {
      name: 'chunk-learning.js',
      duration: 150,
      transferSize: 50000
    },
    {
      name: 'chunk-tools.js', 
      duration: 1200,
      transferSize: 80000
    },
    {
      name: 'chunk-reference.js',
      duration: 300,
      transferSize: 30000
    }
  ])
}

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true
})

describe('Chunk Loading', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useChunkLoading', () => {
    it('should track loading state correctly', () => {
      const { isLoading, startChunkLoading, finishChunkLoading, getChunkStats } = useChunkLoading()
      
      expect(isLoading.value).toBe(false)
      
      startChunkLoading('test-chunk')
      expect(isLoading.value).toBe(true)
      
      finishChunkLoading('test-chunk', true)
      expect(isLoading.value).toBe(false)
      
      const stats = getChunkStats()
      expect(stats.loaded).toBe(1)
      expect(stats.failed).toBe(0)
    })

    it('should track failed chunk loading', () => {
      const { startChunkLoading, finishChunkLoading, getChunkStats } = useChunkLoading()
      
      startChunkLoading('failed-chunk')
      finishChunkLoading('failed-chunk', false)
      
      const stats = getChunkStats()
      expect(stats.failed).toBe(1)
      expect(stats.loaded).toBe(0)
    })

    it('should calculate loading progress correctly', () => {
      const { loadingProgress, startChunkLoading, finishChunkLoading } = useChunkLoading()
      
      startChunkLoading('chunk1')
      startChunkLoading('chunk2')
      expect(loadingProgress.value).toBe(0)
      
      finishChunkLoading('chunk1', true)
      expect(loadingProgress.value).toBe(50)
      
      finishChunkLoading('chunk2', true)
      expect(loadingProgress.value).toBe(100)
    })
  })

  describe('importChunk', () => {
    it('should successfully import a chunk', async () => {
      const mockImport = vi.fn().mockResolvedValue({ default: 'test-component' })
      
      const result = await importChunk(mockImport, { chunkName: 'test-chunk' })
      
      expect(result).toEqual({ default: 'test-component' })
      expect(mockImport).toHaveBeenCalledOnce()
    })

    it('should retry on failure', async () => {
      const mockImport = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ default: 'test-component' })
      
      const result = await importChunk(mockImport, { 
        chunkName: 'test-chunk',
        retryAttempts: 1,
        retryDelay: 10
      })
      
      expect(result).toEqual({ default: 'test-component' })
      expect(mockImport).toHaveBeenCalledTimes(2)
    })

    it('should fail after max retries', async () => {
      const mockImport = vi.fn().mockRejectedValue(new Error('Persistent error'))
      
      await expect(
        importChunk(mockImport, { 
          chunkName: 'test-chunk',
          retryAttempts: 1,
          retryDelay: 10
        })
      ).rejects.toThrow('Failed to load chunk "test-chunk" after 2 attempts')
      
      expect(mockImport).toHaveBeenCalledTimes(2)
    })

    it('should timeout on slow imports', async () => {
      const mockImport = vi.fn(() => new Promise(resolve => setTimeout(resolve, 200)))
      
      await expect(
        importChunk(mockImport, { 
          chunkName: 'test-chunk',
          timeout: 100
        })
      ).rejects.toThrow('Chunk loading timeout: test-chunk')
    })
  })

  describe('analyzeChunkPerformance', () => {
    it('should analyze chunk performance correctly', () => {
      const analysis = analyzeChunkPerformance()
      
      expect(analysis.totalChunks).toBe(3)
      expect(analysis.averageLoadTime).toBe(550) // (150 + 1200 + 300) / 3
      expect(analysis.slowChunks).toHaveLength(1)
      expect(analysis.slowChunks[0].name).toBe('chunk-tools.js')
      expect(analysis.recommendations).toContain('1 chunks are loading slowly (>1s)')
    })

    it('should provide recommendations based on performance', () => {
      const analysis = analyzeChunkPerformance()
      
      expect(analysis.recommendations).toContain('Consider further code splitting for better performance')
      expect(analysis.recommendations).toContain('1 chunks are loading slowly (>1s)')
    })

    it('should handle missing performance API', () => {
      const originalPerformance = window.performance
      // @ts-ignore
      delete window.performance
      
      const analysis = analyzeChunkPerformance()
      
      expect(analysis.totalChunks).toBe(0)
      expect(analysis.averageLoadTime).toBe(0)
      expect(analysis.recommendations).toContain('Performance API not available')
      
      window.performance = originalPerformance
    })
  })
})