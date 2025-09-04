# JSON 성능 최적화 고급 기법

대용량 JSON 데이터 처리와 성능 최적화를 위한 고급 기법들을 학습해봅시다.

## 성능 측정 및 프로파일링

### 1. 성능 측정 도구

```javascript
class JSONPerformanceProfiler {
  constructor() {
    this.metrics = new Map();
    this.startTimes = new Map();
  }
  
  startTimer(operation) {
    this.startTimes.set(operation, performance.now());
  }
  
  endTimer(operation) {
    const startTime = this.startTimes.get(operation);
    if (startTime) {
      const duration = performance.now() - startTime;
      
      if (!this.metrics.has(operation)) {
        this.metrics.set(operation, []);
      }
      
      this.metrics.get(operation).push(duration);
      this.startTimes.delete(operation);
      
      return duration;
    }
    return null;
  }
  
  getStats(operation) {
    const times = this.metrics.get(operation) || [];
    if (times.length === 0) return null;
    
    const sorted = [...times].sort((a, b) => a - b);
    return {
      count: times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      avg: times.reduce((a, b) => a + b, 0) / times.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }
  
  benchmark(operation, fn, iterations = 1000) {
    const results = [];
    
    // 워밍업
    for (let i = 0; i < 10; i++) {
      fn();
    }
    
    // 실제 측정
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      fn();
      const end = performance.now();
      results.push(end - start);
    }
    
    return this.calculateStats(results);
  }
  
  calculateStats(times) {
    const sorted = [...times].sort((a, b) => a - b);
    return {
      iterations: times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      avg: times.reduce((a, b) => a + b, 0) / times.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      stdDev: this.calculateStdDev(times)
    };
  }
  
  calculateStdDev(times) {
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const squareDiffs = times.map(time => Math.pow(time - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / times.length;
    return Math.sqrt(avgSquareDiff);
  }
}

// 사용 예제
const profiler = new JSONPerformanceProfiler();

// 다양한 JSON 파싱 방법 벤치마크
const largeJsonString = JSON.stringify(generateLargeObject(10000));

const parseResults = profiler.benchmark('JSON.parse', () => {
  JSON.parse(largeJsonString);
}, 1000);

console.log('JSON.parse 성능:', parseResults);
```

### 2. 메모리 사용량 모니터링

```javascript
class MemoryMonitor {
  constructor() {
    this.snapshots = [];
  }
  
  takeSnapshot(label) {
    if (typeof performance !== 'undefined' && performance.memory) {
      const memory = {
        label,
        timestamp: Date.now(),
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
      
      this.snapshots.push(memory);
      return memory;
    }
    
    // Node.js 환경
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memory = process.memoryUsage();
      const snapshot = {
        label,
        timestamp: Date.now(),
        ...memory
      };
      
      this.snapshots.push(snapshot);
      return snapshot;
    }
    
    return null;
  }
  
  getDiff(startLabel, endLabel) {
    const start = this.snapshots.find(s => s.label === startLabel);
    const end = this.snapshots.find(s => s.label === endLabel);
    
    if (!start || !end) return null;
    
    return {
      duration: end.timestamp - start.timestamp,
      memoryDiff: {
        used: end.used - start.used,
        total: end.total - start.total
      }
    };
  }
  
  formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
  
  report() {
    return this.snapshots.map(snapshot => ({
      ...snapshot,
      usedFormatted: this.formatBytes(snapshot.used),
      totalFormatted: this.formatBytes(snapshot.total)
    }));
  }
}

// 사용 예제
const monitor = new MemoryMonitor();

monitor.takeSnapshot('start');

// 대용량 JSON 처리
const largeData = generateLargeObject(50000);
const jsonString = JSON.stringify(largeData);

monitor.takeSnapshot('after_stringify');

const parsed = JSON.parse(jsonString);

monitor.takeSnapshot('after_parse');

const diff = monitor.getDiff('start', 'after_parse');
console.log('메모리 사용량 변화:', monitor.formatBytes(diff.memoryDiff.used));
```

## 파싱 최적화 기법

### 1. 스트리밍 JSON 파서

