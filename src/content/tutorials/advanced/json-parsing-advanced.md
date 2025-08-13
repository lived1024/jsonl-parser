# 고급 JSON 파싱 기법

JSON 파싱의 고급 기법들을 학습하여 성능을 최적화하고 복잡한 데이터 구조를 효율적으로 처리하는 방법을 알아봅시다.

## 스트리밍 JSON 파싱

대용량 JSON 파일을 메모리 효율적으로 처리하는 방법입니다.

### SAX 스타일 파싱
```javascript
class JSONStreamParser {
  constructor() {
    this.stack = [];
    this.current = null;
    this.key = null;
    this.state = 'start';
  }
  
  parse(chunk) {
    for (let i = 0; i < chunk.length; i++) {
      this.processChar(chunk[i]);
    }
  }
  
  processChar(char) {
    switch (this.state) {
      case 'start':
        if (char === '{') {
          this.startObject();
        } else if (char === '[') {
          this.startArray();
        }
        break;
      // ... 추가 상태 처리
    }
  }
  
  startObject() {
    const obj = {};
    if (this.current) {
      this.stack.push(this.current);
    }
    this.current = obj;
    this.state = 'object';
    this.onObjectStart(obj);
  }
  
  onObjectStart(obj) {
    // 객체 시작 이벤트 처리
  }
}
```

### Transform Stream 활용
```javascript
const { Transform } = require('stream');

class JSONLTransform extends Transform {
  constructor(options) {
    super({ objectMode: true, ...options });
    this.buffer = '';
  }
  
  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString();
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop(); // 마지막 불완전한 줄 보관
    
    for (const line of lines) {
      if (line.trim()) {
        try {
          const obj = JSON.parse(line);
          this.push(obj);
        } catch (error) {
          this.emit('error', new Error(`Invalid JSON: ${line}`));
        }
      }
    }
    callback();
  }
  
  _flush(callback) {
    if (this.buffer.trim()) {
      try {
        const obj = JSON.parse(this.buffer);
        this.push(obj);
      } catch (error) {
        this.emit('error', new Error(`Invalid JSON: ${this.buffer}`));
      }
    }
    callback();
  }
}
```

## 커스텀 JSON 파서 구현

특별한 요구사항을 위한 커스텀 파서 구현 방법입니다.

### 기본 토크나이저
```javascript
class JSONTokenizer {
  constructor(input) {
    this.input = input;
    this.position = 0;
    this.current = null;
  }
  
  nextToken() {
    this.skipWhitespace();
    
    if (this.position >= this.input.length) {
      return { type: 'EOF' };
    }
    
    const char = this.input[this.position];
    
    switch (char) {
      case '{':
        this.position++;
        return { type: 'LEFT_BRACE' };
      case '}':
        this.position++;
        return { type: 'RIGHT_BRACE' };
      case '[':
        this.position++;
        return { type: 'LEFT_BRACKET' };
      case ']':
        this.position++;
        return { type: 'RIGHT_BRACKET' };
      case '"':
        return this.parseString();
      case ':':
        this.position++;
        return { type: 'COLON' };
      case ',':
        this.position++;
        return { type: 'COMMA' };
      default:
        if (this.isDigit(char) || char === '-') {
          return this.parseNumber();
        } else if (char === 't' || char === 'f') {
          return this.parseBoolean();
        } else if (char === 'n') {
          return this.parseNull();
        }
        throw new Error(`Unexpected character: ${char}`);
    }
  }
  
  parseString() {
    this.position++; // skip opening quote
    let value = '';
    
    while (this.position < this.input.length) {
      const char = this.input[this.position];
      
      if (char === '"') {
        this.position++; // skip closing quote
        return { type: 'STRING', value };
      } else if (char === '\\') {
        this.position++;
        const escaped = this.input[this.position];
        value += this.getEscapedChar(escaped);
      } else {
        value += char;
      }
      
      this.position++;
    }
    
    throw new Error('Unterminated string');
  }
  
  parseNumber() {
    let value = '';
    
    while (this.position < this.input.length) {
      const char = this.input[this.position];
      
      if (this.isDigit(char) || char === '.' || char === '-' || char === '+' || char === 'e' || char === 'E') {
        value += char;
        this.position++;
      } else {
        break;
      }
    }
    
    return { type: 'NUMBER', value: parseFloat(value) };
  }
}
```

