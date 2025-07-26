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
  X as XIcon
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
    
    // Methods
    retryParsing,
    clearInput,
    dismissPartialError
  }
}