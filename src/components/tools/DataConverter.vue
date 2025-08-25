<template>
  <div class="data-converter">
    <div class="tool-header">
      <h2>데이터 변환기</h2>
      <p>JSON 데이터를 CSV, XML, YAML 형식으로 변환합니다.</p>
    </div>
    
    <div class="converter-content">
      <div class="input-section">
        <div class="section-header">
          <h3>입력 데이터</h3>
          <div class="format-selector">
            <label>
              <input 
                type="radio" 
                value="json" 
                v-model="inputFormat"
                @change="validateInput"
              />
              JSON
            </label>
            <label>
              <input 
                type="radio" 
                value="jsonl" 
                v-model="inputFormat"
                @change="validateInput"
              />
              JSONL
            </label>
          </div>
        </div>
        
        <div class="input-wrapper">
          <textarea
            v-model="inputData"
            @input="validateInput"
            placeholder="변환할 데이터를 입력하세요..."
            class="data-input"
            :class="{ 'error': hasInputError, 'valid': isInputValid }"
          ></textarea>
          
          <div class="input-status" :class="inputStatusClass">
            <component :is="inputStatusIcon" :size="16" />
            <span>{{ inputStatusText }}</span>
          </div>
        </div>
      </div>
      
      <!-- 변환 옵션 -->
      <div class="options-section">
        <div class="section-header">
          <h3>변환 옵션</h3>
        </div>
        
        <div class="options-grid">
          <div class="option-group">
            <label>출력 형식</label>
            <select v-model="outputFormat" @change="convertData">
              <option value="csv">CSV</option>
              <option value="xml">XML</option>
              <option value="yaml">YAML</option>
              <option value="tsv">TSV</option>
            </select>
          </div>
          
          <div v-if="outputFormat === 'csv' || outputFormat === 'tsv'" class="option-group">
            <label>
              <input type="checkbox" v-model="options.includeHeaders" @change="convertData" />
              헤더 포함
            </label>
          </div>
          
          <div v-if="outputFormat === 'csv'" class="option-group">
            <label>구분자</label>
            <select v-model="options.delimiter" @change="convertData">
              <option value=",">쉼표 (,)</option>
              <option value=";">세미콜론 (;)</option>
              <option value="|">파이프 (|)</option>
            </select>
          </div>
          
          <div v-if="outputFormat === 'xml'" class="option-group">
            <label>루트 요소명</label>
            <input 
              type="text" 
              v-model="options.rootElement" 
              @input="convertData"
              placeholder="root"
            />
          </div>
        </div>
        
        <div class="convert-actions">
          <button 
            @click="convertData" 
            :disabled="!isInputValid || isConverting"
            class="primary-button"
          >
            <RefreshCw :size="16" :class="{ 'spinning': isConverting }" />
            변환하기
          </button>
          <button @click="clearAll" class="secondary-button">
            <Trash2 :size="16" />
            모두 지우기
          </button>
        </div>
      </div>
      
      <!-- 광고 -->
      <div class="ad-section">
        <SafeAdContainer 
          ad-slot="content-rectangle"
          ad-format="rectangle"
          class-name="tool-ad"
        />
      </div>
      
      <!-- 결과 섹션 -->
      <div class="output-section">
        <div class="section-header">
          <h3>변환 결과</h3>
          <div class="output-actions" v-if="convertedData">
            <button @click="copyToClipboard" class="secondary-button">
              <Copy :size="16" />
              복사
            </button>
            <button @click="downloadResult" class="secondary-button">
              <Download :size="16" />
              다운로드
            </button>
          </div>
        </div>
        
        <div v-if="conversionError" class="error-message">
          <AlertCircle :size="20" />
          <div>
            <div class="error-title">변환 오류</div>
            <div class="error-details">{{ conversionError }}</div>
          </div>
        </div>
        
        <div v-else-if="convertedData" class="output-wrapper">
          <pre class="output-display">{{ convertedData }}</pre>
          <div class="output-info">
            <span>{{ outputFormat.toUpperCase() }} 형식</span>
            <span>{{ convertedData.length.toLocaleString() }} 문자</span>
          </div>
        </div>
        
        <div v-else class="empty-output">
          <FileText :size="48" />
          <p>데이터를 입력하고 변환 버튼을 클릭하세요.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { 
  RefreshCw, 
  Trash2, 
  Copy, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  XCircle
} from 'lucide-vue-next'
import SafeAdContainer from './SafeAdContainer.vue'

