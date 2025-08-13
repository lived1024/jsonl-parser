# JSONL (JSON Lines) 소개

JSONL(JSON Lines)은 각 줄이 유효한 JSON 객체인 텍스트 형식입니다. 대용량 데이터 처리, 스트리밍, 로그 파일 등에서 널리 사용됩니다.

## JSONL이란?

JSONL은 JSON Lines, newline-delimited JSON, 또는 ndjson이라고도 불립니다. 각 줄이 독립적인 JSON 객체로 구성되어 있어 스트리밍 처리와 대용량 데이터 처리에 적합합니다.

### 기본 형식

```jsonl
{"name": "Alice", "age": 30, "city": "Seoul"}
{"name": "Bob", "age": 25, "city": "Busan"}
{"name": "Charlie", "age": 35, "city": "Incheon"}
```

각 줄은:
- 유효한 JSON 객체여야 함
- 줄바꿈 문자(`\n`)로 구분됨
- 빈 줄은 허용되지 않음

## JSON vs JSONL 비교

### 일반 JSON 형식
```json
[
  {"name": "Alice", "age": 30, "city": "Seoul"},
  {"name": "Bob", "age": 25, "city": "Busan"},
  {"name": "Charlie", "age": 35, "city": "Incheon"}
]
```

### JSONL 형식
```jsonl
{"name": "Alice", "age": 30, "city": "Seoul"}
{"name": "Bob", "age": 25, "city": "Busan"}
{"name": "Charlie", "age": 35, "city": "Incheon"}
```

## JSONL의 장점

### 1. 스트리밍 처리
```jsonl
{"timestamp": "2024-01-15T10:00:00Z", "event": "user_login", "user_id": 123}
{"timestamp": "2024-01-15T10:01:00Z", "event": "page_view", "user_id": 123, "page": "/dashboard"}
{"timestamp": "2024-01-15T10:02:00Z", "event": "button_click", "user_id": 123, "button": "save"}
```

각 줄을 독립적으로 처리할 수 있어 실시간 데이터 처리에 적합합니다.

### 2. 메모리 효율성
대용량 파일을 한 번에 메모리에 로드하지 않고 줄 단위로 처리할 수 있습니다.

### 3. 추가 용이성
파일 끝에 새로운 줄을 추가하기만 하면 되므로 로그 파일에 적합합니다.

### 4. 오류 격리
한 줄에 오류가 있어도 다른 줄의 처리에 영향을 주지 않습니다.

## 실제 사용 사례

### 1. 로그 파일
```jsonl
{"level": "INFO", "timestamp": "2024-01-15T10:00:00Z", "message": "Application started", "service": "web-server"}
{"level": "DEBUG", "timestamp": "2024-01-15T10:00:01Z", "message": "Database connection established", "service": "web-server"}
{"level": "ERROR", "timestamp": "2024-01-15T10:00:02Z", "message": "Failed to load user profile", "service": "user-service", "error": "User not found"}
```

### 2. 데이터 내보내기
```jsonl
{"id": 1, "product": "노트북", "price": 1200000, "category": "전자제품", "stock": 15}
{"id": 2, "product": "마우스", "price": 25000, "category": "전자제품", "stock": 50}
{"id": 3, "product": "키보드", "price": 80000, "category": "전자제품", "stock": 30}
```

### 3. API 응답 스트리밍
```jsonl
{"type": "user", "data": {"id": 1, "name": "Alice"}}
{"type": "user", "data": {"id": 2, "name": "Bob"}}
{"type": "metadata", "data": {"total": 2, "page": 1}}
```

### 4. 머신러닝 데이터셋
```jsonl
{"features": [1.2, 3.4, 5.6], "label": "positive", "id": "sample_001"}
{"features": [2.1, 4.3, 6.5], "label": "negative", "id": "sample_002"}
{"features": [3.2, 5.4, 7.6], "label": "positive", "id": "sample_003"}
```

