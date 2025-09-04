<template>
  <div v-if="isDev && showDashboard" class="performance-dashboard">
    <div class="dashboard-header">
      <h3>Performance Dashboard</h3>
      <button @click="toggleDashboard" class="toggle-btn">
        {{ isExpanded ? '−' : '+' }}
      </button>
    </div>
    
    <div v-if="isExpanded" class="dashboard-content">
      <div class="metrics-grid">
        <div class="metric-card">
          <h4>Bundle Performance</h4>
          <div class="metric-value">{{ bundleAnalysis.chunkCount }} chunks</div>
          <div class="metric-detail">Average load: {{ averageLoadTime }}ms</div>
        </div>
        
        <div class="metric-card">
          <h4>Memory Usage</h4>
          <div class="metric-value">{{ memoryUsage }}MB</div>
          <div class="metric-detail">JS Heap Size</div>
        </div>
        
        <div class="metric-card">
          <h4>Route Performance</h4>
          <div class="metric-value">{{ averageRouteTime }}ms</div>
          <div class="metric-detail">Average transition</div>
        </div>
      </div>
      
      <div v-if="slowChunks.length > 0" class="slow-chunks">
        <h4>Slow Loading Chunks</h4>
        <ul>
          <li v-for="chunk in slowChunks" :key="chunk.name">
            {{ chunk.name }}: {{ chunk.time.toFixed(2) }}ms
          </li>
        </ul>
      </div>
      
      <div v-if="recommendations.length > 0" class="recommendations">
        <h4>Optimization Recommendations</h4>
        <ul>
          <li v-for="rec in recommendations" :key="rec">{{ rec }}</li>
        </ul>
      </div>
      
      <div class="actions">
        <button @click="refreshMetrics" class="refresh-btn">Refresh Metrics</button>
        <button @click="exportReport" class="export-btn">Export Report</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { PerformanceService } from '../../services/PerformanceService'

const isDev = import.meta.env.DEV
const showDashboard = ref(false)
const isExpanded = ref(false)
const performanceService = PerformanceService.getInstance()

const performanceData = ref({
  summary: {
    averageChunkLoadTime: 0,
    slowestChunk: null as { name: string; time: number } | null,
    totalChunksLoaded: 0,
    averageRouteTransition: 0
  },
  details: {
    chunkLoadTimes: [] as Array<{ name: string; time: number }>,
    routeTransitionTimes: [] as Array<{ name: string; time: number }>,
    memoryUsage: 0
  }
})

const bundleAnalysis = ref({
  estimatedBundleSize: 0,
  chunkCount: 0,
  recommendations: [] as string[]
})

const averageLoadTime = computed(() => 
  Math.round(performanceData.value.summary.averageChunkLoadTime)
)

const memoryUsage = computed(() => 
  Math.round(performanceData.value.details.memoryUsage)
)

const averageRouteTime = computed(() => 
  Math.round(performanceData.value.summary.averageRouteTransition)
)

const slowChunks = computed(() => 
  performanceData.value.details.chunkLoadTimes.filter(chunk => chunk.time > 1000)
)

const recommendations = computed(() => bundleAnalysis.value.recommendations)

function toggleDashboard() {
  isExpanded.value = !isExpanded.value
}

function refreshMetrics() {
  performanceData.value = performanceService.getPerformanceReport()
  bundleAnalysis.value = performanceService.getBundleAnalysis()
}

function exportReport() {
  const report = {
    timestamp: new Date().toISOString(),
    performance: performanceData.value,
    bundle: bundleAnalysis.value,
    userAgent: navigator.userAgent
  }
  
  const blob = new Blob([JSON.stringify(report, null, 2)], { 
    type: 'application/json' 
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `performance-report-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

let refreshInterval: number

onMounted(() => {
  if (isDev) {
    // Show dashboard after initial load
    setTimeout(() => {
      showDashboard.value = true
      refreshMetrics()
    }, 2000)
    
    // Auto-refresh metrics every 10 seconds
    refreshInterval = setInterval(refreshMetrics, 10000)
  }
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.performance-dashboard {
  position: fixed;
  top: 100px;
  right: 20px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 8px;
  padding: 0.75rem;
  max-width: 280px;
  z-index: 9999;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.dashboard-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #60a5fa;
}

.toggle-btn {
  background: #374151;
  color: white;
  border: none;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-weight: bold;
}

.toggle-btn:hover {
  background: #4b5563;
}

.dashboard-content {
  margin-top: 1rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.metric-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.75rem;
  border-radius: 6px;
}

.metric-card h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: uppercase;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #60a5fa;
  margin-bottom: 0.25rem;
}

.metric-detail {
  font-size: 0.75rem;
  color: #d1d5db;
}

.slow-chunks,
.recommendations {
  margin-bottom: 1rem;
}

.slow-chunks h4,
.recommendations h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #fbbf24;
}

.slow-chunks ul,
.recommendations ul {
  margin: 0;
  padding-left: 1rem;
  font-size: 0.75rem;
}

.slow-chunks li {
  color: #fca5a5;
}

.recommendations li {
  color: #fbbf24;
  margin-bottom: 0.25rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.refresh-btn,
.export-btn {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  cursor: pointer;
  flex: 1;
}

.refresh-btn:hover,
.export-btn:hover {
  background: #2563eb;
}

.export-btn {
  background: #059669;
}

.export-btn:hover {
  background: #047857;
}

@media (max-width: 1024px) {
  .performance-dashboard {
    top: 10px;
    right: 300px;
    max-width: 220px;
    padding: 0.5rem;
    font-size: 0.7rem;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}

@media (max-width: 768px) {
  .performance-dashboard {
    display: none;
  }
}
</style>