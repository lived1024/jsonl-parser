import { computed, ref } from 'vue'
import { TypeIcon } from './icons'
import { SlideTransition } from './transitions'

interface TreeNode {
  id: string
  key?: string
  value: any
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'
  children?: TreeNode[]
}

interface Props {
  node: TreeNode
  level?: number
}

export default function useModernTreeNode(props: Props) {
  const isExpanded = ref(props.level < 2) // 기본적으로 2레벨까지 확장

  const hasChildren = computed(() => {
    return props.node.children && props.node.children.length > 0
  })

  const nodeIconType = computed(() => {
    if (hasChildren.value) {
      return isExpanded.value ? 'folder-open' : 'folder'
    }
    return props.node.type
  })

  const displayValue = computed(() => {
    switch (props.node.type) {
      case 'string':
        return `"${props.node.value}"`
      case 'null':
        return 'null'
      case 'boolean':
        return props.node.value ? 'true' : 'false'
      case 'object':
        return hasChildren.value ? '{...}' : '{}'
      case 'array':
        return hasChildren.value ? '[...]' : '[]'
      default:
        return String(props.node.value)
    }
  })

  const childrenCount = computed(() => {
    if (!hasChildren.value) return ''
    const count = props.node.children!.length
    return props.node.type === 'array' ? `[${count}]` : `{${count}}`
  })

  const nodeClasses = computed(() => ({
    'tree-node--expanded': isExpanded.value,
    'tree-node--has-children': hasChildren.value,
    [`tree-node--${props.node.type}`]: true,
    [`tree-node--level-${props.level}`]: true
  }))

  const valueClasses = computed(() => ({
    [`node-value--${props.node.type}`]: true
  }))

  const nodeStyle = computed(() => ({
    '--node-level': props.level
  }))

  const showTypeInfo = computed(() => {
    return props.node.type !== 'object' && props.node.type !== 'array'
  })

  const toggleExpanded = (event?: Event) => {
    if (event) {
      event.stopPropagation()
    }
    if (hasChildren.value) {
      isExpanded.value = !isExpanded.value
    }
  }

  const handleExpandClick = (event: Event) => {
    event.stopPropagation()
    toggleExpanded()
  }

  const handleKeydown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        event.stopPropagation()
        toggleExpanded()
        break
      case 'ArrowRight':
        if (hasChildren.value && !isExpanded.value) {
          event.preventDefault()
          event.stopPropagation()
          isExpanded.value = true
        }
        break
      case 'ArrowLeft':
        if (hasChildren.value && isExpanded.value) {
          event.preventDefault()
          event.stopPropagation()
          isExpanded.value = false
        }
        break
    }
  }

  return {
    // Components
    TypeIcon,
    SlideTransition,
    
    // Reactive state
    isExpanded,
    
    // Computed properties
    hasChildren,
    nodeIconType,
    displayValue,
    childrenCount,
    nodeClasses,
    valueClasses,
    nodeStyle,
    showTypeInfo,
    
    // Methods
    toggleExpanded,
    handleExpandClick,
    handleKeydown
  }
}

export type { TreeNode, Props }