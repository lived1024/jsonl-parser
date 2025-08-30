# JSON 오류 처리 가이드

JSON 파싱과 처리 과정에서 발생할 수 있는 다양한 오류들과 그 해결 방법을 알아봅시다.

## 일반적인 JSON 오류 유형

### 1. 문법 오류 (Syntax Errors)

#### 쉼표 관련 오류

**문제: 쉼표 누락**
```json
// ❌ 잘못된 형식
{
  "name": "홍길동"
  "age": 30
}
```

**해결책:**
```json
// ✅ 올바른 형식
{
  "name": "홍길동",
  "age": 30
}
```

**문제: 마지막 쉼표 (Trailing Comma)**
```json
// ❌ 잘못된 형식
{
  "name": "홍길동",
  "age": 30,
}
```

**해결책:**
```json
// ✅ 올바른 형식
{
  "name": "홍길동",
  "age": 30
}
```

#### 따옴표 관련 오류

**문제: 작은따옴표 사용**
```json
// ❌ 잘못된 형식
{
  'name': '홍길동',
  'age': 30
}
```

**해결책:**
```json
// ✅ 올바른 형식
{
  "name": "홍길동",
  "age": 30
}
```

**문제: 키에 따옴표 누락**
```json
// ❌ 잘못된 형식
{
  name: "홍길동",
  age: 30
}
```

**해결책:**
```json
// ✅ 올바른 형식
{
  "name": "홍길동",
  "age": 30
}
```

#### 괄호 불일치

**문제: 괄호 누락**
```json
// ❌ 잘못된 형식
{
  "user": {
    "name": "홍길동",
    "profile": {
      "age": 30
    }
  // } 누락
}
```

**해결책:**
```json
// ✅ 올바른 형식
{
  "user": {
    "name": "홍길동",
    "profile": {
      "age": 30
    }
  }
}
```

### 2. 데이터 타입 오류

#### 지원하지 않는 타입

**문제: undefined 사용**
```javascript
// ❌ 잘못된 형식
const data = {
  name: "홍길동",
  middleName: undefined
};
JSON.stringify(data); // {"name":"홍길동"}
```

**해결책:**
```javascript
// ✅ 올바른 형식
const data = {
  name: "홍길동",
  middleName: null
};
JSON.stringify(data); // {"name":"홍길동","middleName":null}
```

**문제: 함수 포함**
```javascript
// ❌ 잘못된 형식
const data = {
  name: "홍길동",
  greet: function() { return "안녕하세요"; }
};
JSON.stringify(data); // {"name":"홍길동"}
```

**해결책:**
```javascript
// ✅ 올바른 형식
const data = {
  name: "홍길동",
  greetMessage: "안녕하세요"
};
JSON.stringify(data); // {"name":"홍길동","greetMessage":"안녕하세요"}
```

#### 순환 참조

**문제: 순환 참조 구조**
```javascript
// ❌ 문제가 되는 구조
const user = { name: "홍길동" };
const profile = { user: user };
user.profile = profile;

JSON.stringify(user); // TypeError: Converting circular structure to JSON
```

**해결책:**
```javascript
// ✅ 순환 참조 제거
function removeCircularReferences(obj, seen = new WeakSet()) {
  if (obj !== null && typeof obj === 'object') {
    if (seen.has(obj)) {
      return '[Circular Reference]';
    }
    seen.add(obj);
    
    const result = Array.isArray(obj) ? [] : {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = removeCircularReferences(obj[key], seen);
      }
    }
    
    seen.delete(obj);
    return result;
  }
  
  return obj;
}

const cleanData = removeCircularReferences(user);
JSON.stringify(cleanData);
```

## 오류 감지 및 처리

### 1. 파싱 오류 처리

```javascript
function safeJSONParse(jsonString, defaultValue = null) {
  try {
    const parsed = JSON.parse(jsonString);
    return { success: true, data: parsed, error: null };
  } catch (error) {
    return {
      success: false,
      data: defaultValue,
      error: {
        type: 'PARSE_ERROR',
        message: error.message,
        position: extractErrorPosition(error.message),
        suggestion: getSuggestion(error.message)
      }
    };
  }
}

function extractErrorPosition(errorMessage) {
  // "Unexpected token } in JSON at position 25"에서 위치 추출
  const match = errorMessage.match(/at position (\d+)/);
  return match ? parseInt(match[1]) : null;
}

function getSuggestion(errorMessage) {
  if (errorMessage.includes('Unexpected token }')) {
    return '닫는 괄호 앞에 불필요한 쉼표가 있는지 확인하세요';
  } else if (errorMessage.includes('Unexpected token ,')) {
    return '쉼표 사용이 올바른지 확인하세요';
  } else if (errorMessage.includes('Unexpected end of JSON input')) {
    return 'JSON 구조가 완전하지 않습니다. 괄호나 따옴표가 누락되었는지 확인하세요';
  }
  return '문법을 다시 확인해보세요';
}

// 사용 예제
const result = safeJSONParse('{"name": "홍길동",}');
if (!result.success) {
  console.error('파싱 오류:', result.error.message);
  console.log('제안:', result.error.suggestion);
}
```

