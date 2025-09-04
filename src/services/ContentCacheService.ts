import type { GuideContent, Tutorial, SampleData } from '../types'

interface CacheEntry<T> {
  data: T
  timestamp: number
  etag?: string
  size: number
  accessCount: number
  lastAccessed: number
}

interface CacheConfig {
  maxMemorySize: number // bytes
  maxEntries: number
  defaultTTL: number // milliseconds
  compressionEnabled: boolean
  persistToStorage: boolean
}

interface CacheStats {
  hitRate: number
  missRate: number
  totalRequests: number
  memoryUsage: number
  entryCount: number
  evictionCount: number
}

export class ContentCacheService {
  private static instance: ContentCacheService
  private cache = new Map<string, CacheEntry<any>>()
  private config: CacheConfig
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0
  }

  private constructor() {
    this.config = {
      maxMemorySize: 50 * 1024 * 1024, // 50MB
      maxEntries: 1000,
      defaultTTL: 30 * 60 * 1000, // 30 minutes
      compressionEnabled: true,
      persistToStorage: true
    }

    // Initialize from localStorage if available
    this.loadFromStorage()
    
    // Set up periodic cleanup
    this.setupCleanup()
  }

  static getInstance(): ContentCacheService {
    if (!ContentCacheService.instance) {
      ContentCacheService.instance = new ContentCacheService()
    }
    return ContentCacheService.instance
  }

  /**
   * Get cached content with automatic compression/decompression
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.misses++
      return null
    }

    // Check TTL
    if (Date.now() - entry.timestamp > this.config.defaultTTL) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }

    // Update access statistics
    entry.accessCount++
    entry.lastAccessed = Date.now()
    this.stats.hits++

    // Decompress if needed
    let data = entry.data
    if (this.config.compressionEnabled && this.isCompressed(data)) {
      data = await this.decompress(data)
    }

    return data
  }

  /**
   * Set cached content with automatic compression
   */
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    let processedData = data
    let size = this.estimateSize(data)

    // Compress large content
    if (this.config.compressionEnabled && size > 10 * 1024) { // 10KB threshold
      processedData = await this.compress(data)
      size = this.estimateSize(processedData)
    }

    const entry: CacheEntry<T> = {
      data: processedData,
      timestamp: Date.now(),
      size,
      accessCount: 1,
      lastAccessed: Date.now()
    }

    // Check memory limits and evict if necessary
    await this.ensureCapacity(size)

    this.cache.set(key, entry)

    // Persist to storage if enabled
    if (this.config.persistToStorage) {
      this.persistToStorage(key, entry)
    }
  }

  /**
   * Cache guide content with metadata
   */
  async cacheGuide(guide: GuideContent): Promise<void> {
    const key = `guide:${guide.id}`
    await this.set(key, guide)
    
    // Also cache rendered content separately for faster access
    const renderedKey = `guide:rendered:${guide.id}`
    await this.set(renderedKey, guide.renderedContent)
  }

  /**
   * Get cached guide
   */
  async getGuide(guideId: string): Promise<GuideContent | null> {
    const key = `guide:${guideId}`
    return await this.get<GuideContent>(key)
  }

  /**
   * Cache tutorial data
   */
  async cacheTutorial(tutorial: Tutorial): Promise<void> {
    const key = `tutorial:${tutorial.id}`
    await this.set(key, tutorial)
  }

  /**
   * Get cached tutorial
   */
  async getTutorial(tutorialId: string): Promise<Tutorial | null> {
    const key = `tutorial:${tutorialId}`
    return await this.get<Tutorial>(key)
  }

  /**
   * Cache sample data
   */
  async cacheSample(sample: SampleData): Promise<void> {
    const key = `sample:${sample.id}`
    await this.set(key, sample)
  }

  /**
   * Get cached sample
   */
  async getSample(sampleId: string): Promise<SampleData | null> {
    const key = `sample:${sampleId}`
    return await this.get<SampleData>(key)
  }

  /**
   * Cache static assets (images, etc.)
   */
  async cacheAsset(url: string, data: ArrayBuffer | Blob): Promise<void> {
    const key = `asset:${url}`
    await this.set(key, data)
  }

  /**
   * Get cached asset
   */
  async getAsset(url: string): Promise<ArrayBuffer | Blob | null> {
    const key = `asset:${url}`
    return await this.get<ArrayBuffer | Blob>(key)
  }

  /**
   * Preload content for better performance
   */
  async preloadContent(contentIds: string[], type: 'guide' | 'tutorial' | 'sample'): Promise<void> {
    const promises = contentIds.map(async (id) => {
      const key = `${type}:${id}`
      if (!this.cache.has(key)) {
        // This would typically load from the actual content service
        // For now, we'll just mark it as a preload request
        console.log(`Preloading ${type}: ${id}`)
      }
    })

    await Promise.all(promises)
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidate(pattern: string | RegExp): number {
    let count = 0
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        count++
      }
    }

    return count
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
    this.clearStorage()
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses
    const memoryUsage = Array.from(this.cache.values())
      .reduce((total, entry) => total + entry.size, 0)

    return {
      hitRate: totalRequests > 0 ? this.stats.hits / totalRequests : 0,
      missRate: totalRequests > 0 ? this.stats.misses / totalRequests : 0,
      totalRequests,
      memoryUsage,
      entryCount: this.cache.size,
      evictionCount: this.stats.evictions
    }
  }

  /**
   * Ensure cache doesn't exceed memory limits
   */
  private async ensureCapacity(newEntrySize: number): Promise<void> {
    const currentSize = Array.from(this.cache.values())
      .reduce((total, entry) => total + entry.size, 0)

    if (currentSize + newEntrySize > this.config.maxMemorySize || 
        this.cache.size >= this.config.maxEntries) {
      await this.evictEntries(newEntrySize)
    }
  }

  /**
   * Evict cache entries using LRU strategy
   */
  private async evictEntries(spaceNeeded: number): Promise<void> {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, ...entry }))
      .sort((a, b) => a.lastAccessed - b.lastAccessed) // LRU order

    let freedSpace = 0
    let evicted = 0

    for (const entry of entries) {
      if (freedSpace >= spaceNeeded && evicted >= 10) break // Evict at least 10 entries or enough space

      this.cache.delete(entry.key)
      freedSpace += entry.size
      evicted++
      this.stats.evictions++
    }
  }

  /**
   * Estimate memory size of data
   */
  private estimateSize(data: any): number {
    if (data instanceof ArrayBuffer) {
      return data.byteLength
    }
    if (data instanceof Blob) {
      return data.size
    }
    
    // Rough estimation for objects
    const jsonString = JSON.stringify(data)
    return new Blob([jsonString]).size
  }

  /**
   * Compress data using built-in compression
   */
  private async compress(data: any): Promise<any> {
    if (typeof CompressionStream !== 'undefined') {
      try {
        const jsonString = JSON.stringify(data)
        const stream = new CompressionStream('gzip')
        const writer = stream.writable.getWriter()
        const reader = stream.readable.getReader()

        writer.write(new TextEncoder().encode(jsonString))
        writer.close()

        const chunks: Uint8Array[] = []
        let done = false

        while (!done) {
          const { value, done: readerDone } = await reader.read()
          done = readerDone
          if (value) chunks.push(value)
        }

        const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
        let offset = 0
        for (const chunk of chunks) {
          compressed.set(chunk, offset)
          offset += chunk.length
        }

        return { __compressed: true, data: compressed }
      } catch (error) {
        console.warn('Compression failed, storing uncompressed:', error)
        return data
      }
    }
    
    return data
  }

  /**
   * Decompress data
   */
  private async decompress(compressedData: any): Promise<any> {
    if (!this.isCompressed(compressedData)) {
      return compressedData
    }

    if (typeof DecompressionStream !== 'undefined') {
      try {
        const stream = new DecompressionStream('gzip')
        const writer = stream.writable.getWriter()
        const reader = stream.readable.getReader()

        writer.write(compressedData.data)
        writer.close()

        const chunks: Uint8Array[] = []
        let done = false

        while (!done) {
          const { value, done: readerDone } = await reader.read()
          done = readerDone
          if (value) chunks.push(value)
        }

        const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
        let offset = 0
        for (const chunk of chunks) {
          decompressed.set(chunk, offset)
          offset += chunk.length
        }

        const jsonString = new TextDecoder().decode(decompressed)
        return JSON.parse(jsonString)
      } catch (error) {
        console.error('Decompression failed:', error)
        return null
      }
    }

    return compressedData
  }

  /**
   * Check if data is compressed
   */
  private isCompressed(data: any): boolean {
    return data && typeof data === 'object' && data.__compressed === true
  }

  /**
   * Persist cache entry to localStorage
   */
  private persistToStorage(key: string, entry: CacheEntry<any>): void {
    try {
      const storageKey = `cache:${key}`
      const storageData = {
        data: entry.data,
        timestamp: entry.timestamp,
        size: entry.size
      }
      localStorage.setItem(storageKey, JSON.stringify(storageData))
    } catch (error) {
      console.warn('Failed to persist cache entry to storage:', error)
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    if (!this.config.persistToStorage) return

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('cache:')) {
          const cacheKey = key.substring(6) // Remove 'cache:' prefix
          const data = localStorage.getItem(key)
          
          if (data) {
            const parsed = JSON.parse(data)
            const entry: CacheEntry<any> = {
              data: parsed.data,
              timestamp: parsed.timestamp,
              size: parsed.size,
              accessCount: 0,
              lastAccessed: Date.now()
            }

            // Check if entry is still valid
            if (Date.now() - entry.timestamp < this.config.defaultTTL) {
              this.cache.set(cacheKey, entry)
            } else {
              localStorage.removeItem(key)
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error)
    }
  }

  /**
   * Clear storage cache
   */
  private clearStorage(): void {
    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('cache:')) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.warn('Failed to clear storage cache:', error)
    }
  }

  /**
   * Setup periodic cleanup
   */
  private setupCleanup(): void {
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      const now = Date.now()
      const expiredKeys: string[] = []

      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > this.config.defaultTTL) {
          expiredKeys.push(key)
        }
      }

      expiredKeys.forEach(key => this.cache.delete(key))

      if (expiredKeys.length > 0) {
        console.log(`Cleaned up ${expiredKeys.length} expired cache entries`)
      }
    }, 5 * 60 * 1000) // 5 minutes
  }
}