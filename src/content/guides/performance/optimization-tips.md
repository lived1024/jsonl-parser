# 성능 최적화 팁

JSON 처리 성능을 향상시키기 위한 다양한 최적화 기법과 모범 사례를 다룹니다. 실제 측정 가능한 성능 개선 방법을 제시합니다.

## 성능 측정 기준

### 주요 메트릭
- **파싱 속도**: 초당 처리 가능한 JSON 객체 수
- **메모리 사용량**: 피크 메모리 사용량과 평균 사용량
- **응답 시간**: 사용자 입력부터 결과 표시까지의 시간
- **처리량**: 단위 시간당 처리 가능한 데이터 양

### 성능 측정 도구

```javascript
class PerformanceProfiler {
  constructor() {
    this.measurements = new Map()
  }
  
  start(label) {
    this.measurements.set(label, {
      startTime: performance.now(),
      startMemory: this.getMemoryUsage()
    })
  }
  
  end(label) {
    const measurement = this.measurements.get(label)
    if (!measurement) return null
    
    const endTime = performance.now()
    const endMemory = this.getMemoryUsage()
    
    const result = {
      duration: endTime - measurement.startTime,
      memoryDelta: endMemory - measurement.startMemory,
      startMemory: measurement.startMemory,
      endMemory: endMemory
    }
    
    this.measurements.delete(label)
    return result
  }
  
  getMemoryUsage() {
    if (performance.memory) {
      return performance.memory.usedJSHeapSize
    }
    return 0
  }
  
  profile(fn, label) {
    return async (...args) => {
      this.start(label)
      try {
        const result = await fn(...args)
        const stats = this.end(label)
        console.log(`${label}:`, stats)
        return result
      } catch (error) {
        this.end(label)
        throw error
      }
    }
  }
}

// 사용 예제
const profiler = new PerformanceProfiler()
const optimizedParse = profiler.profile(JSON.parse, 'json-parse')
```

## 파싱 최적화

### 1. 네이티브 JSON.parse 활용

```javascript
// ❌ 느린 방법: 정규식 기반 파싱
function slowJsonParse(jsonString) {
  // 복잡한 정규식으로 JSON 파싱 시도
  const objectRegex = /\{[^{}]*\}/g
  const matches = jsonString.match(objectRegex)
  return matches?.map(match => {
    try {
      return JSON.parse(match)
    } catch {
      return null
    }
  }).filter(Boolean)
}

// ✅ 빠른 방법: 네이티브 JSON.parse
function fastJsonParse(jsonString) {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    // 오류 처리
    throw new Error(`JSON parsing failed: ${error.message}`)
  }
}
```

### 2. 스트리밍 파서 사용

```javascript
// 대용량 데이터용 스트리밍 파서
class StreamingJSONParser {
  constructor() {
    this.buffer = ''
    this.depth = 0
    this.inString = false
    this.escaped = false
  }
  
  parse(chunk) {
    const results = []
    this.buffer += chunk
    
    let start = 0
    for (let i = 0; i < this.buffer.length; i++) {
      const char = this.buffer[i]
      
      if (this.escaped) {
        this.escaped = false
        continue
      }
      
      if (char === '\\' && this.inString) {
        this.escaped = true
        continue
      }
      
      if (char === '"') {
        this.inString = !this.inString
        continue
      }
      
      if (this.inString) continue
      
      if (char === '{') {
        if (this.depth === 0) start = i
        this.depth++
      } else if (char === '}') {
        this.depth--
        if (this.depth === 0) {
          const jsonStr = this.buffer.slice(start, i + 1)
          try {
            results.push(JSON.parse(jsonStr))
          } catch (error) {
            console.warn('Parse error:', error.message)
          }
        }
      }
    }
    
    // 처리된 부분 제거
    if (this.depth === 0) {
      this.buffer = ''
    }
    
    return results
  }
}
```

### 3. 선택적 파싱

```javascript
// 필요한 필드만 추출하는 최적화된 파서
class SelectiveParser {
  constructor(fields) {
    this.fields = new Set(fields)
  }
  
  parse(jsonString) {
    const data = JSON.parse(jsonString)
    return this.extractFields(data)
  }
  
  extractFields(obj) {
    if (Array.isArray(obj)) {
      return obj.map(item => this.extractFields(item))
    }
    
    if (obj && typeof obj === 'object') {
      const result = {}
      for (const [key, value] of Object.entries(obj)) {
        if (this.fields.has(key)) {
          result[key] = typeof value === 'object' 
            ? this.extractFields(value) 
            : value
        }
      }
      return result
    }
    
    return obj
  }
}

// 사용 예제
const parser = new SelectiveParser(['id', 'name', 'email'])
const result = parser.parse(largeJsonString) // 필요한 필드만 추출
```