interface ConversionOptions {
  includeHeaders: boolean
  delimiter: string
  rootElement: string
}

const inputData = ref('')
const inputFormat = ref<'json' | 'jsonl'>('json')
const outputFormat = ref<'csv' | 'xml' | 'yaml' | 'tsv'>('csv')
const convertedData = ref('')
const conversionError = ref('')
const isConverting = ref(false)
const isInputValid = ref(false)
const hasInputError = ref(false)

const options = ref<ConversionOptions>({
  includeHeaders: true,
  delimiter: ',',
  rootElement: 'root'
})

// 입력 상태 계산
const inputStatusClass = computed(() => {
  if (!inputData.value.trim()) return 'empty'
  if (hasInputError.value) return 'error'
  if (isInputValid.value) return 'valid'
  return 'empty'
})

const inputStatusIcon = computed(() => {
  if (hasInputError.value) return XCircle
  if (isInputValid.value) return CheckCircle
  return FileText
})

const inputStatusText = computed(() => {
  if (!inputData.value.trim()) return '데이터 입력 대기'
  if (hasInputError.value) return '유효하지 않은 형식'
  if (isInputValid.value) return '유효한 데이터'
  return '데이터 입력 대기'
})

// 입력 검증
const validateInput = () => {
  if (!inputData.value.trim()) {
    isInputValid.value = false
    hasInputError.value = false
    return
  }
  
  try {
    if (inputFormat.value === 'json') {
      JSON.parse(inputData.value)
    } else {
      // JSONL 검증
      const lines = inputData.value.trim().split('\n')
      lines.forEach(line => {
        if (line.trim()) {
          JSON.parse(line)
        }
      })
    }
    isInputValid.value = true
    hasInputError.value = false
  } catch (error) {
    isInputValid.value = false
    hasInputError.value = true
  }
}

// JSON을 CSV로 변환
const jsonToCsv = (data: any[]): string => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('CSV 변환을 위해서는 배열 형태의 데이터가 필요합니다.')
  }
  
  // 모든 키 수집
  const allKeys = new Set<string>()
  data.forEach(item => {
    if (typeof item === 'object' && item !== null) {
      Object.keys(item).forEach(key => allKeys.add(key))
    }
  })
  
  const headers = Array.from(allKeys)
  const delimiter = options.value.delimiter
  
  let csv = ''
  
  // 헤더 추가
  if (options.value.includeHeaders) {
    csv += headers.map(header => `"${header}"`).join(delimiter) + '\n'
  }
  
  // 데이터 행 추가
  data.forEach(item => {
    const row = headers.map(header => {
      const value = item[header] ?? ''
      return `"${String(value).replace(/"/g, '""')}"`
    })
    csv += row.join(delimiter) + '\n'
  })
  
  return csv
}

// JSON을 XML로 변환
const jsonToXml = (data: any): string => {
  const xmlEscape = (str: string): string => {
    return str.replace(/[<>&'"]/g, (char) => {
      const escapeMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        "'": '&apos;',
        '"': '&quot;'
      }
      return escapeMap[char]
    })
  }
  
  const convertValue = (value: any, key: string = 'item'): string => {
    if (value === null || value === undefined) {
      return `<${key}></${key}>`
    }
    
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.map(item => convertValue(item, key)).join('')
      } else {
        const content = Object.entries(value)
          .map(([k, v]) => convertValue(v, k))
          .join('')
        return `<${key}>${content}</${key}>`
      }
    }
    
    return `<${key}>${xmlEscape(String(value))}</${key}>`
  }
  
  const rootElement = options.value.rootElement || 'root'
  return `<?xml version="1.0" encoding="UTF-8"?>\n${convertValue(data, rootElement)}`
}

