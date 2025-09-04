# JSON 성능 최적화 팁

JSON 처리 성능을 향상시키기 위한 실용적인 팁과 기법들을 알아봅시다.

## 파싱 성능 최적화

### 1. 적절한 파싱 방법 선택

#### 소량 데이터: 표준 JSON.parse()
```javascript
// 작은 JSON 데이터 (< 1MB)
const smallData = '{"name": "홍길동", "age": 30}';
const parsed = JSON.parse(smallData); // 가장 빠름
```

#### 대량 데이터: 스트리밍 파싱
```javascript
// 대용량 JSON 데이터 (> 10MB)
class StreamingParser {
  constructor() {
    this.buffer = '';
    this.callbacks = {};
  }
  
  on(event, callback) {
    this.callbacks[event] = callback;
  }
  
  parseChunk(chunk) {
    this.buffer += chunk;
    
    // 완전한 객체가 있는지 확인
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
          
          try {
            const obj = JSON.parse(objectStr);
            this.callbacks.object?.(obj);
          } catch (error) {
            this.callbacks.error?.(error);
          }
          
          this.buffer = this.buffer.substring(i + 1);
          i = -1; // 처음부터 다시 시작
          startIndex = -1;
        }
      }
    }
  }
}

// 사용 예제
const parser = new StreamingParser();
parser.on('object', (obj) => {
  console.log('파싱된 객체:', obj);
});

// 큰 파일을 청크 단위로 읽기
const fs = require('fs');
const stream = fs.createReadStream('large-data.json');
stream.on('data', (chunk) => {
  parser.parseChunk(chunk.toString());
});
```

### 2. 메모리 효율적인 처리

#### 객체 풀링
```javascript
class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    
    // 초기 객체 생성
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }
  
  acquire() {
    return this.pool.length > 0 ? this.pool.pop() : this.createFn();
  }
  
  release(obj) {
    this.resetFn(obj);
    this.pool.push(obj);
  }
}

// JSON 파싱용 객체 풀
const jsonPool = new ObjectPool(
  () => ({}),
  (obj) => {
    for (const key in obj) {
      delete obj[key];
    }
  }
);

function parseWithPool(jsonString) {
  const obj = jsonPool.acquire();
  
  try {
    const parsed = JSON.parse(jsonString);
    Object.assign(obj, parsed);
    return obj;
  } finally {
    // 사용 후 풀로 반환 (실제로는 복사본을 반환하고 원본을 풀로)
    setTimeout(() => jsonPool.release(obj), 0);
  }
}
```

#### 지연 로딩
```javascript
class LazyJSONObject {
  constructor(jsonString) {
    this.jsonString = jsonString;
    this.parsed = null;
    this.cache = new Map();
  }
  
  get(path) {
    if (this.cache.has(path)) {
      return this.cache.get(path);
    }
    
    if (!this.parsed) {
      this.parsed = JSON.parse(this.jsonString);
    }
    
    const value = this.getNestedValue(this.parsed, path);
    this.cache.set(path, value);
    return value;
  }
  
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key];
    }, obj);
  }
  
  // 자주 사용되는 경로만 미리 캐싱
  preload(paths) {
    paths.forEach(path => this.get(path));
  }
}

// 사용 예제
const lazyObj = new LazyJSONObject(largeJsonString);
lazyObj.preload(['user.name', 'user.email']); // 자주 사용되는 필드만 미리 로드
const userName = lazyObj.get('user.name'); // 캐시에서 반환
```

### 3. 병렬 처리

