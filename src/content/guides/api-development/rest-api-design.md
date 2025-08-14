# REST API 설계 모범 사례

REST(Representational State Transfer) API는 현대 웹 애플리케이션의 핵심입니다. 이 가이드에서는 JSON을 사용하는 REST API 설계의 모범 사례를 다룹니다.

## REST API 기본 원칙

### 1. 리소스 중심 설계
API는 리소스(명사)를 중심으로 설계되어야 합니다:

```
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
```

### 2. HTTP 메서드 적절한 사용

| 메서드 | 용도 | 예제 |
|--------|------|------|
| GET | 리소스 조회 | `GET /users/123` |
| POST | 리소스 생성 | `POST /users` |
| PUT | 리소스 전체 수정 | `PUT /users/123` |
| PATCH | 리소스 부분 수정 | `PATCH /users/123` |
| DELETE | 리소스 삭제 | `DELETE /users/123` |

### 3. 적절한 HTTP 상태 코드 사용

```json
{
  "success_codes": {
    "200": "OK - 성공적인 GET, PUT, PATCH",
    "201": "Created - 성공적인 POST",
    "204": "No Content - 성공적인 DELETE"
  },
  "client_error_codes": {
    "400": "Bad Request - 잘못된 요청",
    "401": "Unauthorized - 인증 필요",
    "403": "Forbidden - 권한 없음",
    "404": "Not Found - 리소스 없음",
    "409": "Conflict - 리소스 충돌"
  },
  "server_error_codes": {
    "500": "Internal Server Error - 서버 오류",
    "503": "Service Unavailable - 서비스 불가"
  }
}
```

## JSON 응답 구조 설계

### 1. 일관된 응답 형식

**성공 응답:**
```json
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
```

**오류 응답:**
```json
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
```

### 2. 페이지네이션

**요청:**
```
GET /users?page=2&limit=10&sort=created_at&order=desc
```

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "name": "홍길동",
      "email": "hong@example.com",
      "created_at": "2024-02-20T10:30:00Z"
    }
  ],
  "pagination": {
    "current_page": 2,
    "per_page": 10,
    "total_pages": 15,
    "total_items": 147,
    "has_next": true,
    "has_prev": true,
    "next_url": "/users?page=3&limit=10",
    "prev_url": "/users?page=1&limit=10"
  }
}
```

### 3. 필터링 및 검색

**요청:**
```
GET /users?status=active&role=admin&search=홍길동&created_after=2024-01-01
```

**응답:**
```json
{
  "success": true,
  "data": [...],
  "filters": {
    "applied": {
      "status": "active",
      "role": "admin",
      "search": "홍길동",
      "created_after": "2024-01-01"
    },
    "available": {
      "status": ["active", "inactive", "pending"],
      "role": ["admin", "user", "moderator"]
    }
  },
  "meta": {
    "total_results": 5,
    "search_time_ms": 23
  }
}
```

## 리소스 관계 처리

### 1. 중첩 리소스

```json
{
  "user": {
    "id": 123,
    "name": "홍길동",
    "profile": {
      "avatar": "https://example.com/avatar.jpg",
      "bio": "소프트웨어 개발자"
    },
    "preferences": {
      "theme": "dark",
      "language": "ko"
    }
  }
}
```

### 2. 관련 리소스 링크

```json
{
  "user": {
    "id": 123,
    "name": "홍길동",
    "links": {
      "self": "/users/123",
      "posts": "/users/123/posts",
      "followers": "/users/123/followers",
      "following": "/users/123/following"
    }
  }
}
```

### 3. 포함된 리소스 (Include)

**요청:**
```
GET /posts/456?include=author,comments
```

**응답:**
```json
{
  "data": {
    "id": 456,
    "title": "REST API 설계 가이드",
    "content": "...",
    "author_id": 123,
    "author": {
      "id": 123,
      "name": "홍길동",
      "email": "hong@example.com"
    },
    "comments": [
      {
        "id": 789,
        "content": "좋은 글이네요!",
        "author_id": 124,
        "created_at": "2024-02-20T11:00:00Z"
      }
    ]
  }
}
```

## 버전 관리

### 1. URL 경로 버전 관리
```
GET /v1/users/123
GET /v2/users/123
```

### 2. 헤더 버전 관리
```http
GET /users/123
Accept: application/vnd.api+json;version=1
```

### 3. 쿼리 파라미터 버전 관리
```
GET /users/123?version=1
```

## 보안 고려사항

### 1. 인증 및 권한

**JWT 토큰 사용:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**응답에서 민감한 정보 제외:**
```json
{
  "user": {
    "id": 123,
    "name": "홍길동",
    "email": "hong@example.com",
    // "password": "..." // 절대 포함하지 않음
    "created_at": "2024-02-20T10:30:00Z"
  }
}
```

### 2. 입력 검증

**요청 검증:**
```json
{
  "name": {
    "required": true,
    "type": "string",
    "min_length": 2,
    "max_length": 50
  },
  "email": {
    "required": true,
    "type": "email",
    "unique": true
  },
  "age": {
    "required": false,
    "type": "integer",
    "min": 0,
    "max": 150
  }
}
```

### 3. 속도 제한

**응답 헤더:**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

**제한 초과 시 응답:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "요청 한도를 초과했습니다",
    "retry_after": 3600
  }
}
```