```javascript
class StreamingJSONParser {
  constructor() {
    this.buffer = '';
    this.stack = [];
    this.current = null;
    this.key = null;
    this.state = 'start';
    this.callbacks = {};
  }
  
  on(event, callback) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }
  
  emit(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }
  
  parse(chunk) {
    this.buffer += chunk;
    
    while (this.buffer.length > 0) {
      const consumed = this.processBuffer();
      if (consumed === 0) break;
      this.buffer = this.buffer.slice(consumed);
    }
  }
  
  processBuffer() {
    let consumed = 0;
    
    for (let i = 0; i < this.buffer.length; i++) {
      const char = this.buffer[i];
      const result = this.processChar(char);
      
      consumed = i + 1;
      
      if (result === 'break') {
        break;
      } else if (result === 'complete') {
        return consumed;
      }
    }
    
    return consumed;
  }
  
  processChar(char) {
    switch (this.state) {
      case 'start':
        return this.handleStart(char);
      case 'object':
        return this.handleObject(char);
      case 'array':
        return this.handleArray(char);
      case 'string':
        return this.handleString(char);
      case 'number':
        return this.handleNumber(char);
      default:
        return 'continue';
    }
  }
  
  handleStart(char) {
    if (char === '{') {
      this.startObject();
      return 'continue';
    } else if (char === '[') {
      this.startArray();
      return 'continue';
    } else if (this.isWhitespace(char)) {
      return 'continue';
    }
    
    throw new Error(`Unexpected character: ${char}`);
  }
  
  startObject() {
    const obj = {};
    this.emit('objectStart', obj);
    
    if (this.current) {
      this.stack.push({
        type: 'object',
        value: this.current,
        key: this.key
      });
    }
    
    this.current = obj;
    this.state = 'object';
  }
  
  startArray() {
    const arr = [];
    this.emit('arrayStart', arr);
    
    if (this.current) {
      this.stack.push({
        type: 'array',
        value: this.current,
        key: this.key
      });
    }
    
    this.current = arr;
    this.state = 'array';
  }
  
  // 대용량 배열 처리를 위한 청크 단위 처리
  processLargeArray(arrayData, chunkSize = 1000) {
    return new Promise((resolve, reject) => {
      let index = 0;
      const results = [];
      
      const processChunk = () => {
        const chunk = arrayData.slice(index, index + chunkSize);
        
        try {
          // 청크 처리
          const processedChunk = chunk.map(item => this.processItem(item));
          results.push(...processedChunk);
          
          index += chunkSize;
          
          if (index < arrayData.length) {
            // 다음 청크를 비동기로 처리
            setTimeout(processChunk, 0);
          } else {
            resolve(results);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      processChunk();
    });
  }
  
  isWhitespace(char) {
    return /\s/.test(char);
  }
}

// 사용 예제
const parser = new StreamingJSONParser();

parser.on('objectStart', (obj) => {
  console.log('객체 시작');
});

parser.on('arrayStart', (arr) => {
  console.log('배열 시작');
});

// 대용량 JSON을 청크 단위로 처리
const largeJsonStream = fs.createReadStream('large-data.json');
largeJsonStream.on('data', (chunk) => {
  parser.parse(chunk.toString());
});
```

### 2. 지연 로딩 및 가상화

