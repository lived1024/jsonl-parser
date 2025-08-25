<template>
  <div class="json-validator">
    <div class="tool-header">
      <h2>JSON 검증기</h2>
      <p>JSON 데이터의 유효성을 실시간으로 검증하고 오류를 표시합니다.</p>
    </div>
    
    <div class="validator-content">
      <div class="input-section">
        <div class="section-header">
          <h3>JSON 입력</h3>
          <div class="actions">
            <button @click="clearInput" class="secondary-button">
              <Trash2 :size="16" />
              지우기
            </button>
            <button @click="formatJson" class="secondary-button" :disabled="!isValid">
              <AlignLeft :size="16" />
              포맷팅
            </button>
          </div>
        </div>
        
        <div class="input-wrapper">
          <textarea
            v-model="jsonInput"
            @input="validateJson"
            placeholder="JSON 데이터를 입력하세요..."
            class="json-input"
            :class="{ 'error': hasErrors, 'valid': isValid && jsonInput.trim() }"
          ></textarea>
          
          <!-- 실시간 상태 표시 -->
          <div class="status-indicator" :class="statusClass">
            <component :is="statusIcon" :size="16" />
            <span>{{ statusText }}</span>
          </div>
        </div>
      </div>
      
      <!-- 광고 배치 -->
      <div class="ad-section">
        <SafeAdContainer 
          ad-slot="content-rectangle"
          ad-format="rectangle"
          class-name="tool-ad"
        />
      </div>
      
      <div class="results-section">
        <div class="section-header">
          <h3>검증 결과</h3>
          <div class="result-summary" :class="summaryClass">
            <component :is="summaryIcon" :size="16" />
            <span>{{ summaryText }}</span>
          </div>
        </div>
        
        <!-- 오류 목록 -->
        <div v-if="validationErrors.length > 0" class="errors-list">
          <div 
            v-for="(error, index) in validationErrors" 
            :key="index"
            class="error-item"
          >
            <div class="error-icon">
              <AlertCircle :size="16" />
            </div>
            <div class="error-details">
              <div class="error-message">{{ error.message }}</div>
              <div v-if="error.line" class="error-location">
                라인 {{ error.line }}{{ error.column ? `, 컬럼 ${error.column}` : '' }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- 성공 메시지 -->
        <div v-else-if="isValid && jsonInput.trim()" class="success-message">
          <CheckCircle :size="20" />
          <div>
            <div class="success-title">유효한 JSON입니다!</div>
            <div class="success-details">
              {{ jsonStats.objects }}개 객체, {{ jsonStats.arrays }}개 배열, 
              {{ jsonStats.properties }}개 속성
            </div>
          </div>
        </div>
        
        <!-- 빈 상태 -->
        <div v-else class="empty-state">
          <FileText :size="48" />
          <p>JSON 데이터를 입력하면 실시간으로 검증 결과를 확인할 수 있습니다.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Trash2, 
  AlignLeft,
  Clock,
  XCircle
} from 'lucide-vue-next'
import SafeAdContainer from './SafeAdContainer.vue'

interface ValidationError {
  line?: number
  column?: number
  message: string
  severity: 'error' | 'warning'
}

interface JsonStats {
  objects: number
  arrays: number
  properties: number
}

const jsonInput = ref('')
const validationErrors = ref<ValidationError[]>([])
const isValid = ref(false)
const isValidating = ref(false)

const jsonStats = ref<JsonStats>({
  objects: 0,
  arrays: 0,
  properties: 0
})

// 상태 계산
const hasErrors = computed(() => validationErrors.value.length > 0)

const statusClass = computed(() => {
  if (isValidating.value) return 'validating'
  if (!jsonInput.value.trim()) return 'empty'
  if (hasErrors.value) return 'error'
  if (isValid.value) return 'valid'
  return 'empty'
})

const statusIcon = computed(() => {
  if (isValidating.value) return Clock
  if (hasErrors.value) return XCircle
  if (isValid.value) return CheckCircle
  return FileText
})

const statusText = computed(() => {
  if (isValidating.value) return '검증 중...'
  if (!jsonInput.value.trim()) return '입력 대기 중'
  if (hasErrors.value) return `${validationErrors.value.length}개 오류 발견`
  if (isValid.value) return '유효한 JSON'
  return '입력 대기 중'
})