### 2. 스키마 검증

```javascript
class JSONValidator {
  constructor() {
    this.errors = [];
  }
  
  validate(data, schema) {
    this.errors = [];
    this.validateValue(data, schema, '');
    
    return {
      valid: this.errors.length === 0,
      errors: this.errors
    };
  }
  
  validateValue(value, schema, path) {
    // 타입 검증
    if (schema.type && typeof value !== schema.type) {
      this.addError(path, `Expected ${schema.type}, got ${typeof value}`);
      return;
    }
    
    // 필수 필드 검증
    if (schema.type === 'object' && schema.required) {
      for (const requiredField of schema.required) {
        if (!(requiredField in value)) {
          this.addError(`${path}.${requiredField}`, 'Required field is missing');
        }
      }
    }
    
    // 문자열 길이 검증
    if (schema.type === 'string') {
      if (schema.minLength && value.length < schema.minLength) {
        this.addError(path, `String too short. Minimum length: ${schema.minLength}`);
      }
      if (schema.maxLength && value.length > schema.maxLength) {
        this.addError(path, `String too long. Maximum length: ${schema.maxLength}`);
      }
    }
    
    // 숫자 범위 검증
    if (schema.type === 'number') {
      if (schema.minimum !== undefined && value < schema.minimum) {
        this.addError(path, `Number too small. Minimum: ${schema.minimum}`);
      }
      if (schema.maximum !== undefined && value > schema.maximum) {
        this.addError(path, `Number too large. Maximum: ${schema.maximum}`);
      }
    }
    
    // 객체 속성 검증
    if (schema.type === 'object' && schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in value) {
          this.validateValue(value[key], propSchema, `${path}.${key}`);
        }
      }
    }
    
    // 배열 요소 검증
    if (schema.type === 'array' && schema.items) {
      value.forEach((item, index) => {
        this.validateValue(item, schema.items, `${path}[${index}]`);
      });
    }
  }
  
  addError(path, message) {
    this.errors.push({
      path: path || 'root',
      message: message
    });
  }
}

// 사용 예제
const validator = new JSONValidator();
const schema = {
  type: 'object',
  required: ['name', 'email'],
  properties: {
    name: { type: 'string', minLength: 1 },
    email: { type: 'string', minLength: 5 },
    age: { type: 'number', minimum: 0, maximum: 150 }
  }
};

const data = {
  name: "",
  email: "test",
  age: -5
};

const result = validator.validate(data, schema);
console.log(result);
// {
//   valid: false,
//   errors: [
//     { path: '.name', message: 'String too short. Minimum length: 1' },
//     { path: '.age', message: 'Number too small. Minimum: 0' }
//   ]
// }
```

### 3. 부분 파싱 및 복구

```javascript
class RobustJSONParser {
  constructor() {
    this.recoveryStrategies = [
      this.fixTrailingCommas.bind(this),
      this.fixUnquotedKeys.bind(this),
      this.fixSingleQuotes.bind(this),
      this.extractValidPortion.bind(this)
    ];
  }
  
  parse(jsonString) {
    try {
      return {
        success: true,
        data: JSON.parse(jsonString),
        recovered: false
      };
    } catch (originalError) {
      return this.attemptRecovery(jsonString, originalError);
    }
  }
  
  attemptRecovery(jsonString, originalError) {
    for (const strategy of this.recoveryStrategies) {
      try {
        const fixed = strategy(jsonString);
        const data = JSON.parse(fixed);
        
        return {
          success: true,
          data: data,
          recovered: true,
          strategy: strategy.name,
          originalError: originalError.message
        };
      } catch (error) {
        continue;
      }
    }
    
    return {
      success: false,
      data: null,
      recovered: false,
      error: originalError.message
    };
  }
  
  fixTrailingCommas(jsonString) {
    // 마지막 쉼표 제거
    return jsonString.replace(/,(\s*[}\]])/g, '$1');
  }
  
  fixUnquotedKeys(jsonString) {
    // 따옴표 없는 키에 따옴표 추가
    return jsonString.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
  }
  
  fixSingleQuotes(jsonString) {
    // 작은따옴표를 큰따옴표로 변경
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

// 사용 예제
const parser = new RobustJSONParser();

const malformedJSON = `{
  "name": "홍길동",
  "age": 30,
}`;

const result = parser.parse(malformedJSON);
console.log(result);
// {
//   success: true,
//   data: { name: "홍길동", age: 30 },
//   recovered: true,
//   strategy: "fixTrailingCommas"
// }
```

