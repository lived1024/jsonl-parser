<template>
  <div v-if="showDemo" class="analytics-demo">
    <div class="demo-header">
      <h3>Analytics Demo</h3>
      <button @click="toggleDemo" class="close-btn">×</button>
    </div>
    
    <div class="demo-content">
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
const showDemo = import.meta.env.DEV

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
  showDemo && (document.querySelector('.analytics-demo')?.remove())
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
  width: 400px;
  max-height: 600px;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  overflow: hidden;
}

.demo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e1e5e9;
}

.demo-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #495057;
}

.demo-content {
  padding: 20px;
  max-height: 520px;
  overflow-y: auto;
}

.demo-section {
  margin-bottom: 24px;
}

.demo-section:last-child {
  margin-bottom: 0;
}

.demo-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.demo-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.demo-btn {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background: white;
  color: #495057;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.demo-btn:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.demo-btn.error {
  border-color: #dc3545;
  color: #dc3545;
}

.demo-btn.error:hover {
  background: #f8d7da;
}

.status-grid {
  display: grid;
  gap: 8px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f3f4;
}

.status-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: #6c757d;
}

.value {
  font-weight: 600;
}

.value.success {
  color: #28a745;
}

.value.warning {
  color: #ffc107;
}

.value.error {
  color: #dc3545;
}

.value.info {
  color: #17a2b8;
}

.value.muted {
  color: #6c757d;
}

.events-log {
  max-height: 200px;
  overflow-y: auto;
}

.event-item {
  padding: 8px 0;
  border-bottom: 1px solid #f1f3f4;
}

.event-item:last-child {
  border-bottom: none;
}

.event-info {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
}

.event-type {
  background: #007bff;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.event-action {
  background: #6c757d;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;
}

.event-time {
  color: #6c757d;
  font-size: 11px;
  margin-left: auto;
}

.event-label {
  color: #495057;
  font-size: 12px;
  padding-left: 8px;
}

.no-events {
  text-align: center;
  color: #6c757d;
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
  background: #f1f3f4;
}

.demo-content::-webkit-scrollbar-thumb,
.events-log::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 2px;
}
</style>