import { marked } from 'marked'
import hljs from 'highlight.js'

export interface ContentMetadata {
  title: string
  description: string
  author: string
  lastUpdated: Date
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedReadTime: number
  category: string
  relatedTools?: string[]
  interactiveExamples?: InteractiveExample[]
}

export interface InteractiveExample {
  id: string
  title: string
  description: string
  data: string
  type: 'json' | 'jsonl'
}

export interface GuideContent {
  id: string
  metadata: ContentMetadata
  content: string
  renderedContent: string
  tableOfContents: TableOfContentsItem[]
}

export interface TableOfContentsItem {
  id: string
  text: string
  level: number
}

export interface GuideCategory {
  id: string
  name: string
  description: string
  guides: string[]
}

export interface Tutorial {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
  tags: string[]
  estimatedReadTime: number
  lastUpdated: Date
  author: string
}

class ContentService {
  private static instance: ContentService | null = null
  private contentCache = new Map<string, GuideContent>()
  private categoriesCache: GuideCategory[] | null = null

  constructor() {
    this.setupMarked()
  }

  static getInstance(): ContentService {
    if (!ContentService.instance) {
      ContentService.instance = new ContentService()
    }
    return ContentService.instance
  }

  private setupMarked() {
    marked.setOptions({
      breaks: true,
      gfm: true
    })

    // Set up custom renderer for code highlighting
    const renderer = new marked.Renderer()
    renderer.code = function ({ text, lang }: { text: string; lang?: string; escaped?: boolean }) {
      if (lang && hljs.getLanguage(lang)) {
        const highlighted = hljs.highlight(text, { language: lang }).value
        return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`
      }
      const highlighted = hljs.highlightAuto(text).value
      return `<pre><code class="hljs">${highlighted}</code></pre>`
    }

    marked.setOptions({ renderer })
  }

  async getGuideCategories(): Promise<GuideCategory[]> {
    if (this.categoriesCache) {
      return this.categoriesCache
    }

    // In a real implementation, this would load from a configuration file or API
    this.categoriesCache = [
      {
        id: 'getting-started',
        name: '시작하기',
        description: 'JSON과 JSONL의 기본 개념을 학습합니다',
        guides: ['json-basics', 'jsonl-introduction', 'parser-overview']
      },
      {
        id: 'api-development',
        name: 'API 개발',
        description: 'REST API 설계와 JSON 스키마 활용법을 배웁니다',
        guides: ['rest-api-design', 'json-schema-guide', 'api-versioning']
      },
      {
        id: 'data-processing',
        name: '데이터 처리',
        description: '대용량 데이터 처리와 변환 기법을 다룹니다',
        guides: ['large-datasets', 'data-transformation', 'error-handling']
      },
      {
        id: 'performance',
        name: '성능 최적화',
        description: 'JSON 처리 성능을 향상시키는 방법을 학습합니다',
        guides: ['optimization-tips', 'caching-strategies']
      }
    ]

    return this.categoriesCache
  }

  async getGuide(guideId: string): Promise<GuideContent | null> {
    // Check cache first
    if (this.contentCache.has(guideId)) {
      return this.contentCache.get(guideId)!
    }
    try {
      const guideContent = await this.loadGuideContent(guideId)
      this.contentCache.set(guideId, guideContent)
      return guideContent
    } catch (error) {
      console.error(`Failed to load guide ${guideId}:`, error)
      return null
    }
  }

  private async loadGuideContent(guideId: string): Promise<GuideContent> {
    // In a real implementation, this would load from markdown files
    // For now, we'll use mock data based on the files we created
    const mockContent = this.getMockContent(guideId)
    if (!mockContent) {
      throw new Error(`Guide ${guideId} not found`)
    }

    const renderedContent = await marked(mockContent.content)
    const tableOfContents = this.generateTableOfContents(mockContent.content)
    return {
      id: guideId,
      metadata: mockContent.metadata,
      content: mockContent.content,
      renderedContent,
      tableOfContents
    }
  }

  private getMockContent(guideId: string): { metadata: ContentMetadata; content: string } | null {
    const mockGuides: Record<string, { metadata: ContentMetadata; content: string }> = {
      'json-basics': {
        metadata: {
          title: 'JSON 기초',
          description: 'JSON의 기본 개념과 구조를 학습합니다',
          author: 'JSON Parser Team',
          lastUpdated: new Date('2024-01-15'),
          tags: ['json', 'basics', 'syntax'],
          difficulty: 'beginner',
          estimatedReadTime: 5,
          category: 'getting-started',
          relatedTools: ['json-validator', 'json-formatter'],
          interactiveExamples: [
            {
              id: 'basic-json',
              title: '기본 JSON 예제',
              description: '간단한 JSON 객체를 파서에서 확인해보세요',
              data: '{"name": "홍길동", "age": 30, "city": "서울"}',
              type: 'json'
            }
          ]
        },
        content: `# JSON 기초

JSON(JavaScript Object Notation)은 경량의 데이터 교환 형식입니다. 사람이 읽고 쓰기 쉽고, 기계가 파싱하고 생성하기 쉽습니다.

## 기본 구조

JSON은 다음과 같은 기본 구조를 가집니다:

\`\`\`json
{
  "name": "홍길동",
  "age": 30,
  "city": "서울"
}
\`\`\`

## 데이터 타입

JSON은 다음 데이터 타입을 지원합니다:

### 문자열 (String)
\`\`\`json
{
  "message": "Hello World",
  "description": "이것은 문자열입니다"
}
\`\`\`

### 숫자 (Number)
\`\`\`json
{
  "integer": 42,
  "float": 3.14,
  "negative": -10
}
\`\`\`

### 불린 (Boolean)
\`\`\`json
{
  "isActive": true,
  "isCompleted": false
}
\`\`\`

### null
\`\`\`json
{
  "data": null,
  "optional": null
}
\`\`\`

### 객체 (Object)
\`\`\`json
{
  "user": {
    "name": "홍길동",
    "email": "hong@example.com"
  }
}
\`\`\`

### 배열 (Array)
\`\`\`json
{
  "numbers": [1, 2, 3, 4, 5],
  "names": ["홍길동", "김철수", "이영희"]
}
\`\`\`

## 복잡한 예제

다음은 실제 애플리케이션에서 사용될 수 있는 복잡한 JSON 구조의 예제입니다:

\`\`\`json
{
  "users": [
    {
      "id": 1,
      "name": "홍길동",
      "email": "hong@example.com",
      "profile": {
        "avatar": "https://example.com/avatar1.jpg",
        "bio": "소프트웨어 개발자"
      },
      "preferences": {
        "theme": "dark",
        "notifications": {
          "email": true,
          "push": false,
          "sms": true
        }
      },
      "roles": ["user", "admin"],
      "lastLogin": "2024-02-20T10:30:00Z",
      "isActive": true
    }
  ],
  "metadata": {
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
\`\`\`

## JSON 규칙

JSON을 작성할 때 다음 규칙을 따라야 합니다:

1. **문자열은 큰따옴표로 감싸야 합니다** - 작은따옴표는 사용할 수 없습니다
2. **키는 항상 문자열이어야 합니다** - 큰따옴표로 감싸야 합니다
3. **마지막 요소 뒤에 쉼표를 사용하면 안 됩니다** - trailing comma 금지
4. **주석을 사용할 수 없습니다** - JSON은 주석을 지원하지 않습니다

## 일반적인 실수

### 잘못된 예제
\`\`\`json
{
  'name': 'John',        // 작은따옴표 사용 (잘못됨)
  age: 30,               // 키에 따옴표 없음 (잘못됨)
  "city": "Seoul",       // 마지막 쉼표 (잘못됨)
}
\`\`\`

### 올바른 예제
\`\`\`json
{
  "name": "John",
  "age": 30,
  "city": "Seoul"
}
\`\`\`

## 다음 단계

JSON의 기본을 이해했다면 다음 주제들을 학습해보세요:

- [JSONL 소개](/info/jsonl-introduction)
- [JSON 스키마 가이드](/info/json-schema-guide)
- [API 설계 모범 사례](/info/rest-api-design)

## 관련 도구

- [JSON 검증기](/tools/json-validator) - JSON 구문 검증
- [JSON 포맷터](/tools/json-formatter) - JSON 정리 및 압축
- [데이터 변환기](/tools/data-converter) - JSON을 다른 형식으로 변환`
      },
      'jsonl-introduction': {
        metadata: {
          title: 'JSONL 소개',
          description: 'JSONL(JSON Lines) 형식의 특징과 활용법을 배웁니다',
          author: 'JSON Parser Team',
          lastUpdated: new Date('2024-01-20'),
          tags: ['jsonl', 'format', 'streaming'],
          difficulty: 'beginner',
          estimatedReadTime: 7,
          category: 'getting-started',
          relatedTools: ['jsonl-parser', 'data-converter'],
          interactiveExamples: [
            {
              id: 'basic-jsonl',
              title: '기본 JSONL 예제',
              description: 'JSONL 형식의 데이터를 파서에서 확인해보세요',
              data: '{"name": "홍길동", "age": 30}\n{"name": "김철수", "age": 25}\n{"name": "이영희", "age": 28}',
              type: 'jsonl'
            }
          ]
        },
        content: `# JSONL 소개

JSONL(JSON Lines)은 구조화된 데이터를 저장하고 스트리밍하기 위한 편리한 형식입니다. 각 줄이 유효한 JSON 객체인 텍스트 형식입니다.

## JSONL이란?

JSONL은 다음과 같은 특징을 가집니다:

- 각 줄은 유효한 JSON 값입니다 (보통 객체)
- 줄 구분자는 \`\\n\` (LF) 또는 \`\\r\\n\` (CRLF)입니다
- 파일 확장자는 \`.jsonl\` 또는 \`.ndjson\`을 사용합니다

## 기본 형식

### JSON vs JSONL 비교

**JSON 배열:**
\`\`\`json
[
  {"name": "홍길동", "age": 30},
  {"name": "김철수", "age": 25},
  {"name": "이영희", "age": 28}
]
\`\`\`

**JSONL:**
\`\`\`jsonl
{"name": "홍길동", "age": 30}
{"name": "김철수", "age": 25}
{"name": "이영희", "age": 28}
\`\`\`

## JSONL의 장점

### 1. 스트리밍 처리
JSONL은 전체 파일을 메모리에 로드하지 않고도 한 줄씩 처리할 수 있습니다.

### 2. 추가 용이성
새로운 데이터를 파일 끝에 간단히 추가할 수 있습니다.

### 3. 부분 손상 복구
한 줄이 손상되어도 다른 줄들은 여전히 유효합니다.

## 실제 사용 사례

### 1. 로그 데이터
\`\`\`jsonl
{"timestamp": "2024-02-20T10:30:00Z", "level": "INFO", "message": "User logged in", "userId": 123}
{"timestamp": "2024-02-20T10:31:15Z", "level": "ERROR", "message": "Database connection failed", "error": "Connection timeout"}
{"timestamp": "2024-02-20T10:32:00Z", "level": "INFO", "message": "User logged out", "userId": 123}
\`\`\`

### 2. API 응답 데이터
\`\`\`jsonl
{"id": 1, "name": "Product A", "price": 29.99, "category": "electronics"}
{"id": 2, "name": "Product B", "price": 19.99, "category": "books"}
{"id": 3, "name": "Product C", "price": 39.99, "category": "clothing"}
\`\`\`

## 다음 단계

JSONL의 기본을 이해했다면 다음 주제들을 학습해보세요:

- [대용량 데이터셋 처리](/info/large-datasets)
- [데이터 변환 기법](/info/data-transformation)
- [스트리밍 처리 최적화](/info/streaming-optimization)

## 관련 도구

- [JSONL 파서](/tools/jsonl-parser) - JSONL 파일 파싱 및 검증
- [데이터 변환기](/tools/data-converter) - JSONL을 다른 형식으로 변환
- [스트리밍 뷰어](/tools/streaming-viewer) - 대용량 JSONL 파일 탐색`
      },
      'rest-api-design': {
        metadata: {
          title: 'REST API 설계 모범 사례',
          description: 'JSON을 사용하는 REST API 설계의 모범 사례를 학습합니다',
          author: 'JSON Parser Team',
          lastUpdated: new Date('2024-01-25'),
          tags: ['api', 'rest', 'design', 'best-practices'],
          difficulty: 'intermediate',
          estimatedReadTime: 15,
          category: 'api-development',
          relatedTools: ['api-tester', 'schema-generator'],
          interactiveExamples: [
            {
              id: 'api-response',
              title: 'API 응답 예제',
              description: '표준적인 REST API 응답 구조를 확인해보세요',
              data: '{"success": true, "data": {"id": 123, "name": "홍길동", "email": "hong@example.com"}, "meta": {"timestamp": "2024-02-20T10:30:00Z", "version": "1.0"}}',
              type: 'json'
            }
          ]
        },
        content: `# REST API 설계 모범 사례

REST(Representational State Transfer) API는 현대 웹 애플리케이션의 핵심입니다. 이 가이드에서는 JSON을 사용하는 REST API 설계의 모범 사례를 다룹니다.

## REST API 기본 원칙

### 1. 리소스 중심 설계
API는 리소스(명사)를 중심으로 설계되어야 합니다:

\`\`\`
✅ 좋은 예:
GET /users          # 사용자 목록 조회
GET /users/123      # 특정 사용자 조회
POST /users         # 새 사용자 생성
PUT /users/123      # 사용자 정보 수정
DELETE /users/123   # 사용자 삭제

❌ 나쁜 예:
GET /getUsers
POST /createUser
PUT /updateUser/123
DELETE /deleteUser/123
\`\`\`

### 2. HTTP 메서드 적절한 사용

| 메서드 | 용도 | 예제 |
|--------|------|------|
| GET | 리소스 조회 | \`GET /users/123\` |
| POST | 리소스 생성 | \`POST /users\` |
| PUT | 리소스 전체 수정 | \`PUT /users/123\` |
| PATCH | 리소스 부분 수정 | \`PATCH /users/123\` |
| DELETE | 리소스 삭제 | \`DELETE /users/123\` |

## JSON 응답 구조 설계

### 1. 일관된 응답 형식

**성공 응답:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "홍길동",
    "email": "hong@example.com"
  },
  "meta": {
    "timestamp": "2024-02-20T10:30:00Z",
    "version": "1.0"
  }
}
\`\`\`

**오류 응답:**
\`\`\`json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력 데이터가 유효하지 않습니다",
    "details": [
      {
        "field": "email",
        "message": "유효한 이메일 주소를 입력해주세요"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-02-20T10:30:00Z",
    "request_id": "req_123456"
  }
}
\`\`\`

## 다음 단계

REST API 설계의 기본을 이해했다면 다음 주제들을 학습해보세요:

- [JSON 스키마 가이드](/info/json-schema-guide)
- [API 버전 관리](/info/api-versioning)
- [GraphQL vs REST](/info/graphql-vs-rest)

## 관련 도구

- [API 테스터](/tools/api-tester) - REST API 테스트 도구
- [JSON 스키마 생성기](/tools/schema-generator) - API 스키마 자동 생성
- [Mock 서버](/tools/mock-server) - API 모킹 도구`
      },
      'parser-overview': {
        metadata: {
          title: '파서 개요',
          description: 'JSONL Parser의 주요 기능과 사용법을 소개합니다',
          author: 'JSON Parser Team',
          lastUpdated: new Date('2024-01-10'),
          tags: ['parser', 'overview', 'features'],
          difficulty: 'beginner',
          estimatedReadTime: 8,
          category: 'getting-started',
          relatedTools: ['json-parser', 'jsonl-parser']
        },
        content: `# 파서 개요

JSONL Parser는 JSON과 JSONL 데이터를 시각적으로 탐색할 수 있는 강력한 도구입니다. 복잡한 데이터 구조를 이해하기 쉬운 트리 형태로 표시합니다.

## 주요 기능

### 1. 다중 형식 지원
- **JSON**: 단일 객체나 배열
- **JSONL**: 줄 단위 JSON 데이터

### 2. 실시간 파싱
입력한 데이터를 즉시 파싱하여 결과를 표시합니다.

### 3. 트리 뷰어
계층적 구조를 직관적으로 탐색할 수 있습니다.

## 사용법

1. 좌측 패널에 JSON 또는 JSONL 데이터를 입력
2. 우측에서 파싱된 트리 구조 확인
3. 노드를 클릭하여 확장/축소

## 다음 단계

- [JSON 기초](/info/json-basics)
- [JSONL 소개](/info/jsonl-introduction)`
      },
      'json-schema-guide': {
        metadata: {
          title: 'JSON 스키마 가이드',
          description: 'JSON 스키마를 사용한 데이터 검증 방법을 학습합니다',
          author: 'JSON Parser Team',
          lastUpdated: new Date('2024-01-30'),
          tags: ['json-schema', 'validation', 'api'],
          difficulty: 'intermediate',
          estimatedReadTime: 12,
          category: 'api-development',
          relatedTools: ['schema-validator', 'api-tester']
        },
        content: `# JSON 스키마 가이드

JSON 스키마는 JSON 데이터의 구조와 제약 조건을 정의하는 표준입니다.

## 기본 스키마

\`\`\`json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "age": {
      "type": "number",
      "minimum": 0
    }
  },
  "required": ["name"]
}
\`\`\`

## 데이터 타입

- string
- number
- boolean
- object
- array
- null

## 검증 키워드

### 문자열
- minLength, maxLength
- pattern (정규식)

### 숫자
- minimum, maximum
- multipleOf

### 객체
- properties
- required
- additionalProperties

### 배열
- items
- minItems, maxItems
- uniqueItems`
      },
      'api-versioning': {
        metadata: {
          title: 'API 버전 관리',
          description: 'REST API의 효과적인 버전 관리 전략을 학습합니다',
          author: 'JSON Parser Team',
          lastUpdated: new Date('2024-02-01'),
          tags: ['api', 'versioning', 'maintenance'],
          difficulty: 'intermediate',
          estimatedReadTime: 10,
          category: 'api-development',
          relatedTools: ['api-tester']
        },
        content: `# API 버전 관리

API 버전 관리는 기존 클라이언트의 호환성을 유지하면서 API를 발전시키는 중요한 전략입니다.

## 버전 관리 방법

### 1. URL 경로 버전
\`\`\`
GET /v1/users
GET /v2/users
\`\`\`

### 2. 헤더 버전
\`\`\`
GET /users
Accept: application/vnd.api+json;version=1
\`\`\`

### 3. 쿼리 파라미터
\`\`\`
GET /users?version=1
\`\`\`

## 버전 관리 전략

### 시맨틱 버전
- Major.Minor.Patch (1.2.3)
- 호환성 변경: Major 증가
- 기능 추가: Minor 증가
- 버그 수정: Patch 증가

## 모범 사례

1. 명확한 버전 정책 수립
2. 충분한 지원 기간 제공
3. 마이그레이션 가이드 제공
4. 하위 호환성 최대한 유지`
      },
      'large-datasets': {
        metadata: {
          title: '대용량 데이터셋 처리',
          description: '대용량 JSON/JSONL 데이터를 효율적으로 처리하는 방법을 학습합니다',
          author: 'JSON Parser Team',
          lastUpdated: new Date('2024-02-05'),
          tags: ['performance', 'large-data', 'optimization'],
          difficulty: 'advanced',
          estimatedReadTime: 15,
          category: 'data-processing',
          relatedTools: ['streaming-parser', 'batch-processor']
        },
        content: `# 대용량 데이터셋 처리

대용량 JSON/JSONL 데이터를 효율적으로 처리하기 위한 전략과 기법을 다룹니다.

## 스트리밍 처리

### JSONL의 장점
- 메모리 효율적
- 부분 처리 가능
- 실시간 처리 지원

### 구현 예제
\`\`\`javascript
async function processLargeJSONL(stream) {
  const reader = stream.getReader()
  let buffer = ''
  
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    
    buffer += new TextDecoder().decode(value)
    const lines = buffer.split('\\n')
    buffer = lines.pop() // 마지막 불완전한 줄 보관
    
    for (const line of lines) {
      if (line.trim()) {
        const data = JSON.parse(line)
        await processRecord(data)
      }
    }
  }
}
\`\`\`

## 메모리 최적화

### 1. 청크 단위 처리
- 데이터를 작은 단위로 분할
- 메모리 사용량 제한

### 2. 지연 로딩
- 필요한 시점에만 데이터 로드
- 가상화 기법 활용

## 성능 최적화

### 1. 인덱싱
- 자주 검색하는 필드 인덱싱
- B-tree, Hash 인덱스 활용

### 2. 캐싱
- LRU 캐시 구현
- 메모리 기반 캐싱

### 3. 병렬 처리
- Worker 스레드 활용
- 배치 처리 최적화`
      },
      'data-transformation': {
        metadata: {
          title: '데이터 변환 기법',
          description: 'JSON 데이터를 다양한 형태로 변환하는 기법을 학습합니다',
          author: 'JSON Parser Team',
          lastUpdated: new Date('2024-02-08'),
          tags: ['transformation', 'data-processing', 'conversion'],
          difficulty: 'intermediate',
          estimatedReadTime: 12,
          category: 'data-processing',
          relatedTools: ['data-converter', 'transformer']
        },
        content: `# 데이터 변환 기법

JSON 데이터를 다양한 형태로 변환하고 가공하는 기법을 다룹니다.

## 기본 변환

### JSON to CSV
\`\`\`javascript
function jsonToCsv(jsonArray) {
  if (!jsonArray.length) return ''
  
  const headers = Object.keys(jsonArray[0])
  const csvRows = [headers.join(',')]
  
  for (const row of jsonArray) {
    const values = headers.map(header => {
      const value = row[header]
      return typeof value === 'string' ? \`"\${value}"\` : value
    })
    csvRows.push(values.join(','))
  }
  
  return csvRows.join('\\n')
}
\`\`\`

### JSON to XML
\`\`\`javascript
function jsonToXml(obj, rootName = 'root') {
  function objectToXml(obj, name) {
    if (typeof obj !== 'object') {
      return \`<\${name}>\${obj}</\${name}>\`
    }
    
    let xml = \`<\${name}>\`
    for (const [key, value] of Object.entries(obj)) {
      xml += objectToXml(value, key)
    }
    xml += \`</\${name}>\`
    return xml
  }
  
  return objectToXml(obj, rootName)
}
\`\`\`

## 고급 변환

### 스키마 기반 변환
- JSON Schema를 활용한 구조 변환
- 타입 안전성 보장

### 함수형 변환
- map, filter, reduce 활용
- 불변성 유지

## 변환 도구

### jq
명령줄 JSON 프로세서
\`\`\`bash
cat data.json | jq '.users[] | {name, email}'
\`\`\`

### JSONPath
JSON 데이터 쿼리 언어
\`\`\`javascript
const result = JSONPath.query(data, '$.users[*].name')
\`\`\``
      },
      'error-handling': {
        metadata: {
          title: '오류 처리',
          description: 'JSON 파싱과 처리 중 발생하는 오류를 효과적으로 처리하는 방법을 학습합니다',
          author: 'JSON Parser Team',
          lastUpdated: new Date('2024-02-10'),
          tags: ['error-handling', 'debugging', 'validation'],
          difficulty: 'intermediate',
          estimatedReadTime: 10,
          category: 'data-processing',
          relatedTools: ['error-detector', 'validator']
        },
        content: `# 오류 처리

JSON 파싱과 처리 과정에서 발생할 수 있는 다양한 오류를 효과적으로 처리하는 방법을 다룹니다.

## 일반적인 JSON 오류

### 1. 구문 오류
\`\`\`javascript
try {
  const data = JSON.parse(jsonString)
} catch (error) {
  if (error instanceof SyntaxError) {
    console.error('JSON 구문 오류:', error.message)
    // 오류 위치 표시
    const position = error.message.match(/position (\\d+)/)
    if (position) {
      console.error('오류 위치:', position[1])
    }
  }
}
\`\`\`

### 2. 타입 오류
\`\`\`javascript
function validateUser(user) {
  const errors = []
  
  if (typeof user.name !== 'string') {
    errors.push('name은 문자열이어야 합니다')
  }
  
  if (typeof user.age !== 'number' || user.age < 0) {
    errors.push('age는 0 이상의 숫자여야 합니다')
  }
  
  return errors
}
\`\`\`

## 오류 복구 전략

### 1. 부분 파싱
손상된 부분을 건너뛰고 유효한 데이터만 처리

### 2. 기본값 제공
누락된 필드에 대한 기본값 설정

### 3. 사용자 피드백
명확한 오류 메시지와 해결 방법 제시

## 검증 라이브러리

### Joi
\`\`\`javascript
const schema = Joi.object({
  name: Joi.string().required(),
  age: Joi.number().min(0).required()
})

const { error, value } = schema.validate(data)
\`\`\`

### Yup
\`\`\`javascript
const schema = yup.object({
  name: yup.string().required(),
  age: yup.number().positive().required()
})
\`\`\``
      },
      'optimization-tips': {
        metadata: {
          title: '성능 최적화 팁',
          description: 'JSON 처리 성능을 향상시키는 다양한 최적화 기법을 학습합니다',
          author: 'JSON Parser Team',
          lastUpdated: new Date('2024-02-12'),
          tags: ['performance', 'optimization', 'best-practices'],
          difficulty: 'advanced',
          estimatedReadTime: 18,
          category: 'performance',
          relatedTools: ['performance-analyzer', 'profiler']
        },
        content: `# 성능 최적화 팁

JSON 처리 성능을 향상시키기 위한 다양한 최적화 기법과 모범 사례를 다룹니다.

## 파싱 최적화

### 1. 스트리밍 파서 사용
대용량 데이터에 대해 메모리 효율적인 처리

\`\`\`javascript
// 스트리밍 JSON 파서 예제
import { parser } from 'stream-json'
import StreamValues from 'stream-json/streamers/StreamValues'

const pipeline = fs.createReadStream('large-file.json')
  .pipe(parser())
  .pipe(StreamValues.withParser())
  .on('data', (data) => {
    // 각 값을 개별적으로 처리
    processValue(data.value)
  })
\`\`\`

### 2. 선택적 파싱
필요한 필드만 추출하여 메모리 사용량 감소

## 메모리 최적화

### 1. 객체 풀링
\`\`\`javascript
class ObjectPool {
  constructor(createFn, resetFn) {
    this.createFn = createFn
    this.resetFn = resetFn
    this.pool = []
  }
  
  acquire() {
    return this.pool.length > 0 
      ? this.pool.pop() 
      : this.createFn()
  }
  
  release(obj) {
    this.resetFn(obj)
    this.pool.push(obj)
  }
}
\`\`\`

### 2. 가비지 컬렉션 최적화
- 불필요한 객체 참조 제거
- WeakMap, WeakSet 활용

## 캐싱 전략

### 1. LRU 캐시
\`\`\`javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.cache = new Map()
  }
  
  get(key) {
    if (this.cache.has(key)) {
      const value = this.cache.get(key)
      this.cache.delete(key)
      this.cache.set(key, value)
      return value
    }
    return null
  }
  
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }
}
\`\`\`

### 2. 메모이제이션
반복적인 계산 결과 캐싱

## 병렬 처리

### 1. Web Workers
\`\`\`javascript
// 메인 스레드
const worker = new Worker('json-processor.js')
worker.postMessage({ data: largeJsonData })
worker.onmessage = (e) => {
  console.log('처리 완료:', e.data)
}

// json-processor.js
self.onmessage = (e) => {
  const result = processLargeData(e.data.data)
  self.postMessage(result)
}
\`\`\`

### 2. 배치 처리
데이터를 청크 단위로 분할하여 처리

## 성능 측정

### 1. Performance API
\`\`\`javascript
performance.mark('json-parse-start')
const data = JSON.parse(jsonString)
performance.mark('json-parse-end')

performance.measure('json-parse', 'json-parse-start', 'json-parse-end')
const measure = performance.getEntriesByName('json-parse')[0]
console.log(\`파싱 시간: \${measure.duration}ms\`)
\`\`\`

### 2. 메모리 사용량 모니터링
\`\`\`javascript
if (performance.memory) {
  console.log('사용 중인 힙:', performance.memory.usedJSHeapSize)
  console.log('총 힙 크기:', performance.memory.totalJSHeapSize)
}
\`\`\``
      },
      'caching-strategies': {
        metadata: {
          title: '캐싱 전략',
          description: 'JSON 데이터 처리에서 효과적인 캐싱 전략을 학습합니다',
          author: 'JSON Parser Team',
          lastUpdated: new Date('2024-02-15'),
          tags: ['caching', 'performance', 'memory-management'],
          difficulty: 'advanced',
          estimatedReadTime: 14,
          category: 'performance',
          relatedTools: ['cache-manager', 'performance-monitor']
        },
        content: `# 캐싱 전략

JSON 데이터 처리에서 성능을 향상시키기 위한 다양한 캐싱 전략과 구현 방법을 다룹니다.

## 캐싱 레벨

### 1. 메모리 캐시
가장 빠른 접근 속도를 제공하는 인메모리 캐싱

\`\`\`javascript
class MemoryCache {
  constructor(maxSize = 1000, ttl = 300000) { // 5분 TTL
    this.cache = new Map()
    this.maxSize = maxSize
    this.ttl = ttl
  }
  
  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    })
  }
  
  get(key) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }
}
\`\`\`

### 2. 브라우저 캐시
localStorage, sessionStorage, IndexedDB 활용

\`\`\`javascript
class BrowserCache {
  constructor(storage = localStorage) {
    this.storage = storage
  }
  
  set(key, value, ttl = 3600000) { // 1시간 기본 TTL
    const item = {
      value,
      expiry: Date.now() + ttl
    }
    this.storage.setItem(key, JSON.stringify(item))
  }
  
  get(key) {
    const itemStr = this.storage.getItem(key)
    if (!itemStr) return null
    
    const item = JSON.parse(itemStr)
    if (Date.now() > item.expiry) {
      this.storage.removeItem(key)
      return null
    }
    
    return item.value
  }
}
\`\`\`

## 캐시 무효화 전략

### 1. TTL (Time To Live)
시간 기반 만료

### 2. 버전 기반
데이터 버전 변경 시 캐시 무효화

### 3. 태그 기반
관련 데이터 그룹 단위 무효화

## 캐시 워밍

### 1. 사전 로딩
\`\`\`javascript
class CacheWarmer {
  constructor(cache, dataLoader) {
    this.cache = cache
    this.dataLoader = dataLoader
  }
  
  async warmUp(keys) {
    const promises = keys.map(async (key) => {
      if (!this.cache.get(key)) {
        const data = await this.dataLoader.load(key)
        this.cache.set(key, data)
      }
    })
    
    await Promise.all(promises)
  }
}
\`\`\`

### 2. 백그라운드 갱신
만료 전 미리 데이터 갱신

## 분산 캐싱

### 1. Redis 활용
\`\`\`javascript
import Redis from 'ioredis'

class RedisCache {
  constructor() {
    this.redis = new Redis()
  }
  
  async set(key, value, ttl = 3600) {
    await this.redis.setex(key, ttl, JSON.stringify(value))
  }
  
  async get(key) {
    const value = await this.redis.get(key)
    return value ? JSON.parse(value) : null
  }
}
\`\`\`

### 2. 캐시 일관성
- Write-through
- Write-behind
- Cache-aside

## 캐시 성능 모니터링

### 1. 히트율 측정
\`\`\`javascript
class CacheMetrics {
  constructor() {
    this.hits = 0
    this.misses = 0
  }
  
  recordHit() {
    this.hits++
  }
  
  recordMiss() {
    this.misses++
  }
  
  getHitRate() {
    const total = this.hits + this.misses
    return total > 0 ? this.hits / total : 0
  }
}
\`\`\`

### 2. 메모리 사용량 추적
캐시 크기와 메모리 사용량 모니터링`
      }
    }

    return mockGuides[guideId] || null
  }

