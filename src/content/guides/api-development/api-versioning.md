# API 버전 관리

API 버전 관리는 기존 클라이언트의 호환성을 유지하면서 API를 발전시키는 중요한 전략입니다. 올바른 버전 관리 없이는 API 변경이 기존 사용자에게 치명적인 영향을 줄 수 있습니다.

## 버전 관리가 필요한 이유

### 1. 하위 호환성 유지
기존 클라이언트가 계속 작동할 수 있도록 보장합니다.

### 2. 점진적 마이그레이션
사용자가 자신의 일정에 맞춰 새 버전으로 이전할 수 있습니다.

### 3. 안정성 보장
검증된 버전을 계속 사용할 수 있어 안정성을 보장합니다.

## 버전 관리 방법

### 1. URL 경로 버전 관리

가장 명확하고 직관적인 방법입니다.

```http
GET /v1/users/123
GET /v2/users/123
GET /v3/users/123
```

**장점:**
- 명확하고 이해하기 쉬움
- 캐싱이 용이함
- 브라우저에서 직접 테스트 가능

**단점:**
- URL이 길어질 수 있음
- 버전별로 별도 엔드포인트 관리 필요

### 2. 헤더 버전 관리

HTTP 헤더를 통해 버전을 지정합니다.

```http
GET /users/123
Accept: application/vnd.api+json;version=1

GET /users/123
API-Version: 2

GET /users/123
Accept: application/json
X-API-Version: 3
```

**장점:**
- URL이 깔끔함
- 콘텐츠 협상과 자연스럽게 통합
- RESTful 원칙에 부합

**단점:**
- 브라우저에서 직접 테스트하기 어려움
- 캐싱 설정이 복잡할 수 있음

### 3. 쿼리 파라미터 버전 관리

URL 쿼리 파라미터로 버전을 지정합니다.

```http
GET /users/123?version=1
GET /users/123?v=2
GET /users/123?api_version=3
```

**장점:**
- 구현이 간단함
- 브라우저에서 테스트 가능
- 기존 URL 구조 유지

**단점:**
- RESTful 원칙에 어긋날 수 있음
- 캐싱 키가 복잡해질 수 있음

## 시맨틱 버전 관리

### 버전 번호 체계
```
Major.Minor.Patch (예: 2.1.3)
```

- **Major**: 호환성이 깨지는 변경
- **Minor**: 하위 호환 가능한 기능 추가
- **Patch**: 하위 호환 가능한 버그 수정

### API에서의 적용
```http
# Major 버전만 URL에 포함
GET /v2/users/123

# 전체 버전 정보는 응답에 포함
{
  "data": {...},
  "meta": {
    "api_version": "2.1.3"
  }
}
```

## 버전별 변경 사항 예제

### v1 API
```json
{
  "id": 123,
  "name": "홍길동",
  "email": "hong@example.com",
  "created": "2024-01-15"
}
```

### v2 API (필드 추가)
```json
{
  "id": 123,
  "name": "홍길동",
  "email": "hong@example.com",
  "profile": {
    "avatar": "https://example.com/avatar.jpg",
    "bio": "소프트웨어 개발자"
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-02-20T15:45:00Z"
}
```

### v3 API (구조 변경)
```json
{
  "user": {
    "id": 123,
    "personal_info": {
      "name": "홍길동",
      "email": "hong@example.com"
    },
    "profile": {
      "avatar": "https://example.com/avatar.jpg",
      "bio": "소프트웨어 개발자"
    },
    "timestamps": {
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-02-20T15:45:00Z"
    }
  }
}
```

## 버전 관리 전략

### 1. 지원 정책 수립

```json
{
  "version_support_policy": {
    "current_version": "v3",
    "supported_versions": ["v2", "v3"],
    "deprecated_versions": ["v1"],
    "end_of_life": {
      "v1": "2024-12-31"
    },
    "support_duration": "24_months"
  }
}
```

### 2. 버전 감지 및 기본값

```javascript
// 서버 측 버전 감지 로직
function getApiVersion(request) {
  // 1. URL 경로에서 버전 확인
  const pathVersion = request.path.match(/^\/v(\d+)\//)?.[1]
  if (pathVersion) return `v${pathVersion}`
  
  // 2. 헤더에서 버전 확인
  const headerVersion = request.headers['api-version']
  if (headerVersion) return headerVersion
  
  // 3. 쿼리 파라미터에서 버전 확인
  const queryVersion = request.query.version
  if (queryVersion) return queryVersion
  
  // 4. 기본 버전 반환
  return 'v1'
}
```

### 3. 버전별 라우팅

```javascript
// Express.js 예제
app.use('/v1', v1Router)
app.use('/v2', v2Router)
app.use('/v3', v3Router)

// 기본 버전 (최신)
app.use('/', v3Router)
```

## 하위 호환성 유지 기법

