<template>
  <div class="sample-data-viewer">
    <div class="viewer-header">
      <h3 class="viewer-title">{{ sample.name }}</h3>
      <div class="viewer-badges">
        <span :class="`badge badge--${sample.category}`">
          {{ getCategoryLabel(sample.category) }}
        </span>
        <span :class="`badge badge--${sample.difficulty}`">
          {{ getDifficultyLabel(sample.difficulty) }}
        </span>
        <span :class="`badge badge--${sample.size}`">
          {{ getSizeLabel(sample.size) }}
        </span>
      </div>
    </div>

    <div class="viewer-content">
      <div class="sample-info">
        <div class="info-section">
          <h4 class="info-title">설명</h4>
          <p class="info-text">{{ sample.description }}</p>
        </div>

        <div class="info-section">
          <h4 class="info-title">메타데이터</h4>
          <div class="metadata-grid">
            <div class="metadata-item">
              <span class="metadata-label">사용 사례:</span>
              <span class="metadata-value">{{ sample.metadata.useCase }}</span>
            </div>
            <div class="metadata-item">
              <span class="metadata-label">출처:</span>
              <span class="metadata-value">{{ sample.metadata.source }}</span>
            </div>
            <div class="metadata-item" v-if="sample.metadata.features.length > 0">
              <span class="metadata-label">특징:</span>
              <span class="metadata-value">{{ sample.metadata.features.join(', ') }}</span>
            </div>
          </div>
        </div>

        <div class="info-section" v-if="sample.metadata.learningPoints.length > 0">
          <h4 class="info-title">학습 포인트</h4>
          <ul class="learning-points">
            <li v-for="point in sample.metadata.learningPoints" :key="point" class="learning-point">
              {{ point }}
            </li>
          </ul>
        </div>
      </div>

      <div class="data-preview">
        <div class="preview-header">
          <h4 class="preview-title">데이터 미리보기</h4>
          <div class="preview-controls">
            <button 
              class="control-btn"
              :class="{ active: viewMode === 'formatted' }"
              @click="viewMode = 'formatted'"
            >
              포맷됨
            </button>
            <button 
              class="control-btn"
              :class="{ active: viewMode === 'raw' }"
              @click="viewMode = 'raw'"
            >
              원본
            </button>
            <button 
              class="control-btn"
              @click="copyToClipboard"
              :disabled="isCopying"
            >
              {{ isCopying ? '복사됨!' : '복사' }}
            </button>
          </div>
        </div>

        <div class="preview-content">
          <pre 
            class="code-preview" 
            :class="{ 'code-preview--raw': viewMode === 'raw' }"
          ><code>{{ displayData }}</code></pre>
        </div>

        <div class="data-stats">
          <div class="stat-item">
            <span class="stat-label">크기:</span>
            <span class="stat-value">{{ formatDataSize(sample.data.length) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">줄 수:</span>
            <span class="stat-value">{{ sample.data.split('\n').length }}</span>
          </div>
          <div class="stat-item" v-if="isJsonl">
            <span class="stat-label">JSON 객체:</span>
            <span class="stat-value">{{ getJsonlObjectCount() }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="viewer-actions">
      <button 
        class="btn btn--primary"
        @click="$emit('load-in-parser', sample)"
      >
        파서에 로드
      </button>
      <button 
        class="btn btn--secondary"
        @click="downloadSample"
      >
        다운로드
      </button>
      <button 
        class="btn btn--secondary"
        @click="$emit('close')"
      >
        닫기
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SampleData } from '../../types'
import { detectJSONL } from '../../utils/validators'

interface Props {
  sample: SampleData
  maxPreviewLength?: number
}

interface Emits {
  (e: 'load-in-parser', sample: SampleData): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  maxPreviewLength: 1000
})

const emit = defineEmits<Emits>()

// 반응형 상태
const viewMode = ref<'formatted' | 'raw'>('formatted')
const isCopying = ref(false)

// 계산된 속성
const isJsonl = computed(() => detectJSONL(props.sample.data))

const displayData = computed(() => {
  const data = props.sample.data
  
  if (viewMode.value === 'raw') {
    // 원본 데이터 표시 (길면 자르기)
    if (data.length > props.maxPreviewLength) {
      return data.substring(0, props.maxPreviewLength) + '\n...\n(전체 데이터를 보려면 파서에 로드하거나 다운로드하세요)'
    }
    return data
  } else {
    // 포맷된 데이터 표시
    try {
      if (isJsonl.value) {
        // JSONL의 경우 각 줄을 파싱해서 포맷
        const lines = data.split('\n').filter(line => line.trim())
        const formattedLines = lines.slice(0, 5).map((line, index) => {
          try {
            const parsed = JSON.parse(line)
            return `// Line ${index + 1}\n${JSON.stringify(parsed, null, 2)}`
          } catch {
            return `// Line ${index + 1} (Invalid JSON)\n${line}`
          }
        })
        
        let result = formattedLines.join('\n\n')
        if (lines.length > 5) {
          result += `\n\n// ... ${lines.length - 5}개 줄 더 있음\n(전체 데이터를 보려면 파서에 로드하세요)`
        }
        return result
      } else {
        // 일반 JSON의 경우
        const parsed = JSON.parse(data)
        const formatted = JSON.stringify(parsed, null, 2)
        
        if (formatted.length > props.maxPreviewLength) {
          return formatted.substring(0, props.maxPreviewLength) + '\n...\n(전체 데이터를 보려면 파서에 로드하세요)'
        }
        return formatted
      }
    } catch {
      // 파싱 실패 시 원본 반환
      return data.length > props.maxPreviewLength 
        ? data.substring(0, props.maxPreviewLength) + '\n...'
        : data
    }
  }
})

// 메서드
const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    api: 'API 응답',
    config: '설정 파일',
    data: '데이터 내보내기',
    complex: '복잡한 구조'
  }
  return labels[category] || category
}