## JSONL 처리 방법

### JavaScript에서 JSONL 파싱
```javascript
function parseJSONL(jsonlString) {
  return jsonlString
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => JSON.parse(line));
}

// 사용 예제
const jsonlData = `{"name": "Alice", "age": 30}
{"name": "Bob", "age": 25}`;

const parsed = parseJSONL(jsonlData);
console.log(parsed);
// [{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]
```

### 스트리밍 처리
```javascript
function processJSONLStream(stream) {
  let buffer = '';
  
  stream.on('data', (chunk) => {
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop(); // 마지막 불완전한 줄 보관
    
    lines.forEach(line => {
      if (line.trim()) {
        try {
          const obj = JSON.parse(line);
          processObject(obj);
        } catch (error) {
          console.error('Invalid JSON line:', line);
        }
      }
    });
  });
}
```

## 일반적인 실수와 해결법

### 1. 빈 줄 포함
```jsonl
{"name": "Alice", "age": 30}

{"name": "Bob", "age": 25}
```
**해결법**: 빈 줄을 제거하거나 파싱 시 필터링

### 2. 배열 형태로 작성
```jsonl
[{"name": "Alice", "age": 30}]
[{"name": "Bob", "age": 25}]
```
**해결법**: 각 줄은 단일 JSON 객체여야 함

### 3. 줄바꿈 문자 누락
```jsonl
{"name": "Alice", "age": 30}{"name": "Bob", "age": 25}
```
**해결법**: 각 JSON 객체 뒤에 줄바꿈 문자 추가

## 도구와 라이브러리

### 명령줄 도구
```bash
# jq를 사용한 JSONL 처리
cat data.jsonl | jq '.name'

# 특정 조건 필터링
cat data.jsonl | jq 'select(.age > 25)'
```

### Python 라이브러리
```python
import json

# JSONL 파일 읽기
with open('data.jsonl', 'r') as f:
    for line in f:
        obj = json.loads(line)
        print(obj)

# JSONL 파일 쓰기
data = [{"name": "Alice"}, {"name": "Bob"}]
with open('output.jsonl', 'w') as f:
    for obj in data:
        f.write(json.dumps(obj) + '\n')
```

## 성능 고려사항

### 1. 메모리 사용량
- 전체 파일을 메모리에 로드하지 않고 줄 단위로 처리
- 대용량 파일 처리 시 스트리밍 방식 사용

### 2. 파싱 속도
- JSON.parse()를 각 줄마다 호출하므로 오버헤드 존재
- 필요한 경우 배치 처리 고려

### 3. 파일 크기
- 일반 JSON보다 약간 더 큰 파일 크기
- 압축 시 차이는 미미함

## 모범 사례

### 1. 일관된 스키마 유지
```jsonl
{"id": 1, "name": "Alice", "email": "alice@example.com"}
{"id": 2, "name": "Bob", "email": "bob@example.com"}
```

### 2. 오류 처리
```javascript
function safeParseJSONL(line) {
  try {
    return JSON.parse(line);
  } catch (error) {
    console.error(`Invalid JSON line: ${line}`);
    return null;
  }
}
```

### 3. 메타데이터 포함
```jsonl
{"type": "metadata", "version": "1.0", "timestamp": "2024-01-15T10:00:00Z"}
{"type": "data", "id": 1, "name": "Alice"}
{"type": "data", "id": 2, "name": "Bob"}
```

## 다음 단계

JSONL의 기본을 익혔다면 다음 주제들을 학습해보세요:

- **대용량 데이터 처리**: 스트리밍과 배치 처리 기법
- **데이터 파이프라인**: JSONL을 활용한 ETL 프로세스
- **로그 분석**: JSONL 로그 파일 분석 도구와 기법

JSONL은 현대 데이터 처리에서 중요한 역할을 합니다. 특히 빅데이터, 로그 분석, 실시간 처리 영역에서 그 가치를 발휘합니다.