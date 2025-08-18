<template>
  <div v-if="showDashboard" class="analytics-dashboard">
    <div class="dashboard-header">
      <h3>Analytics Dashboard</h3>
      <button @click="toggleDashboard" class="toggle-btn">
        {{ isExpanded ? '−' : '+' }}
      </button>
    </div>
    
    <div v-if="isExpanded" class="dashboard-content">
      <div class="status-section">
        <h4>Status</h4>
        <div class="status-item">
          <span class="label">Initialized:</span>
          <span :class="['status', analyticsState.isInitialized ? 'success' : 'error']">
            {{ analyticsState.isInitialized ? 'Yes' : 'No' }}
          </span>
        </div>
        <div class="status-item">
          <span class="label">Enabled:</span>
          <span :class="['status', analyticsState.isEnabled ? 'success' : 'warning']">
            {{ analyticsState.isEnabled ? 'Yes' : 'No' }}
          </span>
        </div>
        <div v-if="analyticsState.error" class="status-item">
          <span class="label">Error:</span>
          <span class="status error">{{ analyticsState.error }}</span>
        </div>
      </div>

      <div class="events-section">
        <h4>Recent Events ({{ recentEvents.length }})</h4>
        <div class="events-list">
          <div 
            v-for="event in recentEvents.slice(0, 5)" 
            :key="event.id"
            class="event-item"
          >
            <div class="event-header">
              <span class="event-category">{{ event.category }}</span>
              <span class="event-action">{{ event.action }}</span>
              <span class="event-time">{{ formatTime(event.timestamp) }}</span>
            </div>
            <div v-if="event.label" class="event-label">{{ event.label }}</div>
            <div v-if="event.customParameters" class="event-params">
              <pre>{{ JSON.stringify(event.customParameters, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>

      <div class="controls-section">
        <h4>Controls</h4>
        <button @click="toggleAnalytics" class="control-btn">
          {{ analyticsState.isEnabled ? 'Disable' : 'Enable' }} Analytics
        </button>
        <button @click="clearEvents" class="control-btn">
          Clear Events
        </button>
        <button @click="testEvent" class="control-btn">
          Send Test Event
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAnalytics } from '../../composables/useAnalytics'

interface TrackedEvent {
  id: string
  category: string
  action: string
  label?: string
  timestamp: number
  customParameters?: Record<string, any>
}

// Only show in development mode
const showDashboard = import.meta.env.DEV

const { getAnalyticsState, setAnalyticsEnabled, trackEvent } = useAnalytics()

const isExpanded = ref(false)
const recentEvents = ref<TrackedEvent[]>([])

const analyticsState = computed(() => getAnalyticsState())

const toggleDashboard = () => {
  isExpanded.value = !isExpanded.value
}

const toggleAnalytics = () => {
  setAnalyticsEnabled(!analyticsState.value.isEnabled)
}

const clearEvents = () => {
  recentEvents.value = []
}

const testEvent = () => {
  trackEvent({
    category: 'user_interaction',
    action: 'test_event',
    label: 'Analytics Dashboard Test',
    customParameters: {
      test: true,
      timestamp: Date.now()
    }
  })
}

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString()
}

// Intercept gtag calls to track events in dashboard
const originalGtag = window.gtag
let eventCounter = 0

const interceptGtag = (...args: any[]) => {
  if (originalGtag) {
    originalGtag(...args)
  }

  // Track events in dashboard
  if (args[0] === 'event' && args[1]) {
    const eventData = args[2] || {}
    const event: TrackedEvent = {
      id: `event_${++eventCounter}`,
      category: eventData.event_category || 'unknown',
      action: args[1],
      label: eventData.event_label,
      timestamp: Date.now(),
      customParameters: eventData
    }
    
    recentEvents.value.unshift(event)
    
    // Keep only last 50 events
    if (recentEvents.value.length > 50) {
      recentEvents.value = recentEvents.value.slice(0, 50)
    }
  }
}

onMounted(() => {
  if (showDashboard && window.gtag) {
    window.gtag = interceptGtag
  }
})

onUnmounted(() => {
  if (showDashboard && originalGtag) {
    window.gtag = originalGtag
  }
})
</script>

<style scoped>
.analytics-dashboard {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 350px;
  max-height: 80vh;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 10000;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  overflow: hidden;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.dashboard-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.toggle-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dashboard-content {
  padding: 16px;
  max-height: calc(80vh - 60px);
  overflow-y: auto;
}

.status-section,
.events-section,
.controls-section {
  margin-bottom: 20px;
}

.status-section h4,
.events-section h4,
.controls-section h4 {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #ccc;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.label {
  color: #aaa;
}

.status {
  font-weight: 600;
}

.status.success {
  color: #4ade80;
}

.status.warning {
  color: #fbbf24;
}

.status.error {
  color: #f87171;
}

.events-list {
  max-height: 200px;
  overflow-y: auto;
}

.event-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 8px;
  border-left: 3px solid #3b82f6;
}

.event-header {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.event-category {
  background: #3b82f6;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
}

.event-action {
  background: #6b7280;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
}

.event-time {
  color: #9ca3af;
  font-size: 10px;
  margin-left: auto;
}

.event-label {
  color: #d1d5db;
  font-size: 11px;
  margin-bottom: 4px;
}

.event-params {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  padding: 4px;
  font-size: 10px;
  overflow-x: auto;
}

.event-params pre {
  margin: 0;
  color: #e5e7eb;
}

.controls-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-btn {
  background: #374151;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  transition: background-color 0.2s;
}

.control-btn:hover {
  background: #4b5563;
}

/* Scrollbar styling */
.dashboard-content::-webkit-scrollbar,
.events-list::-webkit-scrollbar {
  width: 4px;
}

.dashboard-content::-webkit-scrollbar-track,
.events-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.dashboard-content::-webkit-scrollbar-thumb,
.events-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}
</style>