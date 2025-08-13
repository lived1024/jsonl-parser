<template>
  <div class="json-cheatsheet">
    <div class="cheatsheet-header">
      <h2>JSON 치트시트</h2>
      <p>JSON 구문과 데이터 타입에 대한 빠른 참조 가이드</p>
    </div>
    
    <div class="cheatsheet-content">
      <!-- 검색 기능 -->
      <div class="search-section">
        <div class="search-wrapper">
          <Search :size="20" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="구문 검색... (Ctrl+K)"
            class="search-input"
          />
          <div class="keyboard-shortcut">
            <kbd>Ctrl</kbd> + <kbd>K</kbd>
          </div>
        </div>
      </div>
      
      <!-- 광고 배치 -->
      <div class="ad-section">
        <SafeAdContainer 
          ad-slot="content-rectangle"
          ad-format="rectangle"
          class-name="cheatsheet-ad"
        />
      </div>
      
      <!-- 치트시트 섹션들 -->
      <div class="sections-grid">
        <div 
          v-for="section in filteredSections" 
          :key="section.id"
          class="cheatsheet-section"
        >
          <div class="section-header">
            <component :is="section.icon" :size="24" />
            <h3>{{ section.title }}</h3>
          </div>
          
          <div class="section-content">
            <div 
              v-for="item in section.items" 
              :key="item.id"
              class="syntax-item"
              @click="copyToClipboard(item.code, item.id)"
            >
              <div class="syntax-header">
                <h4>{{ item.name }}</h4>
                <button 
                  class="copy-button" 
                  :class="{ 'copied': copiedItems.has(item.id) }"
                  :title="copiedItems.has(item.id) ? '복사됨!' : '클립보드에 복사'"
                >
                  <component :is="copiedItems.has(item.id) ? 'Check' : 'Copy'" :size="16" />
                </button>
              </div>
              
              <div class="syntax-description">
                {{ item.description }}
              </div>
              
              <div class="syntax-code">
                <pre><code>{{ item.code }}</code></pre>
              </div>
              
              <div v-if="item.example" class="syntax-example">
                <div class="example-label">예제:</div>
                <pre><code>{{ item.example }}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  Search, 
  Copy, 
  Check,
  Type, 
  List, 
  Braces, 
  Hash,
  Quote,
  ToggleLeft
} from 'lucide-vue-next'
import SafeAdContainer from '../tools/SafeAdContainer.vue'

interface SyntaxItem {
  id: string
  name: string
  description: string
  code: string
  example?: string
}

interface CheatsheetSection {
  id: string
  title: string
  icon: any
  items: SyntaxItem[]
}

const searchQuery = ref('')