```javascript
class LazyJSONLoader {
  constructor(jsonData) {
    this.data = jsonData;
    this.cache = new Map();
    this.accessCount = new Map();
  }
  
  // 지연 로딩으로 필요한 부분만 파싱
  get(path) {
    if (this.cache.has(path)) {
      this.incrementAccess(path);
      return this.cache.get(path);
    }
    
    const value = this.extractPath(this.data, path);
    this.cache.set(path, value);
    this.incrementAccess(path);
    
    return value;
  }
  
  extractPath(data, path) {
    const keys = path.split('.');
    let current = data;
    
    for (const key of keys) {
      if (current && typeof current === 'object') {
        current = current[key];
      } else {
        return undefined;
      }
    }
    
    return current;
  }
  
  incrementAccess(path) {
    const count = this.accessCount.get(path) || 0;
    this.accessCount.set(path, count + 1);
  }
  
  // 자주 사용되는 데이터 미리 로딩
  preloadFrequentPaths() {
    const sortedPaths = Array.from(this.accessCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // 상위 10개
    
    sortedPaths.forEach(([path]) => {
      if (!this.cache.has(path)) {
        this.get(path);
      }
    });
  }
  
  // 캐시 정리
  clearLeastUsed(maxSize = 100) {
    if (this.cache.size <= maxSize) return;
    
    const sortedByAccess = Array.from(this.accessCount.entries())
      .sort((a, b) => a[1] - b[1]);
    
    const toRemove = sortedByAccess.slice(0, this.cache.size - maxSize);
    
    toRemove.forEach(([path]) => {
      this.cache.delete(path);
      this.accessCount.delete(path);
    });
  }
}

// 가상 스크롤링을 위한 JSON 배열 처리
class VirtualJSONArray {
  constructor(jsonArray, itemHeight = 50) {
    this.data = jsonArray;
    this.itemHeight = itemHeight;
    this.cache = new Map();
    this.visibleRange = { start: 0, end: 0 };
  }
  
  getVisibleItems(scrollTop, containerHeight) {
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / this.itemHeight) + 1,
      this.data.length
    );
    
    this.visibleRange = { start: startIndex, end: endIndex };
    
    const items = [];
    for (let i = startIndex; i < endIndex; i++) {
      items.push(this.getItem(i));
    }
    
    return {
      items,
      totalHeight: this.data.length * this.itemHeight,
      offsetY: startIndex * this.itemHeight
    };
  }
  
  getItem(index) {
    if (this.cache.has(index)) {
      return this.cache.get(index);
    }
    
    const item = this.processItem(this.data[index], index);
    this.cache.set(index, item);
    
    // 캐시 크기 제한
    if (this.cache.size > 1000) {
      this.cleanupCache();
    }
    
    return item;
  }
  
  processItem(rawItem, index) {
    // 아이템 처리 로직 (포맷팅, 계산 등)
    return {
      id: index,
      data: rawItem,
      processed: true,
      timestamp: Date.now()
    };
  }
  
  cleanupCache() {
    const { start, end } = this.visibleRange;
    const buffer = 50; // 버퍼 크기
    
    for (const [index] of this.cache) {
      if (index < start - buffer || index > end + buffer) {
        this.cache.delete(index);
      }
    }
  }
}
```

### 3. 병렬 처리 및 워커 활용