#### 워커 스레드 활용
```javascript
// main.js
class ParallelJSONProcessor {
  constructor(workerCount = 4) {
    this.workers = [];
    this.taskQueue = [];
    this.results = new Map();
    
    for (let i = 0; i < workerCount; i++) {
      const worker = new Worker('json-worker.js');
      worker.onmessage = this.handleWorkerMessage.bind(this);
      this.workers.push({ worker, busy: false });
    }
  }
  
  async processArray(jsonArray) {
    const chunkSize = Math.ceil(jsonArray.length / this.workers.length);
    const chunks = [];
    
    for (let i = 0; i < jsonArray.length; i += chunkSize) {
      chunks.push(jsonArray.slice(i, i + chunkSize));
    }
    
    const promises = chunks.map((chunk, index) => 
      this.processChunk(chunk, index)
    );
    
    const results = await Promise.all(promises);
    return results.flat();
  }
  
  processChunk(chunk, chunkId) {
    return new Promise((resolve, reject) => {
      const taskId = Date.now() + Math.random();
      this.results.set(taskId, { resolve, reject });
      
      const availableWorker = this.workers.find(w => !w.busy);
      if (availableWorker) {
        this.assignTask(availableWorker, { taskId, chunk, chunkId });
      } else {
        this.taskQueue.push({ taskId, chunk, chunkId });
      }
    });
  }
  
  assignTask(workerInfo, task) {
    workerInfo.busy = true;
    workerInfo.worker.postMessage(task);
  }
  
  handleWorkerMessage(event) {
    const { taskId, result, error } = event.data;
    const taskResult = this.results.get(taskId);
    
    if (taskResult) {
      this.results.delete(taskId);
      
      if (error) {
        taskResult.reject(new Error(error));
      } else {
        taskResult.resolve(result);
      }
    }
    
    // 워커를 사용 가능 상태로 변경
    const worker = this.workers.find(w => w.worker === event.target);
    if (worker) {
      worker.busy = false;
      
      // 대기 중인 작업 처리
      if (this.taskQueue.length > 0) {
        const nextTask = this.taskQueue.shift();
        this.assignTask(worker, nextTask);
      }
    }
  }
}

// json-worker.js
self.onmessage = function(event) {
  const { taskId, chunk, chunkId } = event.data;
  
  try {
    // JSON 처리 작업
    const processed = chunk.map(item => {
      if (typeof item === 'string') {
        return JSON.parse(item);
      }
      return item;
    });
    
    self.postMessage({
      taskId,
      result: processed,
      chunkId
    });
  } catch (error) {
    self.postMessage({
      taskId,
      error: error.message,
      chunkId
    });
  }
};
```

## 직렬화 성능 최적화

### 1. 효율적인 JSON.stringify 사용

#### 커스텀 replacer 함수
```javascript
// 불필요한 필드 제외
function createReplacer(excludeFields = []) {
  return function(key, value) {
    if (excludeFields.includes(key)) {
      return undefined;
    }
    
    // 함수 제외
    if (typeof value === 'function') {
      return undefined;
    }
    
    // 순환 참조 처리
    if (typeof value === 'object' && value !== null) {
      if (this._seen && this._seen.has(value)) {
        return '[Circular]';
      }
      
      if (!this._seen) {
        this._seen = new WeakSet();
      }
      this._seen.add(value);
    }
    
    return value;
  };
}

// 사용 예제
const data = {
  name: '홍길동',
  password: 'secret123', // 제외할 필드
  age: 30,
  greet: function() { return 'hello'; } // 제외될 함수
};

const json = JSON.stringify(data, createReplacer(['password']));
console.log(json); // {"name":"홍길동","age":30}
```

#### 배치 직렬화
```javascript
class BatchSerializer {
  constructor(batchSize = 1000) {
    this.batchSize = batchSize;
  }
  
  async serializeArray(array) {
    const results = [];
    
    for (let i = 0; i < array.length; i += this.batchSize) {
      const batch = array.slice(i, i + this.batchSize);
      
      // 배치를 비동기로 처리하여 UI 블로킹 방지
      const batchResult = await new Promise(resolve => {
        setTimeout(() => {
          const serialized = batch.map(item => JSON.stringify(item));
          resolve(serialized);
        }, 0);
      });
      
      results.push(...batchResult);
      
      // 진행률 보고
      const progress = Math.min((i + this.batchSize) / array.length, 1);
      this.onProgress?.(progress);
    }
    
    return results;
  }
  
  onProgress(progress) {
    console.log(`직렬화 진행률: ${(progress * 100).toFixed(1)}%`);
  }
}

// 사용 예제
const serializer = new BatchSerializer(500);
const largeArray = new Array(10000).fill(0).map((_, i) => ({
  id: i,
  name: `Item ${i}`,
  data: Math.random()
}));

serializer.serializeArray(largeArray).then(results => {
  console.log('직렬화 완료:', results.length);
});
```

### 2. 압축 및 최적화