// 치트시트 데이터
const sections = ref<CheatsheetSection[]>([
  {
    id: 'basic-types',
    title: '기본 데이터 타입',
    icon: Type,
    items: [
      {
        id: 'string',
        name: '문자열 (String)',
        description: '큰따옴표로 감싼 텍스트 데이터',
        code: '"문자열"',
        example: '"Hello, World!"'
      },
      {
        id: 'number',
        name: '숫자 (Number)',
        description: '정수 또는 부동소수점 숫자',
        code: '123\n3.14\n-42',
        example: '42\n3.14159\n-273.15'
      },
      {
        id: 'boolean',
        name: '불린 (Boolean)',
        description: '참(true) 또는 거짓(false) 값',
        code: 'true\nfalse',
        example: 'true\nfalse'
      },
      {
        id: 'null',
        name: '널 (Null)',
        description: '값이 없음을 나타내는 특수 값',
        code: 'null',
        example: 'null'
      }
    ]
  },
  {
    id: 'objects',
    title: '객체 (Objects)',
    icon: Braces,
    items: [
      {
        id: 'empty-object',
        name: '빈 객체',
        description: '속성이 없는 객체',
        code: '{}',
        example: '{}'
      },
      {
        id: 'simple-object',
        name: '단순 객체',
        description: '키-값 쌍으로 구성된 객체',
        code: '{\n  "key": "value",\n  "number": 42\n}',
        example: '{\n  "name": "홍길동",\n  "age": 30,\n  "city": "서울"\n}'
      },
      {
        id: 'nested-object',
        name: '중첩 객체',
        description: '객체 안에 다른 객체를 포함',
        code: '{\n  "user": {\n    "name": "John",\n    "profile": {\n      "age": 25\n    }\n  }\n}',
        example: '{\n  "company": {\n    "name": "테크회사",\n    "address": {\n      "city": "서울",\n      "district": "강남구"\n    }\n  }\n}'
      }
    ]
  },
  {
    id: 'arrays',
    title: '배열 (Arrays)',
    icon: List,
    items: [
      {
        id: 'empty-array',
        name: '빈 배열',
        description: '요소가 없는 배열',
        code: '[]',
        example: '[]'
      },
      {
        id: 'simple-array',
        name: '단순 배열',
        description: '같은 타입의 요소들로 구성된 배열',
        code: '[1, 2, 3, 4, 5]',
        example: '["사과", "바나나", "오렌지"]'
      },
      {
        id: 'mixed-array',
        name: '혼합 배열',
        description: '다양한 타입의 요소들로 구성된 배열',
        code: '[1, "text", true, null]',
        example: '[42, "안녕하세요", true, null]'
      },
      {
        id: 'object-array',
        name: '객체 배열',
        description: '객체들로 구성된 배열',
        code: '[\n  {"name": "John", "age": 30},\n  {"name": "Jane", "age": 25}\n]',
        example: '[\n  {"제품": "노트북", "가격": 1200000},\n  {"제품": "마우스", "가격": 30000}\n]'
      }
    ]
  },
  {
    id: 'special-cases',
    title: '특수 경우',
    icon: Hash,
    items: [
      {
        id: 'escape-characters',
        name: '이스케이프 문자',
        description: '특수 문자를 문자열에 포함하는 방법',
        code: '"He said \\"Hello\\""\n"Line 1\\nLine 2"\n"Tab\\tSeparated"',
        example: '"그는 \\"안녕하세요\\"라고 말했다"\n"첫 번째 줄\\n두 번째 줄"'
      },
      {
        id: 'unicode',
        name: '유니코드',
        description: '유니코드 문자 표현',
        code: '"\\u0048\\u0065\\u006C\\u006C\\u006F"',
        example: '"\\uC548\\uB155\\uD558\\uC138\\uC694"'
      },
      {
        id: 'numbers-special',
        name: '특수 숫자',
        description: '과학적 표기법과 특수 숫자 형식',
        code: '1.23e10\n1.23E-4\n0.123',
        example: '6.022e23\n1.602E-19\n0.00001'
      }
    ]
  },
  {
    id: 'common-patterns',
    title: '일반적인 패턴',
    icon: Hash,
    items: [
      {
        id: 'api-response',
        name: 'API 응답 패턴',
        description: '일반적인 REST API 응답 구조',
        code: '{\n  "success": true,\n  "data": {...},\n  "message": "Success",\n  "timestamp": "2024-01-01T00:00:00Z"\n}',
        example: '{\n  "success": true,\n  "data": {\n    "id": 123,\n    "name": "사용자"\n  },\n  "message": "조회 성공",\n  "timestamp": "2024-01-01T12:00:00Z"\n}'
      },
      {
        id: 'pagination',
        name: '페이지네이션',
        description: '페이지네이션이 포함된 데이터 구조',
        code: '{\n  "data": [...],\n  "pagination": {\n    "page": 1,\n    "limit": 10,\n    "total": 100,\n    "hasNext": true\n  }\n}',
        example: '{\n  "data": [{"id": 1}, {"id": 2}],\n  "pagination": {\n    "page": 1,\n    "limit": 10,\n    "total": 25,\n    "hasNext": true\n  }\n}'
      },
      {
        id: 'error-response',
        name: '오류 응답',
        description: '표준화된 오류 응답 형식',
        code: '{\n  "error": {\n    "code": "ERROR_CODE",\n    "message": "Error description",\n    "details": {...}\n  }\n}',
        example: '{\n  "error": {\n    "code": "VALIDATION_ERROR",\n    "message": "입력값이 올바르지 않습니다",\n    "details": {\n      "field": "email",\n      "reason": "Invalid format"\n    }\n  }\n}'
      }
    ]
  },
  {
    id: 'validation-rules',
    title: '검증 규칙',
    icon: ToggleLeft,
    items: [
      {
        id: 'required-fields',
        name: '필수 필드',
        description: 'JSON 스키마에서 필수 필드 정의',
        code: '{\n  "type": "object",\n  "required": ["name", "email"],\n  "properties": {\n    "name": {"type": "string"},\n    "email": {"type": "string"}\n  }\n}',
        example: '{\n  "type": "object",\n  "required": ["title", "content"],\n  "properties": {\n    "title": {"type": "string", "minLength": 1},\n    "content": {"type": "string"}\n  }\n}'
      },
      {
        id: 'data-types',
        name: '데이터 타입 검증',
        description: 'JSON 스키마 데이터 타입 정의',
        code: '{\n  "type": "object",\n  "properties": {\n    "age": {"type": "integer", "minimum": 0},\n    "score": {"type": "number", "maximum": 100}\n  }\n}',
        example: '{\n  "type": "object",\n  "properties": {\n    "price": {"type": "number", "minimum": 0},\n    "quantity": {"type": "integer", "minimum": 1}\n  }\n}'
      }
    ]
  }
])

