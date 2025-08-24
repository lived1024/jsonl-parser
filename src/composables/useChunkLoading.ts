import { ref, computed } from 'vue'

interface ChunkLoadingState {
  loadingChunks: Set<string>
  loadedChunks: Set<string>
  failedChunks: Set<string>
  loadingTimes: Map<string, number>
}

const state = ref<ChunkLoadingState>({
  loadingChunks: new Set(),
  loadedChunks: new Set(),
  failedChunks: new Set(),
  loadingTimes: new Map()
})

export function useChunkLoading() {
  const isLoading = computed(() => state.value.loadingChunks.size > 0)
  const loadingProgress = computed(() => {
    const total = state.value.loadingChunks.size + state.value.loadedChunks.size
    return total > 0 ? (state.value.loadedChunks.size / total) * 100 : 100
  })

  function startChunkLoading(chunkName: string) {
    state.value.loadingChunks.add(chunkName)
    state.value.loadingTimes.set(chunkName, performance.now())
  }

  function finishChunkLoading(chunkName: string, success: boolean = true) {
    state.value.loadingChunks.delete(chunkName)
    
    if (success) {
      state.value.loadedChunks.add(chunkName)
      
      // Calculate and log loading time
      const startTime = state.value.loadingTimes.get(chunkName)
      if (startTime) {
        const loadTime = performance.now() - startTime
        console.debug(`Chunk "${chunkName}" loaded in ${loadTime.toFixed(2)}ms`)
        
        // Track performance metrics
        if (loadTime > 1000) {
          console.warn(`Slow chunk loading detected: "${chunkName}" took ${loadTime.toFixed(2)}ms`)
        }
      }
    } else {
      state.value.failedChunks.add(chunkName)
      console.error(`Failed to load chunk: "${chunkName}"`)
    }
    
    state.value.loadingTimes.delete(chunkName)
  }

  function getChunkStats() {
    return {
      loading: state.value.loadingChunks.size,
      loaded: state.value.loadedChunks.size,
      failed: state.value.failedChunks.size,
      totalRequested: state.value.loadedChunks.size + state.value.failedChunks.size
    }
  }

  function resetStats() {
    state.value.loadedChunks.clear()
    state.value.failedChunks.clear()
    state.value.loadingTimes.clear()
  }

  return {
    isLoading,
    loadingProgress,
    startChunkLoading,
    finishChunkLoading,
    getChunkStats,
    resetStats
  }
}