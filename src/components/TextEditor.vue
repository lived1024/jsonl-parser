<template>
  <div class="text-editor">
    <div class="editor-container">
      <div class="editor-background">
        <div class="editor-grid"></div>
      </div>
      
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
      
      <div class="editor-overlay">
        <div class="line-numbers" v-if="showLineNumbers" ref="lineNumbersRef">
          <div 
            v-for="(line, index) in textLines" 
            :key="index"
            class="line-number"
            :style="{ height: `${1.6}em` }"
          >
            {{ index + 1 }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 숨겨진 설명 텍스트 -->
    <div id="json-description" class="sr-only">
      단일 JSON 객체나 배열을 입력하세요. 예: {"name": "홍길동", "age": 30}
    </div>
    <div id="jsonl-description" class="sr-only">
      한 줄에 하나씩 JSON 객체를 입력하세요. 각 줄은 유효한 JSON이어야 합니다.
    </div>
    
    <div class="editor-footer">
      <div class="editor-info" role="status" aria-live="polite">
        <div class="info-group">
          <div class="info-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            <span class="char-count" aria-label="문자 수">{{ formatNumber(charCount) }} chars</span>
          </div>
          <div v-if="lineCount > 1" class="info-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12h18m-9-9v18"/>
            </svg>
            <span class="line-count" aria-label="줄 수">{{ lineCount }} lines</span>
          </div>
        </div>
        
        <div class="editor-actions">
          <button 
            type="button" 
            class="action-button"
            @click="formatJson"
            :disabled="!inputText.trim() || store.inputType !== 'json'"
            title="Format JSON (Ctrl+Shift+F)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
            Format
          </button>
          
          <button 
            type="button" 
            class="action-button"
            @click="clearInput"
            :disabled="!inputText.trim()"
            title="Clear input (Ctrl+K)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
            Clear
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import useTextEditor from './TextEditor'

const {
  textareaRef,
  lineNumbersRef,
  store,
  inputText,
  placeholder,
  charCount,
  textLines,
  lineCount,
  showLineNumbers,
  formatNumber,
  formatJson,
  clearInput,
  handleInput,
  handleKeydown
} = useTextEditor()
</script>

<style scoped src="./TextEditor.css"></style>