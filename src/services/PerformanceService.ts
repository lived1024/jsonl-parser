interface PerformanceMetrics {
  initialLoadTime: number
  chunkLoadTimes: Map<string, number>
  routeTransitionTimes: Map<string, number>
  bundleSize: number
  memoryUsage: number
}

interface ChunkPerformanceData {
  name: string
  loadTime: number
  size?: number
  cached: boolean
}

export class PerformanceService {
  private static instance: PerformanceService
  private metrics: PerformanceMetrics
  private observers: PerformanceObserver[] = []

  private constructor() {
    this.metrics = {
      initialLoadTime: 0,
      chunkLoadTimes: new Map(),
      routeTransitionTimes: new Map(),
      bundleSize: 0,
      memoryUsage: 0
    }
    
    this.initializePerformanceObservers()
  }

  static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService()
    }
    return PerformanceService.instance
  }

  private initializePerformanceObservers() {
    // Observe resource loading (chunks, scripts, etc.)
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes('chunk') || entry.name.includes('.js')) {
            this.trackChunkLoad(entry.name, entry.duration)
          }
        }
      })
      
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.push(resourceObserver)

      // Observe navigation timing
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            this.metrics.initialLoadTime = navEntry.loadEventEnd - navEntry.navigationStart
          }
        }
      })
      
      navigationObserver.observe({ entryTypes: ['navigation'] })
      this.observers.push(navigationObserver)
    }
  }

  trackChunkLoad(chunkName: string, loadTime: number) {
    this.metrics.chunkLoadTimes.set(chunkName, loadTime)
    
    // Log performance warnings for slow chunks
    if (loadTime > 1000) {
      console.warn(`Slow chunk detected: ${chunkName} took ${loadTime.toFixed(2)}ms to load`)
    }
  }

  trackRouteTransition(routeName: string, transitionTime: number) {
    this.metrics.routeTransitionTimes.set(routeName, transitionTime)
  }

  getPerformanceReport(): {
    summary: {
      averageChunkLoadTime: number
      slowestChunk: { name: string; time: number } | null
      totalChunksLoaded: number
      averageRouteTransition: number
    }
    details: {
      chunkLoadTimes: Array<{ name: string; time: number }>
      routeTransitionTimes: Array<{ name: string; time: number }>
      memoryUsage: number
    }
  } {
    const chunkTimes = Array.from(this.metrics.chunkLoadTimes.entries())
    const routeTimes = Array.from(this.metrics.routeTransitionTimes.entries())
    
    const averageChunkLoadTime = chunkTimes.length > 0 
      ? chunkTimes.reduce((sum, [, time]) => sum + time, 0) / chunkTimes.length 
      : 0

    const slowestChunk = chunkTimes.length > 0
      ? chunkTimes.reduce((slowest, [name, time]) => 
          time > slowest.time ? { name, time } : slowest, 
          { name: '', time: 0 }
        )
      : null

    const averageRouteTransition = routeTimes.length > 0
      ? routeTimes.reduce((sum, [, time]) => sum + time, 0) / routeTimes.length
      : 0

    return {
      summary: {
        averageChunkLoadTime,
        slowestChunk,
        totalChunksLoaded: chunkTimes.length,
        averageRouteTransition
      },
      details: {
        chunkLoadTimes: chunkTimes.map(([name, time]) => ({ name, time })),
        routeTransitionTimes: routeTimes.map(([name, time]) => ({ name, time })),
        memoryUsage: this.getMemoryUsage()
      }
    }
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024 // MB
    }
    return 0
  }

  // Method to get bundle analysis data
  getBundleAnalysis(): {
    estimatedBundleSize: number
    chunkCount: number
    recommendations: string[]
  } {
    const chunkCount = this.metrics.chunkLoadTimes.size
    const recommendations: string[] = []

    // Analyze performance and provide recommendations
    const avgLoadTime = Array.from(this.metrics.chunkLoadTimes.values())
      .reduce((sum, time) => sum + time, 0) / chunkCount

    if (avgLoadTime > 500) {
      recommendations.push('Consider further code splitting for large chunks')
    }

    if (chunkCount < 3) {
      recommendations.push('Consider splitting more features into separate chunks')
    }

    if (chunkCount > 20) {
      recommendations.push('Consider consolidating some smaller chunks')
    }

    return {
      estimatedBundleSize: this.metrics.bundleSize,
      chunkCount,
      recommendations
    }
  }

  // Clean up observers
  destroy() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}