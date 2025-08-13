<template>
  <div class="json-formatter">
    <div class="tool-header">
      <h2>JSON 포맷터</h2>
      <p>JSON 데이터를 압축하거나 정리하고, 기본 스키마를 생성합니다.</p>
    </div>
    
    <div class="formatter-content">
      <div class="input-section">
        <div class="section-header">
          <h3>JSON 입력</h3>
          <div class="input-actions">
            <button @click="loadSample" class="secondary-button">
              <FileText :size="16" />
              샘플 로드
            </button>
            <button @click="clearInput" class="secondary-button">
              <Trash2 :size="16" />
              지우기
            </button>
          </div>
        </div>
        
        <div class="input-wrapper">
          <textarea
            v-model="inputJson"
            @input="validateInput"
            placeholder="JSON 데이터를 입력하세요..."
            class="json-input"
            :class="{ 'error': hasError, 'valid': isValid }"
          ></textarea>
          
          <div class="input-status" :class="statusClass">
            <component :is="statusIcon" :size="16" />
            <span>{{ statusText }}</span>
          </div>
        </div>
      </div>
      
      <!-- 포맷팅 옵션 -->
      <div class="options-section">
        <div class="section-header">
          <h3>포맷팅 옵션</h3>
        </div>
        
        <div class="format-options">
          <div class="option-group">
            <h4>들여쓰기</h4>
            <div class="indent-options">
              <label>
                <input type="radio" value="2" v-model="indentSize" @change="formatJson" />
                2 스페이스
              </label>
              <label>
                <input type="radio" value="4" v-model="indentSize" @change="formatJson" />
                4 스페이스
              </label>
              <label>
                <input type="radio" value="tab" v-model="indentSize" @change="formatJson" />
                탭
              </label>
            </div>
          </div>
          
          <div class="option-group">
            <h4>정렬 옵션</h4>
            <label>
              <input type="checkbox" v-model="sortKeys" @change="formatJson" />
              키 정렬
            </label>
          </div>
          
          <div class="action-buttons">
            <button 
              @click="formatJson" 
              :disabled="!isValid"
              class="primary-button"
            >
              <AlignLeft :size="16" />
              정리하기
            </button>
            <button 
              @click="compressJson" 
              :disabled="!isValid"
              class="primary-button"
            >
              <Minimize2 :size="16" />
              압축하기
            </button>
            <button 
              @click="generateSchema" 
              :disabled="!isValid"
              class="primary-button"
            >
              <FileCode :size="16" />
              스키마 생성
            </button>
          </div>
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
          <h3>{{ outputTitle }}</h3>
          <div class="output-actions" v-if="outputData">
            <button @click="copyOutput" class="secondary-button">
              <Copy :size="16" />
              복사
            </button>
            <button @click="downloadOutput" class="secondary-button">
              <Download :size="16" />
              다운로드
            </button>
          </div>
        </div>
        
        <div v-if="outputData" class="output-wrapper">
          <pre class="output-display" :class="outputType">{{ outputData }}</pre>
          <div class="output-info">
            <span>{{ outputType === 'schema' ? 'JSON Schema' : 'JSON' }}</span>
            <span>{{ outputData.length.toLocaleString() }} 문자</span>
            <span v-if="compressionRatio">압축률: {{ compressionRatio }}%</span>
          </div>
        </div>
        
        <div v-else class="empty-output">
          <AlignLeft :size="48" />
          <p>JSON 데이터를 입력하고 원하는 작업을 선택하세요.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  AlignLeft, 
  Minimize2, 
  FileCode, 
  FileText, 
  Trash2, 
  Copy, 
  Download,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-vue-next'
import SafeAdContainer from './SafeAdContainer.vue'

const inputJson = ref('')
const outputData = ref('')
const outputType = ref<'formatted' | 'compressed' | 'schema'>('formatted')
const isValid = ref(false)
const hasError = ref(false)
const indentSize = ref('2')
const sortKeys = ref(false)
const compressionRatio = ref<number | null>(null)

// 샘플 JSON 데이터
const sampleJson = {
  "name": "홍길동",
  "age": 30,
  "address": {
    "city": "서울",
    "district": "강남구",
    "zipCode": "06234"
  },
  "hobbies": ["독서", "영화감상", "등산"],
  "isActive": true,
  "metadata": {
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T15:45:00Z",
    "version": 1.2
  }
}

// 상태 계산
const statusClass = computed(() => {
  if (!inputJson.value.trim()) return 'empty'
  if (hasError.value) return 'error'
  if (isValid.value) return 'valid'
  return 'empty'
})

const statusIcon = computed(() => {
  if (hasError.value) return XCircle
  if (isValid.value) return CheckCircle
  return AlertCircle
})

const statusText = computed(() => {
  if (!inputJson.value.trim()) return '입력 대기 중'
  if (hasError.value) return '유효하지 않은 JSON'
  if (isValid.value) return '유효한 JSON'
  return '입력 대기 중'
})