const getDifficultyLabel = (difficulty: string): string => {
  const labels: Record<string, string> = {
    simple: '간단',
    medium: '보통',
    complex: '복잡'
  }
  return labels[difficulty] || difficulty
}

const getSizeLabel = (size: string): string => {
  const labels: Record<string, string> = {
    small: '작음',
    medium: '보통',
    large: '큼'
  }
  return labels[size] || size
}

const formatDataSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} bytes`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const getJsonlObjectCount = (): number => {
  if (!isJsonl.value) return 0
  return props.sample.data.split('\n').filter(line => line.trim()).length
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.sample.data)
    isCopying.value = true
    setTimeout(() => {
      isCopying.value = false
    }, 2000)
  } catch (err) {
    console.error('클립보드 복사 실패:', err)
    // 폴백: 텍스트 선택
    const textArea = document.createElement('textarea')
    textArea.value = props.sample.data
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    
    isCopying.value = true
    setTimeout(() => {
      isCopying.value = false
    }, 2000)
  }
}

const downloadSample = () => {
  const blob = new Blob([props.sample.data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.href = url
  link.download = `${props.sample.id}.${isJsonl.value ? 'jsonl' : 'json'}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.sample-data-viewer {
  display: flex;
  flex-direction: column;
  height: 90vh;
  max-height: 90vh;
}

.viewer-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.viewer-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.viewer-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.badge--api { background: #e3f2fd; color: #1976d2; }
.badge--config { background: #f3e5f5; color: #7b1fa2; }
.badge--data { background: #e8f5e8; color: #388e3c; }
.badge--complex { background: #fff3e0; color: #f57c00; }

.badge--simple { background: #e8f5e8; color: #2e7d32; }
.badge--medium { background: #fff8e1; color: #f57c00; }

.badge--small { background: #f1f8e9; color: #558b2f; }
.badge--large { background: #fce4ec; color: #c2185b; }

.viewer-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
  padding: 1.5rem;
  overflow: hidden;
  min-height: 0;
}

.sample-info {
  overflow-y: auto;
  min-height: 0;
}

.info-section {
  margin-bottom: 1.5rem;
}

.info-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.info-text {
  color: var(--text-secondary);
  line-height: 1.5;
}

.metadata-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metadata-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metadata-label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.metadata-value {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.learning-points {
  list-style: none;
  padding: 0;
  margin: 0;
}

.learning-point {
  padding: 0.5rem 0;
  color: var(--text-secondary);
  border-left: 3px solid var(--color-primary);
  padding-left: 1rem;
  margin-bottom: 0.5rem;
  background: var(--bg-tertiary);
  border-radius: 0 4px 4px 0;
}

.data-preview {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.preview-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.preview-controls {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-secondary);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.control-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.control-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.preview-content {
  flex: 1;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  min-height: 300px;
}

.code-preview {
  width: 100%;
  height: 100%;
  padding: 1rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: var(--font-family-mono);
  font-size: 0.85rem;
  line-height: 1.4;
  overflow: auto;
  margin: 0;
  border: none;
  resize: none;
}

.code-preview--raw {
  white-space: pre-wrap;
  word-break: break-all;
}

.data-stats {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: 4px;
  font-size: 0.85rem;
}

.stat-item {
  display: flex;
  gap: 0.25rem;
}

.stat-label {
  font-weight: 500;
  color: var(--text-primary);
}

.stat-value {
  color: var(--text-secondary);
}

.viewer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn--primary {
  background: var(--color-primary);
  color: white;
}

.btn--primary:hover {
  background: #2563eb;
}

.btn--secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn--secondary:hover {
  background: var(--bg-tertiary);
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .viewer-content {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    gap: 1rem;
  }
  
  .sample-info {
    max-height: 250px;
    overflow-y: auto;
  }
  
  .data-preview {
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .sample-data-viewer {
    height: 95vh;
    max-height: 95vh;
  }
  
  .viewer-header,
  .viewer-content,
  .viewer-actions {
    padding: 1rem;
  }
  
  .viewer-content {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
  
  .sample-info {
    max-height: 200px;
  }
  
  .preview-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .viewer-actions {
    flex-direction: column;
  }
  
  .data-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>