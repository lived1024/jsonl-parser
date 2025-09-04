import { ref, computed } from 'vue'
import { cacheManager, generateCacheKey } from '../utils/cacheUtils'
import type { GuideContent, Tutorial, SampleData } from '../types'

interface CacheState {
  isLoading: boolean
  error: string | null
  stats: {
    hitRate: number
    memoryUsage: number
    entryCount: number
  }
}

export function useContentCache() {
  const state = ref<CacheState>({
    isLoading: false,
    error: null,
    stats: {
      hitRate: 0,
      memoryUsage: 0,
      entryCount: 0
    }
  })

  /**
   * Cache and retrieve guide content
   */
  async function cacheGuide(guide: GuideContent): Promise<void> {
    try {
      state.value.isLoading = true
      state.value.error = null
      
      await cacheManager.cacheContent(
        generateCacheKey('guide', guide.id),
        guide,
        'guides'
      )
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Failed to cache guide'
      console.error('Failed to cache guide:', error)
    } finally {
      state.value.isLoading = false
    }
  }

  async function getGuide(guideId: string): Promise<GuideContent | null> {
    try {
      state.value.isLoading = true
      state.value.error = null
      
      const cacheKey = generateCacheKey('guide', guideId)
      return await cacheManager.getCachedContent<GuideContent>(cacheKey)
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Failed to get cached guide'
      console.error('Failed to get cached guide:', error)
      return null
    } finally {
      state.value.isLoading = false
    }
  }

  /**
   * Cache and retrieve tutorial content
   */
  async function cacheTutorial(tutorial: Tutorial): Promise<void> {
    try {
      state.value.isLoading = true
      state.value.error = null
      
      await cacheManager.cacheContent(
        generateCacheKey('tutorial', tutorial.id),
        tutorial,
        'tutorials'
      )
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Failed to cache tutorial'
      console.error('Failed to cache tutorial:', error)
    } finally {
      state.value.isLoading = false
    }
  }

  async function getTutorial(tutorialId: string): Promise<Tutorial | null> {
    try {
      state.value.isLoading = true
      state.value.error = null
      
      const cacheKey = generateCacheKey('tutorial', tutorialId)
      return await cacheManager.getCachedContent<Tutorial>(cacheKey)
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Failed to get cached tutorial'
      console.error('Failed to get cached tutorial:', error)
      return null
    } finally {
      state.value.isLoading = false
    }
  }

  /**
   * Cache and retrieve sample data
   */
  async function cacheSample(sample: SampleData): Promise<void> {
    try {
      state.value.isLoading = true
      state.value.error = null
      
      await cacheManager.cacheContent(
        generateCacheKey('sample', sample.id),
        sample,
        'samples'
      )
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Failed to cache sample'
      console.error('Failed to cache sample:', error)
    } finally {
      state.value.isLoading = false
    }
  }

  async function getSample(sampleId: string): Promise<SampleData | null> {
    try {
      state.value.isLoading = true
      state.value.error = null
      
      const cacheKey = generateCacheKey('sample', sampleId)
      return await cacheManager.getCachedContent<SampleData>(cacheKey)
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Failed to get cached sample'
      console.error('Failed to get cached sample:', error)
      return null
    } finally {
      state.value.isLoading = false
    }
  }

  /**
   * Optimize and cache images
   */
  async function cacheOptimizedImage(
    imageUrl: string,
    options?: {
      maxWidth?: number
      maxHeight?: number
      quality?: number
      generateResponsive?: boolean
    }
  ): Promise<string> {
    try {
      state.value.isLoading = true
      state.value.error = null
      
      return await cacheManager.cacheOptimizedImage(imageUrl, options)
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Failed to cache optimized image'
      console.error('Failed to cache optimized image:', error)
      return imageUrl // Return original URL as fallback
    } finally {
      state.value.isLoading = false
    }
  }

  /**
   * Preload critical content
   */
  async function preloadCriticalContent(resources: {
    guides?: string[]
    tutorials?: string[]
    samples?: string[]
    images?: string[]
  }): Promise<void> {
    try {
      state.value.isLoading = true
      state.value.error = null
      
      await cacheManager.preloadCriticalResources(resources)
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Failed to preload content'
      console.error('Failed to preload content:', error)
    } finally {
      state.value.isLoading = false
    }
  }

  /**
   * Invalidate cache by pattern
   */
  function invalidateCache(pattern: string | RegExp): number {
    try {
      return cacheManager.invalidateCache(pattern)
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Failed to invalidate cache'
      console.error('Failed to invalidate cache:', error)
      return 0
    }
  }

  /**
   * Clear all caches
   */
  function clearAllCaches(): void {
    try {
      cacheManager.clearAllCaches()
      updateStats()
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Failed to clear caches'
      console.error('Failed to clear caches:', error)
    }
  }

  /**
   * Update cache statistics
   */
  function updateStats(): void {
    try {
      const stats = cacheManager.getCacheStatistics()
      state.value.stats = {
        hitRate: stats.content.hitRate,
        memoryUsage: stats.content.memoryUsage,
        entryCount: stats.content.entryCount
      }
    } catch (error) {
      console.error('Failed to update cache stats:', error)
    }
  }

  /**
   * Computed properties
   */
  const isLoading = computed(() => state.value.isLoading)
  const error = computed(() => state.value.error)
  const stats = computed(() => state.value.stats)
  const hitRate = computed(() => state.value.stats.hitRate)
  const memoryUsage = computed(() => state.value.stats.memoryUsage)
  const entryCount = computed(() => state.value.stats.entryCount)

  /**
   * Format memory usage for display
   */
  const formattedMemoryUsage = computed(() => {
    const bytes = state.value.stats.memoryUsage
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  })

  /**
   * Get cache health status
   */
  const cacheHealth = computed(() => {
    const hitRate = state.value.stats.hitRate
    if (hitRate >= 0.8) return 'excellent'
    if (hitRate >= 0.6) return 'good'
    if (hitRate >= 0.4) return 'fair'
    return 'poor'
  })

  // Initialize stats
  updateStats()

  return {
    // State
    isLoading,
    error,
    stats,
    hitRate,
    memoryUsage,
    entryCount,
    formattedMemoryUsage,
    cacheHealth,

    // Guide methods
    cacheGuide,
    getGuide,

    // Tutorial methods
    cacheTutorial,
    getTutorial,

    // Sample methods
    cacheSample,
    getSample,

    // Image methods
    cacheOptimizedImage,

    // Utility methods
    preloadCriticalContent,
    invalidateCache,
    clearAllCaches,
    updateStats
  }
}

