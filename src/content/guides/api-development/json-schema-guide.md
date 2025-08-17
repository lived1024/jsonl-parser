# JSON 스키마 가이드

JSON 스키마는 JSON 데이터의 구조와 제약 조건을 정의하는 표준입니다. API 개발에서 데이터 검증과 문서화에 필수적인 도구입니다.

## JSON 스키마란?

JSON 스키마는 JSON 데이터의 형태를 기술하는 JSON 문서입니다. 다음과 같은 목적으로 사용됩니다:

- **데이터 검증**: 입력 데이터가 예상 형식과 일치하는지 확인
- **문서화**: API의 데이터 구조를 명확하게 문서화
- **코드 생성**: 스키마를 기반으로 타입 정의나 클래스 자동 생성

## 기본 스키마 구조

### 간단한 예제
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/user.schema.json",
  "title": "User",
  "description": "사용자 정보",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "사용자 이름"
    },
    "age": {
      "type": "number",
      "minimum": 0,
      "maximum": 150,
      "description": "사용자 나이"
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "이메일 주소"
    }
  },
  "required": ["name", "email"]
}
```

### 검증 대상 데이터
```json
{
  "name": "홍길동",
  "age": 30,
  "email": "hong@example.com"
}
```

## 데이터 타입

### 기본 타입

#### 문자열 (string)
```json
{
  "type": "string",
  "minLength": 1,
  "maxLength": 100,
  "pattern": "^[A-Za-z가-힣]+$"
}
```

#### 숫자 (number/integer)
```json
{
  "type": "number",
  "minimum": 0,
  "maximum": 100,
  "multipleOf": 0.5
}
```

#### 불린 (boolean)
```json
{
  "type": "boolean"
}
```

#### 배열 (array)
```json
{
  "type": "array",
  "items": {
    "type": "string"
  },
  "minItems": 1,
  "maxItems": 10,
  "uniqueItems": true
}
```

#### 객체 (object)
```json
{
  "type": "object",
  "properties": {
    "id": {"type": "number"},
    "name": {"type": "string"}
  },
  "required": ["id"],
  "additionalProperties": false
}
```

## 고급 검증 규칙

### 조건부 스키마
```json
{
  "type": "object",
  "properties": {
    "type": {"enum": ["personal", "business"]},
    "name": {"type": "string"}
  },
  "if": {
    "properties": {"type": {"const": "business"}}
  },
  "then": {
    "properties": {
      "businessNumber": {"type": "string"}
    },
    "required": ["businessNumber"]
  }
}
```

### 다중 타입 허용
```json
{
  "type": ["string", "number"],
  "description": "문자열 또는 숫자"
}
```

### 열거형 (enum)
```json
{
  "type": "string",
  "enum": ["red", "green", "blue"],
  "description": "허용된 색상"
}
```

## 실제 API 스키마 예제

### 사용자 등록 API
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "User Registration",
  "type": "object",
  "properties": {
    "username": {
      "type": "string",
      "minLength": 3,
      "maxLength": 20,
      "pattern": "^[a-zA-Z0-9_]+$",
      "description": "사용자명 (영문, 숫자, 언더스코어만 허용)"
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "이메일 주소"
    },
    "password": {
      "type": "string",
      "minLength": 8,
      "pattern": "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]",
      "description": "비밀번호 (대소문자, 숫자, 특수문자 포함)"
    },
    "profile": {
      "type": "object",
      "properties": {
        "firstName": {"type": "string", "minLength": 1},
        "lastName": {"type": "string", "minLength": 1},
        "birthDate": {
          "type": "string",
          "format": "date",
          "description": "생년월일 (YYYY-MM-DD)"
        },
        "phoneNumber": {
          "type": "string",
          "pattern": "^\\+?[1-9]\\d{1,14}$",
          "description": "전화번호"
        }
      },
      "required": ["firstName", "lastName"]
    },
    "preferences": {
      "type": "object",
      "properties": {
        "newsletter": {"type": "boolean", "default": false},
        "language": {
          "type": "string",
          "enum": ["ko", "en", "ja"],
          "default": "ko"
        },
        "timezone": {
          "type": "string",
          "default": "Asia/Seoul"
        }
      }
    }
  },
  "required": ["username", "email", "password", "profile"],
  "additionalProperties": false
}
```

