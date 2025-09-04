# JSON 치트시트

JSON 문법과 사용법을 빠르게 참조할 수 있는 완전한 치트시트입니다.

## 기본 문법

### 데이터 타입

| 타입 | 예제 | 설명 |
|------|------|------|
| **문자열** | `"Hello World"` | 큰따옴표로 감싸진 텍스트 |
| **숫자** | `42`, `3.14`, `1e10` | 정수, 실수, 지수 표기법 |
| **불린** | `true`, `false` | 참/거짓 값 |
| **null** | `null` | 값이 없음을 나타냄 |
| **객체** | `{"key": "value"}` | 키-값 쌍의 집합 |
| **배열** | `[1, 2, 3]` | 순서가 있는 값들의 목록 |

### 문자열 이스케이프

| 이스케이프 | 의미 | 예제 |
|------------|------|------|
| `\"` | 큰따옴표 | `"He said \"Hello\""` |
| `\\` | 백슬래시 | `"C:\\Users\\Name"` |
| `\/` | 슬래시 | `"http:\/\/example.com"` |
| `\b` | 백스페이스 | `"Hello\bWorld"` |
| `\f` | 폼 피드 | `"Page1\fPage2"` |
| `\n` | 줄바꿈 | `"Line1\nLine2"` |
| `\r` | 캐리지 리턴 | `"Line1\rLine2"` |
| `\t` | 탭 | `"Name:\tValue"` |
| `\uXXXX` | 유니코드 | `"Star: \u2605"` |

## 구조 패턴

### 기본 객체
```json
{
  "name": "홍길동",
  "age": 30,
  "active": true,
  "address": null
}
```

### 중첩 객체
```json
{
  "user": {
    "profile": {
      "name": "홍길동",
      "contact": {
        "email": "hong@example.com",
        "phone": "010-1234-5678"
      }
    }
  }
}
```

### 배열
```json
{
  "numbers": [1, 2, 3, 4, 5],
  "strings": ["apple", "banana", "cherry"],
  "mixed": ["text", 123, true, null],
  "objects": [
    {"id": 1, "name": "Item 1"},
    {"id": 2, "name": "Item 2"}
  ]
}
```

### 복잡한 구조
```json
{
  "users": [
    {
      "id": 1,
      "name": "홍길동",
      "roles": ["user", "admin"],
      "settings": {
        "theme": "dark",
        "notifications": {
          "email": true,
          "push": false
        }
      }
    }
  ],
  "metadata": {
    "version": "1.0",
    "created": "2024-01-15T10:30:00Z"
  }
}
```

## 일반적인 패턴

### API 응답 구조
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 123,
        "username": "john_doe",
        "email": "john@example.com"
      }
    ]
  },
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### 오류 응답 구조
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
  }
}
```

### 설정 파일 구조
```json
{
  "app": {
    "name": "MyApp",
    "version": "1.0.0",
    "debug": false
  },
  "database": {
    "host": "localhost",
    "port": 5432,
    "ssl": true
  },
  "features": {
    "auth": true,
    "logging": true
  }
}
```

### 페이지네이션
```json
{
  "data": [...],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total_pages": 5,
    "total_count": 100,
    "has_next": true,
    "has_prev": false
  }
}
```

## 검증 규칙

### ✅ 올바른 형식

```json
{
  "string": "Hello World",
  "number": 42,
  "float": 3.14,
  "boolean": true,
  "null_value": null,
  "array": [1, 2, 3],
  "object": {
    "nested": "value"
  }
}
```

### ❌ 잘못된 형식

```javascript
// 주석 사용 불가
{
  // "comment": "This is not allowed"
  "name": "John"
}

// 작은따옴표 사용 불가
{
  'name': 'John'  // 큰따옴표 사용해야 함
}

// 마지막 쉼표 불가
{
  "name": "John",
  "age": 30,      // 마지막 쉼표 제거해야 함
}

// 키에 따옴표 필수
{
  name: "John"    // "name"으로 써야 함
}

// undefined 사용 불가
{
  "value": undefined  // null 사용해야 함
}

