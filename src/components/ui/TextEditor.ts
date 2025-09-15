import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useJsonTreeStore } from '../../stores'
import { InputType } from '../../types'
import { useI18n } from '../../composables/useI18n'

export default function useTextEditor() {
  const store = useJsonTreeStore()
  const { t } = useI18n()
  const textareaRef = ref<HTMLTextAreaElement>()
  const lineNumbersRef = ref<HTMLDivElement>()
  const parseTimeout = ref<number>()
  const isDragOver = ref(false)
  const isFileLoading = ref(false)

  // 입력 텍스트 양방향 바인딩
  const inputText = computed({
    get: () => store.inputText,
    set: (value: string) => store.setInputText(value)
  })

  // 플레이스홀더 텍스트
  const placeholder = computed(() => {
    if (store.inputType === InputType.JSON) {
      return t('editor.placeholders.json')
    } else {
      return t('editor.placeholders.jsonl')
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

  // 전체 로딩 상태 (파일 로딩 + 스토어 파싱)
  const isOverallLoading = computed(() => isFileLoading.value || store.isLoading)

  // 오류 정보
  const errorInfo = computed(() => store.getErrorLineInfo())
  
  // 오류가 있는 줄인지 확인
  const isErrorLine = (lineNumber: number) => {
    return errorInfo.value && errorInfo.value.lineNumber === lineNumber
  }

  // 오류 위치 계산 (픽셀 단위)
  const getErrorPosition = computed(() => {
    if (!errorInfo.value || !textareaRef.value) return null
    
    const { lineNumber, columnNumber } = errorInfo.value
    const lineHeight = 1.6 * 14 // line-height * font-size (em to px)
    const charWidth = 8.4 // 모노스페이스 폰트의 대략적인 문자 너비
    
    return {
      top: (lineNumber - 1) * lineHeight,
      left: columnNumber * charWidth
    }
  })

  // 숫자 포맷팅
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  // JSON 유효성 검사
  const isInputValidJson = computed(() => {
    try {
      JSON.parse(inputText.value)
      return true
    } catch (e) {
      return false
    }
  })

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

  // 파일 읽기 함수
  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result
        if (typeof result === 'string') {
          resolve(result)
        } else {
          reject(new Error(t('editor.errors.fileReadAsTextFailed')))
        }
      }
      reader.onerror = () => reject(new Error(t('editor.errors.fileReadFailed')))
      reader.readAsText(file, 'utf-8')
    })
  }

  // 파일 타입 감지 함수
  const detectFileType = (filename: string, content: string): InputType => {
    // 파일 확장자로 먼저 판단
    if (filename.toLowerCase().endsWith('.jsonl')) {
      return InputType.JSONL
    }
    if (filename.toLowerCase().endsWith('.json')) {
      return InputType.JSON
    }
    
    // 내용으로 판단 - JSONL은 여러 줄에 각각 JSON 객체가 있음
    const lines = content.trim().split('\n')
    if (lines.length > 1) {
      // 각 줄이 유효한 JSON인지 확인
      const validJsonLines = lines.filter(line => {
        const trimmed = line.trim()
        if (!trimmed) return false
        try {
          JSON.parse(trimmed)
          return true
        } catch {
          return false
        }
      })
      
      // 대부분의 줄이 유효한 JSON이면 JSONL로 판단
      if (validJsonLines.length >= lines.length * 0.8) {
        return InputType.JSONL
      }
    }
    
    // 기본값은 JSON
    return InputType.JSON
  }

  // 드래그 앤 드롭 이벤트 핸들러
  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    isDragOver.value = true
  }

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    // 실제로 컨테이너를 벗어났는지 확인
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const x = event.clientX
    const y = event.clientY
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      isDragOver.value = false
    }
  }

  const handleDrop = async (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    isDragOver.value = false

    // 드롭 즉시 로딩 시작
    isFileLoading.value = true

    const files = event.dataTransfer?.files
    if (!files || files.length === 0) {
      isFileLoading.value = false
      return
    }

    const file = files[0]
    
    // JSON 또는 JSONL 파일만 허용
    const allowedExtensions = ['.json', '.jsonl']
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    
    if (!allowedExtensions.includes(fileExtension)) {
      // 에러 메시지 표시 (향후 토스트 알림으로 개선 가능)
      console.warn(t('editor.errors.unsupportedFileType'))
      isFileLoading.value = false
      return
    }

    try {
      const content = await readFile(file)
      const detectedType = detectFileType(file.name, content)
      const currentType = store.inputType
      
      // 입력 타입 설정
      store.setInputType(detectedType)
      
      // 내용 설정
      inputText.value = content
      
      // 타입이 동일한 경우 명시적으로 파싱 호출
      if (currentType === detectedType) {
        // nextTick을 사용하여 inputText 설정이 완료된 후 파싱
        await nextTick()
        store.parseInput()
      }
      
      // 스토어의 파싱이 완료될 때까지 대기
      await nextTick()
      
      // 스토어 로딩이 완료될 때까지 추가 대기
      while (store.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      
      // 포커스
      textareaRef.value?.focus()
      
    } catch (error) {
      console.error(t('editor.errors.fileReadFailed'), error)
    } finally {
      // 로딩 종료 (최소 표시 시간 보장)
      setTimeout(() => {
        isFileLoading.value = false
      }, 200)
    }
  }

  // 스크롤 동기화
  const syncLineNumbersScroll = () => {
    const textarea = textareaRef.value
    const lineNumbers = lineNumbersRef.value
    
    if (textarea && lineNumbers) {
      lineNumbers.style.transform = `translateY(-${textarea.scrollTop}px)`
      
      // 오류 마커와 하이라이트도 스크롤과 동기화
      const errorMarker = document.querySelector('.error-marker') as HTMLElement
      const errorHighlight = document.querySelector('.error-line-highlight') as HTMLElement
      
      if (errorMarker) {
        errorMarker.style.transform = `translateY(-${textarea.scrollTop}px)`
      }
      
      if (errorHighlight) {
        errorHighlight.style.transform = `translateY(-${textarea.scrollTop}px)`
      }
    }
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

    // Alt+Enter (강제 파싱)
    if (event.altKey && event.key === 'Enter') {
      event.preventDefault()
      store.parseInput()
      return
    }

    // Alt+Shift+F (JSON 포맷팅)
    if (event.altKey && event.shiftKey && event.key === 'F') {
      event.preventDefault()
      if (isInputValidJson.value && store.inputType === 'json') {
        formatJson()
      }
      return
    }

    // Home/End 키 처리 (스크롤 위치 조정)
    if (event.key === 'Home' || event.key === 'End') {
      const textarea = textareaRef.value
      if (!textarea) return

      if (event.ctrlKey) {
        // Ctrl+Home/End: 문서 전체의 시작/끝으로 이동
        // 기본 동작을 허용하고 스크롤 조정
        nextTick(() => {
          if (event.key === 'Home') {
            textarea.scrollLeft = 0
            textarea.scrollTop = 0
          } else {
            textarea.scrollLeft = textarea.scrollWidth - textarea.clientWidth
            textarea.scrollTop = textarea.scrollHeight - textarea.clientHeight
          }
        })
      } else {
        // Home/End: 현재 줄의 시작/끝으로 이동
        event.preventDefault()
        
        const start = textarea.selectionStart
        const value = textarea.value
        
        if (event.key === 'Home') {
          // 현재 줄의 시작으로 이동
          const lineStart = value.lastIndexOf('\n', start - 1) + 1
          textarea.selectionStart = lineStart
          textarea.selectionEnd = lineStart
          
          // 스크롤을 왼쪽으로 조정
          nextTick(() => {
            textarea.scrollLeft = 0
          })
        } else {
          // 현재 줄의 끝으로 이동
          let lineEnd = value.indexOf('\n', start)
          if (lineEnd === -1) lineEnd = value.length
          
          textarea.selectionStart = lineEnd
          textarea.selectionEnd = lineEnd
          
          // 커서 위치가 보이도록 스크롤 조정
          nextTick(() => {
            // 커서가 화면에 보이도록 스크롤 조정
            const cursorPosition = textarea.selectionStart
            const beforeCursor = value.substring(0, cursorPosition)
            const currentLineStart = beforeCursor.lastIndexOf('\n') + 1
            const currentLineText = value.substring(currentLineStart, cursorPosition)
            
            // 대략적인 문자 너비 계산 (모노스페이스 폰트 기준)
            const charWidth = 8 // 픽셀 단위 추정값
            const cursorX = currentLineText.length * charWidth
            
            // 커서가 보이도록 스크롤 조정
            if (cursorX > textarea.scrollLeft + textarea.clientWidth - 50) {
              textarea.scrollLeft = cursorX - textarea.clientWidth + 100
            }
          })
        }
      }
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

  // 컴포넌트 마운트 시 포커스 및 스크롤 이벤트 리스너 등록
  onMounted(() => {
    textareaRef.value?.focus()
    
    // 스크롤 이벤트 리스너 등록
    const textarea = textareaRef.value
    if (textarea) {
      textarea.addEventListener('scroll', syncLineNumbersScroll)
    }
  })

  // 컴포넌트 언마운트 시 이벤트 리스너 제거
  onUnmounted(() => {
    const textarea = textareaRef.value
    if (textarea) {
      textarea.removeEventListener('scroll', syncLineNumbersScroll)
    }
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
    isInputValidJson,
    isDragOver,
    isFileLoading,
    isOverallLoading,

    // Methods
    formatNumber,
    formatJson,
    clearInput,
    handleInput,
    handleKeydown,
    isErrorLine,

    // Drag and drop handlers
    handleDragOver,
    handleDragLeave,
    handleDrop,

    // Error handling
    errorInfo,
    getErrorPosition
  }
}