#### 키 압축
```javascript
class JSONCompressor {
  constructor() {
    this.keyMap = new Map();
    this.reverseKeyMap = new Map();
    this.keyCounter = 0;
  }
  
  compress(obj) {
    const compressed = this.compressObject(obj);
    
    return {
      data: compressed,
      keyMap: Object.fromEntries(this.keyMap),
      originalSize: JSON.stringify(obj).length,
      compressedSize: JSON.stringify(compressed).length
    };
  }
  
  compressObject(obj) {
    if (Array.isArray(obj)) {
      return obj.map(item => this.compressObject(item));
    }
    
    if (obj && typeof obj === 'object') {
      const compressed = {};
      
      for (const [key, value] of Object.entries(obj)) {
        const compressedKey = this.getCompressedKey(key);
        compressed[compressedKey] = this.compressObject(value);
      }
      
      return compressed;
    }
    
    return obj;
  }
  
  getCompressedKey(key) {
    if (!this.keyMap.has(key)) {
      const shortKey = this.generateShortKey();
      this.keyMap.set(key, shortKey);
      this.reverseKeyMap.set(shortKey, key);
    }
    
    return this.keyMap.get(key);
  }
  
  generateShortKey() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    let num = this.keyCounter++;
    
    do {
      result = chars[num % chars.length] + result;
      num = Math.floor(num / chars.length);
    } while (num > 0);
    
    return result;
  }
  
  decompress(compressedData) {
    const { data, keyMap } = compressedData;
    
    // 키 맵 역변환
    this.reverseKeyMap.clear();
    for (const [original, compressed] of Object.entries(keyMap)) {
      this.reverseKeyMap.set(compressed, original);
    }
    
    return this.decompressObject(data);
  }
  
  decompressObject(obj) {
    if (Array.isArray(obj)) {
      return obj.map(item => this.decompressObject(item));
    }
    
    if (obj && typeof obj === 'object') {
      const decompressed = {};
      
      for (const [compressedKey, value] of Object.entries(obj)) {
        const originalKey = this.reverseKeyMap.get(compressedKey) || compressedKey;
        decompressed[originalKey] = this.decompressObject(value);
      }
      
      return decompressed;
    }
    
    return obj;
  }
}

// 사용 예제
const compressor = new JSONCompressor();

const originalData = {
  userProfile: {
    firstName: '홍',
    lastName: '길동',
    emailAddress: 'hong@example.com',
    phoneNumber: '010-1234-5678'
  },
  accountSettings: {
    notificationPreferences: {
      emailNotifications: true,
      pushNotifications: false
    }
  }
};

const compressed = compressor.compress(originalData);
console.log('압축률:', ((1 - compressed.compressedSize / compressed.originalSize) * 100).toFixed(1) + '%');

const decompressed = compressor.decompress(compressed);
console.log('복원 성공:', JSON.stringify(originalData) === JSON.stringify(decompressed));
```

## 캐싱 전략

### 1. 메모리 캐시

```javascript
class JSONCache {
  constructor(maxSize = 100, ttl = 300000) { // 5분 TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.accessOrder = [];
  }
  
  set(key, value) {
    const now = Date.now();
    
    // 기존 항목 제거 (LRU)
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.accessOrder.shift();
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      value: value,
      timestamp: now,
      accessCount: 0
    });
    
    this.updateAccessOrder(key);
  }
  
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // TTL 확인
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return null;
    }
    
    item.accessCount++;
    this.updateAccessOrder(key);
    
    return item.value;
  }
  
  updateAccessOrder(key) {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }
  
  removeFromAccessOrder(key) {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }
  
  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }
  
  getStats() {
    const items = Array.from(this.cache.values());
    
    return {
      size: this.cache.size,
      totalAccess: items.reduce((sum, item) => sum + item.accessCount, 0),
      averageAccess: items.length > 0 ? 
        items.reduce((sum, item) => sum + item.accessCount, 0) / items.length : 0
    };
  }
}

// 파싱 결과 캐싱
const parseCache = new JSONCache(50, 600000); // 10분 TTL

function cachedJSONParse(jsonString) {
  const cacheKey = hashString(jsonString);
  
  let result = parseCache.get(cacheKey);
  if (result) {
    return result;
  }
  
  result = JSON.parse(jsonString);
  parseCache.set(cacheKey, result);
  
  return result;
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32비트 정수로 변환
  }
  return hash.toString();
}
```

### 2. 영구 캐시 (브라우저)

