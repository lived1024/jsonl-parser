interface ImageOptimizationOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
  enableLazyLoading?: boolean
}

interface OptimizedImage {
  src: string
  srcSet?: string
  sizes?: string
  width: number
  height: number
  format: string
  size: number
}

interface MediaCacheEntry {
  originalUrl: string
  optimizedUrl: string
  format: string
  size: number
  timestamp: number
  dimensions: { width: number; height: number }
}

export class MediaOptimizationService {
  private static instance: MediaOptimizationService
  private cache = new Map<string, MediaCacheEntry>()
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  private constructor() {
    try {
      this.canvas = document.createElement('canvas')
      const ctx = this.canvas.getContext('2d')
      if (!ctx) {
        // In test environment, create a mock context
        this.ctx = {
          drawImage: () => {},
          getImageData: () => ({ data: new Uint8ClampedArray(4) }),
          putImageData: () => {}
        } as any
      } else {
        this.ctx = ctx
      }
      this.loadCacheFromStorage()
    } catch (error) {
      // Fallback for test environments
      this.canvas = {
        width: 0,
        height: 0,
        getContext: () => null,
        toDataURL: () => 'data:image/png;base64,mock'
      } as any
      this.ctx = {
        drawImage: () => {},
        getImageData: () => ({ data: new Uint8ClampedArray(4) }),
        putImageData: () => {}
      } as any
      console.warn('Canvas not available, using mock implementation')
    }
  }

  static getInstance(): MediaOptimizationService {
    if (!MediaOptimizationService.instance) {
      MediaOptimizationService.instance = new MediaOptimizationService()
    }
    return MediaOptimizationService.instance
  }