```javascript
// 메인 스레드
class ParallelJSONProcessor {
  constructor(workerCount = navigator.hardwareConcurrency || 4) {
    this.workers = [];
    this.taskQueue = [];
    this.results = new Map();
    this.nextTaskId = 0;
    
    this.initWorkers(workerCount);
  }
  
  initWorkers(count) {
    for (let i = 0; i < count; i++) {
      const worker = new Worker('/json-worker.js');
      
      worker.onmessage = (event) => {
        this.handleWorkerMessage(event.data);
      };
      
      worker.onerror = (error) => {
        console.error('Worker error:', error);
      };
      
      this.workers.push({
        worker,
        busy: false,
        id: i
      });
    }
  }
  
  async processLargeJSON(jsonData, operation) {
    const chunks = this.chunkData(jsonData, this.workers.length);
    const promises = chunks.map((chunk, index) => 
      this.processChunk(chunk, operation, index)
    );
    
    const results = await Promise.all(promises);
    return this.mergeResults(results, operation);
  }
  
  chunkData(data, chunkCount) {
    if (Array.isArray(data)) {
      const chunkSize = Math.ceil(data.length / chunkCount);
      const chunks = [];
      
      for (let i = 0; i < data.length; i += chunkSize) {
        chunks.push(data.slice(i, i + chunkSize));
      }
      
      return chunks;
    }
    
    // 객체의 경우 키 기준으로 분할
    const keys = Object.keys(data);
    const chunkSize = Math.ceil(keys.length / chunkCount);
    const chunks = [];
    
    for (let i = 0; i < keys.length; i += chunkSize) {
      const chunkKeys = keys.slice(i, i + chunkSize);
      const chunk = {};
      
      chunkKeys.forEach(key => {
        chunk[key] = data[key];
      });
      
      chunks.push(chunk);
    }
    
    return chunks;
  }
  
  processChunk(chunk, operation, chunkIndex) {
    return new Promise((resolve, reject) => {
      const taskId = this.nextTaskId++;
      
      this.results.set(taskId, { resolve, reject, chunkIndex });
      
      const availableWorker = this.workers.find(w => !w.busy);
      
      if (availableWorker) {
        this.assignTask(availableWorker, {
          taskId,
          chunk,
          operation,
          chunkIndex
        });
      } else {
        this.taskQueue.push({
          taskId,
          chunk,
          operation,
          chunkIndex
        });
      }
    });
  }
  
  assignTask(workerInfo, task) {
    workerInfo.busy = true;
    workerInfo.worker.postMessage(task);
  }
  
  handleWorkerMessage(data) {
    const { taskId, result, error, workerId } = data;
    
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
    const worker = this.workers.find(w => w.id === workerId);
    if (worker) {
      worker.busy = false;
      
      // 대기 중인 작업이 있으면 할당
      if (this.taskQueue.length > 0) {
        const nextTask = this.taskQueue.shift();
        this.assignTask(worker, nextTask);
      }
    }
  }
  
  mergeResults(results, operation) {
    switch (operation) {
      case 'filter':
        return results.flat();
      case 'map':
        return results.flat();
      case 'reduce':
        return results.reduce((acc, curr) => acc + curr, 0);
      case 'aggregate':
        return this.aggregateResults(results);
      default:
        return results;
    }
  }
  
  aggregateResults(results) {
    const aggregated = {
      totalItems: 0,
      processedItems: 0,
      errors: 0
    };
    
    results.forEach(result => {
      aggregated.totalItems += result.totalItems || 0;
      aggregated.processedItems += result.processedItems || 0;
      aggregated.errors += result.errors || 0;
    });
    
    return aggregated;
  }
  
  terminate() {
    this.workers.forEach(({ worker }) => {
      worker.terminate();
    });
    this.workers = [];
  }
}

// json-worker.js (별도 파일)
self.onmessage = function(event) {
  const { taskId, chunk, operation, chunkIndex } = event.data;
  
  try {
    let result;
    
    switch (operation) {
      case 'filter':
        result = processFilter(chunk);
        break;
      case 'map':
        result = processMap(chunk);
        break;
      case 'validate':
        result = processValidation(chunk);
        break;
      case 'transform':
        result = processTransform(chunk);
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
    
    self.postMessage({
      taskId,
      result,
      workerId: chunkIndex
    });
    
  } catch (error) {
    self.postMessage({
      taskId,
      error: error.message,
      workerId: chunkIndex
    });
  }
};

function processFilter(data) {
  if (Array.isArray(data)) {
    return data.filter(item => {
      // 필터링 로직
      return item && typeof item === 'object' && item.active === true;
    });
  }
  
  return data;
}

function processMap(data) {
  if (Array.isArray(data)) {
    return data.map(item => {
      // 변환 로직
      return {
        ...item,
        processed: true,
        timestamp: Date.now()
      };
    });
  }
  
  return data;
}

function processValidation(data) {
  let validItems = 0;
  let invalidItems = 0;
  
  if (Array.isArray(data)) {
    data.forEach(item => {
      if (isValidItem(item)) {
        validItems++;
      } else {
        invalidItems++;
      }
    });
  }
  
  return {
    totalItems: data.length,
    validItems,
    invalidItems,
    processedItems: validItems + invalidItems
  };
}

function isValidItem(item) {
  return item && 
         typeof item === 'object' && 
         item.id && 
         item.name && 
         typeof item.name === 'string';
}

// 사용 예제
const processor = new ParallelJSONProcessor(4);

// 대용량 JSON 배열 처리
const largeArray = generateLargeArray(100000);

processor.processLargeJSON(largeArray, 'filter')
  .then(filteredData => {
    console.log('필터링 완료:', filteredData.length);
  })
  .catch(error => {
    console.error('처리 오류:', error);
  });
```

## 메모리 최적화

### 1. 객체 풀링