```javascript
class PersistentJSONCache {
  constructor(dbName = 'JSONCache', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }
  
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }
  
  async set(key, value, ttl = 3600000) { // 1시간 기본 TTL
    const transaction = this.db.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');
    
    const item = {
      key: key,
      value: value,
      timestamp: Date.now(),
      ttl: ttl
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  async get(key) {
    const transaction = this.db.transaction(['cache'], 'readonly');
    const store = transaction.objectStore('cache');
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      
      request.onsuccess = () => {
        const item = request.result;
        
        if (!item) {
          resolve(null);
          return;
        }
        
        // TTL 확인
        if (Date.now() - item.timestamp > item.ttl) {
          this.delete(key); // 만료된 항목 삭제
          resolve(null);
          return;
        }
        
        resolve(item.value);
      };
      
      request.onerror = () => reject(request.error);
    });
  }
  
  async delete(key) {
    const transaction = this.db.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  async cleanup() {
    const transaction = this.db.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');
    const index = store.index('timestamp');
    
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24시간 전
    const range = IDBKeyRange.upperBound(cutoff);
    
    return new Promise((resolve, reject) => {
      const request = index.openCursor(range);
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }
}

// 사용 예제
const persistentCache = new PersistentJSONCache();

async function cachedFetch(url) {
  await persistentCache.init();
  
  let data = await persistentCache.get(url);
  
  if (!data) {
    const response = await fetch(url);
    data = await response.json();
    
    await persistentCache.set(url, data, 1800000); // 30분 캐시
  }
  
  return data;
}
```

## 성능 측정 및 모니터링

### 1. 성능 프로파일러

```javascript
class JSONPerformanceProfiler {
  constructor() {
    this.metrics = new Map();
  }
  
  profile(name, fn) {
    const start = performance.now();
    const startMemory = this.getMemoryUsage();
    
    const result = fn();
    
    const end = performance.now();
    const endMemory = this.getMemoryUsage();
    
    const metric = {
      name: name,
      duration: end - start,
      memoryDelta: endMemory - startMemory,
      timestamp: Date.now()
    };
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name).push(metric);
    
    return result;
  }
  
  async profileAsync(name, asyncFn) {
    const start = performance.now();
    const startMemory = this.getMemoryUsage();
    
    const result = await asyncFn();
    
    const end = performance.now();
    const endMemory = this.getMemoryUsage();
    
    const metric = {
      name: name,
      duration: end - start,
      memoryDelta: endMemory - startMemory,
      timestamp: Date.now()
    };
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name).push(metric);
    
    return result;
  }
  
  getMemoryUsage() {
    if (typeof performance !== 'undefined' && performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }
  
  getStats(name) {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) {
      return null;
    }
    
    const durations = metrics.map(m => m.duration);
    const memoryDeltas = metrics.map(m => m.memoryDelta);
    
    return {
      count: metrics.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      avgMemoryDelta: memoryDeltas.reduce((a, b) => a + b, 0) / memoryDeltas.length,
      totalMemoryDelta: memoryDeltas.reduce((a, b) => a + b, 0)
    };
  }
  
  report() {
    const report = {};
    
    for (const [name, metrics] of this.metrics) {
      report[name] = this.getStats(name);
    }
    
    return report;
  }
  
  clear() {
    this.metrics.clear();
  }
}

// 사용 예제
const profiler = new JSONPerformanceProfiler();

// JSON 파싱 성능 측정
const largeJsonString = JSON.stringify(generateLargeObject(10000));

const parsed = profiler.profile('JSON.parse', () => {
  return JSON.parse(largeJsonString);
});

const stringified = profiler.profile('JSON.stringify', () => {
  return JSON.stringify(parsed);
});

console.log('성능 리포트:', profiler.report());
```

### 2. 실시간 모니터링

