<template>
  <Transition name="loading-fade">
    <div 
      v-if="isLoading" 
      class="chunk-loading-indicator"
      role="progressbar"
      :aria-valuenow="loadingProgress"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label="Loading content"
    >
      <div class="loading-bar">
        <div 
          class="loading-progress" 
          :style="{ width: `${loadingProgress}%` }"
        />
      </div>
      <div class="loading-text">
        Loading... {{ Math.round(loadingProgress) }}%
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useChunkLoading } from '../../composables/useChunkLoading'

const { isLoading, loadingProgress } = useChunkLoading()
</script>

<style scoped>
.chunk-loading-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-bar {
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.loading-progress {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  border-radius: 2px;
  transition: width 0.3s ease;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.loading-text {
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.3s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .chunk-loading-indicator {
    background: rgba(17, 24, 39, 0.95);
  }
  
  .loading-bar {
    background: #374151;
  }
  
  .loading-text {
    color: #9ca3af;
  }
}
</style>