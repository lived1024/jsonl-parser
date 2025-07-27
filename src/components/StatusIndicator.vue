<template>
  <div class="status-indicator" role="status" aria-live="polite" aria-atomic="true">
    <!-- 로딩 상태 -->
    <Transition name="status-fade" mode="out-in">
      <div v-if="store.isLoading" key="loading" class="status-item status-item--loading">
        <div class="status-badge status-badge--loading">
          <div class="status-icon" aria-hidden="true">
            <div class="spinner"></div>
          </div>
        </div>
        <div class="status-content">
          <span class="status-text">Parsing JSON...</span>
          <div class="status-progress">
            <div class="progress-bar"></div>
          </div>
        </div>
      </div>
    
      <!-- 오류 상태 -->
      <div v-else-if="store.hasError" key="error" class="status-item status-item--error">
        <div class="status-badge status-badge--error">
          <div class="status-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
        </div>
        <div class="status-content">
          <span class="status-text">Parsing Error</span>
          <div class="error-details">
            <p class="error-message" role="alert">{{ store.parseError?.message }}</p>
            <div v-if="errorLocation" class="error-location" aria-label="오류 위치 정보">
              <div v-if="store.parseError?.line" class="location-tag">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                Line {{ store.parseError.line }}
              </div>
              <div v-if="store.parseError?.column" class="location-tag">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 12h18m-9-9v18"/>
                </svg>
                Col {{ store.parseError.column }}
              </div>
            </div>
          </div>
        </div>
      </div>
    
      <!-- 부분적 성공 상태 (JSONL에서 일부 오류) -->
      <div v-else-if="store.hasData && store.hasError" key="warning" class="status-item status-item--warning">
        <div class="status-badge status-badge--warning">
          <div class="status-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
        </div>
        <div class="status-content">
          <span class="status-text">Partial Success</span>
          <div class="warning-details">
            <p class="warning-message">{{ store.parseError?.message }}</p>
            <div class="success-stats">
              <div class="stat-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                {{ nodeCount }} nodes
              </div>
              <div v-if="store.inputType === 'jsonl'" class="stat-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                {{ lineCount }} lines
              </div>
            </div>
          </div>
        </div>
      </div>
    
      <!-- 성공 상태 -->
      <div v-else-if="store.hasData" key="success" class="status-item status-item--success">
        <div class="status-badge status-badge--success">
          <div class="status-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
        </div>
        <div class="status-content">
          <span class="status-text">Successfully Parsed</span>
          <div class="success-stats">
            <div class="stat-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
              {{ formatNumber(nodeCount) }} nodes
            </div>
            <div v-if="store.inputType === 'jsonl'" class="stat-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              {{ lineCount }} lines
            </div>
          </div>
        </div>
      </div>
    
      <!-- 대기 상태 -->
      <div v-else key="idle" class="status-item status-item--idle">
        <div class="status-badge status-badge--idle">
          <div class="status-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
        </div>
        <div class="status-content">
          <span class="status-text">Ready to Parse</span>
          <p class="status-description">Enter JSON or JSONL data to visualize</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import useStatusIndicator from './StatusIndicator'

const {
  store,
  errorLocation,
  nodeCount,
  lineCount,
  formatNumber
} = useStatusIndicator()
</script>

<style scoped src="./StatusIndicator.css"></style>