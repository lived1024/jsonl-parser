# JSON vs 다른 데이터 형식 비교

JSON과 다른 데이터 형식들을 비교하여 각각의 장단점과 적절한 사용 사례를 알아봅시다.

## 주요 데이터 형식 개요

현대 소프트웨어 개발에서 사용되는 주요 데이터 형식들:

- **JSON** (JavaScript Object Notation)
- **XML** (eXtensible Markup Language)
- **YAML** (YAML Ain't Markup Language)
- **CSV** (Comma-Separated Values)
- **TOML** (Tom's Obvious, Minimal Language)
- **Protocol Buffers** (protobuf)

## JSON vs XML

### 구조 비교

**JSON 형식:**
```json
{
  "user": {
    "id": 123,
    "name": "홍길동",
    "email": "hong@example.com",
    "active": true,
    "roles": ["user", "admin"],
    "profile": {
      "age": 30,
      "city": "서울"
    }
  }
}
```

**XML 형식:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<user>
  <id>123</id>
  <name>홍길동</name>
  <email>hong@example.com</email>
  <active>true</active>
  <roles>
    <role>user</role>
    <role>admin</role>
  </roles>
  <profile>
    <age>30</age>
    <city>서울</city>
  </profile>
</user>
```

### 장단점 비교

| 특징 | JSON | XML |
|------|------|-----|
| **가독성** | 높음 | 보통 |
| **파일 크기** | 작음 | 큼 |
| **파싱 속도** | 빠름 | 느림 |
| **스키마 검증** | 제한적 | 강력함 (XSD) |
| **네임스페이스** | 없음 | 지원 |
| **속성 지원** | 없음 | 지원 |
| **주석** | 없음 | 지원 |
| **데이터 타입** | 제한적 | 풍부함 |

### 사용 사례

**JSON이 적합한 경우:**
- REST API 응답
- 웹 애플리케이션 설정
- NoSQL 데이터베이스
- 실시간 데이터 교환

**XML이 적합한 경우:**
- 복잡한 문서 구조
- 엄격한 스키마 검증 필요
- 레거시 시스템 통합
- SOAP 웹 서비스

## JSON vs YAML

### 구조 비교

**JSON 형식:**
```json
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "credentials": {
      "username": "admin",
      "password": "secret"
    },
    "pools": [
      {"name": "read", "size": 10},
      {"name": "write", "size": 5}
    ]
  }
}
```

**YAML 형식:**
```yaml
database:
  host: localhost
  port: 5432
  credentials:
    username: admin
    password: secret
  pools:
    - name: read
      size: 10
    - name: write
      size: 5
```

### 장단점 비교

| 특징 | JSON | YAML |
|------|------|------|
| **가독성** | 좋음 | 매우 좋음 |
| **작성 용이성** | 보통 | 쉬움 |
| **파싱 속도** | 빠름 | 느림 |
| **주석 지원** | 없음 | 지원 |
| **멀티라인 문자열** | 제한적 | 지원 |
| **들여쓰기 민감성** | 없음 | 있음 |
| **브라우저 지원** | 네이티브 | 라이브러리 필요 |

### 사용 사례

**JSON이 적합한 경우:**
- API 데이터 교환
- 브라우저-서버 통신
- 성능이 중요한 애플리케이션

**YAML이 적합한 경우:**
- 설정 파일
- CI/CD 파이프라인 정의
- 문서화가 중요한 설정
- 사람이 직접 편집하는 파일

## JSON vs CSV

### 구조 비교

**JSON 형식:**
```json
[
  {
    "id": 1,
    "name": "홍길동",
    "email": "hong@example.com",
    "department": "개발팀",
    "salary": 5000000
  },
  {
    "id": 2,
    "name": "김철수",
    "email": "kim@example.com",
    "department": "디자인팀",
    "salary": 4500000
  }
]
```

**CSV 형식:**
```csv
id,name,email,department,salary
1,홍길동,hong@example.com,개발팀,5000000
2,김철수,kim@example.com,디자인팀,4500000
```

### 장단점 비교

| 특징 | JSON | CSV |
|------|------|-----|
| **파일 크기** | 큼 | 작음 |
| **구조 복잡성** | 중첩 구조 지원 | 평면 구조만 |
| **데이터 타입** | 다양한 타입 | 주로 문자열 |
| **스프레드시트 호환** | 제한적 | 완벽 |
| **스키마 유연성** | 높음 | 낮음 |
| **파싱 복잡성** | 보통 | 간단 |

### 사용 사례

**JSON이 적합한 경우:**
- 복잡한 객체 구조
- 다양한 데이터 타입 필요
- API 응답 데이터

**CSV가 적합한 경우:**
- 표 형태의 단순 데이터
- 스프레드시트 프로그램과 호환
- 대용량 데이터 내보내기/가져오기

## JSON vs TOML

### 구조 비교

**JSON 형식:**
```json
{
  "title": "TOML Example",
  "owner": {
    "name": "Tom Preston-Werner",
    "dob": "1979-05-27T07:32:00-08:00"
  },
  "database": {
    "server": "192.168.1.1",
    "ports": [8001, 8001, 8002],
    "connection_max": 5000,
    "enabled": true
  }
}
```

**TOML 형식:**
```toml
title = "TOML Example"

