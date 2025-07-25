<template>
  <div 
    class="tree-node" 
    :class="{ 'is-expanded': node.isExpanded }"
    :style="{ '--node-depth': node.depth }"
  >
    <div 
      class="node-content"
      :style="{ paddingLeft: `${node.depth * 20}px` }"
      @click="handleNodeClick"
      @keydown="handleKeydown"
      tabindex="0"
      role="treeitem"
      :aria-expanded="hasChildren ? node.isExpanded : undefined"
      :aria-level="node.depth + 1"
    >
      <!-- 확장/축소 버튼 -->
      <button 
        v-if="hasChildren"
        class="expand-button"
        @click.stop="toggleNode"
        :aria-label="node.isExpanded ? '축소' : '확장'"
        tabindex="-1"
      >
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 12 12" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
          :class="{ 'rotated': node.isExpanded }"
        >
          <polyline points="3,4.5 6,7.5 9,4.5"/>
        </svg>
      </button>
      <div v-else class="expand-spacer"></div>
      
      <!-- 타입 아이콘 -->
      <div class="type-icon" :class="`type-${node.type}`">
        <component :is="typeIcon" />
      </div>
      
      <!-- 키 -->
      <span v-if="node.key" class="node-key">{{ node.key }}</span>
      <span v-if="node.key" class="key-separator">:</span>
      
      <!-- 값 -->
      <span class="node-value" :class="`value-${node.type}`">
        {{ displayValue }}
      </span>
      
      <!-- 컬렉션 크기 표시 -->
      <span v-if="collectionSize" class="collection-size">
        {{ collectionSize }}
      </span>
    </div>
    
    <!-- 자식 노드들 -->
    <div v-if="hasChildren && node.isExpanded" class="node-children">
      <!-- 지연 로딩: 자식이 많은 경우 일부만 렌더링 -->
      <template v-if="shouldUseLazyLoading">
        <TreeNode 
          v-for="child in visibleChildren" 
          :key="child.id"
          :node="child"
        />
        <div v-if="hasMoreChildren" class="load-more-container">
          <button 
            class="load-more-button"
            @click="loadMoreChildren"
            :disabled="isLoadingMore"
          >
            {{ isLoadingMore ? '로딩 중...' : `${remainingChildrenCount}개 더 보기` }}
          </button>
        </div>
      </template>
      
      <!-- 일반 렌더링 -->
      <template v-else>
        <TreeNode 
          v-for="child in node.children" 
          :key="child.id"
          :node="child"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref } from 'vue'
import { useJsonTreeStore } from '../stores'
import { ParsedNode, DataType } from '../types'

interface Props {
  node: ParsedNode
}

const props = defineProps<Props>()
const store = useJsonTreeStore()

// 지연 로딩 상태
const visibleChildrenCount = ref(50) // 초기에 50개만 표시
const isLoadingMore = ref(false)

// 지연 로딩 사용 여부
const shouldUseLazyLoading = computed(() => {
  return hasChildren.value && props.node.children!.length > 50
})

// 표시할 자식 노드들
const visibleChildren = computed(() => {
  if (!hasChildren.value) return []
  return props.node.children!.slice(0, visibleChildrenCount.value)
})

// 더 보기 버튼 표시 여부
const hasMoreChildren = computed(() => {
  return hasChildren.value && visibleChildrenCount.value < props.node.children!.length
})

// 남은 자식 노드 개수
const remainingChildrenCount = computed(() => {
  if (!hasChildren.value) return 0
  return props.node.children!.length - visibleChildrenCount.value
})

// 더 많은 자식 노드 로드
const loadMoreChildren = async () => {
  isLoadingMore.value = true
  
  // 의도적인 지연으로 부드러운 UX 제공
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const increment = Math.min(50, remainingChildrenCount.value)
  visibleChildrenCount.value += increment
  
  isLoadingMore.value = false
}

// 자식 노드 존재 여부
const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0
})

// 컬렉션 크기 표시
const collectionSize = computed(() => {
  if (!hasChildren.value) return null
  
  const count = props.node.children!.length
  if (props.node.type === DataType.ARRAY) {
    return `[${count}]`
  } else if (props.node.type === DataType.OBJECT) {
    return `{${count}}`
  }
  return null
})