const summaryClass = computed(() => {
  if (hasErrors.value) return 'error'
  if (isValid.value && jsonInput.value.trim()) return 'valid'
  return 'neutral'
})

const summaryIcon = computed(() => {
  if (hasErrors.value) return XCircle
  if (isValid.value && jsonInput.value.trim()) return CheckCircle
  return FileText
})

const summaryText = computed(() => {
  if (hasErrors.value) return '검증 실패'
  if (isValid.value && jsonInput.value.trim()) return '검증 성공'
  return '검증 결과 없음'
})

// JSON 통계 계산
const calculateStats = (obj: any): JsonStats => {
  const stats = { objects: 0, arrays: 0, properties: 0 }
  
  const traverse = (value: any) => {
    if (Array.isArray(value)) {
      stats.arrays++
      value.forEach(traverse)
    } else if (value && typeof value === 'object') {
      stats.objects++
      stats.properties += Object.keys(value).length
      Object.values(value).forEach(traverse)
    }
  }
  
  traverse(obj)
  return stats
}

// JSON 검증 함수
const validateJson = () => {
  if (!jsonInput.value.trim()) {
    validationErrors.value = []
    isValid.value = false
    return
  }
  
  isValidating.value = true
  validationErrors.value = []
  
  try {
    const parsed = JSON.parse(jsonInput.value)
    isValid.value = true
    jsonStats.value = calculateStats(parsed)
  } catch (error: any) {
    isValid.value = false
    
    // JSON.parse 오류 파싱
    const errorMessage = error.message
    let line: number | undefined
    let column: number | undefined
    
    // 위치 정보 추출 시도
    const positionMatch = errorMessage.match(/position (\d+)/)
    if (positionMatch) {
      const position = parseInt(positionMatch[1])
      const lines = jsonInput.value.substring(0, position).split('\n')
      line = lines.length
      column = lines[lines.length - 1].length + 1
    }
    
    validationErrors.value = [{
      line,
      column,
      message: getKoreanErrorMessage(errorMessage),
      severity: 'error'
    }]
  } finally {
    isValidating.value = false
  }
}

// 오류 메시지 한국어 변환
const getKoreanErrorMessage = (message: string): string => {
  const errorMap: Record<string, string> = {
    'Unexpected token': '예상치 못한 토큰',
    'Unexpected end of JSON input': 'JSON 입력이 예상보다 일찍 끝남',
    'Expected property name or': '속성 이름 또는 }가 필요함',
    'Unexpected string in JSON': 'JSON에서 예상치 못한 문자열',
    'Unexpected number in JSON': 'JSON에서 예상치 못한 숫자'
  }
  
  for (const [english, korean] of Object.entries(errorMap)) {
    if (message.includes(english)) {
      return korean
    }
  }
  
  return message
}

// 입력 지우기
const clearInput = () => {
  jsonInput.value = ''
  validationErrors.value = []
  isValid.value = false
}

// JSON 포맷팅
const formatJson = () => {
  if (!isValid.value) return
  
  try {
    const parsed = JSON.parse(jsonInput.value)
    jsonInput.value = JSON.stringify(parsed, null, 2)
  } catch (error) {
    // 이미 검증된 상태이므로 오류가 발생하지 않아야 함
  }
}

// 입력 변화 감지
watch(jsonInput, () => {
  validateJson()
}, { immediate: true })
</script>

<style scoped>
.json-validator {
  max-width: 1000px;
  margin: 0 auto;
}

.tool-header {
  text-align: center;
  margin-bottom: 2rem;
}

