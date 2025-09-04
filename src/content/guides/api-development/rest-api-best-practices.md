# REST API 설계 모범 사례

JSON을 활용한 RESTful API 설계의 핵심 원칙과 실무 가이드라인을 알아봅시다.

## REST API 기본 원칙

### 1. 리소스 중심 설계
API는 동작(verb)이 아닌 리소스(noun)를 중심으로 설계해야 합니다.

**좋은 예:**
```
GET /api/users          # 사용자 목록 조회
GET /api/users/123      # 특정 사용자 조회
POST /api/users         # 새 사용자 생성
PUT /api/users/123      # 사용자 정보 수정
DELETE /api/users/123   # 사용자 삭제
```

**나쁜 예:**
```
GET /api/getUsers
POST /api/createUser
POST /api/updateUser
POST /api/deleteUser
```

### 2. HTTP 메서드 적절한 사용
각 HTTP 메서드의 의미에 맞게 사용해야 합니다.

| 메서드 | 용도 | 멱등성 | 안전성 |
|--------|------|--------|--------|
| GET | 조회 | ✓ | ✓ |
| POST | 생성 | ✗ | ✗ |
| PUT | 전체 수정 | ✓ | ✗ |
| PATCH | 부분 수정 | ✗ | ✗ |
| DELETE | 삭제 | ✓ | ✗ |

### 3. 적절한 HTTP 상태 코드
응답에 맞는 상태 코드를 사용해야 합니다.

**성공 응답:**
- 200 OK: 일반적인 성공
- 201 Created: 리소스 생성 성공
- 204 No Content: 성공했지만 반환할 내용 없음

**클라이언트 오류:**
- 400 Bad Request: 잘못된 요청
- 401 Unauthorized: 인증 필요
- 403 Forbidden: 권한 없음
- 404 Not Found: 리소스 없음
- 422 Unprocessable Entity: 검증 실패

**서버 오류:**
- 500 Internal Server Error: 서버 내부 오류
- 503 Service Unavailable: 서비스 이용 불가

## JSON 응답 구조 설계

### 1. 일관된 응답 형식
모든 API 응답은 일관된 구조를 가져야 합니다.

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "name": "홍길동",
      "email": "hong@example.com"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0"
  }
}
```

### 2. 오류 응답 표준화
오류 응답도 일관된 형식을 유지해야 합니다.

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력 데이터가 유효하지 않습니다",
    "details": [
      {
        "field": "email",
        "message": "이메일 형식이 올바르지 않습니다"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req-abc123"
  }
}
```

### 3. 페이지네이션
대량의 데이터는 페이지네이션을 적용해야 합니다.

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "홍길동"
      }
    ]
  },
  "meta": {
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_pages": 5,
      "total_count": 100,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

## API 버전 관리

### 1. URL 기반 버전 관리
```
GET /api/v1/users
GET /api/v2/users
```

### 2. 헤더 기반 버전 관리
```
GET /api/users
Accept: application/vnd.api+json;version=2
```

### 3. 하위 호환성 유지
새 버전에서도 기존 클라이언트가 동작할 수 있도록 해야 합니다.

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "name": "홍길동",
      "full_name": "홍길동",  // v2에서 추가
      "email": "hong@example.com"
    }
  },
  "meta": {
    "api_version": "2.0",
    "deprecated_fields": ["name"]
  }
}
```

## 보안 고려사항

### 1. 인증과 인가
```json
// JWT 토큰 기반 인증
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// API 키 기반 인증
{
  "X-API-Key": "your-api-key-here"
}
```

### 2. 입력 검증
```json
// 요청 데이터 검증
{
  "user": {
    "name": "홍길동",
    "email": "hong@example.com",
    "age": 30
  }
}

// 검증 실패 응답
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "code": "INVALID_FORMAT",
        "message": "이메일 형식이 올바르지 않습니다"
      }
    ]
  }
}
```

### 3. 민감한 정보 보호
```json
// 공개 프로필 조회 시
{
  "user": {
    "id": 123,
    "name": "홍길동",
    "avatar_url": "https://example.com/avatar.jpg"
    // email, phone 등 민감한 정보 제외
  }
}

// 본인 프로필 조회 시
{
  "user": {
    "id": 123,
    "name": "홍길동",
    "email": "hong@example.com",
    "phone": "+82-10-****-5678"  // 부분 마스킹
  }
}
```

## 성능 최적화

### 1. 필드 선택
클라이언트가 필요한 필드만 요청할 수 있도록 합니다.

```
GET /api/users/123?fields=id,name,email
```

```json
{
  "user": {
    "id": 123,
    "name": "홍길동",
    "email": "hong@example.com"
  }
}
```

### 2. 관계 데이터 포함
관련 데이터를 함께 조회할 수 있도록 합니다.

```
GET /api/posts/456?include=author,comments
```

```json
{
  "post": {
    "id": 456,
    "title": "JSON API 가이드",
    "author": {
      "id": 123,
      "name": "홍길동"
    },
    "comments": [
      {
        "id": 789,
        "content": "좋은 글이네요!"
      }
    ]
  }
}
```

### 3. 캐싱 지원
적절한 캐시 헤더를 제공합니다.

```
Cache-Control: public, max-age=3600
ETag: "abc123def456"
Last-Modified: Mon, 15 Jan 2024 10:30:00 GMT
```

## 필터링과 정렬

### 1. 쿼리 파라미터 활용
```
GET /api/users?status=active&role=admin&sort=created_at:desc&limit=20
```

### 2. 복잡한 필터링
```json
// POST /api/users/search
{
  "filters": {
    "age": {
      "min": 20,
      "max": 40
    },
    "location": {
      "city": "서울",
      "country": "KR"
    },
    "tags": {
      "include": ["developer", "designer"],
      "exclude": ["inactive"]
    }
  },
  "sort": [
    {
      "field": "created_at",
      "direction": "desc"
    }
  ]
}
```

## 문서화

### 1. OpenAPI/Swagger 활용
```yaml
openapi: 3.0.0
info:
  title: User Management API
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
                $ref: '#/components/schemas/UserListResponse'
```

### 2. 예제 제공
각 엔드포인트에 대한 실제 요청/응답 예제를 제공합니다.

```json
// GET /api/users/123 응답 예제
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "name": "홍길동",
      "email": "hong@example.com",
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

## 테스트 전략

### 1. 단위 테스트
각 엔드포인트의 로직을 테스트합니다.

### 2. 통합 테스트
실제 HTTP 요청/응답을 테스트합니다.

### 3. 계약 테스트
API 스펙과 실제 구현이 일치하는지 확인합니다.

## 모니터링과 로깅

### 1. 요청/응답 로깅
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "method": "GET",
  "path": "/api/users/123",
  "status": 200,
  "duration": 45,
  "user_id": 456,
  "ip": "192.168.1.100"
}
```

### 2. 오류 추적
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "error",
  "message": "Database connection failed",
  "error": {
    "type": "DatabaseError",
    "stack": "...",
    "context": {
      "user_id": 123,
      "endpoint": "/api/users"
    }
  }
}
```

이러한 모범 사례를 따르면 유지보수하기 쉽고 확장 가능한 REST API를 구축할 수 있습니다.