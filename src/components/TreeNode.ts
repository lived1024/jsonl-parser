import { computed, defineComponent, h, ref } from 'vue'
import { useJsonTreeStore } from '../stores'
import { ParsedNode, DataType } from '../types'

export default function useTreeNode(props: { node: ParsedNode }) {
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

  return {
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
  }
}