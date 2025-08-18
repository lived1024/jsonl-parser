# 대용량 데이터셋 처리

대용량 JSON/JSONL 데이터를 효율적으로 처리하기 위한 전략과 기법을 다룹니다. 메모리 제약과 성능 요구사항을 고려한 실용적인 접근법을 제시합니다.

## 대용량 데이터의 특징

### 크기별 분류
- **중간 규모**: 1MB - 100MB (수천 ~ 수만 레코드)
- **대용량**: 100MB - 1GB (수만 ~ 수십만 레코드)
- **초대용량**: 1GB 이상 (수십만 레코드 이상)

### 처리 시 고려사항
- 메모리 사용량 제한
- 처리 시간 최적화
- 사용자 경험 유지
- 오류 복구 능력

## 스트리밍 처리

### JSONL의 장점

JSONL은 대용량 데이터 처리에 이상적입니다:

```jsonl
{"id": 1, "name": "홍길동", "age": 30}
{"id": 2, "name": "김철수", "age": 25}
{"id": 3, "name": "이영희", "age": 28}
```

**장점:**
- 메모리 효율적 (한 줄씩 처리)
- 부분 처리 가능
- 실시간 처리 지원
- 오류 격리 (한 줄 오류가 전체에 영향 없음)

### JavaScript 스트리밍 구현

```javascript
async function processLargeJSONL(stream) {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let lineCount = 0
  
  try {
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        // 마지막 줄 처리
        if (buffer.trim()) {
          await processLine(buffer, lineCount++)
        }
        break
      }
      
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      
      // 마지막 불완전한 줄은 다음 청크와 합치기 위해 보관
      buffer = lines.pop() || ''
      
      // 완전한 줄들 처리
      for (const line of lines) {
        if (line.trim()) {
          await processLine(line, lineCount++)
          
          // 주기적으로 UI 업데이트
          if (lineCount % 1000 === 0) {
            updateProgress(lineCount)
            await new Promise(resolve => setTimeout(resolve, 0)) // 이벤트 루프 양보
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

async function processLine(line, lineNumber) {
  try {
    const data = JSON.parse(line)
    // 데이터 처리 로직
    await processRecord(data, lineNumber)
  } catch (error) {
    console.error(`Line ${lineNumber} parsing error:`, error.message)
    // 오류 로깅 및 계속 진행
  }
}
```

### Node.js 스트리밍 구현

```javascript
const fs = require('fs')
const readline = require('readline')

async function processLargeFile(filePath) {
  const fileStream = fs.createReadStream(filePath)
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity // Windows 줄바꿈 처리
  })
  
  let lineNumber = 0
  const batchSize = 1000
  let batch = []
  
  for await (const line of rl) {
    lineNumber++
    
    try {
      const data = JSON.parse(line)
      batch.push(data)
      
      // 배치 단위로 처리
      if (batch.length >= batchSize) {
        await processBatch(batch, lineNumber - batchSize + 1)
        batch = []
      }
      
    } catch (error) {
      console.error(`Line ${lineNumber} error:`, error.message)
    }
  }
  
  // 마지막 배치 처리
  if (batch.length > 0) {
    await processBatch(batch, lineNumber - batch.length + 1)
  }
}

async function processBatch(records, startLineNumber) {
  console.log(`Processing batch starting at line ${startLineNumber}`)
  
  // 병렬 처리
  const promises = records.map((record, index) => 
    processRecord(record, startLineNumber + index)
  )
  
  await Promise.all(promises)
}
```

## 메모리 최적화

### 1. 청크 단위 처리

