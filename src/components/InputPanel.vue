<template>
  <div class="input-panel" role="region" aria-labelledby="input-panel-title">
    <div class="panel-header">
      <div class="header-title">
        <div class="title-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
        </div>
        <div class="title-content">
          <h2 id="input-panel-title">JSON Input</h2>
          <p class="title-description">Paste your JSON or JSONL data</p>
        </div>
      </div>
      
      <fieldset class="input-type-selector" aria-label="입력 형식 선택">
        <legend class="sr-only">JSON 입력 형식을 선택하세요</legend>
        <div class="radio-group">
          <label class="radio-option" :class="{ 'radio-option--active': store.inputType === InputType.JSON }">
            <input 
              type="radio" 
              :value="InputType.JSON" 
              v-model="store.inputType"
              @change="handleTypeChange"
              aria-describedby="json-description"
            />
            <span class="radio-text">JSON</span>
            <span class="radio-description">Objects & Arrays</span>
          </label>
          <label class="radio-option" :class="{ 'radio-option--active': store.inputType === InputType.JSONL }">
            <input 
              type="radio" 
              :value="InputType.JSONL" 
              v-model="store.inputType"
              @change="handleTypeChange"
              aria-describedby="jsonl-description"
            />
            <span class="radio-text">JSONL</span>
            <span class="radio-description">Line-delimited</span>
          </label>
        </div>
      </fieldset>
    </div>
    
    <div class="panel-content">
      <TextEditor />
    </div>
    
    <div class="panel-footer">
      <StatusIndicator />
    </div>
  </div>
</template>

<script setup lang="ts">
import useInputPanel from './InputPanel'

const {
  TextEditor,
  StatusIndicator,
  store,
  InputType,
  handleTypeChange
} = useInputPanel()
</script>

<style scoped src="./InputPanel.css"></style>