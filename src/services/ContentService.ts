import { marked } from 'marked'
import hljs from 'highlight.js'

export interface Tutorial {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number
  content: string
  examples: CodeExample[]
}

export interface CodeExample {
  language: string
  code: string
  description?: string
}

export interface SampleData {
  id: string
  name: string
  description: string
  category: 'api' | 'config' | 'data' | 'complex'
  difficulty: 'simple' | 'medium' | 'complex'
  size: 'small' | 'medium' | 'large'
  data: string
  metadata: SampleMetadata
}

export interface SampleMetadata {
  source: string
  useCase: string
  features: string[]
  learningPoints: string[]
}

export class ContentService {
  private static instance: ContentService
  private tutorialCache = new Map<string, Tutorial>()
  private sampleCache = new Map<string, SampleData>()

  static getInstance(): ContentService {
    if (!ContentService.instance) {
      ContentService.instance = new ContentService()
    }
    return ContentService.instance
  }

  constructor() {
    this.configureMarked()
  }

  private configureMarked() {
    marked.setOptions({
      highlight: (code, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value
          } catch (err) {
            console.warn('Highlight.js error:', err)
          }
        }
        return hljs.highlightAuto(code).value
      },
      langPrefix: 'hljs language-'
    })
  }

  async loadTutorial(tutorialId: string): Promise<Tutorial | null> {
    if (this.tutorialCache.has(tutorialId)) {
      return this.tutorialCache.get(tutorialId)!
    }

    try {
      // In a real implementation, this would load from the content directory
      // For now, return mock data
      const tutorial = await this.getMockTutorial(tutorialId)
      if (tutorial) {
        this.tutorialCache.set(tutorialId, tutorial)
      }
      return tutorial
    } catch (error) {
      console.error('Failed to load tutorial:', error)
      return null
    }
  }

  async loadSample(sampleId: string): Promise<SampleData | null> {
    if (this.sampleCache.has(sampleId)) {
      return this.sampleCache.get(sampleId)!
    }

    try {
      // In a real implementation, this would load from the samples directory
      const sample = await this.getMockSample(sampleId)
      if (sample) {
        this.sampleCache.set(sampleId, sample)
      }
      return sample
    } catch (error) {
      console.error('Failed to load sample:', error)
      return null
    }
  }

  async getAllTutorials(): Promise<Tutorial[]> {
    // Mock implementation - in reality would scan content directory
    return [
      await this.getMockTutorial('json-basics'),
      await this.getMockTutorial('jsonl-introduction'),
      await this.getMockTutorial('json-parsing-advanced')
    ].filter(Boolean) as Tutorial[]
  }

  async getAllSamples(): Promise<SampleData[]> {
    // Mock implementation - in reality would scan samples directory
    return [
      await this.getMockSample('user-profile-api'),
      await this.getMockSample('app-config')
    ].filter(Boolean) as SampleData[]
  }

  renderMarkdown(content: string): string {
    return marked(content)
  }

  private async getMockTutorial(id: string): Promise<Tutorial | null> {
    const tutorials: Record<string, Omit<Tutorial, 'content'> & { contentPath: string }> = {
      'json-basics': {
        id: 'json-basics',
        title: 'JSON 기초',
        description: 'JSON 구조와 기본 문법을 배워보세요',
        difficulty: 'beginner',
        estimatedTime: 15,
        contentPath: '/src/content/tutorials/beginner/json-basics.md',
        examples: [
          {
            language: 'json',
            code: '{\n  "name": "홍길동",\n  "age": 30,\n  "city": "서울"\n}',
            description: '기본 JSON 객체'
          },
          {
            language: 'json',
            code: '{\n  "users": [\n    {"id": 1, "name": "Alice"},\n    {"id": 2, "name": "Bob"}\n  ]\n}',
            description: '배열을 포함한 JSON'
          }
        ]
      },
      'jsonl-introduction': {
        id: 'jsonl-introduction',
        title: 'JSONL 소개',
        description: 'JSON Lines 형식의 이해와 활용법',
        difficulty: 'intermediate',
        estimatedTime: 20,
        contentPath: '/src/content/tutorials/intermediate/jsonl-introduction.md',
        examples: [
          {
            language: 'jsonl',
            code: '{"name": "Alice", "age": 30, "city": "Seoul"}\n{"name": "Bob", "age": 25, "city": "Busan"}\n{"name": "Charlie", "age": 35, "city": "Incheon"}',
            description: 'JSONL 형식 예제'
          },
          {
            language: 'jsonl',
            code: '{"timestamp": "2024-01-15T10:00:00Z", "event": "user_login", "user_id": 123}\n{"timestamp": "2024-01-15T10:01:00Z", "event": "page_view", "user_id": 123, "page": "/dashboard"}',
            description: '로그 형식 JSONL'
          }
        ]
      },
      'json-parsing-advanced': {
        id: 'json-parsing-advanced',
        title: '고급 JSON 파싱 기법',
        description: '성능 최적화와 복잡한 데이터 구조 처리 방법',
        difficulty: 'advanced',
        estimatedTime: 45,
        contentPath: '/src/content/tutorials/advanced/json-parsing-advanced.md',
        examples: [
          {
            language: 'javascript',
            code: 'function parseJSONL(jsonlString) {\n  return jsonlString\n    .split(\'\\n\')\n    .filter(line => line.trim() !== \'\')\n    .map(line => JSON.parse(line));\n}',
            description: 'JSONL 파싱 함수'
          },
          {
            language: 'javascript',
            code: 'class JSONStreamParser {\n  constructor() {\n    this.buffer = \'\';\n  }\n  \n  parse(chunk) {\n    this.buffer += chunk;\n    // 스트리밍 파싱 로직\n  }\n}',
            description: '스트리밍 파서 클래스'
          }
        ]
      }
    }

    const tutorialConfig = tutorials[id]
    if (!tutorialConfig) {
      return null
    }

    // 실제 환경에서는 파일 시스템에서 마크다운 파일을 읽어올 것
    // 현재는 mock 콘텐츠를 사용
    const mockContent = this.getMockContent(id)
    
    return {
      ...tutorialConfig,
      content: mockContent
    } as Tutorial
  }

  private getMockContent(id: string): string {
    const mockContents: Record<string, string> = {
      'json-basics': `# JSON 기초

JSON(JavaScript Object Notation)은 데이터 교환을 위한 경량 형식입니다. 사람이 읽고 쓰기 쉽고, 기계가 파싱하고 생성하기 쉬운 특징을 가지고 있습니다.

## JSON이란?

JSON은 원래 JavaScript에서 파생되었지만, 현재는 언어 독립적인 데이터 형식으로 널리 사용됩니다. 웹 API, 설정 파일, 데이터 저장 등 다양한 용도로 활용됩니다.

### 주요 특징

- **경량성**: XML보다 간결하고 가벼움
- **가독성**: 사람이 읽기 쉬운 텍스트 형식
- **언어 독립성**: 대부분의 프로그래밍 언어에서 지원
- **구조화**: 계층적 데이터 구조 표현 가능

## 기본 데이터 타입

JSON은 6가지 기본 데이터 타입을 지원합니다:

### 1. 문자열 (String)
\`\`\`json
{
  "name": "홍길동",
  "description": "JSON 학습자"
}
\`\`\`

### 2. 숫자 (Number)
\`\`\`json
{
  "age": 30,
  "height": 175.5,
  "temperature": -10.2
}
\`\`\`

### 3. 불린 (Boolean)
\`\`\`json
{
  "isActive": true,
  "isCompleted": false
}
\`\`\`

### 4. null
\`\`\`json
{
  "middleName": null,
  "spouse": null
}
\`\`\`

### 5. 객체 (Object)
\`\`\`json
{
  "person": {
    "name": "김철수",
    "age": 25,
    "address": {
      "city": "서울",
      "district": "강남구"
    }
  }
}
\`\`\`

### 6. 배열 (Array)
\`\`\`json
{
  "fruits": ["사과", "바나나", "오렌지"],
  "numbers": [1, 2, 3, 4, 5],
  "mixed": ["문자열", 123, true, null]
}
\`\`\`

## 실제 사용 예제

### API 응답 예제
\`\`\`json
{
  "status": "success",
  "data": {
    "user": {
      "id": 12345,
      "username": "john_doe",
      "email": "john@example.com",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "https://example.com/avatar.jpg"
      }
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
\`\`\`

JSON은 현대 웹 개발의 핵심 기술 중 하나입니다. 기본기를 탄탄히 다져두면 API 개발, 데이터 처리, 설정 관리 등 다양한 영역에서 활용할 수 있습니다.`,

      'jsonl-introduction': `# JSONL (JSON Lines) 소개

JSONL(JSON Lines)은 각 줄이 유효한 JSON 객체인 텍스트 형식입니다. 대용량 데이터 처리, 스트리밍, 로그 파일 등에서 널리 사용됩니다.

## JSONL이란?

JSONL은 JSON Lines, newline-delimited JSON, 또는 ndjson이라고도 불립니다. 각 줄이 독립적인 JSON 객체로 구성되어 있어 스트리밍 처리와 대용량 데이터 처리에 적합합니다.

### 기본 형식

\`\`\`jsonl
{"name": "Alice", "age": 30, "city": "Seoul"}
{"name": "Bob", "age": 25, "city": "Busan"}
{"name": "Charlie", "age": 35, "city": "Incheon"}
\`\`\`

각 줄은:
- 유효한 JSON 객체여야 함
- 줄바꿈 문자(\`\\n\`)로 구분됨
- 빈 줄은 허용되지 않음

## JSON vs JSONL 비교

### 일반 JSON 형식
\`\`\`json
[
  {"name": "Alice", "age": 30, "city": "Seoul"},
  {"name": "Bob", "age": 25, "city": "Busan"},
  {"name": "Charlie", "age": 35, "city": "Incheon"}
]
\`\`\`

### JSONL 형식
\`\`\`jsonl
{"name": "Alice", "age": 30, "city": "Seoul"}
{"name": "Bob", "age": 25, "city": "Busan"}
{"name": "Charlie", "age": 35, "city": "Incheon"}
\`\`\`

## JSONL의 장점

### 1. 스트리밍 처리
각 줄을 독립적으로 처리할 수 있어 실시간 데이터 처리에 적합합니다.

### 2. 메모리 효율성
대용량 파일을 한 번에 메모리에 로드하지 않고 줄 단위로 처리할 수 있습니다.

### 3. 추가 용이성
파일 끝에 새로운 줄을 추가하기만 하면 되므로 로그 파일에 적합합니다.

### 4. 오류 격리
한 줄에 오류가 있어도 다른 줄의 처리에 영향을 주지 않습니다.

## 실제 사용 사례

### 로그 파일
\`\`\`jsonl
{"level": "INFO", "timestamp": "2024-01-15T10:00:00Z", "message": "Application started"}
{"level": "ERROR", "timestamp": "2024-01-15T10:00:02Z", "message": "Failed to load user profile"}
\`\`\`

### 데이터 내보내기
\`\`\`jsonl
{"id": 1, "product": "노트북", "price": 1200000, "category": "전자제품"}
{"id": 2, "product": "마우스", "price": 25000, "category": "전자제품"}
\`\`\`

JSONL은 현대 데이터 처리에서 중요한 역할을 합니다. 특히 빅데이터, 로그 분석, 실시간 처리 영역에서 그 가치를 발휘합니다.`,

      'json-parsing-advanced': `# 고급 JSON 파싱 기법

JSON 파싱의 고급 기법들을 학습하여 성능을 최적화하고 복잡한 데이터 구조를 효율적으로 처리하는 방법을 알아봅시다.

## 스트리밍 JSON 파싱

대용량 JSON 파일을 메모리 효율적으로 처리하는 방법입니다.

### Transform Stream 활용
\`\`\`javascript
const { Transform } = require('stream');

class JSONLTransform extends Transform {
  constructor(options) {
    super({ objectMode: true, ...options });
    this.buffer = '';
  }
  
  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString();
    const lines = this.buffer.split('\\n');
    this.buffer = lines.pop(); // 마지막 불완전한 줄 보관
    
    for (const line of lines) {
      if (line.trim()) {
        try {
          const obj = JSON.parse(line);
          this.push(obj);
        } catch (error) {
          this.emit('error', new Error(\`Invalid JSON: \${line}\`));
        }
      }
    }
    callback();
  }
}
\`\`\`

## 성능 최적화 기법

### 1. 지연 파싱 (Lazy Parsing)
필요한 부분만 파싱하여 성능을 향상시킵니다.

### 2. 메모리 풀링
파서 인스턴스를 재사용하여 가비지 컬렉션 오버헤드를 줄입니다.

### 3. 워커 스레드 활용
병렬 처리를 통해 대용량 데이터를 효율적으로 처리합니다.

## 오류 처리 및 복구

### 부분 파싱 복구
\`\`\`javascript
class RobustJSONParser {
  parse(jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      return this.attemptRecovery(jsonString, error);
    }
  }
  
  attemptRecovery(jsonString, originalError) {
    // 다양한 복구 전략 시도
    const strategies = [
      this.fixTrailingCommas,
      this.fixUnquotedKeys,
      this.fixSingleQuotes
    ];
    
    for (const strategy of strategies) {
      try {
        const fixed = strategy.call(this, jsonString);
        return JSON.parse(fixed);
      } catch (error) {
        continue;
      }
    }
    
    throw originalError;
  }
}
\`\`\`

고급 JSON 파싱 기법을 마스터하면 대용량 데이터 처리, 실시간 스트리밍, 성능 최적화 등 다양한 상황에서 효율적인 솔루션을 구현할 수 있습니다.`
    }

    return mockContents[id] || `# ${id}\n\n콘텐츠를 불러오는 중...`
  }

  private async getMockSample(id: string): Promise<SampleData | null> {
    const samples: Record<string, SampleData> = {
      'user-profile-api': {
        id: 'user-profile-api',
        name: '사용자 프로필 API',
        description: '일반적인 사용자 프로필 API 응답 예제',
        category: 'api',
        difficulty: 'simple',
        size: 'small',
        data: JSON.stringify({
          id: 12345,
          username: "john_doe",
          email: "john@example.com",
          profile: {
            firstName: "John",
            lastName: "Doe"
          }
        }, null, 2),
        metadata: {
          source: 'REST API',
          useCase: '사용자 인증 후 프로필 정보 조회',
          features: ['중첩 객체', '다양한 데이터 타입'],
          learningPoints: ['API 응답 구조', '사용자 데이터 모델링']
        }
      },
      'app-config': {
        id: 'app-config',
        name: '애플리케이션 설정',
        description: '웹 애플리케이션 설정 파일 예제',
        category: 'config',
        difficulty: 'medium',
        size: 'medium',
        data: JSON.stringify({
          app: {
            name: "MyApp",
            version: "1.2.3"
          },
          database: {
            host: "localhost",
            port: 5432
          }
        }, null, 2),
        metadata: {
          source: '설정 파일',
          useCase: '애플리케이션 초기화 및 환경 설정',
          features: ['계층적 구조', '다양한 데이터 타입'],
          learningPoints: ['설정 파일 구조', '환경별 설정 관리']
        }
      }
    }

    return samples[id] || null
  }
}