```javascript
class JSONPerformanceMonitor {
  constructor(options = {}) {
    this.sampleRate = options.sampleRate || 0.1; // 10% 샘플링
    this.maxSamples = options.maxSamples || 1000;
    this.samples = [];
    this.thresholds = {
      slowParse: options.slowParseThreshold || 100, // 100ms
      largeMemory: options.largeMemoryThreshold || 10 * 1024 * 1024 // 10MB
    };
  }
  
  wrapJSONParse() {
    const originalParse = JSON.parse;
    const monitor = this;
    
    JSON.parse = function(text, reviver) {
      if (Math.random() > monitor.sampleRate) {
        return originalParse.call(this, text, reviver);
      }
      
      const start = performance.now();
      const startMemory = monitor.getMemoryUsage();
      
      try {
        const result = originalParse.call(this, text, reviver);
        
        const duration = performance.now() - start;
        const memoryDelta = monitor.getMemoryUsage() - startMemory;
        
        monitor.recordSample({
          operation: 'parse',
          duration: duration,
          memoryDelta: memoryDelta,
          inputSize: text.length,
          success: true,
          timestamp: Date.now()
        });
        
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        
        monitor.recordSample({
          operation: 'parse',
          duration: duration,
          memoryDelta: 0,
          inputSize: text.length,
          success: false,
          error: error.message,
          timestamp: Date.now()
        });
        
        throw error;
      }
    };
  }
  
  wrapJSONStringify() {
    const originalStringify = JSON.stringify;
    const monitor = this;
    
    JSON.stringify = function(value, replacer, space) {
      if (Math.random() > monitor.sampleRate) {
        return originalStringify.call(this, value, replacer, space);
      }
      
      const start = performance.now();
      const startMemory = monitor.getMemoryUsage();
      
      try {
        const result = originalStringify.call(this, value, replacer, space);
        
        const duration = performance.now() - start;
        const memoryDelta = monitor.getMemoryUsage() - startMemory;
        
        monitor.recordSample({
          operation: 'stringify',
          duration: duration,
          memoryDelta: memoryDelta,
          outputSize: result.length,
          success: true,
          timestamp: Date.now()
        });
        
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        
        monitor.recordSample({
          operation: 'stringify',
          duration: duration,
          memoryDelta: 0,
          outputSize: 0,
          success: false,
          error: error.message,
          timestamp: Date.now()
        });
        
        throw error;
      }
    };
  }
  
  recordSample(sample) {
    this.samples.push(sample);
    
    // 샘플 수 제한
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
    
    // 임계값 확인 및 알림
    this.checkThresholds(sample);
  }
  
  checkThresholds(sample) {
    if (sample.duration > this.thresholds.slowParse) {
      console.warn(`느린 JSON ${sample.operation} 감지:`, {
        duration: sample.duration,
        size: sample.inputSize || sample.outputSize
      });
    }
    
    if (sample.memoryDelta > this.thresholds.largeMemory) {
      console.warn(`큰 메모리 사용량 감지:`, {
        memoryDelta: sample.memoryDelta,
        operation: sample.operation
      });
    }
  }
  
  getMemoryUsage() {
    if (typeof performance !== 'undefined' && performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }
  
  getMetrics() {
    const parseOperations = this.samples.filter(s => s.operation === 'parse');
    const stringifyOperations = this.samples.filter(s => s.operation === 'stringify');
    
    return {
      parse: this.calculateOperationMetrics(parseOperations),
      stringify: this.calculateOperationMetrics(stringifyOperations),
      totalSamples: this.samples.length,
      errorRate: this.samples.filter(s => !s.success).length / this.samples.length
    };
  }
  
  calculateOperationMetrics(operations) {
    if (operations.length === 0) {
      return null;
    }
    
    const durations = operations.map(op => op.duration);
    const memoryDeltas = operations.map(op => op.memoryDelta);
    
    return {
      count: operations.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      p95Duration: this.percentile(durations, 0.95),
      avgMemoryDelta: memoryDeltas.reduce((a, b) => a + b, 0) / memoryDeltas.length,
      successRate: operations.filter(op => op.success).length / operations.length
    };
  }
  
  percentile(arr, p) {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[index];
  }
}

// 사용 예제
const monitor = new JSONPerformanceMonitor({
  sampleRate: 0.2, // 20% 샘플링
  slowParseThreshold: 50,
  largeMemoryThreshold: 5 * 1024 * 1024
});

monitor.wrapJSONParse();
monitor.wrapJSONStringify();

// 주기적으로 메트릭 리포트
setInterval(() => {
  const metrics = monitor.getMetrics();
  console.log('JSON 성능 메트릭:', metrics);
}, 60000); // 1분마다
```

이러한 성능 최적화 기법들을 적절히 조합하여 사용하면 JSON 처리 성능을 크게 향상시킬 수 있습니다. 실제 적용 시에는 프로파일링을 통해 병목 지점을 파악하고 상황에 맞는 최적화 기법을 선택하는 것이 중요합니다.