### API 응답 스키마
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "API Response",
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "description": "요청 성공 여부"
    },
    "data": {
      "description": "응답 데이터"
    },
    "error": {
      "type": "object",
      "properties": {
        "code": {"type": "string"},
        "message": {"type": "string"},
        "details": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "field": {"type": "string"},
              "message": {"type": "string"}
            }
          }
        }
      },
      "required": ["code", "message"]
    },
    "meta": {
      "type": "object",
      "properties": {
        "timestamp": {
          "type": "string",
          "format": "date-time"
        },
        "version": {"type": "string"},
        "requestId": {"type": "string"}
      }
    }
  },
  "required": ["success"],
  "if": {
    "properties": {"success": {"const": true}}
  },
  "then": {
    "required": ["data"]
  },
  "else": {
    "required": ["error"]
  }
}
```

## 스키마 재사용

### 정의 (definitions)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$defs": {
    "address": {
      "type": "object",
      "properties": {
        "street": {"type": "string"},
        "city": {"type": "string"},
        "zipCode": {"type": "string"}
      },
      "required": ["street", "city"]
    }
  },
  "type": "object",
  "properties": {
    "homeAddress": {"$ref": "#/$defs/address"},
    "workAddress": {"$ref": "#/$defs/address"}
  }
}
```

### 외부 스키마 참조
```json
{
  "type": "object",
  "properties": {
    "user": {
      "$ref": "https://example.com/schemas/user.json"
    }
  }
}
```

## 스키마 검증 도구

### JavaScript (Ajv)
```javascript
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const ajv = new Ajv()
addFormats(ajv)

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number', minimum: 0 }
  },
  required: ['name']
}

const validate = ajv.compile(schema)
const valid = validate({ name: '홍길동', age: 30 })

if (!valid) {
  console.log(validate.errors)
}
```

### Python (jsonschema)
```python
import jsonschema

schema = {
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "age": {"type": "number", "minimum": 0}
    },
    "required": ["name"]
}

data = {"name": "홍길동", "age": 30}

try:
    jsonschema.validate(data, schema)
    print("유효한 데이터입니다")
except jsonschema.ValidationError as e:
    print(f"검증 오류: {e.message}")
```

## OpenAPI와의 통합

### OpenAPI 스펙에서 스키마 사용
```yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
          format: int64
        username:
          type: string
          minLength: 3
          maxLength: 20
        email:
          type: string
          format: email
      required:
        - username
        - email

paths:
  /users:
    post:
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/User'
      responses:
        '201':
          description: 사용자 생성 성공
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
```

## 모범 사례

### 1. 명확한 설명 제공
```json
{
  "type": "string",
  "description": "사용자의 고유 식별자",
  "examples": ["user123", "admin456"]
}
```

### 2. 적절한 제약 조건 설정
```json
{
  "type": "string",
  "minLength": 1,
  "maxLength": 255,
  "description": "빈 문자열이나 너무 긴 문자열 방지"
}
```

### 3. 기본값 제공
```json
{
  "type": "boolean",
  "default": false,
  "description": "기본값으로 false 설정"
}
```

### 4. 예제 데이터 포함
```json
{
  "type": "object",
  "properties": {
    "name": {"type": "string"},
    "age": {"type": "number"}
  },
  "examples": [
    {"name": "홍길동", "age": 30},
    {"name": "김철수", "age": 25}
  ]
}
```

## 일반적인 실수와 해결책

### 1. additionalProperties 미설정
```json
// 문제: 예상치 못한 속성 허용
{
  "type": "object",
  "properties": {
    "name": {"type": "string"}
  }
}

// 해결: 명시적으로 설정
{
  "type": "object",
  "properties": {
    "name": {"type": "string"}
  },
  "additionalProperties": false
}
```

### 2. 순환 참조
```json
// 문제: 무한 순환 참조
{
  "$defs": {
    "person": {
      "type": "object",
      "properties": {
        "friend": {"$ref": "#/$defs/person"}
      }
    }
  }
}

// 해결: 깊이 제한 또는 선택적 참조
{
  "$defs": {
    "person": {
      "type": "object",
      "properties": {
        "friend": {
          "anyOf": [
            {"$ref": "#/$defs/person"},
            {"type": "null"}
          ]
        }
      }
    }
  }
}
```

## 다음 단계

JSON 스키마의 기본을 이해했다면 다음 주제들을 학습해보세요:

- [API 버전 관리](/info/api-versioning)
- [REST API 설계 모범 사례](/info/rest-api-design)
- [오류 처리](/info/error-handling)

## 관련 도구

- [JSON 스키마 생성기](/tools/schema-generator) - 데이터에서 스키마 자동 생성
- [JSON 검증기](/tools/json-validator) - 스키마 기반 데이터 검증
- [API 테스터](/tools/api-tester) - 스키마 검증이 포함된 API 테스트