// JSON을 YAML로 변환 (간단한 구현)
const jsonToYaml = (data: any, indent: number = 0): string => {
  const spaces = '  '.repeat(indent)
  
  if (data === null || data === undefined) {
    return 'null'
  }
  
  if (typeof data === 'string') {
    return `"${data.replace(/"/g, '\\"')}"`
  }
  
  if (typeof data === 'number' || typeof data === 'boolean') {
    return String(data)
  }
  
  if (Array.isArray(data)) {
    if (data.length === 0) return '[]'
    return '\n' + data.map(item => 
      `${spaces}- ${jsonToYaml(item, indent + 1).replace(/^\n/, '')}`
    ).join('\n')
  }
  
  if (typeof data === 'object') {
    const entries = Object.entries(data)
    if (entries.length === 0) return '{}'
    return '\n' + entries.map(([key, value]) => 
      `${spaces}${key}: ${jsonToYaml(value, indent + 1).replace(/^\n/, '')}`
    ).join('\n')
  }
  
  return String(data)
}

// 데이터 변환
const convertData = async () => {
  if (!isInputValid.value) return
  
  isConverting.value = true
  conversionError.value = ''
  convertedData.value = ''
  
  try {
    let parsedData: any
    
    if (inputFormat.value === 'json') {
      parsedData = JSON.parse(inputData.value)
    } else {
      // JSONL 파싱
      const lines = inputData.value.trim().split('\n')
      parsedData = lines
        .filter(line => line.trim())
        .map(line => JSON.parse(line))
    }
    
    let result: string
    
    switch (outputFormat.value) {
      case 'csv':
      case 'tsv':
        const csvData = Array.isArray(parsedData) ? parsedData : [parsedData]
        if (outputFormat.value === 'tsv') {
          const originalDelimiter = options.value.delimiter
          options.value.delimiter = '\t'
          result = jsonToCsv(csvData)
          options.value.delimiter = originalDelimiter
        } else {
          result = jsonToCsv(csvData)
        }
        break
        
      case 'xml':
        result = jsonToXml(parsedData)
        break
        
      case 'yaml':
        result = jsonToYaml(parsedData).replace(/^\n/, '')
        break
        
      default:
        throw new Error('지원하지 않는 출력 형식입니다.')
    }
    
    convertedData.value = result
  } catch (error: any) {
    conversionError.value = error.message
  } finally {
    isConverting.value = false
  }
}

// 클립보드에 복사
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(convertedData.value)
    // 성공 피드백 (간단한 구현)
    alert('클립보드에 복사되었습니다!')
  } catch (error) {
    alert('복사에 실패했습니다.')
  }
}

