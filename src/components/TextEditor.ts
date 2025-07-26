import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useJsonTreeStore } from '../stores'
import { InputType } from '../types'

export default function useTextEditor() {
  const store = useJsonTreeStore()
  const textareaRef = ref<HTMLTextAreaElement>()
  const lineNumbersRef = ref<HTMLDivElement>()
  const parseTimeout = ref<number>()

  // 입력 텍스트 양방향 바인딩
  const inputText = computed({
    get: () => store.inputText,
    set: (value: string) => store.setInputText(value)
  })

  // 플레이스홀더 텍스트
  const placeholder = computed(() => {
    if (store.inputType === InputType.JSON) {
      return `JSON 데이터를 입력하세요...

예시:
{
  "name": "홍길동",
  "age": 30,
  "hobbies": ["독서", "영화감상"]
}`
    } else {
      return `JSONL 데이터를 입력하세요 (한 줄에 하나의 JSON)...

예시:
{"name": "홍길동", "age": 30}
{"name": "김철수", "age": 25}
{"name": "이영희", "age": 28}`
    }
  })

  // 문자 수 계산
  const charCount = computed(() => inputText.value.length)

  // 텍스트 줄 배열
  const textLines = computed(() => {
    if (!inputText.value) return ['']
    return inputText.value.split('\n')
  })

  // 줄 수 계산
  const lineCount = computed(() => textLines.value.length)

  // 라인 넘버 표시 여부
  const showLineNumbers = computed(() => lineCount.value > 1)

  // 숫자 포맷팅
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  // JSON 포맷팅
  const formatJson = () => {
    try {
      const parsed = JSON.parse(inputText.value)
      inputText.value = JSON.stringify(parsed, null, 2)
    } catch (error) {
      // 에러 시 아무것도 하지 않음
    }
  }

  // 입력 초기화
  const clearInput = () => {
    inputText.value = ''
    textareaRef.value?.focus()
  }

  // 입력 처리
  const handleInput = () => {
    // 디바운싱을 위해 약간의 지연 후 파싱 실행
    clearTimeout(parseTimeout.value)
    parseTimeout.value = setTimeout(() => {
      if (inputText.value.trim()) {
        store.parseInput()
      }
    }, 300)
  }

  // 키보드 단축키 처리
  const handleKeydown = (event: KeyboardEvent) => {
    // Ctrl+A (전체 선택)
    if (event.ctrlKey && event.key === 'a') {
      event.preventDefault()
      textareaRef.value?.select()
      return
    }

    // Ctrl+Enter (강제 파싱)
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault()
      store.parseInput()
      return
    }

    // Tab 키 처리 (들여쓰기)
    if (event.key === 'Tab') {
      event.preventDefault()
      const textarea = textareaRef.value
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const value = textarea.value

      if (event.shiftKey) {
        // Shift+Tab: 들여쓰기 제거
        const lineStart = value.lastIndexOf('\n', start - 1) + 1
        const lineText = value.substring(lineStart, start)

        if (lineText.startsWith('  ')) {
          const newValue = value.substring(0, lineStart) +
            lineText.substring(2) +
            value.substring(start)
          inputText.value = newValue

          nextTick(() => {
            textarea.selectionStart = start - 2
            textarea.selectionEnd = end - 2
          })
        }
      } else {
        // Tab: 들여쓰기 추가
        const newValue = value.substring(0, start) + '  ' + value.substring(end)
        inputText.value = newValue

        nextTick(() => {
          textarea.selectionStart = start + 2
          textarea.selectionEnd = end + 2
        })
      }
    }
  }

  // 컴포넌트 마운트 시 포커스
  onMounted(() => {
    textareaRef.value?.focus()
  })

  // 입력 타입 변경 시 파싱 재실행
  watch(() => store.inputType, () => {
    if (inputText.value.trim()) {
      store.parseInput()
    }
  })

  return {
    // Refs
    textareaRef,
    lineNumbersRef,

    // Store
    store,

    // Computed properties
    inputText,
    placeholder,
    charCount,
    textLines,
    lineCount,
    showLineNumbers,

    // Methods
    formatNumber,
    formatJson,
    clearInput,
    handleInput,
    handleKeydown
  }
}