## 메모리 최적화

### 1. 객체 풀링

```javascript
class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn
    this.resetFn = resetFn
    this.pool = []
    
    // 초기 객체 생성
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn())
    }
  }
  
  acquire() {
    if (this.pool.length > 0) {
      return this.pool.pop()
    }
    return this.createFn()
  }
  
  release(obj) {
    this.resetFn(obj)
    this.pool.push(obj)
  }
  
  size() {
    return this.pool.length
  }
}

// 사용 예제
const nodePool = new ObjectPool(
  () => ({ type: '', value: null, children: [] }),
  (node) => {
    node.type = ''
    node.value = null
    node.children.length = 0
  }
)

function createTreeNode(type, value) {
  const node = nodePool.acquire()
  node.type = type
  node.value = value
  return node
}

function destroyTreeNode(node) {
  nodePool.release(node)
}
```

### 2. 메모리 사용량 모니터링

```javascript
class MemoryOptimizer {
  constructor(options = {}) {
    this.maxMemoryMB = options.maxMemoryMB || 100
    this.gcThreshold = options.gcThreshold || 0.8
    this.monitorInterval = options.monitorInterval || 1000
    this.isMonitoring = false
  }
  
  startMonitoring() {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    this.intervalId = setInterval(() => {
      this.checkMemoryUsage()
    }, this.monitorInterval)
  }
  
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.isMonitoring = false
    }
  }
  
  checkMemoryUsage() {
    if (!performance.memory) return
    
    const used = performance.memory.usedJSHeapSize
    const total = performance.memory.totalJSHeapSize
    const usedMB = used / (1024 * 1024)
    const utilization = used / total
    
    console.log(`Memory: ${usedMB.toFixed(1)}MB (${(utilization * 100).toFixed(1)}%)`)
    
    if (usedMB > this.maxMemoryMB || utilization > this.gcThreshold) {
      this.triggerCleanup()
    }
  }
  
  triggerCleanup() {
    console.log('Triggering memory cleanup...')
    
    // 캐시 정리
    this.clearCaches()
    
    // 가비지 컬렉션 힌트
    if (window.gc) {
      window.gc()
    }
  }
  
  clearCaches() {
    // 구현별 캐시 정리 로직
    if (window.cacheManager) {
      window.cacheManager.clear()
    }
  }
}
```

### 3. 지연 로딩과 가상화

```javascript
class VirtualizedRenderer {
  constructor(container, itemHeight = 50, bufferSize = 5) {
    this.container = container
    this.itemHeight = itemHeight
    this.bufferSize = bufferSize
    this.data = []
    this.renderedItems = new Map()
    
    this.setupScrollListener()
  }
  
  setData(data) {
    this.data = data
    this.updateContainerHeight()
    this.render()
  }
  
  updateContainerHeight() {
    const totalHeight = this.data.length * this.itemHeight
    this.container.style.height = `${totalHeight}px`
  }
  
  setupScrollListener() {
    this.container.addEventListener('scroll', () => {
      this.render()
    })
  }
  
  render() {
    const scrollTop = this.container.scrollTop
    const containerHeight = this.container.clientHeight
    
    const startIndex = Math.max(0, 
      Math.floor(scrollTop / this.itemHeight) - this.bufferSize
    )
    const endIndex = Math.min(this.data.length - 1,
      Math.floor((scrollTop + containerHeight) / this.itemHeight) + this.bufferSize
    )
    
    // 기존 렌더링된 아이템 중 범위 밖의 것들 제거
    for (const [index, element] of this.renderedItems) {
      if (index < startIndex || index > endIndex) {
        element.remove()
        this.renderedItems.delete(index)
      }
    }
    
    // 새로운 아이템들 렌더링
    for (let i = startIndex; i <= endIndex; i++) {
      if (!this.renderedItems.has(i)) {
        const element = this.createItemElement(this.data[i], i)
        element.style.position = 'absolute'
        element.style.top = `${i * this.itemHeight}px`
        element.style.height = `${this.itemHeight}px`
        
        this.container.appendChild(element)
        this.renderedItems.set(i, element)
      }
    }
  }
  
  createItemElement(data, index) {
    const div = document.createElement('div')
    div.className = 'virtual-item'
    div.textContent = JSON.stringify(data)
    return div
  }
}
```