```javascript
class ChunkedProcessor {
  constructor(chunkSize = 10000) {
    this.chunkSize = chunkSize
    this.processedCount = 0
  }
  
  async processInChunks(data) {
    for (let i = 0; i < data.length; i += this.chunkSize) {
      const chunk = data.slice(i, i + this.chunkSize)
      await this.processChunk(chunk, i)
      
      // 메모리 정리를 위한 가비지 컬렉션 힌트
      if (global.gc) {
        global.gc()
      }
      
      // 진행률 업데이트
      this.processedCount += chunk.length
      this.updateProgress()
    }
  }
  
  async processChunk(chunk, startIndex) {
    const promises = chunk.map((item, index) => 
      this.processItem(item, startIndex + index)
    )
    
    await Promise.all(promises)
  }
  
  updateProgress() {
    const progress = (this.processedCount / this.totalCount) * 100
    console.log(`Progress: ${progress.toFixed(1)}%`)
  }
}
```

### 2. 메모리 사용량 모니터링

```javascript
class MemoryMonitor {
  constructor(maxMemoryMB = 500) {
    this.maxMemory = maxMemoryMB * 1024 * 1024 // bytes
    this.checkInterval = 1000 // 1초마다 체크
  }
  
  startMonitoring() {
    this.intervalId = setInterval(() => {
      const usage = process.memoryUsage()
      const usedMB = usage.heapUsed / 1024 / 1024
      
      console.log(`Memory usage: ${usedMB.toFixed(1)}MB`)
      
      if (usage.heapUsed > this.maxMemory) {
        console.warn('Memory limit exceeded, triggering cleanup')
        this.triggerCleanup()
      }
    }, this.checkInterval)
  }
  
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  }
  
  triggerCleanup() {
    // 캐시 정리
    this.clearCaches()
    
    // 가비지 컬렉션 강제 실행
    if (global.gc) {
      global.gc()
    }
  }
}
```

### 3. 지연 로딩 (Lazy Loading)

```javascript
class LazyDataLoader {
  constructor(dataSource) {
    this.dataSource = dataSource
    this.cache = new Map()
    this.maxCacheSize = 1000
  }
  
  async getData(id) {
    // 캐시에서 먼저 확인
    if (this.cache.has(id)) {
      return this.cache.get(id)
    }
    
    // 데이터 로드
    const data = await this.loadData(id)
    
    // 캐시 크기 관리 (LRU)
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    
    this.cache.set(id, data)
    return data
  }
  
  async loadData(id) {
    // 실제 데이터 로딩 로직
    return await this.dataSource.load(id)
  }
}
```

## 성능 최적화

### 1. 인덱싱

```javascript
class DataIndex {
  constructor() {
    this.indexes = new Map()
  }
  
  // 인덱스 생성
  createIndex(data, keyField) {
    const index = new Map()
    
    data.forEach((item, position) => {
      const key = item[keyField]
      if (!index.has(key)) {
        index.set(key, [])
      }
      index.get(key).push({ item, position })
    })
    
    this.indexes.set(keyField, index)
    return index
  }
  
  // 빠른 검색
  findByKey(keyField, value) {
    const index = this.indexes.get(keyField)
    if (!index) {
      throw new Error(`Index for ${keyField} not found`)
    }
    
    return index.get(value) || []
  }
  
  // 범위 검색 (숫자 필드용)
  findByRange(keyField, min, max) {
    const index = this.indexes.get(keyField)
    if (!index) {
      throw new Error(`Index for ${keyField} not found`)
    }
    
    const results = []
    for (const [key, items] of index) {
      if (key >= min && key <= max) {
        results.push(...items)
      }
    }
    
    return results
  }
}
```

### 2. 병렬 처리

```javascript
class ParallelProcessor {
  constructor(workerCount = navigator.hardwareConcurrency || 4) {
    this.workerCount = workerCount
    this.workers = []
  }
  
  async processInParallel(data, processingFunction) {
    const chunkSize = Math.ceil(data.length / this.workerCount)
    const chunks = []
    
    // 데이터를 워커 수만큼 분할
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize))
    }
    
    // 각 청크를 병렬로 처리
    const promises = chunks.map((chunk, index) => 
      this.processChunk(chunk, processingFunction, index)
    )
    
    const results = await Promise.all(promises)
    
    // 결과 병합
    return results.flat()
  }
  
  async processChunk(chunk, processingFunction, workerId) {
    console.log(`Worker ${workerId} processing ${chunk.length} items`)
    
    const results = []
    for (const item of chunk) {
      const result = await processingFunction(item)
      results.push(result)
    }
    
    return results
  }
}
```