```javascript
class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    this.inUse = new Set();
    
    // 초기 객체 생성
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }
  
  acquire() {
    let obj;
    
    if (this.pool.length > 0) {
      obj = this.pool.pop();
    } else {
      obj = this.createFn();
    }
    
    this.inUse.add(obj);
    return obj;
  }
  
  release(obj) {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }
  
  clear() {
    this.pool.length = 0;
    this.inUse.clear();
  }
  
  getStats() {
    return {
      poolSize: this.pool.length,
      inUse: this.inUse.size,
      total: this.pool.length + this.inUse.size
    };
  }
}

// JSON 파싱용 객체 풀
const jsonObjectPool = new ObjectPool(
  () => ({}), // 빈 객체 생성
  (obj) => {   // 객체 초기화
    for (const key in obj) {
      delete obj[key];
    }
  },
  100
);

const jsonArrayPool = new ObjectPool(
  () => [],   // 빈 배열 생성
  (arr) => {  // 배열 초기화
    arr.length = 0;
  },
  50
);

// 최적화된 JSON 파서
class OptimizedJSONParser {
  constructor() {
    this.objectPool = jsonObjectPool;
    this.arrayPool = jsonArrayPool;
  }
  
  parse(jsonString) {
    try {
      return this.parseValue(jsonString, 0).value;
    } finally {
      // 사용된 객체들을 풀로 반환
      this.cleanup();
    }
  }
  
  parseValue(str, index) {
    const char = str[index];
    
    switch (char) {
      case '{':
        return this.parseObject(str, index);
      case '[':
        return this.parseArray(str, index);
      case '"':
        return this.parseString(str, index);
      default:
        if (char >= '0' && char <= '9' || char === '-') {
          return this.parseNumber(str, index);
        }
        // boolean, null 처리
        return this.parseLiteral(str, index);
    }
  }
  
  parseObject(str, index) {
    const obj = this.objectPool.acquire();
    let i = index + 1; // '{' 건너뛰기
    
    // 공백 건너뛰기
    while (i < str.length && /\s/.test(str[i])) i++;
    
    if (str[i] === '}') {
      return { value: obj, index: i + 1 };
    }
    
    while (i < str.length) {
      // 키 파싱
      const keyResult = this.parseString(str, i);
      const key = keyResult.value;
      i = keyResult.index;
      
      // ':' 찾기
      while (i < str.length && str[i] !== ':') i++;
      i++; // ':' 건너뛰기
      
      // 값 파싱
      const valueResult = this.parseValue(str, i);
      obj[key] = valueResult.value;
      i = valueResult.index;
      
      // 다음 항목 확인
      while (i < str.length && /\s/.test(str[i])) i++;
      
      if (str[i] === '}') {
        return { value: obj, index: i + 1 };
      } else if (str[i] === ',') {
        i++;
        while (i < str.length && /\s/.test(str[i])) i++;
      }
    }
    
    return { value: obj, index: i };
  }
  
  cleanup() {
    // 실제 구현에서는 사용된 객체들을 추적하고 반환
  }
}
```

### 2. 가비지 컬렉션 최적화

```javascript
class GCOptimizedJSONProcessor {
  constructor() {
    this.processedCount = 0;
    this.gcThreshold = 10000;
    this.tempObjects = [];
  }
  
  processLargeDataset(dataset) {
    const results = [];
    
    for (let i = 0; i < dataset.length; i++) {
      const processed = this.processItem(dataset[i]);
      results.push(processed);
      
      this.processedCount++;
      
      // 주기적으로 가비지 컬렉션 유도
      if (this.processedCount % this.gcThreshold === 0) {
        this.triggerGC();
      }
    }
    
    return results;
  }
  
  processItem(item) {
    // 임시 객체 생성 최소화
    const result = this.reuseObject();
    
    // 처리 로직
    result.id = item.id;
    result.processed = true;
    result.timestamp = Date.now();
    
    return result;
  }
  
  reuseObject() {
    if (this.tempObjects.length > 0) {
      const obj = this.tempObjects.pop();
      // 객체 초기화
      for (const key in obj) {
        delete obj[key];
      }
      return obj;
    }
    
    return {};
  }
  
  triggerGC() {
    // 임시 객체들 정리
    this.tempObjects.length = 0;
    
    // 강제 가비지 컬렉션 (Node.js)
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
    }
    
    console.log(`GC triggered after processing ${this.processedCount} items`);
  }
  
  // 메모리 사용량 모니터링
  getMemoryUsage() {
    if (typeof performance !== 'undefined' && performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage();
    }
    
    return null;
  }
}
```

## 캐싱 전략

### 1. 다층 캐시 시스템