// 표시할 값 (메모이제이션)
const displayValue = computed(() => {
  const value = props.node.value
  
  switch (props.node.type) {
    case DataType.STRING:
      return `"${value}"`
    case DataType.NUMBER:
      return String(value)
    case DataType.BOOLEAN:
      return String(value)
    case DataType.NULL:
      return 'null'
    case DataType.ARRAY:
      return hasChildren.value ? '' : '[]'
    case DataType.OBJECT:
      return hasChildren.value ? '' : '{}'
    default:
      return String(value)
  }
})

// 타입별 아이콘 컴포넌트
const typeIcon = computed(() => {
  const iconProps = {
    width: 14,
    height: 14,
    viewBox: '0 0 14 14',
    fill: 'currentColor'
  }
  
  switch (props.node.type) {
    case DataType.OBJECT:
      return defineComponent(() => h('svg', iconProps, [
        h('path', { d: 'M2 2h10v10H2V2zm1 1v8h8V3H3z' })
      ]))
    case DataType.ARRAY:
      return defineComponent(() => h('svg', iconProps, [
        h('path', { d: 'M3 2v10h1V3h6v9h1V2H3z' })
      ]))
    case DataType.STRING:
      return defineComponent(() => h('svg', iconProps, [
        h('path', { d: 'M3 4h8v1H3V4zm0 2h8v1H3V6zm0 2h6v1H3V8z' })
      ]))
    case DataType.NUMBER:
      return defineComponent(() => h('svg', iconProps, [
        h('path', { d: 'M4 3v8h1V4h4v7h1V3H4z' })
      ]))
    case DataType.BOOLEAN:
      return defineComponent(() => h('svg', iconProps, [
        h('path', { d: 'M7 2L2 7l5 5 5-5-5-5zM7 4l3 3-3 3-3-3 3-3z' })
      ]))
    case DataType.NULL:
      return defineComponent(() => h('svg', iconProps, [
        h('circle', { cx: '7', cy: '7', r: '5', fill: 'none', stroke: 'currentColor', 'stroke-width': '1' }),
        h('line', { x1: '4.5', y1: '4.5', x2: '9.5', y2: '9.5', stroke: 'currentColor', 'stroke-width': '1' })
      ]))
    default:
      return defineComponent(() => h('div'))
  }
})

// 노드 토글
const toggleNode = () => {
  if (hasChildren.value) {
    store.toggleNode(props.node.id)
  }
}

// 노드 클릭 처리
const handleNodeClick = () => {
  if (hasChildren.value) {
    toggleNode()
  }
}

// 키보드 네비게이션
const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (hasChildren.value) {
        toggleNode()
      }
      break
    case 'ArrowRight':
      event.preventDefault()
      if (hasChildren.value && !props.node.isExpanded) {
        toggleNode()
      } else {
        // 다음 포커스 가능한 요소로 이동
        const nextElement = findNextFocusableElement(event.target as HTMLElement)
        if (nextElement) {
          nextElement.focus()
        }
      }
      break
    case 'ArrowLeft':
      event.preventDefault()
      if (hasChildren.value && props.node.isExpanded) {
        toggleNode()
      } else {
        // 이전 포커스 가능한 요소로 이동
        const prevElement = findPrevFocusableElement(event.target as HTMLElement)
        if (prevElement) {
          prevElement.focus()
        }
      }
      break
    case 'ArrowDown':
      event.preventDefault()
      const nextElement = findNextFocusableElement(event.target as HTMLElement)
      if (nextElement) {
        nextElement.focus()
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      const prevElement = findPrevFocusableElement(event.target as HTMLElement)
      if (prevElement) {
        prevElement.focus()
      }
      break
  }
}

// 다음 포커스 가능한 요소 찾기
const findNextFocusableElement = (current: HTMLElement): HTMLElement | null => {
  const treeNodes = Array.from(document.querySelectorAll('.node-content[tabindex="0"]'))
  const currentIndex = treeNodes.indexOf(current)
  return (treeNodes[currentIndex + 1] as HTMLElement) || null
}

// 이전 포커스 가능한 요소 찾기
const findPrevFocusableElement = (current: HTMLElement): HTMLElement | null => {
  const treeNodes = Array.from(document.querySelectorAll('.node-content[tabindex="0"]'))
  const currentIndex = treeNodes.indexOf(current)
  return (treeNodes[currentIndex - 1] as HTMLElement) || null
}
</script>