## 캐싱 전략

### 1. 다층 캐시 시스템

```javascript
class MultiLevelCache {
  constructor() {
    this.l1Cache = new Map() // 메모리 캐시 (빠름, 작음)
    this.l2Cache = new Map() // 확장 메모리 캐시 (중간, 중간)
    this.l3Cache = null      // 디스크 캐시 (느림, 큼)
    
    this.l1MaxSize = 100
    this.l2MaxSize = 1000
    
    this.setupL3Cache()
  }
  
  async setupL3Cache() {
    if ('caches' in window) {
      this.l3Cache = await caches.open('json-cache-v1')
    }
  }
  
  async get(key) {
    // L1 캐시 확인
    if (this.l1Cache.has(key)) {
      return this.l1Cache.get(key)
    }
    
    // L2 캐시 확인
    if (this.l2Cache.has(key)) {
      const value = this.l2Cache.get(key)
      this.promoteToL1(key, value)
      return value
    }
    
    // L3 캐시 확인
    if (this.l3Cache) {
      const response = await this.l3Cache.match(key)
      if (response) {
        const value = await response.json()
        this.promoteToL2(key, value)
        return value
      }
    }
    
    return null
  }
  
  async set(key, value) {
    // L1에 저장
    this.setL1(key, value)
    
    // L3에 비동기로 저장
    if (this.l3Cache) {
      const response = new Response(JSON.stringify(value))
      await this.l3Cache.put(key, response)
    }
  }
  
  setL1(key, value) {
    if (this.l1Cache.size >= this.l1MaxSize) {
      const firstKey = this.l1Cache.keys().next().value
      const firstValue = this.l1Cache.get(firstKey)
      this.l1Cache.delete(firstKey)
      this.setL2(firstKey, firstValue)
    }
    this.l1Cache.set(key, value)
  }
  
  setL2(key, value) {
    if (this.l2Cache.size >= this.l2MaxSize) {
      const firstKey = this.l2Cache.keys().next().value
      this.l2Cache.delete(firstKey)
    }
    this.l2Cache.set(key, value)
  }
  
  promoteToL1(key, value) {
    this.l2Cache.delete(key)
    this.setL1(key, value)
  }
  
  promoteToL2(key, value) {
    this.setL2(key, value)
  }
}
```

### 2. 지능형 캐시 무효화

```javascript
class SmartCache {
  constructor() {
    this.cache = new Map()
    this.dependencies = new Map() // key -> Set of dependent keys
    this.reverseDeps = new Map()  // key -> Set of keys this depends on
  }
  
  set(key, value, dependencies = []) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 0,
      dependencies: new Set(dependencies)
    })
    
    // 의존성 관계 설정
    this.dependencies.set(key, new Set(dependencies))
    dependencies.forEach(dep => {
      if (!this.reverseDeps.has(dep)) {
        this.reverseDeps.set(dep, new Set())
      }
      this.reverseDeps.get(dep).add(key)
    })
  }
  
  get(key) {
    const entry = this.cache.get(key)
    if (entry) {
      entry.accessCount++
      return entry.value
    }
    return null
  }
  
  invalidate(key) {
    // 직접 무효화
    this.cache.delete(key)
    
    // 의존하는 키들도 무효화
    const dependents = this.reverseDeps.get(key)
    if (dependents) {
      dependents.forEach(dependent => {
        this.invalidate(dependent)
      })
    }
    
    // 의존성 관계 정리
    this.cleanupDependencies(key)
  }
  
  cleanupDependencies(key) {
    const deps = this.dependencies.get(key)
    if (deps) {
      deps.forEach(dep => {
        const reverseDep = this.reverseDeps.get(dep)
        if (reverseDep) {
          reverseDep.delete(key)
          if (reverseDep.size === 0) {
            this.reverseDeps.delete(dep)
          }
        }
      })
      this.dependencies.delete(key)
    }
  }
  
  // LFU 기반 캐시 정리
  evictLeastUsed(count = 10) {
    const entries = Array.from(this.cache.entries())
      .sort(([,a], [,b]) => a.accessCount - b.accessCount)
      .slice(0, count)
    
    entries.forEach(([key]) => {
      this.cache.delete(key)
      this.cleanupDependencies(key)
    })
  }
}
```

