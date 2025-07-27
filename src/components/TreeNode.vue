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
import { ParsedNode } from '../types'
import useTreeNode from './TreeNode'

interface Props {
  node: ParsedNode
}

const props = defineProps<Props>()

const {
  isLoadingMore,
  shouldUseLazyLoading,
  visibleChildren,
  hasMoreChildren,
  remainingChildrenCount,
  loadMoreChildren,
  hasChildren,
  collectionSize,
  displayValue,
  typeIcon,
  toggleNode,
  handleNodeClick,
  handleKeydown
} = useTreeNode(props)
</script>

<style scoped src="./TreeNode.css"></style>