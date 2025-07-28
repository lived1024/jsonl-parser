<template>
  <div 
    class="tree-node"
    :class="nodeClasses"
    :style="nodeStyle"
    role="treeitem"
    :aria-expanded="hasChildren ? isExpanded : undefined"
    :aria-level="level"
  >
    <div 
      class="node-content"
      :tabindex="0"
      @click.stop="toggleExpanded"
      @keydown="handleKeydown"
    >
      <!-- 들여쓰기 가이드 라인 -->
      <div class="indent-guides">
        <div 
          v-for="i in level" 
          :key="i" 
          class="indent-guide"
          :class="{ 'indent-guide--last': i === level }"
        />
      </div>
      
      <!-- 확장/축소 버튼 -->
      <button
        v-if="hasChildren"
        type="button"
        class="expand-button"
        :class="{ 'expand-button--expanded': isExpanded }"
        @click.stop="handleExpandClick"
        :aria-label="isExpanded ? '축소' : '확장'"
      >
        <TypeIcon 
          :type="isExpanded ? 'collapse' : 'expand'" 
          :size="14"
          :stroke-width="2.5"
        />
      </button>
      <div v-else class="expand-spacer" />
      
      <!-- 노드 아이콘 -->
      <div class="node-icon">
        <TypeIcon 
          :type="nodeIconType" 
          :size="16"
          :stroke-width="2"
        />
      </div>
      
      <!-- 노드 정보 -->
      <div class="node-info">
        <div class="node-header">
          <span v-if="node.key" class="node-key">{{ node.key }}</span>
          <span class="node-separator" v-if="node.key">:</span>
          <span class="node-value" :class="valueClasses">{{ displayValue }}</span>
          <span v-if="hasChildren" class="node-count">{{ childrenCount }}</span>
        </div>
        
        <div v-if="showTypeInfo" class="node-meta">
          <span class="node-type">{{ node.type }}</span>
          <span v-if="node.type === 'string'" class="node-length">{{ node.value.length }} chars</span>
          <span v-if="node.type === 'array'" class="node-length">{{ node.children?.length }} items</span>
          <span v-if="node.type === 'object'" class="node-length">{{ Object.keys(node.children || {}).length }} keys</span>
        </div>
      </div>
    </div>
    
    <!-- 자식 노드들 -->
    <SlideTransition direction="down" v-if="hasChildren && isExpanded">
      <div class="children-container" role="group" @click.stop>
        <ModernTreeNode
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :level="level + 1"
        />
      </div>
    </SlideTransition>
  </div>
</template>

<script setup lang="ts">
import useModernTreeNode, { type Props } from './ModernTreeNode'

const props = withDefaults(defineProps<Props>(), {
  level: 0
})

const {
  TypeIcon,
  SlideTransition,
  isExpanded,
  hasChildren,
  nodeIconType,
  displayValue,
  childrenCount,
  nodeClasses,
  valueClasses,
  nodeStyle,
  showTypeInfo,
  toggleExpanded,
  handleExpandClick,
  handleKeydown
} = useModernTreeNode(props)
</script>

<style scoped src="./ModernTreeNode.css"></style>