[owner]
name = "Tom Preston-Werner"
dob = 1979-05-27T07:32:00-08:00

[database]
server = "192.168.1.1"
ports = [ 8001, 8001, 8002 ]
connection_max = 5000
enabled = true
```

### 장단점 비교

| 특징 | JSON | TOML |
|------|------|------|
| **가독성** | 좋음 | 매우 좋음 |
| **설정 파일 적합성** | 보통 | 높음 |
| **중첩 구조** | 자유로움 | 제한적 |
| **주석 지원** | 없음 | 지원 |
| **데이터 타입** | 기본적 | 풍부함 |
| **도구 지원** | 광범위 | 제한적 |

## JSON vs Protocol Buffers

### 구조 비교

**JSON 형식:**
```json
{
  "name": "홍길동",
  "id": 1234,
  "email": "hong@example.com",
  "phones": [
    {
      "number": "010-1234-5678",
      "type": "MOBILE"
    }
  ]
}
```

**Protocol Buffers 스키마:**
```protobuf
syntax = "proto3";

message Person {
  string name = 1;
  int32 id = 2;
  string email = 3;
  
  repeated PhoneNumber phones = 4;
  
  message PhoneNumber {
    string number = 1;
    PhoneType type = 2;
  }
  
  enum PhoneType {
    MOBILE = 0;
    HOME = 1;
    WORK = 2;
  }
}
```

### 장단점 비교

| 특징 | JSON | Protocol Buffers |
|------|------|------------------|
| **파일 크기** | 큼 | 매우 작음 |
| **파싱 속도** | 보통 | 매우 빠름 |
| **가독성** | 높음 | 낮음 (바이너리) |
| **스키마 진화** | 어려움 | 쉬움 |
| **언어 지원** | 광범위 | 제한적 |
| **디버깅** | 쉬움 | 어려움 |

## 실제 사용 사례별 권장사항

### 1. 웹 API 개발

```json
// REST API 응답 - JSON 권장
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": 1,
        "name": "홍길동",
        "profile": {
          "avatar": "https://example.com/avatar.jpg",
          "bio": "소프트웨어 개발자"
        }
      }
    ]
  },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

**이유:** 브라우저 네이티브 지원, 가벼움, 파싱 속도

### 2. 설정 파일

```yaml
# 애플리케이션 설정 - YAML 권장
app:
  name: MyApp
  version: 1.0.0
  debug: true
  
database:
  host: localhost
  port: 5432
  # 개발 환경에서만 사용
  ssl: false
  
features:
  - authentication
  - logging
  - caching
```

**이유:** 가독성, 주석 지원, 사람이 편집하기 쉬움

