import { ContentCacheService } from '../services/ContentCacheService'
import { MediaOptimizationService } from '../services/MediaOptimizationService'

interface CacheStrategy {
  ttl?: number
  compress?: boolean
  persist?: boolean
  preload?: boolean
}

interface ResourceCacheConfig {
  guides: CacheStrategy
  tutorials: CacheStrategy
  samples: CacheStrategy
  images: CacheStrategy
  assets: CacheStrategy
}

/**
 * Default caching strategies for different content types
 */
export const DEFAULT_CACHE_STRATEGIES: ResourceCacheConfig = {
  guides: {
    ttl: 60 * 60 * 1000, // 1 hour
    compress: true,
    persist: true,
    preload: false
  },
  tutorials: {
    ttl: 30 * 60 * 1000, // 30 minutes
    compress: true,
    persist: true,
    preload: true
  },
  samples: {
    ttl: 2 * 60 * 60 * 1000, // 2 hours
    compress: false, // Sample data is usually small
    persist: true,
    preload: false
  },
  images: {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    compress: false, // Images are already compressed
    persist: true,
    preload: false
  },
  assets: {
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
    compress: false,
    persist: true,
    preload: false
  }
}

/**
 * Cache manager that coordinates different caching services
 */
export class CacheManager {
  private static instance: CacheManager
  private contentCache: ContentCacheService
  private mediaOptimizer: MediaOptimizationService
  private config: ResourceCacheConfig

