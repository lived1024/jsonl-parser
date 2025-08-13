<template>
  <div class="api-guide">
    <div class="guide-header">
      <h2>API 설계 가이드</h2>
      <p>RESTful API JSON 응답 설계를 위한 모범 사례</p>
    </div>
    
    <div class="guide-content">
      <!-- 광고 배치 -->
      <div class="ad-section">
        <SafeAdContainer 
          ad-slot="content-rectangle"
          ad-format="rectangle"
          class-name="guide-ad"
        />
      </div>
      
      <!-- API 가이드 섹션들 -->
      <div class="sections-list">
        <div 
          v-for="section in sections" 
          :key="section.id"
          class="guide-section"
        >
          <div class="section-header">
            <component :is="section.icon" :size="24" />
            <h3>{{ section.title }}</h3>
          </div>
          
          <div class="section-content">
            <p class="section-description">{{ section.description }}</p>
            
            <div class="examples-list">
              <div 
                v-for="example in section.examples" 
                :key="example.id"
                class="example-item"
              >
                <div class="example-header">
                  <h4>{{ example.title }}</h4>
                  <span class="http-method" :class="example.method.toLowerCase()">
                    {{ example.method }}
                  </span>
                </div>
                
                <p class="example-description">{{ example.description }}</p>
                
                <div class="example-content">
                  <div class="request-section">
                    <h5>요청:</h5>
                    <div class="code-block">
                      <pre><code>{{ example.request }}</code></pre>
                    </div>
                  </div>
                  
                  <div class="response-section">
                    <h5>응답:</h5>
                    <div class="code-block">
                      <pre><code>{{ example.response }}</code></pre>
                    </div>
                  </div>
                </div>
                
                <div v-if="example.notes" class="example-notes">
                  <h5>주요 포인트:</h5>
                  <ul>
                    <li v-for="note in example.notes" :key="note">{{ note }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Globe, Database, Shield, Zap } from 'lucide-vue-next'
import SafeAdContainer from '../tools/SafeAdContainer.vue'

interface ApiExample {
  id: string
  title: string
  description: string
  method: string
  request: string
  response: string
  notes?: string[]
}

interface GuideSection {
  id: string
  title: string
  description: string
  icon: any
  examples: ApiExample[]
}