const outputTitle = computed(() => {
  switch (outputType.value) {
    case 'formatted': return '정리된 JSON'
    case 'compressed': return '압축된 JSON'
    case 'schema': return 'JSON 스키마'
    default: return '결과'
  }
})

// 입력 검증
const validateInput = () => {
  if (!inputJson.value.trim()) {
    isValid.value = false
    hasError.value = false
    return
  }
  
  try {
    JSON.parse(inputJson.value)
    isValid.value = true
    hasError.value = false
  } catch (error) {
    isValid.value = false
    hasError.value = true
  }
}

// 샘플 로드
const loadSample = () => {
  inputJson.value = JSON.stringify(sampleJson, null, 2)
  validateInput()
}

// 입력 지우기
const clearInput = () => {
  inputJson.value = ''
  outputData.value = ''
  isValid.value = false
  hasError.value = false
  compressionRatio.value = null
}

// JSON 정리
const formatJson = () => {
  if (!isValid.value) return
  
  try {
    const parsed = JSON.parse(inputJson.value)
    let formatted: any = parsed
    
    if (sortKeys.value) {
      formatted = sortObjectKeys(parsed)
    }
    
    const indent = indentSize.value === 'tab' ? '\t' : parseInt(indentSize.value)
    outputData.value = JSON.stringify(formatted, null, indent)
    outputType.value = 'formatted'
    compressionRatio.value = null
  } catch (error) {
    // 이미 검증된 상태이므로 오류가 발생하지 않아야 함
  }
}

// JSON 압축
const compressJson = () => {
  if (!isValid.value) return
  
  try {
    const parsed = JSON.parse(inputJson.value)
    const compressed = JSON.stringify(parsed)
    const originalLength = inputJson.value.length
    const compressedLength = compressed.length
    
    outputData.value = compressed
    outputType.value = 'compressed'
    compressionRatio.value = Math.round(((originalLength - compressedLength) / originalLength) * 100)
  } catch (error) {
    // 이미 검증된 상태이므로 오류가 발생하지 않아야 함
  }
}

// 객체 키 정렬
const sortObjectKeys = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys)
  } else if (obj && typeof obj === 'object') {
    const sorted: any = {}
    Object.keys(obj).sort().forEach(key => {
      sorted[key] = sortObjectKeys(obj[key])
    })
    return sorted
  }
  return obj
}

// JSON 스키마 생성
const generateSchema = () => {
  if (!isValid.value) return
  
  try {
    const parsed = JSON.parse(inputJson.value)
    const schema = generateJsonSchema(parsed)
    outputData.value = JSON.stringify(schema, null, 2)
    outputType.value = 'schema'
    compressionRatio.value = null
  } catch (error) {
    // 이미 검증된 상태이므로 오류가 발생하지 않아야 함
  }
}

// JSON 스키마 생성 로직
const generateJsonSchema = (data: any): any => {
  const getType = (value: any): string => {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'array'
    return typeof value
  }
  
  const generateSchemaForValue = (value: any): any => {
    const type = getType(value)
    const schema: any = { type }
    
    switch (type) {
      case 'object':
        schema.properties = {}
        schema.required = []
        
        Object.entries(value).forEach(([key, val]) => {
          schema.properties[key] = generateSchemaForValue(val)
          schema.required.push(key)
        })
        break
        
      case 'array':
        if (value.length > 0) {
          // 첫 번째 요소를 기준으로 스키마 생성
          schema.items = generateSchemaForValue(value[0])
        }
        break
        
      case 'string':
        schema.minLength = 0
        if (value.length > 0) {
          schema.example = value
        }
        break
        
      case 'number':
        schema.example = value
        break
        
      case 'boolean':
        schema.example = value
        break
    }
    
    return schema
  }
  
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: getType(data),
    ...generateSchemaForValue(data)
  }
}

// 출력 복사
const copyOutput = async () => {
  try {
    await navigator.clipboard.writeText(outputData.value)
    alert('클립보드에 복사되었습니다!')
  } catch (error) {
    alert('복사에 실패했습니다.')
  }
}

// 출력 다운로드
const downloadOutput = () => {
  const fileExtension = outputType.value === 'schema' ? 'schema.json' : 'json'
  const blob = new Blob([outputData.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `formatted.${fileExtension}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.json-formatter {
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

.formatter-content {
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

.input-actions {
  display: flex;
  gap: 0.5rem;
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

.format-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.option-group h4 {
  margin: 0 0 0.5rem 0;
  color: var(--color-text-primary);
  font-size: 0.9rem;
}

.indent-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.indent-options label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.option-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.action-buttons {
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
  font-size: 0.9rem;
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

.ad-section {
  display: flex;
  justify-content: center;
  align-items: center;
}

.output-actions {
  display: flex;
  gap: 0.5rem;
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

.output-display.schema {
  border-left: 4px solid var(--color-primary);
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
  .formatter-content {
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
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .input-actions,
  .output-actions {
    flex-direction: column;
  }
  
  .json-input {
    height: 200px;
  }
  
  :deep(.tool-ad) {
    min-height: 200px;
    padding: 0.5rem;
  }
}
</style>