  private generateTableOfContents(content: string): TableOfContentsItem[] {
    const headings: TableOfContentsItem[] = []
    const lines = content.split('\n')

    lines.forEach((line) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/)
      if (match) {
        const level = match[1].length
        const text = match[2]
        const id = text.toLowerCase()
          .replace(/[^a-z0-9가-힣\s]/g, '')
          .replace(/\s+/g, '-')

        headings.push({ id, text, level })
      }
    })

    return headings
  }

  async searchGuides(query: string, category?: string): Promise<GuideContent[]> {
    const categories = await this.getGuideCategories()
    const allGuideIds: string[] = []

    // Collect all guide IDs
    for (const cat of categories) {
      if (!category || cat.id === category) {
        allGuideIds.push(...cat.guides)
      }
    }

    // Load and filter guides
    const results: GuideContent[] = []
    const searchLower = query.toLowerCase()

    for (const guideId of allGuideIds) {
      const guide = await this.getGuide(guideId)
      if (guide) {
        const titleMatch = guide.metadata.title.toLowerCase().includes(searchLower)
        const descriptionMatch = guide.metadata.description.toLowerCase().includes(searchLower)
        const tagMatch = guide.metadata.tags.some(tag => tag.toLowerCase().includes(searchLower))
        const contentMatch = guide.content.toLowerCase().includes(searchLower)

        if (titleMatch || descriptionMatch || tagMatch || contentMatch) {
          results.push(guide)
        }
      }
    }

    return results
  }

  getRelatedGuides(guideId: string, limit: number = 3): Promise<GuideContent[]> {
    // In a real implementation, this would use similarity algorithms
    // For now, return mock related guides
    const relatedIds = ['json-schema-guide', 'api-versioning', 'data-transformation']
      .filter(id => id !== guideId)
      .slice(0, limit)

    return Promise.all(
      relatedIds.map(id => this.getGuide(id)).filter(Boolean)
    ) as Promise<GuideContent[]>
  }

  async getTutorials(): Promise<Tutorial[]> {
    const categories = await this.getGuideCategories()
    const tutorials: Tutorial[] = []

    for (const category of categories) {
      for (const guideId of category.guides) {
        const guide = await this.getGuide(guideId)
        if (guide) {
          tutorials.push({
            id: guide.id,
            title: guide.metadata.title,
            description: guide.metadata.description,
            difficulty: guide.metadata.difficulty,
            category: guide.metadata.category,
            tags: guide.metadata.tags,
            estimatedReadTime: guide.metadata.estimatedReadTime,
            lastUpdated: guide.metadata.lastUpdated,
            author: guide.metadata.author
          })
        }
      }
    }

    return tutorials
  }

  async loadTutorial(tutorialId: string): Promise<GuideContent | null> {
    // loadTutorial은 getGuide와 동일한 기능을 수행
    // 튜토리얼과 가이드는 동일한 데이터 구조를 사용
    return await this.getGuide(tutorialId)
  }

  async getTutorials(): Promise<Tutorial[]> {
    const categories = await this.getGuideCategories()
    const tutorials: Tutorial[] = []

    for (const category of categories) {
      for (const guideId of category.guides) {
        const guide = await this.getGuide(guideId)
        if (guide) {
          tutorials.push({
            id: guide.id,
            title: guide.metadata.title,
            description: guide.metadata.description,
            difficulty: guide.metadata.difficulty,
            category: guide.metadata.category,
            tags: guide.metadata.tags,
            estimatedReadTime: guide.metadata.estimatedReadTime,
            lastUpdated: guide.metadata.lastUpdated,
            author: guide.metadata.author
          })
        }
      }
    }

    return tutorials
  }

  renderMarkdown(content: string): string {
    // marked를 사용하여 마크다운을 HTML로 변환
    return marked(content) as string
  }

  clearCache(): void {
    this.contentCache.clear()
    this.categoriesCache = null
  }
}

export const contentService = new ContentService()
export { ContentService }
export default contentService