### 재귀 하강 파서
```javascript
class JSONParser {
  constructor(tokenizer) {
    this.tokenizer = tokenizer;
    this.currentToken = this.tokenizer.nextToken();
  }
  
  parse() {
    return this.parseValue();
  }
  
  parseValue() {
    switch (this.currentToken.type) {
      case 'LEFT_BRACE':
        return this.parseObject();
      case 'LEFT_BRACKET':
        return this.parseArray();
      case 'STRING':
        return this.parseString();
      case 'NUMBER':
        return this.parseNumber();
      case 'BOOLEAN':
        return this.parseBoolean();
      case 'NULL':
        return this.parseNull();
      default:
        throw new Error(`Unexpected token: ${this.currentToken.type}`);
    }
  }
  
  parseObject() {
    const obj = {};
    this.consume('LEFT_BRACE');
    
    if (this.currentToken.type === 'RIGHT_BRACE') {
      this.consume('RIGHT_BRACE');
      return obj;
    }
    
    while (true) {
      const key = this.currentToken.value;
      this.consume('STRING');
      this.consume('COLON');
      const value = this.parseValue();
      
      obj[key] = value;
      
      if (this.currentToken.type === 'RIGHT_BRACE') {
        this.consume('RIGHT_BRACE');
        break;
      } else if (this.currentToken.type === 'COMMA') {
        this.consume('COMMA');
      } else {
        throw new Error('Expected comma or closing brace');
      }
    }
    
    return obj;
  }
  
  consume(expectedType) {
    if (this.currentToken.type !== expectedType) {
      throw new Error(`Expected ${expectedType}, got ${this.currentToken.type}`);
    }
    this.currentToken = this.tokenizer.nextToken();
  }
}
```

## 성능 최적화 기법

### 1. 지연 파싱 (Lazy Parsing)
```javascript
class LazyJSONObject {
  constructor(jsonString, path = []) {
    this.jsonString = jsonString;
    this.path = path;
    this.parsed = null;
    this.cache = new Map();
  }
  
  get(key) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    
    // 필요한 부분만 파싱
    const value = this.parseProperty(key);
    this.cache.set(key, value);
    return value;
  }
  
  parseProperty(key) {
    // JSON 문자열에서 특정 키의 값만 추출
    const regex = new RegExp(`"${key}"\\s*:\\s*([^,}]+)`);
    const match = this.jsonString.match(regex);
    
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch (error) {
        // 복잡한 객체나 배열인 경우 전체 파싱 필요
        return this.parseComplex(key);
      }
    }
    
    return undefined;
  }
}
```

### 2. 메모리 풀링
```javascript
class JSONParserPool {
  constructor(size = 10) {
    this.pool = [];
    this.size = size;
    
    for (let i = 0; i < size; i++) {
      this.pool.push(new JSONParser());
    }
  }
  
  acquire() {
    return this.pool.pop() || new JSONParser();
  }
  
  release(parser) {
    if (this.pool.length < this.size) {
      parser.reset();
      this.pool.push(parser);
    }
  }
  
  parse(jsonString) {
    const parser = this.acquire();
    try {
      return parser.parse(jsonString);
    } finally {
      this.release(parser);
    }
  }
}
```

### 3. 워커 스레드 활용
```javascript
// main.js
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  class ParallelJSONParser {
    constructor(workerCount = 4) {
      this.workers = [];
      this.taskQueue = [];
      this.results = new Map();
      
      for (let i = 0; i < workerCount; i++) {
        const worker = new Worker(__filename);
        worker.on('message', this.handleWorkerMessage.bind(this));
        this.workers.push(worker);
      }
    }
    
    parse(jsonString, id) {
      return new Promise((resolve, reject) => {
        this.results.set(id, { resolve, reject });
        
        const availableWorker = this.workers.find(w => !w.busy);
        if (availableWorker) {
          availableWorker.busy = true;
          availableWorker.postMessage({ jsonString, id });
        } else {
          this.taskQueue.push({ jsonString, id });
        }
      });
    }
    
    handleWorkerMessage({ result, error, id }) {
      const { resolve, reject } = this.results.get(id);
      this.results.delete(id);
      
      if (error) {
        reject(new Error(error));
      } else {
        resolve(result);
      }
      
      // 다음 작업 처리
      if (this.taskQueue.length > 0) {
        const task = this.taskQueue.shift();
        const worker = this.workers.find(w => !w.busy);
        if (worker) {
          worker.postMessage(task);
        }
      }
    }
  }
} else {
  // worker.js
  parentPort.on('message', ({ jsonString, id }) => {
    try {
      const result = JSON.parse(jsonString);
      parentPort.postMessage({ result, id });
    } catch (error) {
      parentPort.postMessage({ error: error.message, id });
    }
  });
}
```

## 오류 처리 및 복구

### 1. 부분 파싱 복구
```javascript
class RobustJSONParser {
  parse(jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      return this.attemptRecovery(jsonString, error);
    }
  }
  
  attemptRecovery(jsonString, originalError) {
    const recoveryStrategies = [
      this.fixTrailingCommas,
      this.fixUnquotedKeys,
      this.fixSingleQuotes,
      this.extractValidPortion
    ];
    
    for (const strategy of recoveryStrategies) {
      try {
        const fixed = strategy.call(this, jsonString);
        return JSON.parse(fixed);
      } catch (error) {
        continue;
      }
    }
    
    throw originalError;
  }
  
  fixTrailingCommas(jsonString) {
    return jsonString.replace(/,(\s*[}\]])/g, '$1');
  }
  
  fixUnquotedKeys(jsonString) {
    return jsonString.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
  }
  
  fixSingleQuotes(jsonString) {
    return jsonString.replace(/'/g, '"');
  }
  
  extractValidPortion(jsonString) {
    // 유효한 JSON 부분만 추출
    let braceCount = 0;
    let inString = false;
    let escaped = false;
    
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString[i];
      
      if (!inString) {
        if (char === '{') braceCount++;
        else if (char === '}') braceCount--;
        else if (char === '"') inString = true;
      } else {
        if (escaped) {
          escaped = false;
        } else if (char === '\\') {
          escaped = true;
        } else if (char === '"') {
          inString = false;
        }
      }
      
      if (braceCount === 0 && i > 0) {
        return jsonString.substring(0, i + 1);
      }
    }
    
    throw new Error('No valid JSON portion found');
  }
}
```

