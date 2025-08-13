<template>
  <div class="performance-guide">
    <div class="guide-header">
      <h2>JSON 성능 최적화 가이드</h2>
      <p>JSON 처리 성능을 향상시키는 모범 사례와 최적화 기법</p>
    </div>
    
    <div class="guide-content">
      <!-- 광고 배치 -->
      <div class="ad-section">
        <SafeAdContainer 
          ad-slot="content-rectangle"
          ad-format="rectangle"
          class-name="guide-ad"
        />
      </div>

      <!-- 성능 측정 도구 섹션 -->
      <div class="performance-tools-section">
        <div class="section-header">
          <Gauge :size="24" />
          <h3>성능 측정 도구</h3>
        </div>
        
        <div class="tools-grid">
          <div class="tool-card">
            <div class="tool-header">
              <Timer :size="20" />
              <h4>파싱 속도 측정</h4>
            </div>
            <p>JSON 파싱 시간을 정확히 측정하여 최적화 효과를 확인하세요.</p>
            <div class="tool-demo">
              <textarea 
                v-model="testJson"
                placeholder="테스트할 JSON 데이터를 입력하세요..."
                class="json-input"
                rows="4"
              ></textarea>
              <div class="tool-controls">
                <button @click="measureParsingSpeed" class="measure-btn" :disabled="!testJson.trim()">
                  <Play :size="16" />
                  측정 시작
                </button>
                <button @click="clearResults" class="clear-btn">
                  <X :size="16" />
                  결과 지우기
                </button>
              </div>
              <div v-if="parsingResults.length > 0" class="results">
                <h5>측정 결과:</h5>
                <div class="results-list">
                  <div 
                    v-for="(result, index) in parsingResults" 
                    :key="index"
                    class="result-item"
                  >
                    <div class="result-info">
                      <span class="result-label">시도 {{ index + 1 }}:</span>
                      <span class="result-time">{{ result.time }}ms</span>
                      <span class="result-size">{{ result.size }} 문자</span>
                    </div>
                    <div v-if="result.error" class="result-error">
                      오류: {{ result.error }}
                    </div>
                  </div>
                </div>
                <div class="results-summary">
                  <div class="summary-item">
                    <span>평균 시간:</span>
                    <span class="summary-value">{{ averageTime }}ms</span>
                  </div>
                  <div class="summary-item">
                    <span>처리 속도:</span>
                    <span class="summary-value">{{ processingSpeed }} 문자/ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="tool-card">
            <div class="tool-header">
              <BarChart :size="20" />
              <h4>메모리 사용량 모니터</h4>
            </div>
            <p>JSON 처리 시 메모리 사용량을 모니터링하여 최적화 포인트를 찾으세요.</p>
            <div class="tool-demo">
              <div class="memory-info">
                <div class="memory-item">
                  <span>현재 힙 사용량:</span>
                  <span class="memory-value">{{ formatBytes(memoryInfo.usedJSHeapSize) }}</span>
                </div>
                <div class="memory-item">
                  <span>총 힙 크기:</span>
                  <span class="memory-value">{{ formatBytes(memoryInfo.totalJSHeapSize) }}</span>
                </div>
                <div class="memory-item">
                  <span>힙 사용률:</span>
                  <span class="memory-value">{{ memoryUsagePercent }}%</span>
                </div>
              </div>
              <div class="memory-chart">
                <div class="chart-bar">
                  <div 
                    class="chart-fill"
                    :style="{ width: memoryUsagePercent + '%' }"
                  ></div>
                </div>
              </div>
              <button @click="startMemoryMonitoring" class="monitor-btn" :disabled="isMonitoring">
                <Activity :size="16" />
                {{ isMonitoring ? '모니터링 중...' : '모니터링 시작' }}
              </button>
            </div>
          </div>

          <div class="tool-card">
            <div class="tool-header">
              <Zap :size="20" />
              <h4>성능 프로파일러</h4>
            </div>
            <p>다양한 JSON 처리 방식의 성능을 비교 분석하세요.</p>
            <div class="tool-demo">
              <div class="profiler-options">
                <label class="option-label">
                  <input 
                    type="checkbox" 
                    v-model="profilerOptions.includeStringify"
                  />
                  JSON.stringify 포함
                </label>
                <label class="option-label">
                  <input 
                    type="checkbox" 
                    v-model="profilerOptions.includeDeepCopy"
                  />
                  깊은 복사 테스트
                </label>
                <label class="option-label">
                  <input 
                    type="checkbox" 
                    v-model="profilerOptions.includeTraversal"
                  />
                  트리 순회 테스트
                </label>
              </div>
              <button @click="runProfiler" class="profile-btn" :disabled="!testJson.trim()">
                <Cpu :size="16" />
                프로파일 실행
              </button>
              <div v-if="profilerResults.length > 0" class="profiler-results">
                <h5>프로파일링 결과:</h5>
                <div class="profile-list">
                  <div 
                    v-for="result in profilerResults" 
                    :key="result.operation"
                    class="profile-item"
                  >
                    <span class="profile-operation">{{ result.operation }}</span>
                    <span class="profile-time">{{ result.time }}ms</span>
                    <div class="profile-bar">
                      <div 
                        class="profile-fill"
                        :style="{ width: (result.time / maxProfileTime * 100) + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 성능 가이드 섹션들 -->
      <div class="sections-list">
        <div 
          v-for="section in sections" 
          :key="section.id"
          class="guide-section"
        >
          <div class="section-header">
            <component :is="section.icon" :size="24" />
            <h3>{{ section.title }}</h3>
          </div>
          
          <div class="section-content">
            <p class="section-description">{{ section.description }}</p>
            
            <div class="tips-list">
              <div 
                v-for="tip in section.tips" 
                :key="tip.id"
                class="tip-item"
              >
                <div class="tip-header">
                  <CheckCircle :size="20" class="tip-icon" />
                  <h4>{{ tip.title }}</h4>
                </div>
                
                <p class="tip-description">{{ tip.description }}</p>
                
                <div v-if="tip.example" class="tip-example">
                  <div class="example-tabs">
                    <button 
                      :class="{ active: tip.activeTab === 'bad' }"
                      @click="tip.activeTab = 'bad'"
                      class="tab-button bad"
                    >
                      비효율적
                    </button>
                    <button 
                      :class="{ active: tip.activeTab === 'good' }"
                      @click="tip.activeTab = 'good'"
                      class="tab-button good"
                    >
                      효율적
                    </button>
                  </div>
                  
                  <div class="example-content">
                    <pre v-if="tip.activeTab === 'bad'" class="bad-example"><code>{{ tip.example.bad }}</code></pre>
                    <pre v-else class="good-example"><code>{{ tip.example.good }}</code></pre>
                  </div>
                </div>
                
                <div v-if="tip.metrics" class="performance-metrics">
                  <h5>성능 개선 효과:</h5>
                  <div class="metrics-grid">
                    <div 
                      v-for="metric in tip.metrics" 
                      :key="metric.name"
                      class="metric-item"
                    >
                      <div class="metric-name">{{ metric.name }}</div>
                      <div class="metric-value" :class="metric.type">{{ metric.value }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  Zap, Database, Code, Network, CheckCircle, Gauge, Timer, 
  BarChart, Activity, Play, X, Cpu
} from 'lucide-vue-next'
import SafeAdContainer from '../tools/SafeAdContainer.vue'