## 캐싱 전략

### 1. HTTP 캐싱 헤더

```http
Cache-Control: public, max-age=3600
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
Last-Modified: Tue, 20 Feb 2024 10:30:00 GMT
```

### 2. 조건부 요청

**요청:**
```http
GET /users/123
If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

**응답 (변경 없음):**
```http
HTTP/1.1 304 Not Modified
```

## 문서화

### 1. OpenAPI/Swagger 스펙

```yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
paths:
  /users:
    get:
      summary: 사용자 목록 조회
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
      responses:
        '200':
          description: 성공
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
```

### 2. 예제 포함

각 엔드포인트에 대해 실제 요청/응답 예제를 제공하세요:

```json
{
  "example_request": {
    "method": "POST",
    "url": "/users",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer token"
    },
    "body": {
      "name": "홍길동",
      "email": "hong@example.com"
    }
  },
  "example_response": {
    "status": 201,
    "body": {
      "success": true,
      "data": {
        "id": 123,
        "name": "홍길동",
        "email": "hong@example.com",
        "created_at": "2024-02-20T10:30:00Z"
      }
    }
  }
}
```

## 성능 최적화

### 1. 필드 선택

**요청:**
```
GET /users/123?fields=id,name,email
```

**응답:**
```json
{
  "data": {
    "id": 123,
    "name": "홍길동",
    "email": "hong@example.com"
  }
}
```

### 2. 배치 요청

**요청:**
```json
{
  "requests": [
    {
      "method": "GET",
      "url": "/users/123"
    },
    {
      "method": "GET",
      "url": "/users/124"
    }
  ]
}
```

**응답:**
```json
{
  "responses": [
    {
      "status": 200,
      "body": {"id": 123, "name": "홍길동"}
    },
    {
      "status": 200,
      "body": {"id": 124, "name": "김철수"}
    }
  ]
}
```

## 모니터링 및 로깅

### 1. 구조화된 로그

```json
{
  "timestamp": "2024-02-20T10:30:00Z",
  "level": "INFO",
  "method": "GET",
  "path": "/users/123",
  "status_code": 200,
  "response_time_ms": 45,
  "user_id": 456,
  "request_id": "req_123456",
  "user_agent": "Mozilla/5.0...",
  "ip_address": "192.168.1.1"
}
```

### 2. 메트릭 수집

```json
{
  "api_metrics": {
    "endpoint": "/users",
    "method": "GET",
    "avg_response_time_ms": 120,
    "requests_per_minute": 150,
    "error_rate": 0.02,
    "p95_response_time_ms": 250
  }
}
```

## 다음 단계

REST API 설계의 기본을 이해했다면 다음 주제들을 학습해보세요:

- [JSON 스키마 가이드](/info/json-schema-guide)
- [API 버전 관리](/info/api-versioning)
- [GraphQL vs REST](/info/graphql-vs-rest)

## 관련 도구

- [API 테스터](/tools/api-tester) - REST API 테스트 도구
- [JSON 스키마 생성기](/tools/schema-generator) - API 스키마 자동 생성
- [Mock 서버](/tools/mock-server) - API 모킹 도구