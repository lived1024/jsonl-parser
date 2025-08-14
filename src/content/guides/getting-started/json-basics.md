# JSON 기초

JSON(JavaScript Object Notation)은 경량의 데이터 교환 형식입니다. 사람이 읽고 쓰기 쉽고, 기계가 파싱하고 생성하기 쉽습니다.

## 기본 구조

JSON은 다음과 같은 기본 구조를 가집니다:

```json
{
  "name": "홍길동",
  "age": 30,
  "city": "서울"
}
```

## 데이터 타입

JSON은 다음 데이터 타입을 지원합니다:

### 문자열 (String)
```json
{
  "message": "Hello World",
  "description": "이것은 문자열입니다"
}
```

### 숫자 (Number)
```json
{
  "integer": 42,
  "float": 3.14,
  "negative": -10
}
```

### 불린 (Boolean)
```json
{
  "isActive": true,
  "isCompleted": false
}
```

### null
```json
{
  "data": null,
  "optional": null
}
```

### 객체 (Object)
```json
{
  "user": {
    "name": "홍길동",
    "email": "hong@example.com"
  }
}
```

### 배열 (Array)
```json
{
  "numbers": [1, 2, 3, 4, 5],
  "names": ["홍길동", "김철수", "이영희"]
}
```

## 복잡한 예제

다음은 실제 애플리케이션에서 사용될 수 있는 복잡한 JSON 구조의 예제입니다:

```json
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
```

## JSON 규칙

JSON을 작성할 때 다음 규칙을 따라야 합니다:

1. **문자열은 큰따옴표로 감싸야 합니다** - 작은따옴표는 사용할 수 없습니다
2. **키는 항상 문자열이어야 합니다** - 큰따옴표로 감싸야 합니다
3. **마지막 요소 뒤에 쉼표를 사용하면 안 됩니다** - trailing comma 금지
4. **주석을 사용할 수 없습니다** - JSON은 주석을 지원하지 않습니다

## 일반적인 실수

### 잘못된 예제
```json
{
  'name': 'John',        // 작은따옴표 사용 (잘못됨)
  age: 30,               // 키에 따옴표 없음 (잘못됨)
  "city": "Seoul",       // 마지막 쉼표 (잘못됨)
}
```

### 올바른 예제
```json
{
  "name": "John",
  "age": 30,
  "city": "Seoul"
}
```

## 다음 단계

JSON의 기본을 이해했다면 다음 주제들을 학습해보세요:

- [JSONL 소개](/info/jsonl-introduction)
- [JSON 스키마 가이드](/info/json-schema-guide)
- [API 설계 모범 사례](/info/rest-api-design)

## 관련 도구

- [JSON 검증기](/tools/json-validator) - JSON 구문 검증
- [JSON 포맷터](/tools/json-formatter) - JSON 정리 및 압축
- [데이터 변환기](/tools/data-converter) - JSON을 다른 형식으로 변환