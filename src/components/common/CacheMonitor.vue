<template>
  <div v-if="showMonitor" class="cache-monitor">
    <div class="cache-monitor-header">
      <h3>Cache Performance Monitor</h3>
      <button @click="toggleExpanded" class="toggle-btn">
        {{ isExpanded ? '−' : '+' }}
      </button>
      <button @click="closeMonitor" class="close-btn">×</button>
    </div>
    
    <div v-if="isExpanded" class="cache-monitor-content">
      <!-- Content Cache Stats -->
      <div class="cache-section">
        <h4>Content Cache</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Hit Rate</span>
            <span class="stat-value" :class="getHitRateClass(contentStats.hitRate)">
              {{ (contentStats.hitRate * 100).toFixed(1) }}%
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Memory Usage</span>
            <span class="stat-value">
              {{ formatBytes(contentStats.memoryUsage) }}
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Entries</span>
            <span class="stat-value">{{ contentStats.entryCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Evictions</span>
            <span class="stat-value">{{ contentStats.evictionCount }}</span>
          </div>
        </div>
      </div>

      <!-- Media Cache Stats -->
      <div class="cache-section">
        <h4>Media Cache</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Images Cached</span>
            <span class="stat-value">{{ mediaStats.entryCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Size</span>
            <span class="stat-value">{{ formatBytes(mediaStats.totalSize) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Oldest Entry</span>
            <span class="stat-value">
              {{ mediaStats.oldestEntry ? formatDate(mediaStats.oldestEntry) : 'N/A' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Recommendations -->
      <div v-if="recommendations.length" class="recommendations-section">
        <h4>Recommendations</h4>
        <ul class="recommendations-list">
          <li v-for="recommendation in recommendations" :key="recommendation">
            {{ recommendation }}
          </li>
        </ul>
      </div>

      <!-- Actions -->
      <div class="actions-section">
        <button @click="clearAllCaches" class="action-btn danger">
          Clear All Caches
        </button>
        <button @click="warmUpCache" class="action-btn primary">
          Warm Up Cache
        </button>
        <button @click="refreshStats" class="action-btn secondary">
          Refresh Stats
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { cacheManager } from '../../utils/cacheUtils'

// Component state
const showMonitor = ref(false)
const isExpanded = ref(false)
const contentStats = ref({
  hitRate: 0,
  missRate: 0,
  totalRequests: 0,
  memoryUsage: 0,
  entryCount: 0,
  evictionCount: 0
})
const mediaStats = ref({
  entryCount: 0,
  totalSize: 0,
  oldestEntry: null as Date | null,
  newestEntry: null as Date | null
})
const recommendations = ref<string[]>([])

let updateInterval: number | null = null

// Show monitor in development or when debug flag is set
onMounted(() => {
  const isDevelopment = import.meta.env.DEV
  const debugCache = localStorage.getItem('debug-cache') === 'true'
  
  if (isDevelopment || debugCache) {
    showMonitor.value = true
    startMonitoring()
  }
})

onUnmounted(() => {
  stopMonitoring()
})

function startMonitoring() {
  refreshStats()
  
  // Update stats every 5 seconds
  updateInterval = window.setInterval(() => {
    refreshStats()
  }, 5000)
}

function stopMonitoring() {
  if (updateInterval) {
    clearInterval(updateInterval)
    updateInterval = null
  }
}

function refreshStats() {
  const stats = cacheManager.getCacheStatistics()
  contentStats.value = stats.content
  mediaStats.value = stats.media
  recommendations.value = stats.recommendations
}

function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}

function closeMonitor() {
  showMonitor.value = false
  stopMonitoring()
}

async function clearAllCaches() {
  if (confirm('Are you sure you want to clear all caches? This may impact performance temporarily.')) {
    cacheManager.clearAllCaches()
    refreshStats()
  }
}

async function warmUpCache() {
  try {
    await cacheManager.warmUpCache()
    refreshStats()
  } catch (error) {
    console.error('Failed to warm up cache:', error)
  }
}

function getHitRateClass(hitRate: number): string {
  if (hitRate >= 0.8) return 'good'
  if (hitRate >= 0.6) return 'ok'
  return 'poor'
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatDate(date: Date): string {
  return date.toLocaleTimeString()
}

// Expose global functions for debugging
if (import.meta.env.DEV) {
  ;(window as any).showCacheMonitor = () => {
    showMonitor.value = true
    startMonitoring()
  }
  ;(window as any).hideCacheMonitor = () => {
    showMonitor.value = false
    stopMonitoring()
  }
}
</script>

<style scoped>
.cache-monitor {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 8px;
  padding: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 11px;
  max-width: 280px;
  z-index: 10001;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.cache-monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.cache-monitor-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.toggle-btn,
.close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
}

.toggle-btn:hover,
.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.cache-section {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.cache-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.cache-section h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #ffd700;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: #ccc;
}

.stat-value {
  font-weight: 600;
}

.stat-value.good {
  color: #4ade80;
}

.stat-value.ok {
  color: #fbbf24;
}

.stat-value.poor {
  color: #f87171;
}

.recommendations-section {
  margin-bottom: 16px;
}

.recommendations-list {
  margin: 8px 0 0 0;
  padding-left: 16px;
  color: #fbbf24;
}

.recommendations-list li {
  margin-bottom: 4px;
  font-size: 11px;
}

.actions-section {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.2s;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
}

.action-btn.secondary {
  background: #6b7280;
  color: white;
}

.action-btn.danger {
  background: #ef4444;
  color: white;
}

.action-btn:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

@media (max-width: 1024px) {
  .cache-monitor {
    top: 10px;
    right: 10px;
    max-width: 220px;
    padding: 8px;
    font-size: 10px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .cache-monitor {
    display: none;
  }
}
</style>