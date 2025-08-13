<template>
  <div class="schema-generator">
    <div class="tool-header">
      <h2>JSON 스키마 생성기</h2>
      <p>JSON 데이터로부터 자동으로 JSON Schema를 생성합니다.</p>
    </div>
    
    <div class="generator-content">
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
      
      <!-- 스키마 옵션 -->
      <div class="options-section">
        <div class="section-header">
          <h3>스키마 옵션</h3>
        </div>
        
        <div class="schema-options">
          <div class="option-group">
            <label>
              <input type="checkbox" v-model="options.includeExamples" @change="generateSchema" />
              예제 값 포함
            </label>
          </div>
          
          <div class="option-group">
            <label>
              <input type="checkbox" v-model="options.strictRequired" @change="generateSchema" />
              모든 속성 필수로 설정
            </label>
          </div>
          
          <div class="option-group">
            <label>
              <input type="checkbox" v-model="options.includeDescriptions" @change="generateSchema" />
              설명 추가
            </label>
          </div>
          
          <div class="option-group">
            <label>스키마 버전</label>
            <select v-model="options.schemaVersion" @change="generateSchema">
              <option value="draft-07">Draft 07</option>
              <option value="draft-04">Draft 04</option>
              <option value="2019-09">2019-09</option>
            </select>
          </div>
          
          <div class="action-buttons">
            <button 
              @click="generateSchema" 
              :disabled="!isValid"
              class="primary-button"
            >
              <FileCode :size="16" />
              스키마 생성
            </button>
            <button 
              @click="validateWithSchema" 
              :disabled="!isValid || !schemaData"
              class="primary-button"
            >
              <CheckCircle :size="16" />
              스키마 검증
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
          <h3>생성된 스키마</h3>
          <div class="output-actions" v-if="schemaData">
            <button @click="copySchema" class="secondary-button">
              <Copy :size="16" />
              복사
            </button>
            <button @click="downloadSchema" class="secondary-button">
              <Download :size="16" />
              다운로드
            </button>
          </div>
        </div>
        
        <div v-if="validationResult" class="validation-result" :class="validationResult.isValid ? 'valid' : 'invalid'">
          <div class="validation-header">
            <component :is="validationResult.isValid ? CheckCircle : XCircle" :size="20" />
            <span>{{ validationResult.isValid ? '스키마 검증 성공' : '스키마 검증 실패' }}</span>
          </div>
          <div v-if="!validationResult.isValid && validationResult.errors.length > 0" class="validation-errors">
            <div v-for="(error, index) in validationResult.errors" :key="index" class="error-item">
              {{ error }}
            </div>
          </div>
        </div>
        
        <div v-if="schemaData" class="schema-wrapper">
          <pre class="schema-display">{{ schemaData }}</pre>
          <div class="schema-info">
            <span>JSON Schema {{ options.schemaVersion }}</span>
            <span>{{ schemaData.length.toLocaleString() }} 문자</span>
          </div>
        </div>
        
        <div v-else class="empty-schema">
          <FileCode :size="48" />
          <p>JSON 데이터를 입력하고 스키마 생성 버튼을 클릭하세요.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
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

interface SchemaOptions {
  includeExamples: boolean
  strictRequired: boolean
  includeDescriptions: boolean
  schemaVersion: 'draft-07' | 'draft-04' | '2019-09'
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
}

const inputJson = ref('')
const schemaData = ref('')
const isValid = ref(false)
const hasError = ref(false)
const validationResult = ref<ValidationResult | null>(null)

const options = ref<SchemaOptions>({
  includeExamples: true,
  strictRequired: false,
  includeDescriptions: true,
  schemaVersion: 'draft-07'
})

