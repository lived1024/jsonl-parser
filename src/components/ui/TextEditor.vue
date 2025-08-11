<template>
  <div class="text-editor">
    <!-- 파일 로딩 스피너 -->
    <LoadingSpinner 
      :is-visible="isOverallLoading"
      :title="t('editor.loading.title')"
      :description="t('editor.loading.description')"
    />
    
    <div 
      class="editor-container"
      :class="{ 'editor-container--drag-over': isDragOver }"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div class="editor-background">
        <div class="editor-grid"></div>
      </div>
      
      <!-- 드래그 오버레이 -->
      <div v-if="isDragOver" class="drag-overlay">
        <div class="drag-overlay-content">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="12" y1="11" x2="12" y2="17"/>
            <polyline points="9,14 12,11 15,14"/>
          </svg>
          <h3>{{ t('editor.dragDrop.title') }}</h3>
          <p>{{ t('editor.dragDrop.description') }}</p>
        </div>
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
        :aria-label="t('accessibility.jsonInput')"
        :aria-describedby="store.inputType === 'json' ? 'json-description' : 'jsonl-description'"
        aria-multiline="true"
      ></textarea>
      
      <div class="editor-overlay">
        <div class="line-numbers" v-if="showLineNumbers" ref="lineNumbersRef">
          <div 
            v-for="(line, index) in textLines" 
            :key="index"
            class="line-number"
            :class="{ 'line-number--error': isErrorLine(index + 1) }"
            :style="{ height: `${1.6}em` }"
          >
            {{ index + 1 }}
          </div>
        </div>
        
        <!-- 오류 위치 표시 -->
        <div 
          v-if="errorInfo && getErrorPosition" 
          class="error-marker"
          :style="{
            top: `${getErrorPosition.top + 24}px`,
            left: `${getErrorPosition.left + 56}px`
          }"
          :title="store.parseError?.message"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        
        <!-- 오류 줄 하이라이트 -->
        <div 
          v-if="errorInfo" 
          class="error-line-highlight"
          :style="{
            top: `${(errorInfo.lineNumber - 1) * 1.6 * 14 + 24}px`,
            height: `${1.6 * 14}px`
          }"
        ></div>
      </div>
    </div>
    
    <!-- 숨겨진 설명 텍스트 -->
    <div id="json-description" class="sr-only">
      {{ t('editor.descriptions.json') }}
    </div>
    <div id="jsonl-description" class="sr-only">
      {{ t('editor.descriptions.jsonl') }}
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
            <span class="char-count" :aria-label="t('editor.info.chars', { count: formatNumber(charCount) })">{{ t('editor.info.chars', { count: formatNumber(charCount) }) }}</span>
          </div>
          <div v-if="lineCount > 1" class="info-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12h18m-9-9v18"/>
            </svg>
            <span class="line-count" :aria-label="t('editor.info.lines', { count: lineCount })">{{ t('editor.info.lines', { count: lineCount }) }}</span>
          </div>
        </div>
        
        <div class="editor-actions">
          <button 
            type="button" 
            class="action-button"
            @click="formatJson"
            :disabled="!isInputValidJson || store.inputType !== 'json'"
            :title="t('editor.actions.formatTitle')"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
            {{ t('editor.actions.format') }}
          </button>
          
          <button 
            type="button" 
            class="action-button"
            @click="clearInput"
            :disabled="!inputText.trim()"
            :title="t('editor.actions.clearTitle')"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
            {{ t('editor.actions.clear') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import useTextEditor from './TextEditor'
import LoadingSpinner from './LoadingSpinner.vue'
import { useI18n } from '../../composables/useI18n'

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
  handleKeydown,
  isInputValidJson,
  isErrorLine,
  errorInfo,
  getErrorPosition,
  isDragOver,
  isFileLoading,
  isOverallLoading,
  handleDragOver,
  handleDragLeave,
  handleDrop
} = useTextEditor()

const { t } = useI18n()
</script>

<style scoped src="./TextEditor.css"></style>