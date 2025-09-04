# JSON 스트리밍 처리

대용량 JSON 데이터를 스트리밍 방식으로 처리하는 고급 기법을 알아봅시다.

## 스트리밍 처리의 필요성

### 메모리 효율성
대용량 JSON 파일을 한 번에 메모리에 로드하지 않고 청크 단위로 처리할 수 있습니다.

### 실시간 처리
네트워크를 통해 전송되는 JSON 데이터를 실시간으로 처리할 수 있습니다.

## 기본 스트리밍 파서 구현

```javascript
class JSONStreamParser {
  constructor() {
    this.buffer = '';
    this.callbacks = {};
    this.stack = [];
    this.current = null;
  }
  
  on(event, callback) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }
  
  parse(chunk) {
    this.buffer += chunk;
    this.processBuffer();
  }
  
  processBuffer() {
    // 완전한 JSON 객체 감지 및 처리
    let braceCount = 0;
    let startIndex = -1;
    
    for (let i = 0; i < this.buffer.length; i++) {
      if (this.buffer[i] === '{') {
        if (braceCount === 0) startIndex = i;
        braceCount++;
      } else if (this.buffer[i] === '}') {
        braceCount--;
        
        if (braceCount === 0 && startIndex !== -1) {
          const objectStr = this.buffer.substring(startIndex, i + 1);
          this.emit('object', JSON.parse(objectStr));
          this.buffer = this.buffer.substring(i + 1);
          i = -1;
          startIndex = -1;
        }
      }
    }
  }
  
  emit(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }
}
```

## Node.js 스트림 활용

```javascript
const fs = require('fs');
const { Transform } = require('stream');

class JSONLTransform extends Transform {
  constructor() {
    super({ objectMode: true });
    this.buffer = '';
  }
  
  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString();
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop();
    
    for (const line of lines) {
      if (line.trim()) {
        try {
          this.push(JSON.parse(line));
        } catch (error) {
          this.emit('error', error);
        }
      }
    }
    
    callback();
  }
}

// 사용 예제
fs.createReadStream('large-data.jsonl')
  .pipe(new JSONLTransform())
  .on('data', (obj) => {
    console.log('처리된 객체:', obj);
  });
```

## 브라우저에서의 스트리밍

```javascript
async function processJSONStream(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const parser = new JSONStreamParser();
  
  parser.on('object', (obj) => {
    console.log('스트리밍 객체:', obj);
  });
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      parser.parse(chunk);
    }
  } finally {
    reader.releaseLock();
  }
}
```

스트리밍 처리를 통해 메모리 효율적이고 확장 가능한 JSON 처리 시스템을 구축할 수 있습니다.