<template>
  <div class="status-indicator" role="status" aria-live="polite" aria-atomic="true">
    <!-- 로딩 상태 -->
    <div v-if="store.isLoading" class="status-item loading">
      <div class="status-icon" aria-hidden="true">
        <div class="spinner"></div>
      </div>
      <span class="status-text">파싱 중...</span>
    </div>
    
    <!-- 오류 상태 -->
    <div v-else-if="store.hasError" class="status-item error">
      <div class="status-icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8S12.42 0 8 0zM7 3h2v6H7V3zm0 8h2v2H7v-2z"/>
        </svg>
      </div>
      <div class="status-content">
        <span class="status-text">파싱 오류</span>
        <div class="error-details">
          <p class="error-message" role="alert">{{ store.parseError?.message }}</p>
          <div v-if="errorLocation" class="error-location" aria-label="오류 위치 정보">
            <span v-if="store.parseError?.line">줄 {{ store.parseError.line }}</span>
            <span v-if="store.parseError?.column">열 {{ store.parseError.column }}</span>
            <span v-if="store.parseError?.position">위치 {{ store.parseError.position }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 부분적 성공 상태 (JSONL에서 일부 오류) -->
    <div v-else-if="store.hasData && store.hasError" class="status-item warning">
      <div class="status-icon">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0L0 8l8 8 8-8L8 0zM7 3h2v6H7V3zm0 8h2v2H7v-2z"/>
        </svg>
      </div>
      <div class="status-content">
        <span class="status-text">부분적 파싱 완료</span>
        <div class="warning-details">
          <p class="warning-message">{{ store.parseError?.message }}</p>
          <div class="success-details">
            <span class="node-count">{{ nodeCount }}개 노드 성공</span>
            <span v-if="store.inputType === 'jsonl'" class="line-count">{{ lineCount }}줄 처리됨</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 성공 상태 -->
    <div v-else-if="store.hasData" class="status-item success">
      <div class="status-icon">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8S12.42 0 8 0zm3.35 6.35L6.7 11l-.7-.7L4.65 8.95l.7-.7L6.7 9.6l4.65-4.65.7.7z"/>
        </svg>
      </div>
      <div class="status-content">
        <span class="status-text">파싱 완료</span>
        <div class="success-details">
          <span class="node-count">{{ nodeCount }}개 노드</span>
          <span v-if="store.inputType === 'jsonl'" class="line-count">{{ lineCount }}줄</span>
        </div>
      </div>
    </div>
    
    <!-- 대기 상태 -->
    <div v-else class="status-item idle">
      <div class="status-icon">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8S12.42 0 8 0zm1 12H7V7h2v5zm0-6H7V4h2v2z"/>
        </svg>
      </div>
      <span class="status-text">JSON 또는 JSONL 데이터를 입력하세요</span>
    </div>
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
</script>

<style scoped>
.status-indicator {
  padding: 0.75rem 1rem;
}

.status-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.status-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.status-content {
  flex: 1;
  min-width: 0;
}

.status-text {
  font-size: 0.875rem;
  font-weight: 500;
  display: block;
  margin-bottom: 0.25rem;
}

/* 상태별 색상 */
.loading {
  color: var(--color-info);
}

.error {
  color: var(--color-danger);
}

.success {
  color: var(--color-success);
}

.warning {
  color: var(--color-warning);
}

.idle {
  color: var(--color-text-muted);
}

/* 스피너 애니메이션 */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
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
  font-size: 0.75rem;
  line-height: 1.4;
}

.error-message {
  margin: 0 0 0.25rem 0;
  color: var(--color-text);
  word-break: break-word;
}

.error-location {
  display: flex;
  gap: 0.5rem;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.error-location span {
  background: var(--color-background-alt);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.6875rem;
}

/* 경고 세부 정보 */
.warning-details {
  font-size: 0.75rem;
  line-height: 1.4;
}

.warning-message {
  margin: 0 0 0.5rem 0;
  color: var(--color-text);
  word-break: break-word;
}

/* 성공 세부 정보 */
.success-details {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.node-count,
.line-count {
  background: var(--color-background-alt);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

/* 모바일 최적화 */
@media (max-width: 768px) {
  .status-indicator {
    padding: 0.5rem 0.75rem;
  }
  
  .status-item {
    gap: 0.5rem;
  }
  
  .status-text {
    font-size: 0.8125rem;
  }
  
  .error-details,
  .success-details {
    font-size: 0.6875rem;
  }
  
  .error-location,
  .success-details {
    flex-wrap: wrap;
    gap: 0.375rem;
  }
}
</style>