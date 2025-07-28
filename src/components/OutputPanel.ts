import { computed } from 'vue'
import {
  TreePine as TreePineIcon,
  Sparkles as SparklesIcon,
  AlertTriangle as AlertTriangleIcon,
  RefreshCw as RefreshCwIcon,
  Keyboard as KeyboardIcon,
  Zap as ZapIcon,
  Layers as LayersIcon,
  FileText as FileTextIcon,
  Network as NodesIcon,
  Trash as TrashIcon,
  X as XIcon,
  ChevronDown as ExpandAllIcon,
  ChevronRight as CollapseAllIcon
} from 'lucide-vue-next'
import { useJsonTreeStore } from '../stores'
import ModernTreeNode from './ModernTreeNode.vue'
import { TypeIcon } from './icons'
import { FadeTransition, SlideTransition } from './transitions'

export default function useOutputPanel() {
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

  // 최대 깊이 계산
  const maxDepth = computed(() => {
    const getMaxDepth = (nodes: any[], currentDepth = 0): number => {
      let maxDepth = currentDepth
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          const childDepth = getMaxDepth(node.children, currentDepth + 1)
          maxDepth = Math.max(maxDepth, childDepth)
        }
      }
      return maxDepth
    }

    return getMaxDepth(store.parsedData)
  })

  // 오류 위치 정보 표시 여부
  const errorLocation = computed(() => {
    const error = store.parseError
    return error && (error.line || error.column || error.position)
  })

  // 파싱 재시도
  const retryParsing = () => {
    store.parseInput()
  }

  // 입력 초기화
  const clearInput = () => {
    store.setInputText('')
  }

  // 부분적 오류 배너 닫기
  const dismissPartialError = () => {
    // 부분적 오류 상태를 숨기는 로직 (필요시 스토어에 추가)
  }

  // 레벨 버튼 배열 생성
  const levelButtons = computed(() => {
    const depth = maxDepth.value
    if (depth <= 0) return []

    // 최대 15개 레벨까지 표시 (실용적인 제한)
    const maxLevels = Math.min(depth + 1, 15)
    return Array.from({ length: maxLevels }, (_, i) => i + 1)
  })

  // 레벨 컨트롤이 스크롤 필요한지 확인
  const needsScroll = computed(() => {
    return levelButtons.value.length > 8
  })

  // 트리 제어 메서드들
  const expandAll = () => {
    store.expandAllNodes()
  }

  const collapseAll = () => {
    store.collapseAllNodes()
  }

  const expandToLevel = (level: number) => {
    store.expandToLevel(level)
  }

  return {
    // Icons
    TreePineIcon,
    SparklesIcon,
    AlertTriangleIcon,
    RefreshCwIcon,
    KeyboardIcon,
    ZapIcon,
    LayersIcon,
    FileTextIcon,
    NodesIcon,
    TrashIcon,
    XIcon,
    ExpandAllIcon,
    CollapseAllIcon,

    // Components
    ModernTreeNode,
    TypeIcon,
    FadeTransition,
    SlideTransition,

    // Store
    store,

    // Computed properties
    nodeCount,
    maxDepth,
    errorLocation,
    levelButtons,
    needsScroll,

    // Methods
    retryParsing,
    clearInput,
    dismissPartialError,
    expandAll,
    collapseAll,
    expandToLevel
  }
}