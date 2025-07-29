import { computed } from 'vue'
import { Network as NodesIcon } from 'lucide-vue-next'
import { useJsonTreeStore } from '../../stores'

export default function useStatusIndicator() {
  const store = useJsonTreeStore()

  // 오류 위치 정보 표시 여부
  const errorLocation = computed(() => {
    const error = store.parseError
    return error && (error.line || error.column || error.position)
  })

  // 노드 개수 계산
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

  // JSONL 줄 수 계산
  const lineCount = computed(() => {
    if (store.inputType !== 'jsonl') return 0
    return store.parsedData.length
  })

  // 숫자 포맷팅
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  return {
    NodesIcon,
    store,
    errorLocation,
    nodeCount,
    lineCount,
    formatNumber
  }
}