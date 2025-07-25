<template>
  <div class="text-editor">
    <textarea
      ref="textareaRef"
      v-model="inputText"
      @input="handleInput"
      @keydown="handleKeydown"
      :placeholder="placeholder"
      class="editor-textarea"
      spellcheck="false"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      role="textbox"
      aria-label="JSON 데이터 입력"
      :aria-describedby="store.inputType === 'json' ? 'json-description' : 'jsonl-description'"
      aria-multiline="true"
    ></textarea>
    
    <!-- 숨겨진 설명 텍스트 -->
    <div id="json-description" class="sr-only">
      단일 JSON 객체나 배열을 입력하세요. 예: {"name": "홍길동", "age": 30}
    </div>
    <div id="jsonl-description" class="sr-only">
      한 줄에 하나씩 JSON 객체를 입력하세요. 각 줄은 유효한 JSON이어야 합니다.
    </div>
    
    <div class="editor-info" role="status" aria-live="polite">
      <span class="char-count" aria-label="문자 수">{{ charCount }} 문자</span>
      <span v-if="lineCount > 1" class="line-count" aria-label="줄 수">{{ lineCount }} 줄</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useJsonTreeStore } from '../stores'
import { InputType } from '../types'

const store = useJsonTreeStore()
const textareaRef = ref<HTMLTextAreaElement>()

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

// 줄 수 계산
const lineCount = computed(() => {
  if (!inputText.value) return 0
  return inputText.value.split('\n').length
})

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

const parseTimeout = ref<number>()

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
</script>

<style scoped>
.text-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-textarea {
  flex: 1;
  width: 100%;
  padding: 1rem;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  background: var(--color-background-alt);
  color: var(--color-text);
  overflow-y: auto;
}

.editor-textarea::placeholder {
  color: var(--color-text-muted);
  opacity: 0.7;
}

.editor-textarea:focus {
  background: var(--color-background);
}

.editor-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--color-background);
  border-top: 1px solid var(--color-border);
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.char-count,
.line-count {
  font-variant-numeric: tabular-nums;
}

/* 스크롤바 스타일링 */
.editor-textarea::-webkit-scrollbar {
  width: 8px;
}

.editor-textarea::-webkit-scrollbar-track {
  background: transparent;
}

.editor-textarea::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

.editor-textarea::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted);
}

/* 스크린 리더 전용 텍스트 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 모바일 최적화 */
@media (max-width: 768px) {
  .editor-textarea {
    padding: 0.75rem;
    font-size: 0.8125rem;
  }
  
  .editor-info {
    padding: 0.375rem 0.75rem;
    font-size: 0.6875rem;
  }
}
</style>