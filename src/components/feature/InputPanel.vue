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
          <h2 id="input-panel-title">{{ t('input.title') }}</h2>
          <p class="title-description">{{ t('input.description') }}</p>
        </div>
      </div>
      
      <div class="input-type-selector">
        <div class="type-tabs">
          <label class="type-tab json-tab" :class="{ 'type-tab--active': store.inputType === InputType.JSON }">
            <input 
              type="radio" 
              :value="InputType.JSON" 
              v-model="store.inputType"
              @change="handleTypeChange"
              aria-describedby="json-description"
            />
            <div class="tab-icon json-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
            </div>
            <div class="tab-content">
              <span class="tab-name">{{ t('input.json.name') }}</span>
              <span class="tab-desc">{{ t('input.json.description') }}</span>
            </div>
          </label>
          
          <label class="type-tab jsonl-tab" :class="{ 'type-tab--active': store.inputType === InputType.JSONL }">
            <input 
              type="radio" 
              :value="InputType.JSONL" 
              v-model="store.inputType"
              @change="handleTypeChange"
              aria-describedby="jsonl-description"
            />
            <div class="tab-icon jsonl-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M8 6h13"/>
                <path d="M8 12h13"/>
                <path d="M8 18h13"/>
                <path d="M3 6h.01"/>
                <path d="M3 12h.01"/>
                <path d="M3 18h.01"/>
              </svg>
            </div>
            <div class="tab-content">
              <span class="tab-name">{{ t('input.jsonl.name') }}</span>
              <span class="tab-desc">{{ t('input.jsonl.description') }}</span>
            </div>
          </label>
        </div>
      </div>
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
import { useI18n } from '../../composables/useI18n'

const {
  TextEditor,
  StatusIndicator,
  store,
  InputType,
  handleTypeChange
} = useInputPanel()

const { t } = useI18n()
</script>

<style scoped src="./InputPanel.css"></style>