  /**
   * Optimize image with various options
   */
  async optimizeImage(
    imageUrl: string, 
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImage> {
    const cacheKey = this.generateCacheKey(imageUrl, options)
    const cached = this.cache.get(cacheKey)

    if (cached) {
      return {
        src: cached.optimizedUrl,
        width: cached.dimensions.width,
        height: cached.dimensions.height,
        format: cached.format,
        size: cached.size
      }
    }

    try {
      const optimized = await this.processImage(imageUrl, options)
      
      // Cache the result
      this.cache.set(cacheKey, {
        originalUrl: imageUrl,
        optimizedUrl: optimized.src,
        format: optimized.format,
        size: optimized.size,
        timestamp: Date.now(),
        dimensions: { width: optimized.width, height: optimized.height }
      })

      this.saveCacheToStorage()
      return optimized
    } catch (error) {
      console.error('Image optimization failed:', error)
      // Return original image as fallback
      return {
        src: imageUrl,
        width: 0,
        height: 0,
        format: 'unknown',
        size: 0
      }
    }
  }

  /**
   * Generate responsive image srcSet
   */
  async generateResponsiveImages(
    imageUrl: string,
    breakpoints: number[] = [320, 640, 768, 1024, 1280]
  ): Promise<OptimizedImage> {
    const srcSetEntries: string[] = []
    const sizes = [
      '(max-width: 320px) 320px',
      '(max-width: 640px) 640px',
      '(max-width: 768px) 768px',
      '(max-width: 1024px) 1024px',
      '1280px'
    ]

    let mainImage: OptimizedImage | null = null

    for (const width of breakpoints) {
      const optimized = await this.optimizeImage(imageUrl, {
        maxWidth: width,
        quality: 0.8,
        format: 'webp'
      })

      srcSetEntries.push(`${optimized.src} ${width}w`)
      
      if (!mainImage || width === 1024) {
        mainImage = optimized
      }
    }

    return {
      ...mainImage!,
      srcSet: srcSetEntries.join(', '),
      sizes: sizes.join(', ')
    }
  }

  /**
   * Preload critical images
   */
  async preloadImages(imageUrls: string[]): Promise<void> {
    const preloadPromises = imageUrls.map(async (url) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = () => reject(new Error(`Failed to preload image: ${url}`))
        img.src = url
      })
    })

    try {
      await Promise.all(preloadPromises)
      console.log(`Preloaded ${imageUrls.length} images`)
    } catch (error) {
      console.warn('Some images failed to preload:', error)
    }
  }

  /**
   * Lazy load images with intersection observer
   */
  setupLazyLoading(selector: string = 'img[data-src]'): void {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      this.loadAllImages(selector)
      return
    }

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          const src = img.dataset.src

          if (src) {
            img.src = src
            img.classList.remove('lazy')
            img.classList.add('loaded')
            observer.unobserve(img)
          }
        }
      })
    }, {
      rootMargin: '50px 0px', // Start loading 50px before the image enters viewport
      threshold: 0.01
    })

    document.querySelectorAll(selector).forEach(img => {
      imageObserver.observe(img)
    })
  }

  /**
   * Convert image to WebP format if supported
   */
  async convertToWebP(imageUrl: string, quality: number = 0.8): Promise<string> {
    if (!this.isWebPSupported()) {
      return imageUrl
    }

    try {
      const img = await this.loadImage(imageUrl)
      this.canvas.width = img.width
      this.canvas.height = img.height
      
      this.ctx.drawImage(img, 0, 0)
      
      return this.canvas.toDataURL('image/webp', quality)
    } catch (error) {
      console.error('WebP conversion failed:', error)
      return imageUrl
    }
  }

  /**
   * Compress image while maintaining aspect ratio
   */
  async compressImage(
    imageUrl: string,
    maxWidth: number = 1920,
    maxHeight: number = 1080,
    quality: number = 0.8
  ): Promise<string> {
    try {
      const img = await this.loadImage(imageUrl)
      const { width, height } = this.calculateDimensions(img.width, img.height, maxWidth, maxHeight)
      
      this.canvas.width = width
      this.canvas.height = height
      
      this.ctx.drawImage(img, 0, 0, width, height)
      
      // Try WebP first, fallback to JPEG
      const format = this.isWebPSupported() ? 'image/webp' : 'image/jpeg'
      return this.canvas.toDataURL(format, quality)
    } catch (error) {
      console.error('Image compression failed:', error)
      return imageUrl
    }
  }

  /**
   * Generate image placeholder (blur/low quality)
   */
  async generatePlaceholder(imageUrl: string, size: number = 20): Promise<string> {
    try {
      const img = await this.loadImage(imageUrl)
      const { width, height } = this.calculateDimensions(img.width, img.height, size, size)
      
      this.canvas.width = width
      this.canvas.height = height
      
      this.ctx.drawImage(img, 0, 0, width, height)
      
      return this.canvas.toDataURL('image/jpeg', 0.1)
    } catch (error) {
      console.error('Placeholder generation failed:', error)
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZjNmNGY2Ii8+Cjwvc3ZnPgo='
    }
  }

  /**
   * Optimize SVG content
   */
  optimizeSVG(svgContent: string): string {
    // Basic SVG optimization
    return svgContent
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
      .replace(/\s*([<>])\s*/g, '$1') // Remove spaces around tags
      .replace(/\s+([=])\s+/g, '$1') // Remove spaces around equals
      .replace(/\s+(\/?>)/g, '$1') // Remove spaces before closing tags
      .trim()
  }

  /**
   * Process image with given options
   */
  private async processImage(
    imageUrl: string,
    options: ImageOptimizationOptions
  ): Promise<OptimizedImage> {
    const img = await this.loadImage(imageUrl)
    const maxWidth = options.maxWidth || img.width
    const maxHeight = options.maxHeight || img.height
    const quality = options.quality || 0.8
    const format = options.format || (this.isWebPSupported() ? 'webp' : 'jpeg')

    const { width, height } = this.calculateDimensions(img.width, img.height, maxWidth, maxHeight)
    
    this.canvas.width = width
    this.canvas.height = height
    
    this.ctx.drawImage(img, 0, 0, width, height)
    
    const mimeType = `image/${format}`
    const dataUrl = this.canvas.toDataURL(mimeType, quality)
    
    return {
      src: dataUrl,
      width,
      height,
      format,
      size: this.estimateDataUrlSize(dataUrl)
    }
  }

  /**
   * Load image from URL
   */
  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
      img.src = url
    })
  }

  /**
   * Calculate optimal dimensions maintaining aspect ratio
   */
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight
    
    let width = Math.min(originalWidth, maxWidth)
    let height = width / aspectRatio
    
    if (height > maxHeight) {
      height = maxHeight
      width = height * aspectRatio
    }
    
    return {
      width: Math.round(width),
      height: Math.round(height)
    }
  }

  /**
   * Check WebP support
   */
  private isWebPSupported(): boolean {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  }

  /**
   * Estimate data URL size in bytes
   */
  private estimateDataUrlSize(dataUrl: string): number {
    // Remove data URL prefix and calculate base64 size
    const base64 = dataUrl.split(',')[1]
    return Math.round((base64.length * 3) / 4)
  }

  /**
   * Generate cache key for image optimization
   */
  private generateCacheKey(url: string, options: ImageOptimizationOptions): string {
    const optionsStr = JSON.stringify(options)
    return `${url}:${btoa(optionsStr)}`
  }

  /**
   * Fallback for browsers without IntersectionObserver
   */
  private loadAllImages(selector: string): void {
    document.querySelectorAll(selector).forEach(img => {
      const element = img as HTMLImageElement
      const src = element.dataset.src
      if (src) {
        element.src = src
        element.classList.remove('lazy')
        element.classList.add('loaded')
      }
    })
  }

  /**
   * Save cache to localStorage
   */
  private saveCacheToStorage(): void {
    try {
      const cacheData = Array.from(this.cache.entries())
      localStorage.setItem('media-optimization-cache', JSON.stringify(cacheData))
    } catch (error) {
      console.warn('Failed to save media cache to storage:', error)
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadCacheFromStorage(): void {
    try {
      const cacheData = localStorage.getItem('media-optimization-cache')
      if (cacheData) {
        const entries = JSON.parse(cacheData)
        this.cache = new Map(entries)
        
        // Clean up expired entries (older than 24 hours)
        const now = Date.now()
        const maxAge = 24 * 60 * 60 * 1000
        
        for (const [key, entry] of this.cache.entries()) {
          if (now - entry.timestamp > maxAge) {
            this.cache.delete(key)
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load media cache from storage:', error)
    }
  }

  /**
   * Clear media cache
   */
  clearCache(): void {
    this.cache.clear()
    localStorage.removeItem('media-optimization-cache')
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    entryCount: number
    totalSize: number
    oldestEntry: Date | null
    newestEntry: Date | null
  } {
    const entries = Array.from(this.cache.values())
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0)
    
    const timestamps = entries.map(entry => entry.timestamp)
    const oldestEntry = timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null
    const newestEntry = timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null
    
    return {
      entryCount: entries.length,
      totalSize,
      oldestEntry,
      newestEntry
    }
  }
}