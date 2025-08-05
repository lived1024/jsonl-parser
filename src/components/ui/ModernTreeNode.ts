import { computed, ref } from 'vue'
import TypeIcon from '../icons/TypeIcon.vue'
import SlideTransition from '../transitions/SlideTransition.vue'
import TextModal from './TextModal.vue'
import { useJsonTreeStore } from '../../stores'
import type { ParsedNode } from '../../types'

interface Props {
  node: ParsedNode
  level?: number
}

export default function useModernTreeNode(props: Props) {
  const store = useJsonTreeStore()
  const showTextModal = ref(false)

  const isExpanded = computed(() => props.node.isExpanded)

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
      case 'string': {
        const stringValue = String(props.node.value || '')
        if (store.preserveLineBreaks) {
          // 줄바꿈을 보존하여 표시
          return `"${stringValue}"`
        } else {
          // 줄바꿈 문자를 시각적으로 표시
          const processedValue = stringValue
            .replace(/\r\n/g, '\\r\\n')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
          return `"${processedValue}"`
        }
      }
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

  const isStringValue = computed(() => {
    return props.node.type === 'string' && typeof props.node.value === 'string' && props.node.value !== null
  })

  const toggleExpanded = (event?: Event) => {
    if (event) {
      event.stopPropagation()
    }
    if (hasChildren.value) {
      store.toggleNode(props.node.id)
    }
  }

  const handleExpandClick = (event: Event) => {
    event.stopPropagation()
    toggleExpanded()
  }

  const handleValueClick = (event: Event) => {
    if (isStringValue.value && typeof props.node.value === 'string' && props.node.value !== null) {
      event.stopPropagation()
      showTextModal.value = true
    }
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
          store.toggleNode(props.node.id)
        }
        break
      case 'ArrowLeft':
        if (hasChildren.value && isExpanded.value) {
          event.preventDefault()
          event.stopPropagation()
          store.toggleNode(props.node.id)
        }
        break
    }
  }

  return {
    // Components
    TypeIcon,
    SlideTransition,
    TextModal,
    
    // Store
    store,
    
    // Reactive state
    isExpanded,
    showTextModal,
    
    // Computed properties
    hasChildren,
    nodeIconType,
    displayValue,
    childrenCount,
    nodeClasses,
    valueClasses,
    nodeStyle,
    showTypeInfo,
    isStringValue,
    
    // Methods
    toggleExpanded,
    handleExpandClick,
    handleKeydown,
    handleValueClick
  }
}

export type { Props }