interface PerformanceMetric {
  name: string
  value: string
  type: 'improvement' | 'reduction' | 'neutral'
}

interface PerformanceTip {
  id: string
  title: string
  description: string
  example?: {
    bad: string
    good: string
  }
  metrics?: PerformanceMetric[]
  activeTab: 'bad' | 'good'
}

interface GuideSection {
  id: string
  title: string
  description: string
  icon: any
  tips: PerformanceTip[]
}

interface ParsingResult {
  time: number
  size: number
  error?: string
}

interface ProfilerResult {
  operation: string
  time: number
}

interface MemoryInfo {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

// 성능 측정 도구 상태
const testJson = ref('')
const parsingResults = ref<ParsingResult[]>([])
const memoryInfo = ref<MemoryInfo>({
  usedJSHeapSize: 0,
  totalJSHeapSize: 0,
  jsHeapSizeLimit: 0
})
const isMonitoring = ref(false)
const monitoringInterval = ref<number | null>(null)
const profilerOptions = ref({
  includeStringify: true,
  includeDeepCopy: true,
  includeTraversal: true
})
const profilerResults = ref<ProfilerResult[]>([])

// 계산된 속성
const averageTime = computed(() => {
  if (parsingResults.value.length === 0) return 0
  const validResults = parsingResults.value.filter(r => !r.error)
  if (validResults.length === 0) return 0
  const total = validResults.reduce((sum, r) => sum + r.time, 0)
  return Math.round(total / validResults.length * 100) / 100
})

const processingSpeed = computed(() => {
  if (parsingResults.value.length === 0) return 0
  const validResults = parsingResults.value.filter(r => !r.error)
  if (validResults.length === 0) return 0
  const totalChars = validResults.reduce((sum, r) => sum + r.size, 0)
  const totalTime = validResults.reduce((sum, r) => sum + r.time, 0)
  return Math.round(totalChars / totalTime * 100) / 100
})

const memoryUsagePercent = computed(() => {
  if (memoryInfo.value.totalJSHeapSize === 0) return 0
  return Math.round(
    (memoryInfo.value.usedJSHeapSize / memoryInfo.value.totalJSHeapSize) * 100
  )
})

const maxProfileTime = computed(() => {
  if (profilerResults.value.length === 0) return 1
  return Math.max(...profilerResults.value.map(r => r.time))
})

// 성능 측정 메서드
const measureParsingSpeed = () => {
  const jsonString = testJson.value.trim()
  if (!jsonString) return

  try {
    const startTime = performance.now()
    JSON.parse(jsonString)
    const endTime = performance.now()
    
    parsingResults.value.push({
      time: Math.round((endTime - startTime) * 100) / 100,
      size: jsonString.length
    })
  } catch (error) {
    parsingResults.value.push({
      time: 0,
      size: jsonString.length,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

const clearResults = () => {
  parsingResults.value = []
  profilerResults.value = []
}

const updateMemoryInfo = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    memoryInfo.value = {
      usedJSHeapSize: memory.usedJSHeapSize || 0,
      totalJSHeapSize: memory.totalJSHeapSize || 0,
      jsHeapSizeLimit: memory.jsHeapSizeLimit || 0
    }
  }
}

const startMemoryMonitoring = () => {
  if (isMonitoring.value) return
  
  isMonitoring.value = true
  updateMemoryInfo()
  
  monitoringInterval.value = window.setInterval(() => {
    updateMemoryInfo()
  }, 1000)
  
  setTimeout(() => {
    if (monitoringInterval.value) {
      clearInterval(monitoringInterval.value)
      monitoringInterval.value = null
    }
    isMonitoring.value = false
  }, 10000) // 10초 후 자동 중지
}

const runProfiler = () => {
  const jsonString = testJson.value.trim()
  if (!jsonString) return

  profilerResults.value = []
  let parsedData: any

  try {
    // JSON 파싱 테스트
    const parseStart = performance.now()
    parsedData = JSON.parse(jsonString)
    const parseEnd = performance.now()
    
    profilerResults.value.push({
      operation: 'JSON.parse',
      time: Math.round((parseEnd - parseStart) * 100) / 100
    })

    // JSON.stringify 테스트
    if (profilerOptions.value.includeStringify) {
      const stringifyStart = performance.now()
      JSON.stringify(parsedData)
      const stringifyEnd = performance.now()
      
      profilerResults.value.push({
        operation: 'JSON.stringify',
        time: Math.round((stringifyEnd - stringifyStart) * 100) / 100
      })
    }

    // 깊은 복사 테스트
    if (profilerOptions.value.includeDeepCopy) {
      const deepCopyStart = performance.now()
      JSON.parse(JSON.stringify(parsedData))
      const deepCopyEnd = performance.now()
      
      profilerResults.value.push({
        operation: '깊은 복사',
        time: Math.round((deepCopyEnd - deepCopyStart) * 100) / 100
      })
    }

    // 트리 순회 테스트
    if (profilerOptions.value.includeTraversal) {
      const traversalStart = performance.now()
      traverseObject(parsedData)
      const traversalEnd = performance.now()
      
      profilerResults.value.push({
        operation: '트리 순회',
        time: Math.round((traversalEnd - traversalStart) * 100) / 100
      })
    }
  } catch (error) {
    console.error('프로파일링 중 오류:', error)
  }
}

const traverseObject = (obj: any): void => {
  if (obj === null || typeof obj !== 'object') return
  
  if (Array.isArray(obj)) {
    obj.forEach(item => traverseObject(item))
  } else {
    Object.values(obj).forEach(value => traverseObject(value))
  }
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 라이프사이클 훅
onMounted(() => {
  updateMemoryInfo()
  // 샘플 JSON 데이터 설정
  testJson.value = `{
  "users": [
    {"id": 1, "name": "John", "email": "john@example.com"},
    {"id": 2, "name": "Jane", "email": "jane@example.com"}
  ],
  "metadata": {
    "total": 2,
    "page": 1
  }
}`
})

onUnmounted(() => {
  if (monitoringInterval.value) {
    clearInterval(monitoringInterval.value)
  }
})

// 성능 가이드 데이터
const sections = ref<GuideSection[]>([
  {
    id: 'parsing',
    title: '파싱 최적화',
    description: 'JSON 파싱 성능을 향상시키는 방법들',
    icon: Code,
    tips: [
      {
        id: 'streaming',
        title: '스트리밍 파싱 사용',
        description: '큰 JSON 파일의 경우 전체를 메모리에 로드하지 말고 스트리밍 방식으로 처리하세요.',
        activeTab: 'bad',
        example: {
          bad: '// 전체 파일을 메모리에 로드\nconst data = JSON.parse(await fs.readFile("large.json", "utf8"));',
          good: '// 스트리밍 파서 사용\nconst parser = new StreamingJsonParser();\nparser.on("object", (obj) => processObject(obj));'
        },
        metrics: [
          { name: '메모리 사용량', value: '-70%', type: 'reduction' },
          { name: '초기 응답 시간', value: '-85%', type: 'reduction' }
        ]
      },
      {
        id: 'lazy-parsing',
        title: '지연 파싱 적용',
        description: '필요한 부분만 파싱하여 초기 로딩 시간을 단축하세요.',
        activeTab: 'bad',
        example: {
          bad: '// 전체 객체 파싱\nconst fullData = JSON.parse(jsonString);\nconst name = fullData.user.profile.name;',
          good: '// 필요한 경로만 파싱\nconst name = JSONPath.query(jsonString, "$.user.profile.name")[0];'
        },
        metrics: [
          { name: '파싱 시간', value: '-60%', type: 'reduction' },
          { name: 'CPU 사용량', value: '-45%', type: 'reduction' }
        ]
      }
    ]
  },
  {
    id: 'structure',
    title: '데이터 구조 최적화',
    description: 'JSON 데이터 구조를 효율적으로 설계하는 방법',
    icon: Database,
    tips: [
      {
        id: 'flat-structure',
        title: '평면적 구조 선호',
        description: '깊게 중첩된 구조보다는 평면적인 구조를 사용하여 접근 성능을 향상시키세요.',
        activeTab: 'bad',
        example: {
          bad: '{\n  "user": {\n    "profile": {\n      "personal": {\n        "name": "John"\n      }\n    }\n  }\n}',
          good: '{\n  "userId": "123",\n  "userName": "John",\n  "userProfile": {...}\n}'
        },
        metrics: [
          { name: '접근 속도', value: '+40%', type: 'improvement' },
          { name: '파싱 복잡도', value: '-30%', type: 'reduction' }
        ]
      },
      {
        id: 'array-optimization',
        title: '배열 최적화',
        description: '큰 배열의 경우 페이지네이션을 적용하고 인덱스를 활용하세요.',
        activeTab: 'bad',
        example: {
          bad: '{\n  "items": [/* 10000개 아이템 */]\n}',
          good: '{\n  "items": [/* 50개 아이템 */],\n  "pagination": {\n    "page": 1,\n    "total": 10000\n  }\n}'
        },
        metrics: [
          { name: '초기 로딩', value: '-90%', type: 'reduction' },
          { name: '메모리 효율', value: '+80%', type: 'improvement' }
        ]
      },
      {
        id: 'memory-management',
        title: '메모리 관리',
        description: '대용량 JSON 처리 시 메모리 사용량을 효율적으로 관리하세요.',
        activeTab: 'bad',
        example: {
          bad: '// 전체 데이터를 메모리에 보관\nconst allData = [];\nfor (let item of largeDataset) {\n  allData.push(processItem(item));\n}',
          good: '// 스트림 처리로 메모리 절약\nfor (let item of largeDataset) {\n  const processed = processItem(item);\n  yield processed; // 즉시 처리 후 해제\n}'
        },
        metrics: [
          { name: '메모리 사용량', value: '-80%', type: 'reduction' },
          { name: 'GC 압박', value: '-65%', type: 'reduction' }
        ]
      }
    ]
  },
  {
    id: 'rendering',
    title: '렌더링 최적화',
    description: 'JSON 데이터를 UI에 효율적으로 렌더링하는 방법',
    icon: Zap,
    tips: [
      {
        id: 'virtual-scrolling',
        title: '가상 스크롤링 적용',
        description: '대량의 JSON 배열 데이터를 표시할 때 가상 스크롤링을 사용하세요.',
        activeTab: 'bad',
        example: {
          bad: '// 모든 아이템을 DOM에 렌더링\n<div v-for="item in allItems" :key="item.id">\n  {{ item.name }}\n</div>',
          good: '// 가상 스크롤링으로 보이는 부분만 렌더링\n<VirtualList\n  :items="allItems"\n  :item-height="50"\n  :visible-count="10"\n/>'
        },
        metrics: [
          { name: 'DOM 노드 수', value: '-90%', type: 'reduction' },
          { name: '렌더링 시간', value: '-85%', type: 'reduction' }
        ]
      },
      {
        id: 'lazy-rendering',
        title: '지연 렌더링',
        description: '복잡한 JSON 구조는 필요할 때만 렌더링하여 초기 로딩을 빠르게 하세요.',
        activeTab: 'bad',
        example: {
          bad: '// 모든 중첩 구조를 즉시 렌더링\n<TreeNode\n  v-for="node in allNodes"\n  :node="node"\n  :expanded="true"\n/>',
          good: '// 필요시에만 렌더링\n<TreeNode\n  v-for="node in visibleNodes"\n  :node="node"\n  :lazy="true"\n  @expand="loadChildren"\n/>'
        },
        metrics: [
          { name: '초기 렌더링', value: '-70%', type: 'reduction' },
          { name: '메모리 사용량', value: '-50%', type: 'reduction' }
        ]
      }
    ]
  },
  {
    id: 'network',
    title: '네트워크 최적화',
    description: 'JSON 데이터 전송 최적화 기법',
    icon: Network,
    tips: [
      {
        id: 'compression',
        title: 'GZIP 압축 활용',
        description: 'JSON 데이터를 GZIP으로 압축하여 전송 크기를 줄이세요.',
        activeTab: 'bad',
        example: {
          bad: '// 압축 없이 전송\nfetch("/api/data.json")',
          good: '// GZIP 압축 요청\nfetch("/api/data.json", {\n  headers: {\n    "Accept-Encoding": "gzip"\n  }\n})'
        },
        metrics: [
          { name: '전송 크기', value: '-75%', type: 'reduction' },
          { name: '로딩 시간', value: '-60%', type: 'reduction' }
        ]
      },
      {
        id: 'caching',
        title: '적절한 캐싱 전략',
        description: '변경이 적은 데이터는 캐싱을 활용하여 반복 요청을 줄이세요.',
        activeTab: 'bad',
        example: {
          bad: '// 매번 새로 요청\nconst data = await fetch("/api/config.json");',
          good: '// 캐시 활용\nconst data = await fetchWithCache("/api/config.json", {\n  maxAge: 3600000 // 1시간\n});'
        },
        metrics: [
          { name: '응답 시간', value: '-95%', type: 'reduction' },
          { name: '서버 부하', value: '-80%', type: 'reduction' }
        ]
      },
      {
        id: 'chunking',
        title: '데이터 청킹',
        description: '대용량 JSON 데이터는 작은 청크로 나누어 전송하세요.',
        activeTab: 'bad',
        example: {
          bad: '// 전체 데이터를 한 번에 전송\nfetch("/api/all-data.json")',
          good: '// 청크 단위로 분할 전송\nfor (let page = 1; page <= totalPages; page++) {\n  const chunk = await fetch(`/api/data?page=${page}&size=100`);\n  processChunk(chunk);\n}'
        },
        metrics: [
          { name: '초기 응답 시간', value: '-80%', type: 'reduction' },
          { name: '메모리 효율성', value: '+60%', type: 'improvement' }
        ]
      }
    ]
  },
  {
    id: 'advanced',
    title: '고급 최적화 기법',
    description: '전문적인 JSON 성능 최적화 방법',
    icon: Cpu,
    tips: [
      {
        id: 'worker-threads',
        title: 'Web Worker 활용',
        description: '무거운 JSON 처리 작업을 Web Worker로 분리하여 UI 블로킹을 방지하세요.',
        activeTab: 'bad',
        example: {
          bad: '// 메인 스레드에서 처리\nconst result = processLargeJson(data);\nsetResult(result);',
          good: '// Web Worker에서 처리\nconst worker = new Worker("json-processor.js");\nworker.postMessage(data);\nworker.onmessage = (e) => setResult(e.data);'
        },
        metrics: [
          { name: 'UI 응답성', value: '+95%', type: 'improvement' },
          { name: '사용자 경험', value: '+80%', type: 'improvement' }
        ]
      },
      {
        id: 'schema-validation',
        title: '스키마 기반 최적화',
        description: 'JSON 스키마를 활용하여 불필요한 검증과 처리를 줄이세요.',
        activeTab: 'bad',
        example: {
          bad: '// 런타임에 모든 필드 검증\nif (data.user && data.user.profile && data.user.profile.name) {\n  processName(data.user.profile.name);\n}',
          good: '// 스키마 검증 후 안전한 접근\nif (isValidSchema(data)) {\n  processName(data.user.profile.name); // 타입 안전\n}'
        },
        metrics: [
          { name: '검증 시간', value: '-40%', type: 'reduction' },
          { name: '런타임 오류', value: '-90%', type: 'reduction' }
        ]
      }
    ]
  }
])
</script>

<style scoped>
.performance-guide {
  max-width: 1000px;
  margin: 0 auto;
}

.guide-header {
  text-align: center;
  margin-bottom: 2rem;
}

.guide-header h2 {
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.guide-header p {
  color: var(--color-text-secondary);
}

.ad-section {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

.sections-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.guide-section {
  background: var(--color-background-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--color-border);
}

.section-header h3 {
  color: var(--color-text-primary);
  margin: 0;
}

.section-header svg {
  color: var(--color-primary);
}

.section-description {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tip-item {
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 1rem;
}

.tip-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.tip-icon {
  color: var(--color-success);
}

.tip-header h4 {
  color: var(--color-text-primary);
  margin: 0;
  font-size: 1rem;
}

.tip-description {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.tip-example {
  margin-bottom: 1rem;
}

.example-tabs {
  display: flex;
  margin-bottom: 0.5rem;
}

.tab-button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  background: var(--color-background-primary);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.tab-button:first-child {
  border-radius: 4px 0 0 4px;
}

.tab-button:last-child {
  border-radius: 0 4px 4px 0;
  border-left: none;
}

.tab-button.active.bad {
  background: #fff5f5;
  color: #c53030;
  border-color: #fed7d7;
}

.tab-button.active.good {
  background: #f0fff4;
  color: #2f855a;
  border-color: #9ae6b4;
}

.example-content {
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.bad-example {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  color: #c53030;
  margin: 0;
  padding: 1rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
}

.good-example {
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  color: #2f855a;
  margin: 0;
  padding: 1rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
}

.performance-metrics {
  background: var(--color-background-primary);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 1rem;
}

.performance-metrics h5 {
  color: var(--color-text-primary);
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: var(--color-background-secondary);
  border-radius: 4px;
}

.metric-name {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.metric-value {
  font-weight: 600;
  font-size: 0.9rem;
}

.metric-value.improvement {
  color: var(--color-success);
}

.metric-value.reduction {
  color: var(--color-primary);
}

.metric-value.neutral {
  color: var(--color-text-secondary);
}

/* 성능 측정 도구 스타일 */
.performance-tools-section {
  background: var(--color-background-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.tool-card {
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 1.25rem;
}

.tool-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.tool-header svg {
  color: var(--color-primary);
}

.tool-header h4 {
  color: var(--color-text-primary);
  margin: 0;
  font-size: 1.1rem;
}

.tool-demo {
  margin-top: 1rem;
}

.json-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  resize: vertical;
  margin-bottom: 1rem;
}

.tool-controls {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.measure-btn, .clear-btn, .monitor-btn, .profile-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.measure-btn:hover, .profile-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.clear-btn:hover {
  background: var(--color-error);
  color: white;
  border-color: var(--color-error);
}

.monitor-btn:hover {
  background: var(--color-success);
  color: white;
  border-color: var(--color-success);
}

.measure-btn:disabled, .monitor-btn:disabled, .profile-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.results {
  background: var(--color-background-primary);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 1rem;
}

.results h5 {
  color: var(--color-text-primary);
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.result-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
}

.result-label {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.result-time {
  color: var(--color-primary);
  font-weight: 600;
}

.result-size {
  color: var(--color-text-secondary);
}

.result-error {
  color: var(--color-error);
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  background: #fff5f5;
  border-radius: 3px;
}

.results-summary {
  display: flex;
  gap: 1.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.summary-item span:first-child {
  color: var(--color-text-secondary);
  font-size: 0.8rem;
}

.summary-value {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 1rem;
}

.memory-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.memory-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.memory-item span:first-child {
  color: var(--color-text-secondary);
}

.memory-value {
  color: var(--color-text-primary);
  font-weight: 500;
}

.memory-chart {
  margin-bottom: 1rem;
}

.chart-bar {
  width: 100%;
  height: 20px;
  background: var(--color-background-primary);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  overflow: hidden;
}

.chart-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-success), var(--color-warning), var(--color-error));
  transition: width 0.3s ease;
}

.profiler-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text-primary);
  cursor: pointer;
}

.option-label input[type="checkbox"] {
  margin: 0;
}

.profiler-results {
  background: var(--color-background-primary);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 1rem;
  margin-top: 1rem;
}

.profile-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.profile-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.profile-operation {
  color: var(--color-text-primary);
  font-weight: 500;
  font-size: 0.9rem;
}

.profile-time {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.8rem;
}

.profile-bar {
  width: 100%;
  height: 8px;
  background: var(--color-background-secondary);
  border-radius: 4px;
  overflow: hidden;
}

.profile-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

/* 광고 스타일 */
:deep(.guide-ad) {
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 300px;
}

@media (max-width: 768px) {
  .guide-section {
    padding: 1rem;
  }
  
  .tip-item {
    padding: 0.75rem;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
  }
  
  .tool-card {
    padding: 1rem;
  }
  
  .tool-controls {
    flex-direction: column;
  }
  
  .results-summary {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .profiler-options {
    gap: 0.75rem;
  }
  
  :deep(.guide-ad) {
    min-height: 200px;
    padding: 0.5rem;
  }
}
</style>