<style scoped>
.tree-node {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

.node-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 1rem;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background-color 0.15s ease;
  outline: none;
}

.node-content:hover {
  background: var(--color-background-alt);
}

.node-content:focus {
  background: var(--color-background-alt);
  box-shadow: 0 0 0 2px var(--color-secondary);
}

.expand-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 0.125rem;
  color: var(--color-text-muted);
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.expand-button:hover {
  background: var(--color-border);
  color: var(--color-text);
}

.expand-button svg {
  transition: transform 0.15s ease;
}

.expand-button svg.rotated {
  transform: rotate(90deg);
}

.expand-spacer {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.type-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* 타입별 색상 */
.type-object { color: var(--color-object); }
.type-array { color: var(--color-array); }
.type-string { color: var(--color-string); }
.type-number { color: var(--color-number); }
.type-boolean { color: var(--color-boolean); }
.type-null { color: var(--color-null); }

.node-key {
  font-weight: 600;
  color: var(--color-text);
  word-break: break-word;
}

.key-separator {
  color: var(--color-text-muted);
  margin: 0 0.25rem;
}

.node-value {
  word-break: break-word;
  flex: 1;
  min-width: 0;
}

/* 값 타입별 스타일 */
.value-string { color: var(--color-string); }
.value-number { color: var(--color-number); }
.value-boolean { color: var(--color-boolean); }
.value-null { 
  color: var(--color-null);
  font-style: italic;
}
.value-object,
.value-array {
  color: var(--color-text-muted);
  font-style: italic;
}

.collection-size {
  color: var(--color-text-muted);
  font-size: 0.75rem;
  margin-left: 0.5rem;
  flex-shrink: 0;
}

.node-children {
  position: relative;
  overflow: hidden;
}

/* 연결선 표시 */
.node-children::before {
  content: '';
  position: absolute;
  left: calc(var(--node-depth, 0) * 20px + 1rem + 8px);
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--color-border);
  opacity: 0.3;
}

/* 자식 노드 애니메이션 */
.node-children {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 1000px;
  }
}

/* 노드 호버 효과 개선 */
.node-content {
  position: relative;
}

.node-content::before {
  content: '';
  position: absolute;
  left: -1rem;
  right: -1rem;
  top: 0;
  bottom: 0;
  background: var(--color-background-alt);
  border-radius: 0.25rem;
  opacity: 0;
  transition: opacity 0.15s ease;
  z-index: -1;
}

.node-content:hover::before {
  opacity: 1;
}

.node-content:focus::before {
  opacity: 1;
  background: var(--color-secondary);
  opacity: 0.1;
}

/* 타입 아이콘 개선 */
.type-icon {
  position: relative;
  transition: transform 0.15s ease;
}

.node-content:hover .type-icon {
  transform: scale(1.1);
}

/* 값 복사 가능 표시 */
.node-value {
  position: relative;
  user-select: text;
}

.node-value:hover {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 0.125rem;
  padding: 0.125rem 0.25rem;
  margin: -0.125rem -0.25rem;
}

/* 지연 로딩 버튼 */
.load-more-container {
  padding: 0.5rem 1rem;
  margin-left: calc(var(--node-depth, 0) * 20px + 2rem);
}

.load-more-button {
  background: var(--color-background-alt);
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.load-more-button:hover:not(:disabled) {
  background: var(--color-secondary);
  color: white;
  border-color: var(--color-secondary);
}

.load-more-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 모바일 최적화 */
@media (max-width: 768px) {
  .tree-node {
    font-size: 0.8125rem;
  }
  
  .node-content {
    padding: 0.375rem 0.75rem;
    gap: 0.375rem;
  }
  
  .expand-button,
  .expand-spacer,
  .type-icon {
    width: 14px;
    height: 14px;
  }
  
  .expand-button svg {
    width: 10px;
    height: 10px;
  }
  
  .type-icon svg {
    width: 12px;
    height: 12px;
  }
  
  .collection-size {
    font-size: 0.6875rem;
  }
  
  .load-more-container {
    padding: 0.375rem 0.75rem;
    margin-left: calc(var(--node-depth, 0) * 20px + 1.5rem);
  }
  
  .load-more-button {
    padding: 0.375rem 0.75rem;
    font-size: 0.6875rem;
  }
}
</style>