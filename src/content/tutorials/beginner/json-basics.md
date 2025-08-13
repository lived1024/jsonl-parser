# JSON 기초

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
```json
{
  "name": "홍길동",
  "description": "JSON 학습자"
}
```

문자열은 반드시 큰따옴표(`"`)로 감싸야 합니다. 작은따옴표는 사용할 수 없습니다.

### 2. 숫자 (Number)
```json
{
  "age": 30,
  "height": 175.5,
  "temperature": -10.2
}
```

정수와 실수를 구분하지 않으며, 과학적 표기법도 지원합니다.

### 3. 불린 (Boolean)
```json
{
  "isActive": true,
  "isCompleted": false
}
```

`true` 또는 `false` 값만 가능합니다.

### 4. null
```json
{
  "middleName": null,
  "spouse": null
}
```

값이 없음을 나타냅니다.

### 5. 객체 (Object)
```json
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
```

중괄호 `{}`로 감싸며, 키-값 쌍의 집합입니다.

### 6. 배열 (Array)
```json
{
  "fruits": ["사과", "바나나", "오렌지"],
  "numbers": [1, 2, 3, 4, 5],
  "mixed": ["문자열", 123, true, null]
}
```

대괄호 `[]`로 감싸며, 순서가 있는 값들의 목록입니다.

## JSON 구문 규칙

### 1. 키는 반드시 문자열
```json
// 올바른 형식
{
  "name": "홍길동",
  "age": 30
}

// 잘못된 형식 (키에 따옴표 없음)
{
  name: "홍길동",
  age: 30
}
```

### 2. 문자열은 큰따옴표 사용
```json
// 올바른 형식
{
  "message": "안녕하세요"
}

// 잘못된 형식 (작은따옴표 사용)
{
  "message": '안녕하세요'
}
```

### 3. 마지막 요소 뒤에 쉼표 금지
```json
// 올바른 형식
{
  "name": "홍길동",
  "age": 30
}

// 잘못된 형식 (trailing comma)
{
  "name": "홍길동",
  "age": 30,
}
```

### 4. 주석 사용 불가
JSON은 주석을 지원하지 않습니다. 주석이 필요한 경우 별도의 키를 사용하거나 JSON5, JSONC 등의 확장 형식을 고려해보세요.

## 실제 사용 예제

### API 응답 예제
```json
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
      },
      "preferences": {
        "theme": "dark",
        "language": "ko",
        "notifications": true
      }
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 설정 파일 예제
```json
{
  "app": {
    "name": "MyApp",
    "version": "1.2.3",
    "debug": false
  },
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "myapp_db",
    "ssl": true
  },
  "features": {
    "authentication": true,
    "analytics": false,
    "caching": true
  }
}
```

## 일반적인 실수와 해결법

### 1. 문법 오류
```json
// 잘못된 형식
{
  "name": "홍길동"
  "age": 30
}

// 올바른 형식 (쉼표 추가)
{
  "name": "홍길동",
  "age": 30
}
```

### 2. 잘못된 따옴표 사용
```json
// 잘못된 형식
{
  'name': '홍길동'
}

// 올바른 형식
{
  "name": "홍길동"
}
```

### 3. 함수나 undefined 사용
```json
// 잘못된 형식 (JavaScript 코드)
{
  "callback": function() { return true; },
  "value": undefined
}

// 올바른 형식
{
  "callback": null,
  "value": null
}
```

## 다음 단계

JSON의 기본을 익혔다면 다음 주제들을 학습해보세요:

- **JSONL (JSON Lines)**: 여러 JSON 객체를 한 줄씩 저장하는 형식
- **JSON 스키마**: JSON 데이터의 구조를 정의하고 검증하는 방법
- **JSON 최적화**: 대용량 JSON 데이터 처리 기법

## 연습 문제

1. 자신의 프로필 정보를 JSON 형식으로 작성해보세요.
2. 온라인 쇼핑몰의 상품 정보를 JSON으로 표현해보세요.
3. 날씨 API 응답 형식을 JSON으로 설계해보세요.

JSON은 현대 웹 개발의 핵심 기술 중 하나입니다. 기본기를 탄탄히 다져두면 API 개발, 데이터 처리, 설정 관리 등 다양한 영역에서 활용할 수 있습니다.