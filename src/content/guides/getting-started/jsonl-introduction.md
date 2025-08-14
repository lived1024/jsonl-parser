# JSONL 소개

JSONL(JSON Lines)은 구조화된 데이터를 저장하고 스트리밍하기 위한 편리한 형식입니다. 각 줄이 유효한 JSON 객체인 텍스트 형식입니다.

## JSONL이란?

JSONL은 다음과 같은 특징을 가집니다:

- 각 줄은 유효한 JSON 값입니다 (보통 객체)
- 줄 구분자는 `\n` (LF) 또는 `\r\n` (CRLF)입니다
- 파일 확장자는 `.jsonl` 또는 `.ndjson`을 사용합니다

## 기본 형식

### JSON vs JSONL 비교

**JSON 배열:**
```json
[
  {"name": "홍길동", "age": 30},
  {"name": "김철수", "age": 25},
  {"name": "이영희", "age": 28}
]
```

**JSONL:**
```jsonl
{"name": "홍길동", "age": 30}
{"name": "김철수", "age": 25}
{"name": "이영희", "age": 28}
```

## JSONL의 장점

### 1. 스트리밍 처리
JSONL은 전체 파일을 메모리에 로드하지 않고도 한 줄씩 처리할 수 있습니다:

```javascript
// 스트리밍 처리 예제
const readline = require('readline');
const fs = require('fs');

const fileStream = fs.createReadStream('data.jsonl');
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  const data = JSON.parse(line);
  console.log(data);
});
```

### 2. 추가 용이성
새로운 데이터를 파일 끝에 간단히 추가할 수 있습니다:

```bash
echo '{"name": "박민수", "age": 32}' >> data.jsonl
```

### 3. 부분 손상 복구
한 줄이 손상되어도 다른 줄들은 여전히 유효합니다.

## 실제 사용 사례

### 1. 로그 데이터
```jsonl
{"timestamp": "2024-02-20T10:30:00Z", "level": "INFO", "message": "User logged in", "userId": 123}
{"timestamp": "2024-02-20T10:31:15Z", "level": "ERROR", "message": "Database connection failed", "error": "Connection timeout"}
{"timestamp": "2024-02-20T10:32:00Z", "level": "INFO", "message": "User logged out", "userId": 123}
```

### 2. API 응답 데이터
```jsonl
{"id": 1, "name": "Product A", "price": 29.99, "category": "electronics"}
{"id": 2, "name": "Product B", "price": 19.99, "category": "books"}
{"id": 3, "name": "Product C", "price": 39.99, "category": "clothing"}
```

### 3. 머신러닝 데이터셋
```jsonl
{"features": [1.2, 3.4, 5.6], "label": "positive", "metadata": {"source": "dataset_v1"}}
{"features": [2.1, 4.3, 6.5], "label": "negative", "metadata": {"source": "dataset_v1"}}
{"features": [3.2, 5.4, 7.6], "label": "positive", "metadata": {"source": "dataset_v2"}}
```

## JSONL 처리 도구

### 명령줄 도구

**jq를 사용한 JSONL 처리:**
```bash
# 각 줄의 name 필드만 추출
cat data.jsonl | jq -r '.name'

# age가 30 이상인 항목만 필터링
cat data.jsonl | jq 'select(.age >= 30)'

# 새로운 필드 추가
cat data.jsonl | jq '. + {"processed": true}'
```

### Python에서 JSONL 처리
```python
import json

# JSONL 파일 읽기
def read_jsonl(filename):
    with open(filename, 'r', encoding='utf-8') as file:
        for line in file:
            yield json.loads(line.strip())

# JSONL 파일 쓰기
def write_jsonl(filename, data):
    with open(filename, 'w', encoding='utf-8') as file:
        for item in data:
            file.write(json.dumps(item, ensure_ascii=False) + '\n')

# 사용 예제
data = [
    {"name": "홍길동", "age": 30},
    {"name": "김철수", "age": 25}
]

write_jsonl('output.jsonl', data)

for item in read_jsonl('output.jsonl'):
    print(item)
```

## 모범 사례

### 1. 일관된 스키마 유지
각 줄의 JSON 객체는 일관된 구조를 가져야 합니다:

```jsonl
{"id": 1, "name": "홍길동", "email": "hong@example.com"}
{"id": 2, "name": "김철수", "email": "kim@example.com"}
{"id": 3, "name": "이영희", "email": "lee@example.com"}
```

### 2. 메타데이터 포함
처리에 필요한 메타데이터를 포함하세요:

```jsonl
{"data": {"user": "홍길동"}, "timestamp": "2024-02-20T10:30:00Z", "version": "1.0"}
{"data": {"user": "김철수"}, "timestamp": "2024-02-20T10:31:00Z", "version": "1.0"}
```

### 3. 오류 처리
잘못된 JSON 라인을 처리할 수 있도록 준비하세요:

```python
def safe_read_jsonl(filename):
    with open(filename, 'r', encoding='utf-8') as file:
        for line_num, line in enumerate(file, 1):
            try:
                yield json.loads(line.strip())
            except json.JSONDecodeError as e:
                print(f"Error parsing line {line_num}: {e}")
                continue
```

## 성능 고려사항

### 메모리 효율성
JSONL은 대용량 데이터셋을 처리할 때 메모리 효율적입니다:

```python
# 메모리 효율적인 처리
def process_large_jsonl(filename):
    total = 0
    count = 0
    
    for item in read_jsonl(filename):
        if 'value' in item:
            total += item['value']
            count += 1
    
    return total / count if count > 0 else 0
```

### 병렬 처리
JSONL은 병렬 처리에 적합합니다:

```python
from multiprocessing import Pool
import json

def process_chunk(lines):
    results = []
    for line in lines:
        try:
            data = json.loads(line.strip())
            # 처리 로직
            results.append(process_item(data))
        except json.JSONDecodeError:
            continue
    return results

def parallel_process_jsonl(filename, num_processes=4):
    with open(filename, 'r') as file:
        lines = file.readlines()
    
    chunk_size = len(lines) // num_processes
    chunks = [lines[i:i + chunk_size] for i in range(0, len(lines), chunk_size)]
    
    with Pool(num_processes) as pool:
        results = pool.map(process_chunk, chunks)
    
    return [item for sublist in results for item in sublist]
```

## 다음 단계

JSONL의 기본을 이해했다면 다음 주제들을 학습해보세요:

- [대용량 데이터셋 처리](/info/large-datasets)
- [데이터 변환 기법](/info/data-transformation)
- [스트리밍 처리 최적화](/info/streaming-optimization)

## 관련 도구

- [JSONL 파서](/tools/jsonl-parser) - JSONL 파일 파싱 및 검증
- [데이터 변환기](/tools/data-converter) - JSONL을 다른 형식으로 변환
- [스트리밍 뷰어](/tools/streaming-viewer) - 대용량 JSONL 파일 탐색