### 1. 필드 추가 (안전)
```json
// v1
{"name": "홍길동"}

// v2 (하위 호환)
{"name": "홍길동", "age": 30}
```

### 2. 선택적 필드 제거 (주의)
```json
// v1
{"name": "홍길동", "nickname": "길동이"}

// v2 (nickname 제거 - 주의 필요)
{"name": "홍길동"}
```

### 3. 필드명 변경 (호환성 깨짐)
```json
// v1
{"created": "2024-01-15"}

// v2 (필드명 변경 - Major 버전 업)
{"created_at": "2024-01-15T10:30:00Z"}
```

### 4. 데이터 타입 변경 (호환성 깨짐)
```json
// v1
{"id": "123"}

// v2 (타입 변경 - Major 버전 업)
{"id": 123}
```

## 마이그레이션 가이드 제공

### 1. 변경 사항 문서화
```markdown
# v1 → v2 마이그레이션 가이드

## 주요 변경 사항
- `created` 필드가 `created_at`으로 변경됨
- 날짜 형식이 ISO 8601로 변경됨
- `profile` 객체 추가

## 마이그레이션 단계
1. 새로운 필드명 사용
2. 날짜 파싱 로직 업데이트
3. 프로필 정보 처리 로직 추가

## 코드 예제
```javascript
// v1
const user = response.data
const createdDate = new Date(user.created)

// v2
const user = response.data
const createdDate = new Date(user.created_at)
const avatar = user.profile?.avatar
```

### 2. 자동 마이그레이션 도구
```javascript
// v1 → v2 변환기
function migrateV1ToV2(v1Data) {
  return {
    ...v1Data,
    created_at: v1Data.created + 'T00:00:00Z',
    profile: {
      avatar: null,
      bio: null
    }
  }
}
```

## 버전 감지 및 알림

### 1. 응답 헤더에 버전 정보 포함
```http
HTTP/1.1 200 OK
API-Version: v2
Supported-Versions: v1,v2,v3
Deprecated-Versions: v1
Sunset: v1=2024-12-31
```

### 2. 경고 메시지
```json
{
  "data": {...},
  "warnings": [
    {
      "code": "DEPRECATED_VERSION",
      "message": "API v1은 2024년 12월 31일에 지원이 종료됩니다. v2로 업그레이드해주세요.",
      "migration_guide": "https://api.example.com/docs/migration/v1-to-v2"
    }
  ]
}
```

## 버전 관리 도구

### 1. API 게이트웨이 활용
```yaml
# Kong 설정 예제
plugins:
  - name: request-transformer
    config:
      add:
        headers:
          - "X-API-Version:v2"
  - name: response-transformer
    config:
      add:
        headers:
          - "API-Version:v2"
```

### 2. OpenAPI 스펙 버전 관리
```yaml
openapi: 3.0.0
info:
  title: User API
  version: 2.1.0
  description: |
    ## 버전 히스토리
    - v2.1.0: 프로필 정보 추가
    - v2.0.0: 날짜 형식 변경 (Breaking Change)
    - v1.0.0: 초기 버전

servers:
  - url: https://api.example.com/v2
    description: v2 API
  - url: https://api.example.com/v1
    description: v1 API (Deprecated)
```

## 모니터링 및 분석

### 1. 버전별 사용량 추적
```javascript
// 분석 데이터 수집
function trackApiUsage(version, endpoint, userId) {
  analytics.track('api_request', {
    version,
    endpoint,
    user_id: userId,
    timestamp: new Date().toISOString()
  })
}
```

### 2. 마이그레이션 진행률 모니터링
```sql
-- 버전별 사용량 조회
SELECT 
  api_version,
  COUNT(*) as request_count,
  COUNT(DISTINCT user_id) as unique_users
FROM api_requests 
WHERE created_at >= NOW() - INTERVAL 30 DAY
GROUP BY api_version
ORDER BY api_version;
```

## 모범 사례

### 1. 명확한 버전 정책 수립
- 지원 기간 명시
- 마이그레이션 가이드 제공
- 충분한 사전 공지

### 2. 점진적 변경
- 한 번에 많은 변경 피하기
- 단계적 기능 추가
- 사용자 피드백 수집

### 3. 자동화된 테스트
- 버전별 회귀 테스트
- 호환성 검증 자동화
- 성능 테스트 포함

### 4. 문서화
- 변경 사항 상세 기록
- 마이그레이션 가이드 제공
- 예제 코드 포함

## 다음 단계

API 버전 관리의 기본을 이해했다면 다음 주제들을 학습해보세요:

- [REST API 설계 모범 사례](/info/rest-api-design)
- [JSON 스키마 가이드](/info/json-schema-guide)
- [API 보안](/info/api-security)

## 관련 도구

- [API 테스터](/tools/api-tester) - 다양한 버전의 API 테스트
- [스키마 생성기](/tools/schema-generator) - 버전별 스키마 관리
- [문서 생성기](/tools/doc-generator) - API 문서 자동 생성