## 실시간 오류 감지

### 1. 스트리밍 검증

```javascript
class StreamingJSONValidator {
  constructor() {
    this.stack = [];
    this.errors = [];
    this.position = 0;
  }
  
  validateChunk(chunk) {
    for (let i = 0; i < chunk.length; i++) {
      this.validateChar(chunk[i]);
      this.position++;
    }
    
    return {
      errors: [...this.errors],
      isComplete: this.stack.length === 0
    };
  }
  
  validateChar(char) {
    switch (char) {
      case '{':
        this.stack.push('object');
        break;
      case '}':
        if (this.stack.length === 0 || this.stack.pop() !== 'object') {
          this.addError('Unexpected closing brace');
        }
        break;
      case '[':
        this.stack.push('array');
        break;
      case ']':
        if (this.stack.length === 0 || this.stack.pop() !== 'array') {
          this.addError('Unexpected closing bracket');
        }
        break;
      case '"':
        this.handleString();
        break;
    }
  }
  
  handleString() {
    // 문자열 처리 로직
  }
  
  addError(message) {
    this.errors.push({
      message: message,
      position: this.position
    });
  }
  
  reset() {
    this.stack = [];
    this.errors = [];
    this.position = 0;
  }
}
```

### 2. 실시간 편집기 검증

```javascript
class JSONEditor {
  constructor(textarea) {
    this.textarea = textarea;
    this.errorDisplay = document.getElementById('error-display');
    this.debounceTimer = null;
    
    this.textarea.addEventListener('input', this.handleInput.bind(this));
  }
  
  handleInput() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.validateJSON();
    }, 300);
  }
  
  validateJSON() {
    const content = this.textarea.value;
    
    if (!content.trim()) {
      this.clearErrors();
      return;
    }
    
    try {
      JSON.parse(content);
      this.showSuccess();
    } catch (error) {
      this.showError(error);
    }
  }
  
  showError(error) {
    const errorInfo = this.parseError(error);
    
    this.errorDisplay.innerHTML = `
      <div class="error">
        <strong>오류:</strong> ${errorInfo.message}
        ${errorInfo.line ? `<br><strong>위치:</strong> ${errorInfo.line}줄` : ''}
        ${errorInfo.suggestion ? `<br><strong>제안:</strong> ${errorInfo.suggestion}` : ''}
      </div>
    `;
    
    this.highlightError(errorInfo);
  }
  
  parseError(error) {
    const message = error.message;
    let line = null;
    let suggestion = null;
    
    // 위치 정보 추출
    const positionMatch = message.match(/at position (\d+)/);
    if (positionMatch) {
      const position = parseInt(positionMatch[1]);
      line = this.getLineFromPosition(position);
    }
    
    // 제안 생성
    if (message.includes('Unexpected token }')) {
      suggestion = '마지막 쉼표를 제거해보세요';
    } else if (message.includes('Unexpected token ,')) {
      suggestion = '쉼표 위치를 확인해보세요';
    } else if (message.includes('Unexpected end')) {
      suggestion = '괄호나 따옴표가 누락되었는지 확인해보세요';
    }
    
    return { message, line, suggestion };
  }
  
  getLineFromPosition(position) {
    const content = this.textarea.value;
    const beforePosition = content.substring(0, position);
    return beforePosition.split('\n').length;
  }
  
  highlightError(errorInfo) {
    if (errorInfo.line) {
      // 에러 라인 하이라이트 로직
      this.textarea.classList.add('has-error');
    }
  }
  
  showSuccess() {
    this.errorDisplay.innerHTML = '<div class="success">✓ 유효한 JSON입니다</div>';
    this.textarea.classList.remove('has-error');
  }
  
  clearErrors() {
    this.errorDisplay.innerHTML = '';
    this.textarea.classList.remove('has-error');
  }
}

// 사용 예제
const editor = new JSONEditor(document.getElementById('json-textarea'));
```

## 오류 예방 모범 사례

### 1. 타입 안전성 확보

```typescript
// TypeScript 인터페이스 정의
interface User {
  id: number;
  name: string;
  email: string;
  profile?: {
    age?: number;
    bio?: string;
  };
}

function processUser(userData: unknown): User | null {
  try {
    // 런타임 타입 검증
    if (!isValidUser(userData)) {
      throw new Error('Invalid user data structure');
    }
    
    return userData as User;
  } catch (error) {
    console.error('User data validation failed:', error);
    return null;
  }
}

function isValidUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    'email' in data &&
    typeof (data as any).id === 'number' &&
    typeof (data as any).name === 'string' &&
    typeof (data as any).email === 'string'
  );
}
```

### 2. 방어적 프로그래밍

