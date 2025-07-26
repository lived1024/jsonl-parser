<template>
  <component 
    :is="iconComponent" 
    :size="size" 
    :stroke-width="strokeWidth"
    :class="iconClass"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  FolderOpen,
  Folder,
  FileText,
  Hash,
  Type,
  ToggleLeft,
  Minus,
  ChevronRight,
  ChevronDown
} from 'lucide-vue-next'

interface Props {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null' | 'folder' | 'folder-open' | 'expand' | 'collapse'
  size?: number
  strokeWidth?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 16,
  strokeWidth: 2
})

const iconComponent = computed(() => {
  switch (props.type) {
    case 'object':
      return Folder
    case 'array':
      return FileText
    case 'string':
      return Type
    case 'number':
      return Hash
    case 'boolean':
      return ToggleLeft
    case 'null':
      return Minus
    case 'folder':
      return Folder
    case 'folder-open':
      return FolderOpen
    case 'expand':
      return ChevronRight
    case 'collapse':
      return ChevronDown
    default:
      return FileText
  }
})

const iconClass = computed(() => {
  return `type-icon type-icon--${props.type}`
})
</script>

<style scoped>
.type-icon {
  transition: all var(--transition-fast);
}

.type-icon--object {
  color: var(--color-object);
}

.type-icon--array {
  color: var(--color-array);
}

.type-icon--string {
  color: var(--color-string);
}

.type-icon--number {
  color: var(--color-number);
}

.type-icon--boolean {
  color: var(--color-boolean);
}

.type-icon--null {
  color: var(--color-null);
}

.type-icon--folder,
.type-icon--folder-open {
  color: var(--color-primary);
}

.type-icon--expand,
.type-icon--collapse {
  color: var(--color-text-muted);
}
</style>