### 2. 점진적 검증
```javascript
class ValidatingJSONParser {
  parse(jsonString) {
    const validator = new JSONValidator();
    const errors = validator.validate(jsonString);
    
    if (errors.length === 0) {
      return JSON.parse(jsonString);
    }
    
    // 오류 정보와 함께 부분 파싱 시도
    return this.parseWithErrors(jsonString, errors);
  }
  
  parseWithErrors(jsonString, errors) {
    const result = {
      data: null,
      errors: errors,
      warnings: []
    };
    
    try {
      // 오류가 있어도 가능한 부분까지 파싱
      result.data = this.partialParse(jsonString, errors);
    } catch (error) {
      result.errors.push({
        type: 'PARSE_ERROR',
        message: error.message,
        position: this.findErrorPosition(jsonString, error)
      });
    }
    
    return result;
  }
}
```

## 스키마 기반 파싱

### JSON Schema 활용
```javascript
class SchemaBasedParser {
  constructor(schema) {
    this.schema = schema;
    this.validator = new JSONSchemaValidator(schema);
  }
  
  parse(jsonString) {
    const data = JSON.parse(jsonString);
    const validation = this.validator.validate(data);
    
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }
    
    return this.transformData(data);
  }
  
  transformData(data) {
    // 스키마에 따른 데이터 변환
    return this.applyTransforms(data, this.schema);
  }
  
  applyTransforms(data, schema) {
    if (schema.type === 'object') {
      const result = {};
      
      for (const [key, value] of Object.entries(data)) {
        const propertySchema = schema.properties[key];
        if (propertySchema) {
          result[key] = this.transformValue(value, propertySchema);
        }
      }
      
      return result;
    }
    
    return data;
  }
  
  transformValue(value, schema) {
    switch (schema.type) {
      case 'string':
        if (schema.format === 'date-time') {
          return new Date(value);
        }
        break;
      case 'number':
        if (schema.multipleOf) {
          return Math.round(value / schema.multipleOf) * schema.multipleOf;
        }
        break;
    }
    
    return value;
  }
}
```

## 성능 측정 및 프로파일링

### 벤치마킹 도구
```javascript
class JSONParserBenchmark {
  constructor() {
    this.parsers = new Map();
    this.testData = [];
  }
  
  addParser(name, parser) {
    this.parsers.set(name, parser);
  }
  
  addTestData(name, data) {
    this.testData.push({ name, data });
  }
  
  run() {
    const results = [];
    
    for (const [parserName, parser] of this.parsers) {
      const parserResults = {
        name: parserName,
        tests: []
      };
      
      for (const test of this.testData) {
        const startTime = performance.now();
        const startMemory = process.memoryUsage().heapUsed;
        
        try {
          const result = parser.parse(test.data);
          const endTime = performance.now();
          const endMemory = process.memoryUsage().heapUsed;
          
          parserResults.tests.push({
            testName: test.name,
            time: endTime - startTime,
            memory: endMemory - startMemory,
            success: true
          });
        } catch (error) {
          parserResults.tests.push({
            testName: test.name,
            error: error.message,
            success: false
          });
        }
      }
      
      results.push(parserResults);
    }
    
    return results;
  }
}
```

## 실제 적용 예제

### 대용량 로그 파일 처리
```javascript
const fs = require('fs');
const readline = require('readline');

class LogProcessor {
  constructor() {
    this.stats = {
      processed: 0,
      errors: 0,
      startTime: Date.now()
    };
  }
  
  async processLogFile(filePath) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    
    for await (const line of rl) {
      try {
        const logEntry = JSON.parse(line);
        await this.processLogEntry(logEntry);
        this.stats.processed++;
      } catch (error) {
        this.stats.errors++;
        console.error(`Error processing line: ${line}`);
      }
      
      if (this.stats.processed % 10000 === 0) {
        this.printProgress();
      }
    }
    
    this.printFinalStats();
  }
  
  async processLogEntry(entry) {
    // 로그 엔트리 처리 로직
    if (entry.level === 'ERROR') {
      await this.handleError(entry);
    }
  }
  
  printProgress() {
    const elapsed = Date.now() - this.stats.startTime;
    const rate = this.stats.processed / (elapsed / 1000);
    console.log(`Processed: ${this.stats.processed}, Rate: ${rate.toFixed(2)}/sec`);
  }
}
```

고급 JSON 파싱 기법을 마스터하면 대용량 데이터 처리, 실시간 스트리밍, 성능 최적화 등 다양한 상황에서 효율적인 솔루션을 구현할 수 있습니다.