// 샘플 JSON 데이터
const sampleJson = {
  "user": {
    "id": 12345,
    "name": "홍길동",
    "email": "hong@example.com",
    "age": 30,
    "isActive": true,
    "profile": {
      "bio": "소프트웨어 개발자",
      "location": "서울, 대한민국",
      "website": "https://example.com"
    },
    "skills": ["JavaScript", "Python", "React"],
    "projects": [
      {
        "name": "프로젝트 A",
        "status": "completed",
        "startDate": "2024-01-01",
        "technologies": ["Vue.js", "Node.js"]
      }
    ]
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
  schemaData.value = ''
  isValid.value = false
  hasError.value = false
  validationResult.value = null
}

// 스키마 생성
const generateSchema = () => {
  if (!isValid.value) return
  
  try {
    const parsed = JSON.parse(inputJson.value)
    const schema = generateJsonSchema(parsed)
    schemaData.value = JSON.stringify(schema, null, 2)
    validationResult.value = null
  } catch (error) {
    // 이미 검증된 상태이므로 오류가 발생하지 않아야 함
  }
}

// JSON 스키마 생성 로직
const generateJsonSchema = (data: any): any => {
  const getSchemaUrl = () => {
    switch (options.value.schemaVersion) {
      case 'draft-04': return 'http://json-schema.org/draft-04/schema#'
      case '2019-09': return 'https://json-schema.org/draft/2019-09/schema'
      default: return 'http://json-schema.org/draft-07/schema#'
    }
  }
  
  const getType = (value: any): string => {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'array'
    return typeof value
  }
  
  const generateSchemaForValue = (value: any, key?: string): any => {
    const type = getType(value)
    const schema: any = { type }
    
    // 설명 추가
    if (options.value.includeDescriptions && key) {
      schema.description = `${key} 속성`
    }
    
    switch (type) {
      case 'object':
        schema.properties = {}
        const required: string[] = []
        
        Object.entries(value).forEach(([objKey, val]) => {
          schema.properties[objKey] = generateSchemaForValue(val, objKey)
          if (options.value.strictRequired) {
            required.push(objKey)
          }
        })
        
        if (required.length > 0) {
          schema.required = required
        }
        break
        
      case 'array':
        if (value.length > 0) {
          // 배열의 모든 요소 타입 분석
          const itemTypes = new Set(value.map((item: any) => getType(item)))
          
          if (itemTypes.size === 1) {
            // 모든 요소가 같은 타입
            schema.items = generateSchemaForValue(value[0])
          } else {
            // 여러 타입이 혼재
            schema.items = {
              oneOf: Array.from(itemTypes).map(itemType => {
                const example = value.find((item: any) => getType(item) === itemType)
                return generateSchemaForValue(example)
              })
            }
          }
        }
        break
        
      case 'string':
        schema.minLength = 0
        if (options.value.includeExamples && value.length > 0) {
          schema.example = value
        }
        
        // 이메일 패턴 감지
        if (key && (key.toLowerCase().includes('email') || key.toLowerCase().includes('mail'))) {
          schema.format = 'email'
        }
        
        // URL 패턴 감지
        if (key && (key.toLowerCase().includes('url') || key.toLowerCase().includes('website'))) {
          schema.format = 'uri'
        }
        
        // 날짜 패턴 감지
        if (key && (key.toLowerCase().includes('date') || key.toLowerCase().includes('time'))) {
          if (value.match(/^\d{4}-\d{2}-\d{2}/)) {
            schema.format = 'date-time'
          }
        }
        break
        
      case 'number':
        if (options.value.includeExamples) {
          schema.example = value
        }
        
        // 정수인지 확인
        if (Number.isInteger(value)) {
          schema.type = 'integer'
        }
        
        // ID 패턴 감지
        if (key && key.toLowerCase().includes('id')) {
          schema.minimum = 1
        }
        
        // 나이 패턴 감지
        if (key && key.toLowerCase().includes('age')) {
          schema.minimum = 0
          schema.maximum = 150
        }
        break
        
      case 'boolean':
        if (options.value.includeExamples) {
          schema.example = value
        }
        break
    }
    
    return schema
  }
  
  return {
    $schema: getSchemaUrl(),
    type: getType(data),
    ...generateSchemaForValue(data)
  }
}

// 스키마로 검증
const validateWithSchema = () => {
  if (!isValid.value || !schemaData.value) return
  
  try {
    const data = JSON.parse(inputJson.value)
    const schema = JSON.parse(schemaData.value)
    
    // 간단한 검증 로직 (실제로는 ajv 같은 라이브러리 사용 권장)
    const errors = validateAgainstSchema(data, schema)
    
    validationResult.value = {
      isValid: errors.length === 0,
      errors
    }
  } catch (error: any) {
    validationResult.value = {
      isValid: false,
      errors: [`검증 오류: ${error.message}`]
    }
  }
}

// 간단한 스키마 검증 로직
const validateAgainstSchema = (data: any, schema: any): string[] => {
  const errors: string[] = []
  
  const validateValue = (value: any, schemaNode: any, path: string = '') => {
    // 타입 검증
    if (schemaNode.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value
      if (actualType !== schemaNode.type) {
        errors.push(`${path}: 예상 타입 ${schemaNode.type}, 실제 타입 ${actualType}`)
        return
      }
    }
    
    // 객체 속성 검증
    if (schemaNode.type === 'object' && schemaNode.properties) {
      if (typeof value === 'object' && value !== null) {
        // 필수 속성 검증
        if (schemaNode.required) {
          schemaNode.required.forEach((requiredProp: string) => {
            if (!(requiredProp in value)) {
              errors.push(`${path}: 필수 속성 '${requiredProp}'이 누락됨`)
            }
          })
        }
        
        // 각 속성 검증
        Object.entries(value).forEach(([key, val]) => {
          if (schemaNode.properties[key]) {
            validateValue(val, schemaNode.properties[key], `${path}.${key}`)
          }
        })
      }
    }
    
    // 배열 검증
    if (schemaNode.type === 'array' && schemaNode.items) {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          validateValue(item, schemaNode.items, `${path}[${index}]`)
        })
      }
    }
    
    // 문자열 길이 검증
    if (schemaNode.type === 'string' && typeof value === 'string') {
      if (schemaNode.minLength && value.length < schemaNode.minLength) {
        errors.push(`${path}: 최소 길이 ${schemaNode.minLength}, 실제 길이 ${value.length}`)
      }
    }
    
    // 숫자 범위 검증
    if (schemaNode.type === 'number' && typeof value === 'number') {
      if (schemaNode.minimum && value < schemaNode.minimum) {
        errors.push(`${path}: 최솟값 ${schemaNode.minimum}, 실제값 ${value}`)
      }
      if (schemaNode.maximum && value > schemaNode.maximum) {
        errors.push(`${path}: 최댓값 ${schemaNode.maximum}, 실제값 ${value}`)
      }
    }
  }
  
  validateValue(data, schema, 'root')
  return errors
}

// 스키마 복사
const copySchema = async () => {
  try {
    await navigator.clipboard.writeText(schemaData.value)
    alert('스키마가 클립보드에 복사되었습니다!')
  } catch (error) {
    alert('복사에 실패했습니다.')
  }
}

// 스키마 다운로드
const downloadSchema = () => {
  const blob = new Blob([schemaData.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'schema.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.schema-generator {
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

.generator-content {
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

.schema-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--color-text-primary);
}

.option-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  margin-top: 0.5rem;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
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

.validation-result {
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid;
}

.validation-result.valid {
  background: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
}

.validation-result.invalid {
  background: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
}

.validation-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.validation-errors {
  margin-top: 0.5rem;
}

.error-item {
  padding: 0.25rem 0;
  font-size: 0.9rem;
  border-bottom: 1px solid rgba(0,0,0,0.1);
}

.error-item:last-child {
  border-bottom: none;
}

.schema-wrapper {
  position: relative;
}

.schema-display {
  width: 100%;
  max-height: 400px;
  padding: 1rem;
  background: var(--color-background-primary);
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-primary);
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.schema-info {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.empty-schema {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-secondary);
}

.empty-schema svg {
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
  .generator-content {
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