```javascript
class SafeJSONHandler {
  static stringify(obj, options = {}) {
    const {
      space = 2,
      replacer = null,
      maxDepth = 10,
      handleCircular = true
    } = options;
    
    try {
      if (handleCircular) {
        obj = this.removeCircularReferences(obj, maxDepth);
      }
      
      return JSON.stringify(obj, replacer, space);
    } catch (error) {
      console.error('JSON stringify failed:', error);
      return null;
    }
  }
  
  static parse(jsonString, options = {}) {
    const {
      defaultValue = null,
      reviver = null,
      validate = true
    } = options;
    
    if (typeof jsonString !== 'string') {
      console.warn('Expected string input for JSON.parse');
      return defaultValue;
    }
    
    if (!jsonString.trim()) {
      return defaultValue;
    }
    
    try {
      const parsed = JSON.parse(jsonString, reviver);
      
      if (validate && !this.isValidJSON(parsed)) {
        throw new Error('Parsed data failed validation');
      }
      
      return parsed;
    } catch (error) {
      console.error('JSON parse failed:', error);
      return defaultValue;
    }
  }
  
  static removeCircularReferences(obj, maxDepth = 10, depth = 0, seen = new WeakSet()) {
    if (depth > maxDepth) {
      return '[Max Depth Exceeded]';
    }
    
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (seen.has(obj)) {
      return '[Circular Reference]';
    }
    
    seen.add(obj);
    
    const result = Array.isArray(obj) ? [] : {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = this.removeCircularReferences(obj[key], maxDepth, depth + 1, seen);
      }
    }
    
    seen.delete(obj);
    return result;
  }
  
  static isValidJSON(data) {
    // 기본적인 JSON 유효성 검사
    if (data === null) return true;
    
    const type = typeof data;
    if (['string', 'number', 'boolean'].includes(type)) return true;
    
    if (Array.isArray(data)) {
      return data.every(item => this.isValidJSON(item));
    }
    
    if (type === 'object') {
      return Object.values(data).every(value => this.isValidJSON(value));
    }
    
    return false;
  }
}

// 사용 예제
const data = { name: "홍길동", age: 30 };
const jsonString = SafeJSONHandler.stringify(data);
const parsed = SafeJSONHandler.parse(jsonString, { validate: true });
```

### 3. 로깅 및 모니터링

```javascript
class JSONErrorLogger {
  constructor(options = {}) {
    this.logLevel = options.logLevel || 'error';
    this.maxLogSize = options.maxLogSize || 1000;
    this.logs = [];
  }
  
  logError(error, context = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message: error.message,
      stack: error.stack,
      context: context,
      id: this.generateId()
    };
    
    this.addLog(logEntry);
    
    // 외부 로깅 서비스로 전송
    this.sendToExternalService(logEntry);
  }
  
  logWarning(message, context = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'warning',
      message: message,
      context: context,
      id: this.generateId()
    };
    
    this.addLog(logEntry);
  }
  
  addLog(logEntry) {
    this.logs.push(logEntry);
    
    // 로그 크기 제한
    if (this.logs.length > this.maxLogSize) {
      this.logs.shift();
    }
  }
  
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
  
  async sendToExternalService(logEntry) {
    try {
      // 실제 구현에서는 외부 로깅 서비스 API 호출
      console.error('JSON Error:', logEntry);
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }
  
  getErrorStats() {
    const errorLogs = this.logs.filter(log => log.level === 'error');
    const warningLogs = this.logs.filter(log => log.level === 'warning');
    
    return {
      totalErrors: errorLogs.length,
      totalWarnings: warningLogs.length,
      recentErrors: errorLogs.slice(-10),
      errorsByType: this.groupErrorsByType(errorLogs)
    };
  }
  
  groupErrorsByType(errorLogs) {
    const grouped = {};
    
    errorLogs.forEach(log => {
      const errorType = this.extractErrorType(log.message);
      grouped[errorType] = (grouped[errorType] || 0) + 1;
    });
    
    return grouped;
  }
  
  extractErrorType(message) {
    if (message.includes('Unexpected token')) return 'SYNTAX_ERROR';
    if (message.includes('circular structure')) return 'CIRCULAR_REFERENCE';
    if (message.includes('Unexpected end')) return 'INCOMPLETE_JSON';
    return 'UNKNOWN_ERROR';
  }
}

// 전역 오류 처리기 설정
const errorLogger = new JSONErrorLogger();

// JSON 파싱 래퍼
function safeJSONParse(jsonString, context = {}) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    errorLogger.logError(error, {
      ...context,
      jsonString: jsonString.substring(0, 100) + '...' // 일부만 로깅
    });
    throw error;
  }
}
```

이러한 오류 처리 기법들을 활용하면 더 안정적이고 사용자 친화적인 JSON 처리 시스템을 구축할 수 있습니다.