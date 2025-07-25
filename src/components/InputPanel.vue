<template>
  <div class="input-panel" role="region" aria-labelledby="input-panel-title">
    <div class="panel-header">
      <h2 id="input-panel-title">입력</h2>
      <fieldset class="input-type-selector" aria-label="입력 형식 선택">
        <legend class="sr-only">JSON 입력 형식을 선택하세요</legend>
        <label class="radio-label">
          <input 
            type="radio" 
            :value="InputType.JSON" 
            v-model="store.inputType"
            @change="handleTypeChange"
            aria-describedby="json-description"
          />
          <span>JSON</span>
        </label>
        <label class="radio-label">
          <input 
            type="radio" 
            :value="InputType.JSONL" 
            v-model="store.inputType"
            @change="handleTypeChange"
            aria-describedby="jsonl-description"
          />
          <span>JSONL</span>
        </label>
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
import { useJsonTreeStore } from '../stores'
import { InputType } from '../types'
import TextEditor from './TextEditor.vue'
import StatusIndicator from './StatusIndicator.vue'

const store = useJsonTreeStore()

const handleTypeChange = () => {
  // 타입 변경 시 자동으로 파싱 재실행 (스토어에서 처리됨)
}
</script>

<style scoped>
.input-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-background-alt);
}

.panel-header {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
}

.input-type-selector {
  display: flex;
  gap: 1rem;
  border: none;
  margin: 0;
  padding: 0;
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

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--color-text);
}

.radio-label input[type="radio"] {
  margin: 0;
  accent-color: var(--color-secondary);
}

.radio-label:hover {
  color: var(--color-secondary);
}

.panel-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-footer {
  flex-shrink: 0;
  border-top: 1px solid var(--color-border);
  background: var(--color-background);
}

/* 모바일 최적화 */
@media (max-width: 768px) {
  .panel-header {
    padding: 0.75rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .input-type-selector {
    align-self: stretch;
    justify-content: center;
  }
}
</style>