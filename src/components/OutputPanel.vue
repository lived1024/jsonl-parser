<template>
  <div class="output-panel" role="region" aria-labelledby="output-panel-title">
    <div class="panel-header">
      <h2 id="output-panel-title">출력</h2>
      <div v-if="store.hasData" class="panel-stats" role="status" aria-live="polite">
        <span class="stat-item" aria-label="총 노드 수">{{ nodeCount }}개 노드</span>
        <span v-if="store.inputType === 'jsonl'" class="stat-item" aria-label="처리된 줄 수">{{ store.parsedData.length }}줄</span>
      </div>
    </div>
    
    <div class="panel-content">
      <!-- 빈 상태 -->
      <div v-if="!store.hasData && !store.hasError" class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
        </div>
        <h3>JSON 트리가 여기에 표시됩니다</h3>
        <p>왼쪽 패널에 JSON 또는 JSONL 데이터를 입력하세요</p>
      </div>
      
      <!-- 오류 상태 -->
      <div v-else-if="store.hasError" class="error-state">
        <div class="error-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h3>파싱 오류</h3>
        <p>입력된 데이터를 파싱할 수 없습니다</p>
      </div>
      
      <!-- 트리 뷰 -->
      <div v-else class="tree-container">
        <div 
          class="tree-scroll"
          role="tree"
          aria-label="JSON 트리 구조"
          tabindex="0"
        >
          <TreeNode 
            v-for="node in store.parsedData" 
            :key="node.id"
            :node="node"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useJsonTreeStore } from '../stores'
import TreeNode from './TreeNode.vue'

const store = useJsonTreeStore()

// 총 노드 개수 계산
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
</script>

<style scoped>
.output-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-background);
}

.panel-header {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
}

.panel-stats {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.stat-item {
  background: var(--color-background-alt);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-variant-numeric: tabular-nums;
}

.panel-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 빈 상태 스타일 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: var(--color-text-muted);
}

.empty-icon {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--color-text);
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

/* 오류 상태 스타일 */
.error-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: var(--color-danger);
}

.error-icon {
  margin-bottom: 1rem;
  opacity: 0.7;
}

.error-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 500;
}

.error-state p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-text-muted);
}

/* 트리 컨테이너 */
.tree-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tree-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

/* 스크롤바 스타일링 */
.tree-scroll::-webkit-scrollbar {
  width: 8px;
}

.tree-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.tree-scroll::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

.tree-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted);
}

/* 모바일 최적화 */
@media (max-width: 768px) {
  .panel-header {
    padding: 0.75rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .panel-stats {
    align-self: stretch;
    justify-content: center;
  }
  
  .empty-state,
  .error-state {
    padding: 1.5rem;
  }
  
  .empty-state h3,
  .error-state h3 {
    font-size: 1rem;
  }
  
  .empty-state p,
  .error-state p {
    font-size: 0.8125rem;
  }
}
</style>