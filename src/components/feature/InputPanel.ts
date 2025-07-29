import { useJsonTreeStore } from '../../stores'
import { InputType } from '../../types'
import TextEditor from '../ui/TextEditor.vue'
import StatusIndicator from '../ui/StatusIndicator.vue'

export default function useInputPanel() {
  const store = useJsonTreeStore()

  const handleTypeChange = () => {
    // 타입 변경 시 자동으로 파싱 재실행 (스토어에서 처리됨)
  }

  return {
    // Components
    TextEditor,
    StatusIndicator,
    
    // Store
    store,
    
    // Constants
    InputType,
    
    // Methods
    handleTypeChange
  }
}