### 3. 데이터 내보내기

```csv
# 대용량 표 데이터 - CSV 권장
id,name,email,created_at,status
1,홍길동,hong@example.com,2024-01-01,active
2,김철수,kim@example.com,2024-01-02,inactive
```

**이유:** 파일 크기, 스프레드시트 호환성, 처리 속도

### 4. 마이크로서비스 통신

```protobuf
// 고성능 서비스 간 통신 - Protocol Buffers 권장
service UserService {
  rpc GetUser(GetUserRequest) returns (User);
  rpc CreateUser(CreateUserRequest) returns (User);
}

message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
}
```

**이유:** 성능, 타입 안정성, 스키마 진화

## 선택 가이드라인

### 성능이 중요한 경우
1. **Protocol Buffers** - 마이크로서비스, 고성능 시스템
2. **JSON** - 웹 API, 일반적인 데이터 교환
3. **CSV** - 대용량 표 데이터

### 가독성이 중요한 경우
1. **YAML** - 설정 파일, 문서화
2. **TOML** - 간단한 설정 파일
3. **JSON** - 구조화된 데이터

### 호환성이 중요한 경우
1. **JSON** - 웹 표준, 광범위한 지원
2. **XML** - 레거시 시스템, 엔터프라이즈
3. **CSV** - 스프레드시트, 데이터 분석 도구

## 변환 예제

### JSON ↔ YAML 변환

```javascript
// JSON to YAML
const yaml = require('js-yaml');

const jsonData = {
  name: "홍길동",
  age: 30,
  hobbies: ["독서", "영화감상"]
};

const yamlString = yaml.dump(jsonData);
console.log(yamlString);
// name: 홍길동
// age: 30
// hobbies:
//   - 독서
//   - 영화감상

// YAML to JSON
const yamlString2 = `
name: 홍길동
age: 30
hobbies:
  - 독서
  - 영화감상
`;

const jsonData2 = yaml.load(yamlString2);
console.log(JSON.stringify(jsonData2, null, 2));
```

### JSON ↔ CSV 변환

```javascript
// JSON to CSV
function jsonToCsv(jsonArray) {
  if (jsonArray.length === 0) return '';
  
  const headers = Object.keys(jsonArray[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = jsonArray.map(obj => 
    headers.map(header => {
      const value = obj[header];
      // 쉼표나 따옴표가 있는 경우 처리
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
}

// CSV to JSON
function csvToJson(csvString) {
  const lines = csvString.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    
    headers.forEach((header, index) => {
      obj[header] = values[index];
    });
    
    return obj;
  });
}
```

## 모범 사례

### 1. 적절한 형식 선택

```javascript
// 상황별 형식 선택 함수
function chooseDataFormat(useCase) {
  const recommendations = {
    'web-api': 'JSON',
    'config-file': 'YAML',
    'data-export': 'CSV',
    'high-performance': 'Protocol Buffers',
    'document-markup': 'XML',
    'simple-config': 'TOML'
  };
  
  return recommendations[useCase] || 'JSON';
}
```

### 2. 형식 간 변환 시 주의사항

```javascript
// 데이터 손실 방지
function safeConversion(data, fromFormat, toFormat) {
  const warnings = [];
  
  // JSON to CSV: 중첩 객체 처리
  if (fromFormat === 'JSON' && toFormat === 'CSV') {
    if (hasNestedObjects(data)) {
      warnings.push('중첩 객체는 평면화됩니다');
    }
  }
  
  // CSV to JSON: 데이터 타입 추론
  if (fromFormat === 'CSV' && toFormat === 'JSON') {
    warnings.push('모든 값이 문자열로 처리됩니다');
  }
  
  return { convertedData: convert(data, toFormat), warnings };
}
```

각 데이터 형식은 고유한 장단점을 가지고 있습니다. 프로젝트의 요구사항, 성능 목표, 팀의 선호도를 고려하여 적절한 형식을 선택하는 것이 중요합니다.