## 병렬 처리 최적화

### 1. Web Workers 활용

```javascript
class WorkerPool {
  constructor(workerScript, poolSize = navigator.hardwareConcurrency || 4) {
    this.workerScript = workerScript
    this.poolSize = poolSize
    this.workers = []
    this.availableWorkers = []
    this.taskQueue = []
    
    this.initializeWorkers()
  }
  
  initializeWorkers() {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker(this.workerScript)
      worker.id = i
      worker.busy = false
      
      worker.onmessage = (event) => {
        this.handleWorkerMessage(worker, event)
      }
      
      this.workers.push(worker)
      this.availableWorkers.push(worker)
    }
  }
  
  async execute(data, taskType = 'process') {
    return new Promise((resolve, reject) => {
      const task = {
        data,
        taskType,
        resolve,
        reject,
        id: Date.now() + Math.random()
      }
      
      const worker = this.getAvailableWorker()
      if (worker) {
        this.assignTask(worker, task)
      } else {
        this.taskQueue.push(task)
      }
    })
  }
  
  getAvailableWorker() {
    return this.availableWorkers.pop() || null
  }
  
  assignTask(worker, task) {
    worker.busy = true
    worker.currentTask = task
    worker.postMessage({
      id: task.id,
      type: task.taskType,
      data: task.data
    })
  }
  
  handleWorkerMessage(worker, event) {
    const { id, result, error } = event.data
    const task = worker.currentTask
    
    if (task && task.id === id) {
      worker.busy = false
      worker.currentTask = null
      this.availableWorkers.push(worker)
      
      if (error) {
        task.reject(new Error(error))
      } else {
        task.resolve(result)
      }
      
      // 대기 중인 작업 처리
      if (this.taskQueue.length > 0) {
        const nextTask = this.taskQueue.shift()
        this.assignTask(worker, nextTask)
      }
    }
  }
  
  async processInParallel(dataArray, taskType = 'process') {
    const promises = dataArray.map(data => this.execute(data, taskType))
    return Promise.all(promises)
  }
  
  terminate() {
    this.workers.forEach(worker => worker.terminate())
    this.workers = []
    this.availableWorkers = []
    this.taskQueue = []
  }
}

// Worker 스크립트 예제 (json-worker.js)
/*
self.onmessage = function(event) {
  const { id, type, data } = event.data
  
  try {
    let result
    
    switch (type) {
      case 'parse':
        result = JSON.parse(data)
        break
      case 'stringify':
        result = JSON.stringify(data)
        break
      case 'validate':
        result = validateJSON(data)
        break
      default:
        throw new Error(`Unknown task type: ${type}`)
    }
    
    self.postMessage({ id, result })
  } catch (error) {
    self.postMessage({ id, error: error.message })
  }
}

function validateJSON(jsonString) {
  try {
    JSON.parse(jsonString)
    return { valid: true }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}
*/
```

### 2. 배치 처리 최적화

```javascript
class BatchProcessor {
  constructor(options = {}) {
    this.batchSize = options.batchSize || 1000
    this.maxConcurrency = options.maxConcurrency || 4
    this.delayBetweenBatches = options.delayBetweenBatches || 0
  }
  
  async processBatches(data, processingFunction) {
    const batches = this.createBatches(data)
    const results = []
    
    // 배치들을 병렬로 처리
    for (let i = 0; i < batches.length; i += this.maxConcurrency) {
      const batchGroup = batches.slice(i, i + this.maxConcurrency)
      
      const batchPromises = batchGroup.map((batch, index) => 
        this.processBatch(batch, i + index, processingFunction)
      )
      
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults.flat())
      
      // 배치 간 지연
      if (this.delayBetweenBatches > 0 && i + this.maxConcurrency < batches.length) {
        await new Promise(resolve => setTimeout(resolve, this.delayBetweenBatches))
      }
    }
    
    return results
  }
  
  createBatches(data) {
    const batches = []
    for (let i = 0; i < data.length; i += this.batchSize) {
      batches.push(data.slice(i, i + this.batchSize))
    }
    return batches
  }
  
  async processBatch(batch, batchIndex, processingFunction) {
    console.log(`Processing batch ${batchIndex + 1} (${batch.length} items)`)
    
    const startTime = performance.now()
    const results = []
    
    for (const item of batch) {
      try {
        const result = await processingFunction(item)
        results.push(result)
      } catch (error) {
        console.error('Batch processing error:', error)
        results.push(null) // 또는 오류 객체
      }
    }
    
    const duration = performance.now() - startTime
    console.log(`Batch ${batchIndex + 1} completed in ${duration.toFixed(2)}ms`)
    
    return results
  }
}
```

