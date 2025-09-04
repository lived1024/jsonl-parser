<template>
  <div v-if="showDemo" class="analytics-demo">
    <div class="demo-header">
      <h3 style="width: 80%;">Analytics Demo</h3>
      <button @click="toggleExpanded" class="toggle-btn">
        {{ isExpanded ? '−' : '+' }}
      </button>
      <button @click="toggleDemo" class="close-btn">×</button>
    </div>
    
    <div v-if="isExpanded" class="demo-content">
      <div class="demo-section">
        <h4>Test Analytics Events</h4>
        <div class="demo-buttons">
          <button @click="testPageView" class="demo-btn">
            Track Page View
          </button>
          <button @click="testToolUsage" class="demo-btn">
            Track Tool Usage
          </button>
          <button @click="testTutorial" class="demo-btn">
            Track Tutorial
          </button>
          <button @click="testSample" class="demo-btn">
            Track Sample
          </button>
          <button @click="testError" class="demo-btn error">
            Track Error
          </button>
        </div>
      </div>

      <div class="demo-section">
        <h4>Analytics Status</h4>
        <div class="status-grid">
          <div class="status-item">
            <span class="label">Initialized:</span>
            <span :class="['value', analyticsState.isInitialized ? 'success' : 'error']">
              {{ analyticsState.isInitialized ? 'Yes' : 'No' }}
            </span>
          </div>
          <div class="status-item">
            <span class="label">Enabled:</span>
            <span :class="['value', analyticsState.isEnabled ? 'success' : 'warning']">
              {{ analyticsState.isEnabled ? 'Yes' : 'No' }}
            </span>
          </div>
          <div class="status-item">
            <span class="label">Debug Mode:</span>
            <span :class="['value', analyticsState.debugMode ? 'info' : 'muted']">
              {{ analyticsState.debugMode ? 'On' : 'Off' }}
            </span>
          </div>
          <div v-if="analyticsState.error" class="status-item">
            <span class="label">Error:</span>
            <span class="value error">{{ analyticsState.error }}</span>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h4>Recent Events</h4>
        <div class="events-log">
          <div 
            v-for="event in recentEvents.slice(0, 5)" 
            :key="event.id"
            class="event-item"
          >
            <div class="event-info">
              <span class="event-type">{{ event.category }}</span>
              <span class="event-action">{{ event.action }}</span>
              <span class="event-time">{{ formatTime(event.timestamp) }}</span>
            </div>
            <div v-if="event.label" class="event-label">{{ event.label }}</div>
          </div>
          <div v-if="recentEvents.length === 0" class="no-events">
            No events tracked yet. Click the buttons above to test!
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAnalytics } from '../../composables/useAnalytics'

interface DemoEvent {
  id: string
  category: string
  action: string
  label?: string
  timestamp: number
}

// Only show in development mode
const showDemo = ref(import.meta.env.DEV)
const isExpanded = ref(false)

const {
  trackPageView,
  trackTool,
  trackTutorial,
  trackSample,
  trackException,
  getAnalyticsState
} = useAnalytics()

const recentEvents = ref<DemoEvent[]>([])
let eventCounter = 0

const analyticsState = computed(() => getAnalyticsState())

const toggleDemo = () => {
  showDemo.value = false
}

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const addEvent = (category: string, action: string, label?: string) => {
  const event: DemoEvent = {
    id: `demo_${++eventCounter}`,
    category,
    action,
    label,
    timestamp: Date.now()
  }
  
  recentEvents.value.unshift(event)
  
  // Keep only last 10 events
  if (recentEvents.value.length > 10) {
    recentEvents.value = recentEvents.value.slice(0, 10)
  }
}

const testPageView = () => {
  trackPageView('/demo/analytics', 'Analytics Demo Page', {
    demo: true,
    test_type: 'page_view'
  })
  addEvent('navigation', 'page_view', 'Analytics Demo')
}

const testToolUsage = () => {
  trackTool.use('analytics_demo_tool', 'small', {
    demo: true,
    test_type: 'tool_usage'
  })
  addEvent('tool', 'use', 'Analytics Demo Tool')
}

const testTutorial = () => {
  trackTutorial.start('analytics-demo-tutorial', {
    demo: true,
    test_type: 'tutorial'
  })
  addEvent('tutorial', 'start', 'Analytics Demo Tutorial')
}

const testSample = () => {
  trackSample.load('analytics-demo-sample', 'demo', 'simple', {
    demo: true,
    test_type: 'sample'
  })
  addEvent('sample', 'load', 'Analytics Demo Sample')
}

const testError = () => {
  trackException('Demo error for testing analytics', false)
  addEvent('error', 'exception', 'Demo Error')
}

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString()
}

onMounted(() => {
  if (showDemo) {
    console.log('🎯 Analytics Demo component mounted')
    console.log('Analytics State:', analyticsState.value)
  }
})
</script>

<style scoped>
.analytics-demo {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 350px;
  max-height: 80vh;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 9998;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  overflow: hidden;
}

.demo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.demo-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.toggle-btn,
.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: white;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
}

.toggle-btn:hover,
.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.demo-content {
  padding: 16px;
  max-height: calc(80vh - 60px);
  overflow-y: auto;
}

.demo-section {
  margin-bottom: 20px;
}

.demo-section:last-child {
  margin-bottom: 0;
}

.demo-section h4 {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #ccc;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.demo-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.demo-btn {
  background: #374151;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  transition: background-color 0.2s;
}

.demo-btn:hover {
  background: #4b5563;
}

.demo-btn.error {
  background: #dc2626;
}

.demo-btn.error:hover {
  background: #b91c1c;
}

.status-grid {
  display: grid;
  gap: 4px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.label {
  color: #aaa;
}

.value {
  font-weight: 600;
}

.value.success {
  color: #4ade80;
}

.value.warning {
  color: #fbbf24;
}

.value.error {
  color: #f87171;
}

.value.info {
  color: #60a5fa;
}

.value.muted {
  color: #9ca3af;
}

.events-log {
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

.event-info {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.event-type {
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

.no-events {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  padding: 20px;
}

/* Scrollbar styling */
.demo-content::-webkit-scrollbar,
.events-log::-webkit-scrollbar {
  width: 4px;
}

.demo-content::-webkit-scrollbar-track,
.events-log::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.demo-content::-webkit-scrollbar-thumb,
.events-log::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

/* Responsive design */
@media (max-width: 1024px) {
  .analytics-demo {
    width: 300px;
    max-height: 500px;
  }
}

@media (max-width: 768px) {
  .analytics-demo {
    display: none;
  }
}
</style>