// API 가이드 데이터
const sections = ref<GuideSection[]>([
  {
    id: 'response-structure',
    title: '응답 구조 설계',
    description: '일관성 있고 예측 가능한 API 응답 구조를 설계하는 방법',
    icon: Database,
    examples: [
      {
        id: 'success-response',
        title: '성공 응답 구조',
        description: '성공적인 API 응답의 표준 구조',
        method: 'GET',
        request: 'GET /api/users/123',
        response: `{
  "success": true,
  "data": {
    "id": 123,
    "name": "홍길동",
    "email": "hong@example.com",
    "createdAt": "2024-01-15T09:30:00Z"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0"
  }
}`,
        notes: [
          'success 필드로 성공/실패를 명확히 표시',
          'data 필드에 실제 응답 데이터 포함',
          'meta 필드에 메타데이터 정보 포함',
          'ISO 8601 형식의 타임스탬프 사용'
        ]
      },
      {
        id: 'error-response',
        title: '오류 응답 구조',
        description: '오류 발생 시 일관된 오류 응답 구조',
        method: 'POST',
        request: 'POST /api/users\n{\n  "name": "",\n  "email": "invalid-email"\n}',
        response: `{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력 데이터가 유효하지 않습니다",
    "details": [
      {
        "field": "name",
        "message": "이름은 필수 항목입니다"
      },
      {
        "field": "email",
        "message": "유효한 이메일 주소를 입력하세요"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456789"
  }
}`,
        notes: [
          '오류 코드와 메시지를 명확히 제공',
          '필드별 상세 오류 정보 포함',
          '디버깅을 위한 requestId 포함',
          'HTTP 상태 코드와 일치하는 오류 구조'
        ]
      }
    ]
  },
  {
    id: 'pagination',
    title: '페이지네이션',
    description: '대량의 데이터를 효율적으로 처리하는 페이지네이션 구현',
    icon: Globe,
    examples: [
      {
        id: 'cursor-pagination',
        title: '커서 기반 페이지네이션',
        description: '대용량 데이터에 적합한 커서 기반 페이지네이션',
        method: 'GET',
        request: 'GET /api/posts?limit=10&cursor=eyJpZCI6MTIzfQ==',
        response: `{
  "success": true,
  "data": [
    {
      "id": 124,
      "title": "게시글 제목",
      "content": "게시글 내용...",
      "createdAt": "2024-01-15T09:30:00Z"
    }
  ],
  "pagination": {
    "hasNext": true,
    "nextCursor": "eyJpZCI6MTM0fQ==",
    "limit": 10
  },
  "meta": {
    "total": null,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}`,
        notes: [
          '커서는 Base64로 인코딩된 JSON 객체',
          'hasNext로 다음 페이지 존재 여부 표시',
          '대용량 데이터에서 성능이 우수',
          'total 개수는 성능상 제공하지 않음'
        ]
      },
      {
        id: 'offset-pagination',
        title: '오프셋 기반 페이지네이션',
        description: '전통적인 페이지 번호 기반 페이지네이션',
        method: 'GET',
        request: 'GET /api/users?page=2&limit=20',
        response: `{
  "success": true,
  "data": [
    {
      "id": 21,
      "name": "사용자21",
      "email": "user21@example.com"
    }
  ],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": true
  }
}`,
        notes: [
          '페이지 번호와 전체 페이지 수 제공',
          '이전/다음 페이지 존재 여부 표시',
          '전체 항목 수 포함',
          '소규모 데이터셋에 적합'
        ]
      }
    ]
  },
  {
    id: 'security',
    title: '보안 고려사항',
    description: 'API 보안을 위한 JSON 응답 설계 원칙',
    icon: Shield,
    examples: [
      {
        id: 'sensitive-data',
        title: '민감한 데이터 처리',
        description: '민감한 정보를 안전하게 처리하는 방법',
        method: 'GET',
        request: 'GET /api/users/profile',
        response: `{
  "success": true,
  "data": {
    "id": 123,
    "name": "홍길동",
    "email": "h***@example.com",
    "phone": "010-****-5678",
    "profileImage": "https://cdn.example.com/profiles/123.jpg",
    "lastLoginAt": "2024-01-15T09:30:00Z"
  }
}`,
        notes: [
          '이메일과 전화번호는 마스킹 처리',
          '비밀번호나 토큰은 절대 응답에 포함하지 않음',
          '민감한 ID는 UUID 사용 권장',
          '로그에 민감한 정보가 기록되지 않도록 주의'
        ]
      },
      {
        id: 'rate-limiting',
        title: '속도 제한 정보',
        description: 'API 속도 제한 상태를 응답에 포함',
        method: 'GET',
        request: 'GET /api/data',
        response: `{
  "success": true,
  "data": {
    "items": [...]
  },
  "rateLimit": {
    "limit": 1000,
    "remaining": 995,
    "resetAt": "2024-01-15T11:00:00Z"
  }
}`,
        notes: [
          '현재 속도 제한 상태 정보 제공',
          '클라이언트가 요청 속도를 조절할 수 있도록 지원',
          'HTTP 헤더와 함께 JSON에도 포함',
          '제한 초기화 시간을 명확히 표시'
        ]
      }
    ]
  }
])
</script>

<style scoped>
.api-guide {
  max-width: 1000px;
  margin: 0 auto;
}

.guide-header {
  text-align: center;
  margin-bottom: 2rem;
}

.guide-header h2 {
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.guide-header p {
  color: var(--color-text-secondary);
}

.ad-section {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

.sections-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.guide-section {
  background: var(--color-background-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
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

.section-description {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.examples-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.example-item {
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 1rem;
}

.example-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.example-header h4 {
  color: var(--color-text-primary);
  margin: 0;
  font-size: 1rem;
}

.http-method {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.http-method.get {
  background: #e6f3ff;
  color: #0066cc;
}

.http-method.post {
  background: #e8f5e8;
  color: #2d5a2d;
}

.http-method.put {
  background: #fff3cd;
  color: #856404;
}

.http-method.delete {
  background: #f8d7da;
  color: #721c24;
}

.example-description {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.example-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.request-section h5,
.response-section h5 {
  color: var(--color-text-primary);
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.code-block {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
  padding: 1rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85rem;
  line-height: 1.4;
  color: #333;
}

.example-notes {
  background: var(--color-background-primary);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 1rem;
}

.example-notes h5 {
  color: var(--color-text-primary);
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
}

.example-notes ul {
  margin: 0;
  padding-left: 1.5rem;
}

.example-notes li {
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

/* 광고 스타일 */
:deep(.guide-ad) {
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

@media (max-width: 768px) {
  .guide-section {
    padding: 1rem;
  }
  
  .example-item {
    padding: 0.75rem;
  }
  
  .example-content {
    grid-template-columns: 1fr;
  }
  
  .example-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  :deep(.guide-ad) {
    min-height: 200px;
    padding: 0.5rem;
  }
}
</style>