/**
 * Composable for image optimization
 */
export function useImageOptimization() {
  const { cacheOptimizedImage } = useContentCache()

  /**
   * Create optimized image with lazy loading
   */
  async function createOptimizedImage(
    src: string,
    options?: {
      maxWidth?: number
      maxHeight?: number
      quality?: number
      lazy?: boolean
    }
  ): Promise<{
    src: string
    loading: 'lazy' | 'eager'
    decoding: 'async' | 'sync'
  }> {
    const optimizedSrc = await cacheOptimizedImage(src, options)
    
    return {
      src: optimizedSrc,
      loading: options?.lazy !== false ? 'lazy' : 'eager',
      decoding: 'async'
    }
  }

  /**
   * Create responsive image srcSet
   */
  async function createResponsiveImage(
    src: string,
    breakpoints: number[] = [320, 640, 768, 1024, 1280]
  ): Promise<{
    src: string
    srcSet: string
    sizes: string
  }> {
    const optimizedSrc = await cacheOptimizedImage(src, {
      generateResponsive: true
    })

    // Generate srcSet for different breakpoints
    const srcSetPromises = breakpoints.map(async (width) => {
      const optimized = await cacheOptimizedImage(src, { maxWidth: width })
      return `${optimized} ${width}w`
    })

    const srcSetEntries = await Promise.all(srcSetPromises)
    const sizes = [
      '(max-width: 320px) 320px',
      '(max-width: 640px) 640px',
      '(max-width: 768px) 768px',
      '(max-width: 1024px) 1024px',
      '1280px'
    ]

    return {
      src: optimizedSrc,
      srcSet: srcSetEntries.join(', '),
      sizes: sizes.join(', ')
    }
  }

  return {
    createOptimizedImage,
    createResponsiveImage
  }
}