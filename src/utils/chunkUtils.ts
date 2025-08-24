import { useChunkLoading } from '../composables/useChunkLoading'

interface ChunkImportOptions {
  chunkName: string
  retryAttempts?: number
  retryDelay?: number
  timeout?: number
}

/**
 * Enhanced dynamic import with chunk loading tracking and error handling
 */
export async function importChunk<T = any>(
  importFn: () => Promise<T>,
  options: ChunkImportOptions
): Promise<T> {
  const { chunkName, retryAttempts = 3, retryDelay = 1000, timeout = 10000 } = options
  const { startChunkLoading, finishChunkLoading } = useChunkLoading()

  startChunkLoading(chunkName)

  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= retryAttempts; attempt++) {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Chunk loading timeout: ${chunkName}`)), timeout)
      })

      // Race between import and timeout
      const result = await Promise.race([importFn(), timeoutPromise])
      
      finishChunkLoading(chunkName, true)
      return result
    } catch (error) {
      lastError = error as Error
      
      if (attempt < retryAttempts) {
        console.warn(`Chunk loading failed (attempt ${attempt + 1}/${retryAttempts + 1}): ${chunkName}`, error)
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)))
      }
    }
  }

  finishChunkLoading(chunkName, false)
  throw new Error(`Failed to load chunk "${chunkName}" after ${retryAttempts + 1} attempts: ${lastError?.message}`)
}

/**
 * Preload a chunk without importing it
 */
export function preloadChunk(importFn: () => Promise<any>, chunkName: string): Promise<void> {
  return importFn()
    .then(() => {
      console.debug(`Preloaded chunk: ${chunkName}`)
    })
    .catch((error) => {
      console.warn(`Failed to preload chunk: ${chunkName}`, error)
    })
}

/**
 * Get estimated chunk size from network timing
 */
export function getChunkSize(chunkName: string): number {
  if ('performance' in window) {
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    const chunkEntry = entries.find(entry => entry.name.includes(chunkName))
    
    if (chunkEntry && 'transferSize' in chunkEntry) {
      return chunkEntry.transferSize || 0
    }
  }
  return 0
}

/**
 * Analyze chunk loading performance
 */
export function analyzeChunkPerformance(): {
  totalChunks: number
  averageLoadTime: number
  slowChunks: Array<{ name: string; loadTime: number }>
  recommendations: string[]
} {
  if (!('performance' in window)) {
    return {
      totalChunks: 0,
      averageLoadTime: 0,
      slowChunks: [],
      recommendations: ['Performance API not available']
    }
  }

  const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  const chunkEntries = entries.filter(entry => 
    entry.name.includes('chunk') || 
    entry.name.includes('.js') && !entry.name.includes('node_modules')
  )

  const totalChunks = chunkEntries.length
  const averageLoadTime = totalChunks > 0 
    ? chunkEntries.reduce((sum, entry) => sum + entry.duration, 0) / totalChunks 
    : 0

  const slowChunks = chunkEntries
    .filter(entry => entry.duration > 1000)
    .map(entry => ({
      name: entry.name.split('/').pop() || entry.name,
      loadTime: entry.duration
    }))
    .sort((a, b) => b.loadTime - a.loadTime)

  const recommendations: string[] = []
  
  if (averageLoadTime > 500) {
    recommendations.push('Consider further code splitting for better performance')
  }
  
  if (slowChunks.length > 0) {
    recommendations.push(`${slowChunks.length} chunks are loading slowly (>1s)`)
  }
  
  if (totalChunks < 3) {
    recommendations.push('Consider splitting more features into separate chunks')
  }
  
  if (totalChunks > 15) {
    recommendations.push('Consider consolidating some smaller chunks')
  }

  return {
    totalChunks,
    averageLoadTime,
    slowChunks,
    recommendations
  }
}

/**
 * Create a chunk-aware component loader
 */
export function createChunkLoader(chunkGroup: string) {
  return function loadComponent(componentName: string, importFn: () => Promise<any>) {
    return importChunk(importFn, {
      chunkName: `${chunkGroup}-${componentName}`,
      retryAttempts: 2,
      timeout: 8000
    })
  }
}