// 결과 다운로드
const downloadResult = () => {
  const blob = new Blob([convertedData.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `converted.${outputFormat.value}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 모두 지우기
const clearAll = () => {
  inputData.value = ''
  convertedData.value = ''
  conversionError.value = ''
  isInputValid.value = false
  hasInputError.value = false
}

// 입력 변화 감지
watch(inputData, validateInput)
watch(inputFormat, validateInput)
</script>

<style scoped>
.data-converter {
  max-width: 1200px;
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

.converter-content {
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

.format-selector {
  display: flex;
  gap: 1rem;
}

.format-selector label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.input-wrapper {
  position: relative;
}

.data-input {
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

.data-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.data-input.error {
  border-color: var(--color-error);
}

.data-input.valid {
  border-color: var(--color-success);
}

.input-status {
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

.input-status.valid {
  background: #d4edda;
  color: #155724;
}

.input-status.error {
  background: #f8d7da;
  color: #721c24;
}

.input-status.empty {
  background: var(--color-background-secondary);
  color: var(--color-text-secondary);
}

.options-section {
  background: var(--color-background-secondary);
  padding: 1.5rem;
  border-radius: 8px;
}

.options-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.option-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.option-group select,
.option-group input[type="text"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
}

.option-group input[type="checkbox"] {
  margin-right: 0.5rem;
}

.convert-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.primary-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.primary-button:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.primary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.secondary-button {
  display: flex;
  align-items: center;
  justify-content: center;
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

.secondary-button:hover {
  background: var(--color-background-secondary);
  border-color: var(--color-primary);
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.ad-section {
  display: flex;
  justify-content: center;
  align-items: center;
}

.output-actions {
  display: flex;
  gap: 0.5rem;
}

.error-message {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  color: #721c24;
}

.error-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.output-wrapper {
  position: relative;
}

.output-display {
  width: 100%;
  max-height: 400px;
  padding: 1rem;
  background: var(--color-background-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.output-info {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.empty-output {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-secondary);
}

.empty-output svg {
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
  .converter-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .options-section {
    order: 2;
  }
  
  .ad-section {
    order: 3;
  }
  
  .output-section {
    order: 4;
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
  
  .format-selector {
    width: 100%;
    justify-content: flex-start;
    gap: 1rem;
  }
  
  .format-selector label {
    padding: 0.5rem 0;
    font-size: 0.95rem;
  }
  
  .data-input {
    height: 240px;
    font-size: 14px;
    padding: 1rem;
    border-radius: 12px;
  }
  
  .input-status {
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.375rem 0.75rem;
    font-size: 0.85rem;
    border-radius: 6px;
  }
  
  .options-section {
    padding: 1.25rem;
    border-radius: 12px;
  }
  
  .options-grid {
    gap: 1.25rem;
  }
  
  .option-group label {
    font-size: 0.95rem;
    margin-bottom: 0.625rem;
  }
  
  .option-group select,
  .option-group input[type="text"] {
    padding: 0.75rem;
    font-size: 16px; /* Prevent zoom on iOS */
    border-radius: 8px;
    min-height: 44px;
  }
  
  .convert-actions {
    gap: 0.75rem;
  }
  
  .primary-button {
    padding: 0.875rem 1.25rem;
    font-size: 1rem;
    border-radius: 8px;
    min-height: 48px;
  }
  
  .secondary-button {
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
    border-radius: 8px;
    min-height: 44px;
  }
  
  .output-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .output-display {
    max-height: 300px;
    font-size: 13px;
    padding: 1rem;
    border-radius: 12px;
  }
  
  .output-info {
    font-size: 0.85rem;
    margin-top: 0.75rem;
  }
  
  .error-message {
    padding: 1.25rem;
    border-radius: 12px;
  }
  
  .empty-output {
    padding: 2.5rem 1rem;
  }
  
  .empty-output svg {
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
  
  .format-selector {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .data-input {
    height: 200px;
    font-size: 13px;
    padding: 0.875rem;
  }
  
  .options-section {
    padding: 1rem;
  }
  
  .options-grid {
    gap: 1rem;
  }
  
  .option-group select,
  .option-group input[type="text"] {
    padding: 0.625rem;
    min-height: 40px;
  }
  
  .primary-button {
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
    min-height: 44px;
  }
  
  .secondary-button {
    padding: 0.625rem 0.875rem;
    font-size: 0.9rem;
    min-height: 40px;
  }
  
  .output-display {
    max-height: 250px;
    font-size: 12px;
    padding: 0.875rem;
  }
  
  .empty-output {
    padding: 2rem 0.75rem;
  }
  
  :deep(.tool-ad) {
    min-height: 160px;
    padding: 0.75rem;
  }
}

/* Touch-specific improvements */
@media (hover: none) and (pointer: coarse) {
  .primary-button:hover,
  .secondary-button:hover {
    transform: none;
  }
  
  .primary-button:active {
    transform: scale(0.98);
  }
  
  .secondary-button:active {
    transform: scale(0.98);
  }
  
  .data-input,
  .output-display {
    -webkit-overflow-scrolling: touch;
  }
}
</style>