// 검색 필터링
const filteredSections = computed(() => {
  if (!searchQuery.value.trim()) {
    return sections.value
  }
  
  const query = searchQuery.value.toLowerCase()
  
  return sections.value.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query)
    )
  })).filter(section => section.items.length > 0)
})

// 복사 상태 관리
const copiedItems = ref<Set<string>>(new Set())

// 클립보드에 복사
const copyToClipboard = async (text: string, itemId: string) => {
  try {
    await navigator.clipboard.writeText(text)
    copiedItems.value.add(itemId)
    
    // 2초 후 복사 상태 초기화
    setTimeout(() => {
      copiedItems.value.delete(itemId)
    }, 2000)
  } catch (error) {
    console.error('복사 실패:', error)
    // 폴백: 텍스트 선택
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      copiedItems.value.add(itemId)
      setTimeout(() => {
        copiedItems.value.delete(itemId)
      }, 2000)
    } catch (fallbackError) {
      console.error('폴백 복사도 실패:', fallbackError)
    }
    document.body.removeChild(textArea)
  }
}

// 키보드 단축키 처리
const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl/Cmd + K로 검색 포커스
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault()
    const searchInput = document.querySelector('.search-input') as HTMLInputElement
    if (searchInput) {
      searchInput.focus()
    }
  }
  
  // Escape로 검색 초기화
  if (event.key === 'Escape' && searchQuery.value) {
    searchQuery.value = ''
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.json-cheatsheet {
  max-width: 1200px;
  margin: 0 auto;
}

.cheatsheet-header {
  text-align: center;
  margin-bottom: 2rem;
}

.cheatsheet-header h2 {
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.cheatsheet-header p {
  color: var(--color-text-secondary);
}

.search-section {
  margin-bottom: 2rem;
}

.search-wrapper {
  position: relative;
  max-width: 400px;
  margin: 0 auto;
}

.search-wrapper svg {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  font-size: 1rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.keyboard-shortcut {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  pointer-events: none;
}

.keyboard-shortcut kbd {
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: 3px;
  padding: 0.125rem 0.25rem;
  font-size: 0.7rem;
  font-family: monospace;
}

.ad-section {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

.sections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
}

.cheatsheet-section {
  background: var(--color-background-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--color-border);
}

.section-header h3 {
  color: var(--color-text-primary);
  margin: 0;
}

.section-header svg {
  color: var(--color-primary);
}

.syntax-item {
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.syntax-item:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.syntax-item:last-child {
  margin-bottom: 0;
}

.syntax-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.syntax-header h4 {
  color: var(--color-text-primary);
  margin: 0;
  font-size: 1rem;
}

.copy-button {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.copy-button:hover {
  color: var(--color-primary);
  background: var(--color-background-primary);
}

.copy-button.copied {
  color: #22c55e;
  background: #dcfce7;
}

.copy-button.copied:hover {
  color: #16a34a;
  background: #bbf7d0;
}

.syntax-description {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.syntax-code {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
}

.syntax-code pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #333;
}

.syntax-example {
  border-top: 1px solid var(--color-border);
  padding-top: 0.75rem;
}

.example-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}

.syntax-example pre {
  background: #e8f5e8;
  border: 1px solid #c3e6c3;
  border-radius: 4px;
  padding: 0.5rem;
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85rem;
  line-height: 1.4;
  color: #2d5a2d;
}

/* 광고 스타일 */
:deep(.cheatsheet-ad) {
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 300px;
}

@media (max-width: 1024px) {
  .sections-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .sections-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .cheatsheet-section {
    padding: 1rem;
  }
  
  .syntax-item {
    padding: 0.75rem;
  }
  
  :deep(.cheatsheet-ad) {
    min-height: 200px;
    padding: 0.5rem;
  }
}
</style>