// 함수 사용 불가
{
  "callback": function() {}  // 문자열이나 null 사용
}
```

## 유용한 패턴

### 타임스탬프
```json
{
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00.123Z",
  "date_only": "2024-01-15",
  "timestamp": 1705312200
}
```

### 다국어 지원
```json
{
  "title": {
    "ko": "안녕하세요",
    "en": "Hello",
    "ja": "こんにちは"
  },
  "description": {
    "ko": "한국어 설명",
    "en": "English description"
  }
}
```

### 버전 관리
```json
{
  "version": "1.2.3",
  "api_version": "v2",
  "schema_version": 2,
  "compatibility": {
    "min_version": "1.0.0",
    "max_version": "2.0.0"
  }
}
```

### 상태 관리
```json
{
  "status": "active",
  "state": {
    "current": "processing",
    "previous": "pending",
    "transitions": [
      {"from": "pending", "to": "processing", "at": "2024-01-15T10:30:00Z"}
    ]
  }
}
```

### 권한 및 역할
```json
{
  "user": {
    "id": 123,
    "roles": ["user", "moderator"],
    "permissions": [
      "read:posts",
      "write:posts",
      "delete:own_posts"
    ],
    "access_level": 2
  }
}
```

### 파일 정보
```json
{
  "file": {
    "name": "document.pdf",
    "size": 2048576,
    "mime_type": "application/pdf",
    "url": "https://example.com/files/document.pdf",
    "metadata": {
      "pages": 10,
      "created": "2024-01-15T10:30:00Z",
      "checksum": "abc123def456"
    }
  }
}
```

## 성능 최적화 팁

### 1. 키 이름 최적화
```json
// 긴 키 이름 (비효율적)
{
  "very_long_descriptive_key_name": "value",
  "another_extremely_long_key_name": "value"
}

// 짧은 키 이름 (효율적)
{
  "id": "value",
  "nm": "value"
}
```

### 2. 중복 데이터 최소화
```json
// 중복이 많은 구조 (비효율적)
{
  "users": [
    {
      "id": 1,
      "name": "John",
      "department": "Engineering",
      "company": "TechCorp"
    },
    {
      "id": 2,
      "name": "Jane",
      "department": "Engineering",
      "company": "TechCorp"
    }
  ]
}

// 정규화된 구조 (효율적)
{
  "users": [
    {"id": 1, "name": "John", "dept_id": 1},
    {"id": 2, "name": "Jane", "dept_id": 1}
  ],
  "departments": [
    {"id": 1, "name": "Engineering", "company": "TechCorp"}
  ]
}
```

### 3. 배열 vs 객체 선택
```json
// 순서가 중요한 경우 - 배열 사용
{
  "steps": [
    {"order": 1, "action": "login"},
    {"order": 2, "action": "verify"},
    {"order": 3, "action": "proceed"}
  ]
}

// 키로 접근하는 경우 - 객체 사용
{
  "users": {
    "123": {"name": "John"},
    "456": {"name": "Jane"}
  }
}
```

## 디버깅 체크리스트

### 문법 검사
- [ ] 모든 문자열이 큰따옴표로 감싸져 있는가?
- [ ] 객체 키가 모두 문자열인가?
- [ ] 마지막 요소 뒤에 쉼표가 없는가?
- [ ] 모든 괄호가 올바르게 열리고 닫혔는가?
- [ ] 이스케이프 문자가 올바르게 사용되었는가?

### 데이터 타입 검사
- [ ] 숫자 형식이 올바른가? (01, +5, .5 등은 불가)
- [ ] 불린 값이 true/false인가?
- [ ] null 값이 올바르게 표현되었는가?
- [ ] undefined, 함수 등 지원하지 않는 타입이 없는가?

### 구조 검사
- [ ] 중첩 구조가 올바른가?
- [ ] 순환 참조가 없는가?
- [ ] 배열과 객체가 적절히 사용되었는가?

## 도구 및 라이브러리

### 온라인 검증 도구
- JSONLint (jsonlint.com)
- JSON Formatter (jsonformatter.org)
- JSON Validator (jsonvalidator.net)

### 명령줄 도구
```bash
# jq - JSON 처리 도구
echo '{"name":"John","age":30}' | jq '.name'

# Python으로 JSON 검증
python -m json.tool input.json

# Node.js로 JSON 검증
node -e "console.log(JSON.parse(require('fs').readFileSync('input.json')))"
```

### JavaScript 라이브러리
```javascript
// 기본 JSON 메서드
JSON.parse(jsonString)
JSON.stringify(object, replacer, space)

// 검증 라이브러리
const Ajv = require('ajv');
const ajv = new Ajv();
const validate = ajv.compile(schema);
const valid = validate(data);
```

## 빠른 참조

### 자주 사용하는 패턴
```json
{
  "id": 123,
  "name": "string",
  "active": true,
  "count": 0,
  "items": [],
  "metadata": {},
  "created_at": "2024-01-15T10:30:00Z"
}
```

### 에러 코드 패턴
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {},
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### 페이지네이션 패턴
```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "has_more": true
  }
}
```

이 치트시트를 북마크해두고 JSON 작업 시 빠른 참조용으로 활용하세요!