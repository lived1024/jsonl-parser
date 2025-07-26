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
import { computed } from 'vue'
import { useJsonTreeStore } from '../stores'

const store = useJsonTreeStore()

// 오류 위치 정보 표시 여부
const errorLocation = computed(() => {
  const error = store.parseError
  return error && (error.line || error.column || error.position)
})

// 노드 개수 계산
const nodeCount = computed(() => {
  const countNodes = (nodes: any[]): number => {
    let count = 0
    for (const node of nodes) {
      count++
      if (node.children) {
        count += countNodes(node.children)
      }
    }
    return count
  }
  
  return countNodes(store.parsedData)
})

// JSONL 줄 수 계산
const lineCount = computed(() => {
  if (store.inputType !== 'jsonl') return 0
  return store.parsedData.length
})

// 숫자 포맷팅
const formatNumber = (num: number) => {
  return num.toLocaleString()
}
</script>

<style scoped>
.status-indicator {
  padding: 1rem;
  background: var(--color-surface);
  border-radius: var(--radius-md);
}

.status-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.status-badge {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.status-badge--loading {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.status-badge--error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.status-badge--warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.status-badge--success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.status-badge--idle {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.status-content {
  flex: 1;
  min-width: 0;
}

.status-text {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text);
  line-height: var(--leading-tight);
  margin-bottom: 0.25rem;
}

.status-description {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
}

.status-progress {
  width: 100%;
  height: 0.25rem;
  background: var(--color-border-light);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-top: 0.5rem;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  border-radius: var(--radius-sm);
  animation: progress 2s ease-in-out infinite;
}

@keyframes progress {
  0% {
    width: 0%;
    transform: translateX(-100%);
  }
  50% {
    width: 100%;
    transform: translateX(0%);
  }
  100% {
    width: 100%;
    transform: translateX(100%);
  }
}

/* 스피너 애니메이션 */
.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 오류 세부 정보 */
.error-details {
  margin-top: 0.5rem;
}

.error-message {
  margin: 0 0 0.5rem 0;
  font-size: var(--text-xs);
  color: var(--color-text);
  line-height: var(--leading-relaxed);
  word-break: break-word;
  background: var(--color-surface);
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--color-error);
}

.error-location {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.location-tag {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

/* 경고 세부 정보 */
.warning-details {
  margin-top: 0.5rem;
}

.warning-message {
  margin: 0 0 0.5rem 0;
  font-size: var(--text-xs);
  color: var(--color-text);
  line-height: var(--leading-relaxed);
  word-break: break-word;
  background: var(--color-surface);
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--color-warning);
}

/* 성공 통계 */
.success-stats {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
  transition: all var(--transition-fast);
}

.stat-item:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.stat-item svg {
  color: var(--color-primary);
}

/* 전환 애니메이션 */
.status-fade-enter-active,
.status-fade-leave-active {
  transition: all var(--transition-normal);
}

.status-fade-enter-from {
  opacity: 0;
  transform: translateY(0.5rem);
}

.status-fade-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

/* 모바일 최적화 */
@media (max-width: 768px) {
  .status-indicator {
    padding: 0.75rem;
  }
  
  .status-item {
    gap: 0.5rem;
  }
  
  .status-badge {
    width: 1.75rem;
    height: 1.75rem;
  }
  
  .status-text {
    font-size: var(--text-xs);
  }
  
  .status-description {
    font-size: 0.625rem;
  }
  
  .error-message,
  .warning-message {
    padding: 0.375rem;
    font-size: 0.625rem;
  }
  
  .location-tag,
  .stat-item {
    padding: 0.25rem 0.375rem;
    font-size: 0.625rem;
  }
  
  .success-stats {
    gap: 0.5rem;
  }
}

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  .spinner,
  .progress-bar,
  .stat-item {
    animation: none;
  }
  
  .stat-item:hover {
    transform: none;
  }
  
  .status-fade-enter-active,
  .status-fade-leave-active {
    transition: none;
  }
}

/* 고대비 모드 */
@media (prefers-contrast: high) {
  .status-badge {
    border: 2px solid currentColor;
  }
  
  .error-message,
  .warning-message {
    border-left-width: 4px;
  }
  
  .location-tag,
  .stat-item {
    border-width: 2px;
  }
}
</style>