## 실시간 성능 모니터링

### 1. 성능 메트릭 수집

```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      parseTime: [],
      memoryUsage: [],
      renderTime: [],
      userInteractions: []
    }
    
    this.startMonitoring()
  }
  
  startMonitoring() {
    // 성능 옵저버 설정
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric(entry)
        }
      })
      
      observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] })
    }
    
    // 메모리 사용량 주기적 수집
    setInterval(() => {
      this.recordMemoryUsage()
    }, 5000)
  }
  
  recordMetric(entry) {
    switch (entry.entryType) {
      case 'measure':
        if (entry.name.startsWith('json-')) {
          this.metrics.parseTime.push({
            name: entry.name,
            duration: entry.duration,
            timestamp: entry.startTime
          })
        }
        break
      case 'paint':
        this.metrics.renderTime.push({
          name: entry.name,
          duration: entry.startTime,
          timestamp: Date.now()
        })
        break
    }
  }
  
  recordMemoryUsage() {
    if (performance.memory) {
      this.metrics.memoryUsage.push({
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        timestamp: Date.now()
      })
      
      // 오래된 데이터 정리 (최근 1시간만 유지)
      const oneHourAgo = Date.now() - 3600000
      this.metrics.memoryUsage = this.metrics.memoryUsage
        .filter(entry => entry.timestamp > oneHourAgo)
    }
  }
  
  getPerformanceReport() {
    return {
      averageParseTime: this.calculateAverage(this.metrics.parseTime, 'duration'),
      peakMemoryUsage: Math.max(...this.metrics.memoryUsage.map(m => m.used)),
      averageMemoryUsage: this.calculateAverage(this.metrics.memoryUsage, 'used'),
      renderPerformance: this.analyzeRenderPerformance(),
      recommendations: this.generateRecommendations()
    }
  }
  
  calculateAverage(array, property) {
    if (array.length === 0) return 0
    const sum = array.reduce((acc, item) => acc + item[property], 0)
    return sum / array.length
  }
  
  analyzeRenderPerformance() {
    const paintEntries = this.metrics.renderTime
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    const lcp = paintEntries.find(entry => entry.name === 'largest-contentful-paint')
    
    return {
      firstContentfulPaint: fcp?.duration || 0,
      largestContentfulPaint: lcp?.duration || 0,
      renderingScore: this.calculateRenderingScore(fcp, lcp)
    }
  }
  
  calculateRenderingScore(fcp, lcp) {
    // 간단한 점수 계산 (0-100)
    const fcpScore = fcp && fcp.duration < 1000 ? 50 : 0
    const lcpScore = lcp && lcp.duration < 2500 ? 50 : 0
    return fcpScore + lcpScore
  }
  
  generateRecommendations() {
    const recommendations = []
    const avgParseTime = this.calculateAverage(this.metrics.parseTime, 'duration')
    const avgMemory = this.calculateAverage(this.metrics.memoryUsage, 'used')
    
    if (avgParseTime > 100) {
      recommendations.push('JSON 파싱 시간이 깁니다. 스트리밍 파서 사용을 고려해보세요.')
    }
    
    if (avgMemory > 50 * 1024 * 1024) { // 50MB
      recommendations.push('메모리 사용량이 높습니다. 캐시 크기를 줄이거나 가상화를 적용해보세요.')
    }
    
    return recommendations
  }
}
```

## 다음 단계

성능 최적화의 기본을 이해했다면 다음 주제들을 학습해보세요:

- [캐싱 전략](/info/caching-strategies)
- [대용량 데이터셋 처리](/info/large-datasets)
- [오류 처리](/info/error-handling)

## 관련 도구

- [성능 분석기](/tools/performance-analyzer) - 상세한 성능 분석
- [메모리 프로파일러](/tools/memory-profiler) - 메모리 사용량 분석
- [벤치마크 도구](/tools/benchmark-tool) - 성능 비교 테스트