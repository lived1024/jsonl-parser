# JSON이란 무엇인가?

JSON(JavaScript Object Notation)에 대한 포괄적인 소개와 현대 웹 개발에서의 역할을 알아봅시다.

## JSON의 정의

JSON은 **JavaScript Object Notation**의 줄임말로, 데이터를 저장하고 전송하기 위한 경량의 텍스트 기반 데이터 교환 형식입니다. 2001년 Douglas Crockford에 의해 처음 소개되었으며, 현재는 웹 개발의 표준 데이터 형식으로 자리잡았습니다.

## 왜 JSON인가?

### 1. 단순성과 가독성
JSON은 사람이 읽고 쓰기 쉬운 형태로 설계되었습니다. 복잡한 마크업 없이도 구조화된 데이터를 표현할 수 있습니다.

```json
{
  "name": "홍길동",
  "age": 30,
  "city": "서울"
}
```

### 2. 언어 독립성
JavaScript에서 파생되었지만, 현재는 거의 모든 프로그래밍 언어에서 지원됩니다:
- JavaScript (네이티브 지원)
- Python (json 모듈)
- Java (Jackson, Gson 라이브러리)
- C# (.NET의 System.Text.Json)
- PHP (json_encode/json_decode)
- Go (encoding/json 패키지)

### 3. 웹 표준
현대 웹 API의 사실상 표준 형식으로, REST API에서 가장 널리 사용됩니다.

## JSON vs 다른 형식

### XML과의 비교
```xml
<!-- XML -->
<person>
  <name>홍길동</name>
  <age>30</age>
  <city>서울</city>
</person>
```

```json
// JSON
{
  "name": "홍길동",
  "age": 30,
  "city": "서울"
}
```

**JSON의 장점:**
- 더 간결함 (약 30% 적은 용량)
- 파싱 속도가 빠름
- JavaScript와의 완벽한 호환성

## JSON의 핵심 특징

### 1. 텍스트 기반
JSON은 순수 텍스트 형식이므로 플랫폼과 언어에 관계없이 사용할 수 있습니다.

### 2. 구조화된 데이터
계층적 구조를 통해 복잡한 데이터 관계를 표현할 수 있습니다.

### 3. 타입 지원
- 문자열 (String)
- 숫자 (Number)
- 불린 (Boolean)
- null
- 객체 (Object)
- 배열 (Array)

## 실제 사용 사례

### 1. 웹 API
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": 1,
        "name": "홍길동",
        "email": "hong@example.com"
      }
    ]
  }
}
```

### 2. 설정 파일
```json
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "myapp"
  },
  "features": {
    "authentication": true,
    "logging": true
  }
}
```

### 3. 데이터 저장
```json
{
  "user_preferences": {
    "theme": "dark",
    "language": "ko",
    "notifications": {
      "email": true,
      "push": false
    }
  }
}
```

## JSON의 한계

### 1. 주석 지원 안 함
JSON은 주석을 지원하지 않습니다. 필요한 경우 별도의 키를 사용해야 합니다.

### 2. 제한된 데이터 타입
날짜, 함수, undefined 등은 직접 지원하지 않습니다.

### 3. 순환 참조 불가
객체 간의 순환 참조는 JSON으로 직렬화할 수 없습니다.

## JSON 보안 고려사항

### 1. JSON 인젝션
사용자 입력을 JSON에 직접 포함할 때 주의가 필요합니다.

### 2. 파싱 오류 처리
잘못된 JSON 형식에 대한 적절한 오류 처리가 중요합니다.

### 3. 데이터 검증
JSON 데이터의 구조와 내용을 검증해야 합니다.

## 다음 단계

JSON의 기본을 이해했다면 다음 주제들을 학습해보세요:

1. **JSON 문법 상세** - 정확한 문법 규칙과 형식
2. **JSON 파싱** - 다양한 언어에서의 JSON 처리
3. **JSON Schema** - 데이터 구조 검증
4. **JSONL** - 대용량 데이터 처리를 위한 JSON Lines

JSON은 현대 웹 개발의 핵심 기술입니다. 올바른 이해와 활용을 통해 효율적인 데이터 교환과 저장을 구현할 수 있습니다.