  private constructor() {
    this.contentCache = ContentCacheService.getInstance()
    this.mediaOptimizer = MediaOptimizationService.getInstance()
    this.config = DEFAULT_CACHE_STRATEGIES
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  /**
   * Cache content with appropriate strategy
   */
  async cacheContent<T>(
    key: string,
    data: T,
    type: keyof ResourceCacheConfig
  ): Promise<void> {
    const strategy = this.config[type]
    await this.contentCache.set(key, data, strategy.ttl)
  }

  /**
   * Get cached content
   */
  async getCachedContent<T>(key: string): Promise<T | null> {
    return await this.contentCache.get<T>(key)
  }

  /**
   * Cache and optimize image
   */
  async cacheOptimizedImage(
    imageUrl: string,
    options?: {
      maxWidth?: number
      maxHeight?: number
      quality?: number
      generateResponsive?: boolean
    }
  ): Promise<string> {
    const cacheKey = `optimized-image:${imageUrl}:${JSON.stringify(options)}`
    
    // Check if already cached
    const cached = await this.contentCache.get<string>(cacheKey)
    if (cached) {
      return cached
    }

    // Optimize and cache
    const optimized = options?.generateResponsive
      ? await this.mediaOptimizer.generateResponsiveImages(imageUrl)
      : await this.mediaOptimizer.optimizeImage(imageUrl, options)

    await this.contentCache.set(cacheKey, optimized.src, this.config.images.ttl)
    return optimized.src
  }

  /**
   * Preload critical resources
   */
  async preloadCriticalResources(resources: {
    guides?: string[]
    tutorials?: string[]
    samples?: string[]
    images?: string[]
  }): Promise<void> {
    const promises: Promise<void>[] = []

    // Preload guides
    if (resources.guides?.length) {
      promises.push(this.contentCache.preloadContent(resources.guides, 'guide'))
    }

    // Preload tutorials
    if (resources.tutorials?.length) {
      promises.push(this.contentCache.preloadContent(resources.tutorials, 'tutorial'))
    }

    // Preload samples
    if (resources.samples?.length) {
      promises.push(this.contentCache.preloadContent(resources.samples, 'sample'))
    }

    // Preload images
    if (resources.images?.length) {
      promises.push(this.mediaOptimizer.preloadImages(resources.images))
    }

    await Promise.all(promises)
  }

  /**
   * Warm up cache with frequently accessed content
   */
  async warmUpCache(): Promise<void> {
    // This would typically be called on app initialization
    const criticalResources = {
      guides: ['json-basics', 'jsonl-introduction', 'parser-overview'],
      tutorials: ['beginner-tutorial-1', 'beginner-tutorial-2'],
      samples: ['api-response-sample', 'config-sample'],
      images: ['/images/hero-bg.jpg', '/images/feature-icons.svg']
    }

    await this.preloadCriticalResources(criticalResources)
  }

  /**
   * Invalidate cache by pattern or type
   */
  invalidateCache(pattern: string | RegExp | keyof ResourceCacheConfig): number {
    if (typeof pattern === 'string' && pattern in this.config) {
      // Invalidate by content type
      const typePattern = new RegExp(`^${pattern}:`)
      return this.contentCache.invalidate(typePattern)
    }
    
    return this.contentCache.invalidate(pattern as string | RegExp)
  }

  /**
   * Get comprehensive cache statistics
   */
  getCacheStatistics(): {
    content: ReturnType<ContentCacheService['getStats']>
    media: ReturnType<MediaOptimizationService['getCacheStats']>
    recommendations: string[]
  } {
    const contentStats = this.contentCache.getStats()
    const mediaStats = this.mediaOptimizer.getCacheStats()
    const recommendations: string[] = []

    // Generate recommendations based on statistics
    if (contentStats.hitRate < 0.7) {
      recommendations.push('Consider increasing cache TTL or preloading more content')
    }

    if (contentStats.memoryUsage > 40 * 1024 * 1024) { // 40MB
      recommendations.push('Memory usage is high, consider reducing cache size or enabling compression')
    }

    if (mediaStats.totalSize > 20 * 1024 * 1024) { // 20MB
      recommendations.push('Image cache is large, consider more aggressive optimization')
    }

    return {
      content: contentStats,
      media: mediaStats,
      recommendations
    }
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.contentCache.clear()
    this.mediaOptimizer.clearCache()
  }

  /**
   * Update cache configuration
   */
  updateConfig(newConfig: Partial<ResourceCacheConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

/**
 * Utility functions for cache management
 */

/**
 * Generate cache key with version support
 */
export function generateCacheKey(
  type: string,
  id: string,
  version?: string,
  params?: Record<string, any>
): string {
  const parts = [type, id]
  
  if (version) {
    parts.push(`v${version}`)
  }
  
  if (params) {
    const paramString = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
    parts.push(btoa(paramString))
  }
  
  return parts.join(':')
}

/**
 * Cache decorator for methods
 */
export function cached(
  keyGenerator: (...args: any[]) => string,
  ttl?: number
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    const cache = new Map<string, { data: any; timestamp: number }>()
    
    descriptor.value = async function (...args: any[]) {
      const key = keyGenerator(...args)
      const cached = cache.get(key)
      const now = Date.now()
      
      if (cached && (!ttl || now - cached.timestamp < ttl)) {
        return cached.data
      }
      
      const result = await method.apply(this, args)
      cache.set(key, { data: result, timestamp: now })
      
      return result
    }
  }
}

/**
 * Memoization utility for expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }
    
    const result = fn(...args)
    cache.set(key, result)
    
    return result
  }) as T
}

/**
 * Debounced cache invalidation
 */
export function createDebouncedInvalidator(
  invalidateFn: (pattern: string) => void,
  delay: number = 1000
) {
  let timeoutId: number | null = null
  const pendingInvalidations = new Set<string>()
  
  return function invalidate(pattern: string) {
    pendingInvalidations.add(pattern)
    
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = window.setTimeout(() => {
      for (const p of pendingInvalidations) {
        invalidateFn(p)
      }
      pendingInvalidations.clear()
      timeoutId = null
    }, delay)
  }
}

/**
 * Cache warming scheduler
 */
export class CacheWarmingScheduler {
  private intervals = new Map<string, number>()
  
  schedule(
    name: string,
    warmupFn: () => Promise<void>,
    intervalMs: number
  ): void {
    // Clear existing interval if any
    this.unschedule(name)
    
    // Run immediately
    warmupFn().catch(console.error)
    
    // Schedule recurring warmup
    const intervalId = window.setInterval(() => {
      warmupFn().catch(console.error)
    }, intervalMs)
    
    this.intervals.set(name, intervalId)
  }
  
  unschedule(name: string): void {
    const intervalId = this.intervals.get(name)
    if (intervalId) {
      clearInterval(intervalId)
      this.intervals.delete(name)
    }
  }
  
  unscheduleAll(): void {
    for (const [name] of this.intervals) {
      this.unschedule(name)
    }
  }
}

// Export singleton instances
export const cacheManager = CacheManager.getInstance()
export const cacheWarmingScheduler = new CacheWarmingScheduler()