```javascript
class MultiLevelCache {
  constructor(options = {}) {
    this.l1Cache = new Map(); // 메모리 캐시
    this.l2Cache = new Map(); // 압축된 캐시
    this.l3Cache = null;      // 디스크 캐시 (Node.js)
    
    this.l1MaxSize = options.l1MaxSize || 100;
    this.l2MaxSize = options.l2MaxSize || 500;
    this.compressionThreshold = options.compressionThreshold || 1024;
    
    this.stats = {
      l1Hits: 0,
      l2Hits: 0,
      l3Hits: 0,
      misses: 0
    };
  }
  
  async get(key) {
    // L1 캐시 확인
    if (this.l1Cache.has(key)) {
      this.stats.l1Hits++;
      return this.l1Cache.get(key);
    }
    
    // L2 캐시 확인 (압축된 데이터)
    if (this.l2Cache.has(key)) {
      this.stats.l2Hits++;
      const compressed = this.l2Cache.get(key);
      const decompressed = await this.decompress(compressed);
      
      // L1으로 승격
      this.setL1(key, decompressed);
      return decompressed;
    }
    
    // L3 캐시 확인 (디스크)
    if (this.l3Cache) {
      const diskData = await this.l3Cache.get(key);
      if (diskData) {
        this.stats.l3Hits++;
        this.setL2(key, diskData);
        return diskData;
      }
    }
    
    this.stats.misses++;
    return null;
  }
  
  async set(key, value) {
    const size = this.estimateSize(value);
    
    // 크기에 따라 적절한 캐시 레벨 선택
    if (size < this.compressionThreshold) {
      this.setL1(key, value);
    } else {
      await this.setL2(key, value);
    }
  }
  
  setL1(key, value) {
    if (this.l1Cache.size >= this.l1MaxSize) {
      this.evictL1();
    }
    
    this.l1Cache.set(key, value);
  }
  
  async setL2(key, value) {
    if (this.l2Cache.size >= this.l2MaxSize) {
      await this.evictL2();
    }
    
    const compressed = await this.compress(value);
    this.l2Cache.set(key, compressed);
  }
  
  evictL1() {
    // LRU 방식으로 제거
    const firstKey = this.l1Cache.keys().next().value;
    const evicted = this.l1Cache.get(firstKey);
    this.l1Cache.delete(firstKey);
    
    // L2로 이동
    this.setL2(firstKey, evicted);
  }
  
  async evictL2() {
    const firstKey = this.l2Cache.keys().next().value;
    const evicted = this.l2Cache.get(firstKey);
    this.l2Cache.delete(firstKey);
    
    // L3로 이동 (디스크)
    if (this.l3Cache) {
      await this.l3Cache.set(firstKey, evicted);
    }
  }
  
  async compress(data) {
    // 실제 구현에서는 압축 라이브러리 사용
    const jsonString = JSON.stringify(data);
    
    // 간단한 압축 시뮬레이션
    return {
      compressed: true,
      data: jsonString,
      originalSize: jsonString.length,
      compressedSize: Math.floor(jsonString.length * 0.7)
    };
  }
  
  async decompress(compressed) {
    if (compressed.compressed) {
      return JSON.parse(compressed.data);
    }
    return compressed;
  }
  
  estimateSize(obj) {
    return JSON.stringify(obj).length;
  }
  
  getStats() {
    const total = this.stats.l1Hits + this.stats.l2Hits + 
                  this.stats.l3Hits + this.stats.misses;
    
    return {
      ...this.stats,
      hitRate: total > 0 ? (this.stats.l1Hits + this.stats.l2Hits + this.stats.l3Hits) / total : 0,
      l1HitRate: total > 0 ? this.stats.l1Hits / total : 0
    };
  }
  
  clear() {
    this.l1Cache.clear();
    this.l2Cache.clear();
    if (this.l3Cache) {
      this.l3Cache.clear();
    }
  }
}

// 사용 예제
const cache = new MultiLevelCache({
  l1MaxSize: 50,
  l2MaxSize: 200,
  compressionThreshold: 2048
});

// JSON 데이터 캐싱
async function getCachedJSON(url) {
  let data = await cache.get(url);
  
  if (!data) {
    // 캐시 미스 - 데이터 로드
    const response = await fetch(url);
    data = await response.json();
    
    // 캐시에 저장
    await cache.set(url, data);
  }
  
  return data;
}
```

이러한 성능 최적화 기법들을 적절히 조합하여 사용하면 대용량 JSON 데이터도 효율적으로 처리할 수 있습니다. 실제 적용 시에는 프로파일링을 통해 병목 지점을 파악하고 상황에 맞는 최적화 기법을 선택하는 것이 중요합니다.