### 3. 캐싱 전략

```javascript
class LRUCache {
  constructor(maxSize = 1000) {
    this.maxSize = maxSize
    this.cache = new Map()
  }
  
  get(key) {
    if (this.cache.has(key)) {
      // 최근 사용으로 이동
      const value = this.cache.get(key)
      this.cache.delete(key)
      this.cache.set(key, value)
      return value
    }
    return null
  }
  
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // 가장 오래된 항목 제거
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    
    this.cache.set(key, value)
  }
  
  clear() {
    this.cache.clear()
  }
  
  size() {
    return this.cache.size
  }
}
```

## 진행률 표시 및 사용자 경험

### 1. 진행률 추적

```javascript
class ProgressTracker {
  constructor(total, onUpdate) {
    this.total = total
    this.processed = 0
    this.startTime = Date.now()
    this.onUpdate = onUpdate
  }
  
  update(increment = 1) {
    this.processed += increment
    const progress = (this.processed / this.total) * 100
    const elapsed = Date.now() - this.startTime
    const rate = this.processed / (elapsed / 1000) // items per second
    const eta = (this.total - this.processed) / rate // seconds
    
    this.onUpdate({
      progress: Math.min(progress, 100),
      processed: this.processed,
      total: this.total,
      rate: Math.round(rate),
      eta: Math.round(eta),
      elapsed: Math.round(elapsed / 1000)
    })
  }
  
  complete() {
    const elapsed = Date.now() - this.startTime
    this.onUpdate({
      progress: 100,
      processed: this.total,
      total: this.total,
      rate: Math.round(this.total / (elapsed / 1000)),
      eta: 0,
      elapsed: Math.round(elapsed / 1000),
      completed: true
    })
  }
}

// 사용 예제
const tracker = new ProgressTracker(totalItems, (stats) => {
  console.log(`Progress: ${stats.progress.toFixed(1)}% (${stats.processed}/${stats.total})`)
  console.log(`Rate: ${stats.rate} items/sec, ETA: ${stats.eta}s`)
})
```

### 2. 취소 가능한 처리

```javascript
class CancellableProcessor {
  constructor() {
    this.cancelled = false
    this.abortController = new AbortController()
  }
  
  cancel() {
    this.cancelled = true
    this.abortController.abort()
  }
  
  async process(data, processingFunction) {
    this.cancelled = false
    
    try {
      for (let i = 0; i < data.length; i++) {
        if (this.cancelled) {
          throw new Error('Processing cancelled by user')
        }
        
        await processingFunction(data[i], i)
        
        // 주기적으로 취소 확인
        if (i % 100 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0))
        }
      }
    } catch (error) {
      if (error.name === 'AbortError' || this.cancelled) {
        console.log('Processing cancelled')
        return { cancelled: true, processed: i }
      }
      throw error
    }
    
    return { completed: true, processed: data.length }
  }
}
```

## 오류 처리 및 복구

### 1. 부분 오류 처리

```javascript
class RobustProcessor {
  constructor() {
    this.errors = []
    this.successCount = 0
    this.errorCount = 0
  }
  
  async processWithErrorHandling(data) {
    const results = []
    
    for (let i = 0; i < data.length; i++) {
      try {
        const result = await this.processItem(data[i], i)
        results.push({ success: true, data: result, index: i })
        this.successCount++
      } catch (error) {
        const errorInfo = {
          success: false,
          error: error.message,
          index: i,
          data: data[i]
        }
        results.push(errorInfo)
        this.errors.push(errorInfo)
        this.errorCount++
        
        console.warn(`Error processing item ${i}:`, error.message)
      }
    }
    
    return {
      results,
      summary: {
        total: data.length,
        success: this.successCount,
        errors: this.errorCount,
        errorRate: (this.errorCount / data.length) * 100
      }
    }
  }
  
  getErrorReport() {
    return {
      totalErrors: this.errors.length,
      errors: this.errors,
      commonErrors: this.analyzeErrors()
    }
  }
  
  analyzeErrors() {
    const errorCounts = {}
    this.errors.forEach(error => {
      const message = error.error
      errorCounts[message] = (errorCounts[message] || 0) + 1
    })
    
    return Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5) // 상위 5개 오류
  }
}
```