.tool-header h2 {
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.tool-header p {
  color: var(--color-text-secondary);
}

.validator-content {
  display: grid;
  grid-template-columns: 1fr 300px 1fr;
  gap: 2rem;
  align-items: start;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h3 {
  color: var(--color-text-primary);
  margin: 0;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.secondary-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-background-primary);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.secondary-button:hover:not(:disabled) {
  background: var(--color-background-secondary);
  border-color: var(--color-primary);
}

.secondary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-wrapper {
  position: relative;
}

.json-input {
  width: 100%;
  height: 300px;
  padding: 1rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  resize: vertical;
  transition: border-color 0.2s;
}

.json-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.json-input.error {
  border-color: var(--color-error);
}

.json-input.valid {
  border-color: var(--color-success);
}

.status-indicator {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-indicator.validating {
  background: #fff3cd;
  color: #856404;
}

.status-indicator.valid {
  background: #d4edda;
  color: #155724;
}

.status-indicator.error {
  background: #f8d7da;
  color: #721c24;
}

.status-indicator.empty {
  background: var(--color-background-secondary);
  color: var(--color-text-secondary);
}

.ad-section {
  display: flex;
  justify-content: center;
  align-items: center;
}

.result-summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
}

.result-summary.valid {
  background: #d4edda;
  color: #155724;
}

.result-summary.error {
  background: #f8d7da;
  color: #721c24;
}

.result-summary.neutral {
  background: var(--color-background-secondary);
  color: var(--color-text-secondary);
}

.errors-list {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
}

.error-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #dee2e6;
}

.error-item:last-child {
  border-bottom: none;
}

.error-icon {
  color: var(--color-error);
  flex-shrink: 0;
}

.error-message {
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 0.25rem;
}

.error-location {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.success-message {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  color: #155724;
}

.success-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.success-details {
  font-size: 0.9rem;
  opacity: 0.8;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-secondary);
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* 광고 스타일 */
:deep(.tool-ad) {
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 1024px) {
  .validator-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .ad-section {
    order: 2;
  }
  
  .results-section {
    order: 3;
  }
}

@media (max-width: 768px) {
  .tool-header {
    margin-bottom: 1.5rem;
    padding: 0 0.5rem;
  }
  
  .tool-header h2 {
    font-size: 1.5rem;
    line-height: 1.3;
  }
  
  .tool-header p {
    font-size: 0.95rem;
    line-height: 1.5;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .secondary-button {
    padding: 0.625rem 1rem;
    font-size: 0.9rem;
    min-height: 44px;
    border-radius: 8px;
  }
  
  .json-input {
    height: 240px;
    font-size: 14px;
    padding: 1rem;
    border-radius: 12px;
    border-width: 2px;
  }
  
  .status-indicator {
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.375rem 0.75rem;
    font-size: 0.85rem;
    border-radius: 6px;
  }
  
  .result-summary {
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
    border-radius: 8px;
  }
  
  .errors-list {
    border-radius: 12px;
    padding: 1.25rem;
  }
  
  .error-item {
    padding: 1rem 0;
    gap: 1rem;
  }
  
  .error-message {
    font-size: 0.95rem;
    line-height: 1.4;
  }
  
  .error-location {
    font-size: 0.85rem;
  }
  
  .success-message {
    padding: 1.25rem;
    border-radius: 12px;
    gap: 1rem;
  }
  
  .success-title {
    font-size: 1rem;
  }
  
  .success-details {
    font-size: 0.9rem;
  }
  
  .empty-state {
    padding: 2.5rem 1rem;
  }
  
  .empty-state svg {
    width: 40px;
    height: 40px;
  }
  
  :deep(.tool-ad) {
    min-height: 200px;
    padding: 1rem;
    border-radius: 12px;
  }
}

@media (max-width: 480px) {
  .tool-header {
    margin-bottom: 1rem;
  }
  
  .tool-header h2 {
    font-size: 1.25rem;
  }
  
  .tool-header p {
    font-size: 0.9rem;
  }
  
  .json-input {
    height: 200px;
    font-size: 13px;
    padding: 0.875rem;
  }
  
  .secondary-button {
    padding: 0.5rem 0.875rem;
    font-size: 0.85rem;
    min-height: 40px;
  }
  
  .status-indicator {
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
  }
  
  .errors-list {
    padding: 1rem;
  }
  
  .error-item {
    padding: 0.75rem 0;
  }
  
  .success-message {
    padding: 1rem;
  }
  
  .empty-state {
    padding: 2rem 0.75rem;
  }
  
  :deep(.tool-ad) {
    min-height: 160px;
    padding: 0.75rem;
  }
}

/* Touch-specific improvements */
@media (hover: none) and (pointer: coarse) {
  .secondary-button:hover {
    transform: none;
  }
  
  .secondary-button:active {
    transform: scale(0.98);
  }
  
  .json-input {
    /* Better touch scrolling */
    -webkit-overflow-scrolling: touch;
  }
}
</style>