### 2. 체크포인트 및 재시작

```javascript
class CheckpointProcessor {
  constructor(checkpointInterval = 1000) {
    this.checkpointInterval = checkpointInterval
    this.lastCheckpoint = 0
  }
  
  async processWithCheckpoints(data, processingFunction) {
    let startIndex = this.loadCheckpoint()
    
    for (let i = startIndex; i < data.length; i++) {
      await processingFunction(data[i], i)
      
      // 체크포인트 저장
      if (i - this.lastCheckpoint >= this.checkpointInterval) {
        this.saveCheckpoint(i)
        this.lastCheckpoint = i
      }
    }
    
    this.clearCheckpoint()
  }
  
  saveCheckpoint(index) {
    localStorage.setItem('processing_checkpoint', index.toString())
  }
  
  loadCheckpoint() {
    const checkpoint = localStorage.getItem('processing_checkpoint')
    return checkpoint ? parseInt(checkpoint) : 0
  }
  
  clearCheckpoint() {
    localStorage.removeItem('processing_checkpoint')
  }
}
```

## 실제 사용 예제

### 대용량 CSV 변환

```javascript
async function convertLargeJSONLToCSV(jsonlStream) {
  const csvWriter = new CSVWriter()
  let headers = null
  let rowCount = 0
  
  await processLargeJSONL(jsonlStream, async (line, lineNumber) => {
    const data = JSON.parse(line)
    
    // 첫 번째 레코드에서 헤더 추출
    if (!headers) {
      headers = Object.keys(data)
      csvWriter.writeHeaders(headers)
    }
    
    // CSV 행 작성
    const row = headers.map(header => data[header] || '')
    csvWriter.writeRow(row)
    
    rowCount++
    
    // 진행률 업데이트
    if (rowCount % 1000 === 0) {
      console.log(`Converted ${rowCount} rows`)
    }
  })
  
  console.log(`Conversion complete: ${rowCount} rows`)
  return csvWriter.getResult()
}
```

### 데이터 검증 및 정리

```javascript
async function validateAndCleanData(data) {
  const validator = new DataValidator()
  const cleaner = new DataCleaner()
  const results = {
    valid: [],
    invalid: [],
    cleaned: []
  }
  
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    
    // 검증
    const validation = validator.validate(item)
    if (validation.isValid) {
      results.valid.push(item)
    } else {
      results.invalid.push({
        item,
        errors: validation.errors,
        index: i
      })
      continue
    }
    
    // 데이터 정리
    const cleaned = cleaner.clean(item)
    results.cleaned.push(cleaned)
    
    // 메모리 관리
    if (i % 10000 === 0) {
      console.log(`Processed ${i}/${data.length} items`)
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }
  
  return results
}
```

## 다음 단계

대용량 데이터셋 처리의 기본을 이해했다면 다음 주제들을 학습해보세요:

- [데이터 변환 기법](/info/data-transformation)
- [성능 최적화 팁](/info/optimization-tips)
- [캐싱 전략](/info/caching-strategies)

## 관련 도구

- [스트리밍 파서](/tools/streaming-parser) - 대용량 파일 스트리밍 처리
- [배치 프로세서](/tools/batch-processor) - 배치 단위 데이터 처리
- [성능 모니터](/tools/performance-monitor) - 처리 성능 모니터링