<template>
  <div class="error-guide">
    <div class="guide-header">
      <h2>JSON 오류 해결 가이드</h2>
      <p>일반적인 JSON 파싱 오류와 해결 방법을 안내합니다.</p>
    </div>
    
    <div class="guide-content">
      <!-- 오류 분석 섹션 -->
      <div class="error-analyzer">
        <h3>오류 메시지 분석기</h3>
        <p>오류 메시지를 입력하면 가능한 원인과 해결책을 제안합니다.</p>
        
        <div class="analyzer-input">
          <textarea
            v-model="errorMessage"
            placeholder="오류 메시지를 입력하세요... (예: Unexpected token , in JSON at position 25)"
            class="error-input"
            rows="3"
          />
          <button 
            @click="analyzeError"
            :disabled="!errorMessage.trim()"
            class="analyze-button"
          >
            <Search :size="16" />
            분석하기
          </button>
        </div>

        <!-- 분석 결과 -->
        <div v-if="analysisResults.length > 0" class="analysis-results">
          <h4>분석 결과</h4>
          <div 
            v-for="result in analysisResults" 
            :key="result.errorGuide.id"
            class="analysis-result"
          >
            <div class="result-header">
              <div class="confidence-badge" :class="getConfidenceClass(result.confidence)">
                {{ Math.round(result.confidence * 100) }}% 일치
              </div>
              <h5>{{ result.errorGuide.title }}</h5>
            </div>
            <p class="result-description">{{ result.errorGuide.description }}</p>
            <div v-if="result.suggestedFix" class="suggested-fix">
              <strong>제안된 수정:</strong>
              <pre class="fix-code"><code>{{ result.suggestedFix }}</code></pre>
            </div>
          </div>
        </div>
      </div>

      <!-- 검색 기능 -->
      <div class="search-section">
        <div class="search-wrapper">
          <Search :size="20" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="오류 검색..."
            class="search-input"
          />
        </div>
        
        <!-- 카테고리 필터 -->
        <div class="category-filters">
          <button
            v-for="category in categories"
            :key="category.value"
            @click="selectedCategory = category.value"
            :class="['category-button', { active: selectedCategory === category.value }]"
          >
            {{ category.label }}
          </button>
        </div>
      </div>
      
      <!-- 광고 배치 -->
      <div class="ad-section">
        <SafeAdContainer 
          ad-slot="content-rectangle"
          ad-format="rectangle"
          class-name="guide-ad"
        />
      </div>
      
      <!-- 오류 가이드 목록 -->
      <div class="error-list">
        <div 
          v-for="error in filteredErrors" 
          :key="error.id"
          :id="`error-${error.id}`"
          class="error-item"
          :class="getSeverityClass(error.severity)"
        >
          <div class="error-header">
            <div class="error-meta">
              <AlertTriangle :size="24" class="error-icon" />
              <div class="severity-badge" :class="getSeverityClass(error.severity)">
                {{ getSeverityLabel(error.severity) }}
              </div>
            </div>
            <h3>{{ error.title }}</h3>
          </div>
          
          <div class="error-content">
            <div class="error-description">
              {{ error.description }}
            </div>

            <!-- 일반적인 원인 -->
            <div v-if="error.commonCauses" class="common-causes">
              <h4>일반적인 원인:</h4>
              <ul>
                <li v-for="cause in error.commonCauses" :key="cause">{{ cause }}</li>
              </ul>
            </div>
            
            <div class="error-example">
              <h4>잘못된 예제:</h4>
              <pre class="error-code"><code>{{ error.badExample }}</code></pre>
            </div>
            
            <div class="error-solution">
              <h4>올바른 해결책:</h4>
              <pre class="solution-code"><code>{{ error.solution }}</code></pre>
            </div>
            
            <div v-if="error.tips" class="error-tips">
              <h4>추가 팁:</h4>
              <ul>
                <li v-for="tip in error.tips" :key="tip">{{ tip }}</li>
              </ul>
            </div>

            <!-- 관련 오류 -->
            <div v-if="getRelatedErrors(error.id).length > 0" class="related-errors">
              <h4>관련 오류:</h4>
              <div class="related-links">
                <button
                  v-for="relatedError in getRelatedErrors(error.id)"
                  :key="relatedError.id"
                  @click="scrollToError(relatedError.id)"
                  class="related-link"
                >
                  {{ relatedError.title }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Search, AlertTriangle } from 'lucide-vue-next'
import SafeAdContainer from '../tools/SafeAdContainer.vue'
import { errorPatternService } from '../../services/ErrorPatternService'
import type { ErrorGuideItem, ErrorMatchResult } from '../../types/reference'

const searchQuery = ref('')
const selectedCategory = ref<string>('all')
const errorMessage = ref('')
const analysisResults = ref<ErrorMatchResult[]>([])

// 오류 가이드 데이터 (서비스에서 가져오기)
const errors = ref<ErrorGuideItem[]>(errorPatternService.getAllErrorGuides())

// 카테고리 옵션
const categories = [
  { value: 'all', label: '전체' },
  { value: 'syntax', label: '구문 오류' },
  { value: 'structure', label: '구조 오류' },
  { value: 'data-type', label: '데이터 타입' },
  { value: 'encoding', label: '인코딩' }
]

// 오류 분석 함수
const analyzeError = () => {
  if (!errorMessage.value.trim()) return
  
  analysisResults.value = errorPatternService.analyzeError(errorMessage.value)
}

// 검색 및 카테고리 필터링
const filteredErrors = computed(() => {
  let filtered = errors.value

  // 카테고리 필터링
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(error => error.category === selectedCategory.value)
  }

  // 검색 필터링
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    
    filtered = filtered.filter(error =>
      error.title.toLowerCase().includes(query) ||
      error.description.toLowerCase().includes(query) ||
      error.badExample.toLowerCase().includes(query) ||
      error.solution.toLowerCase().includes(query) ||
      error.commonCauses?.some(cause => cause.toLowerCase().includes(query)) ||
      error.tips?.some(tip => tip.toLowerCase().includes(query))
    )
  }

  return filtered
})

// 심각도 클래스 반환
const getSeverityClass = (severity: string) => {
  return `severity-${severity}`
}

// 심각도 라벨 반환
const getSeverityLabel = (severity: string) => {
  const labels = {
    low: '낮음',
    medium: '보통',
    high: '높음'
  }
  return labels[severity as keyof typeof labels] || severity
}

// 신뢰도 클래스 반환
const getConfidenceClass = (confidence: number) => {
  if (confidence >= 0.8) return 'confidence-high'
  if (confidence >= 0.6) return 'confidence-medium'
  return 'confidence-low'
}

// 관련 오류 가져오기
const getRelatedErrors = (errorId: string) => {
  return errorPatternService.getRelatedErrors(errorId)
}

// 특정 오류로 스크롤
const scrollToError = async (errorId: string) => {
  await nextTick()
  const element = document.getElementById(`error-${errorId}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<style scoped>
.error-guide {
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

/* 오류 분석기 스타일 */
.error-analyzer {
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.error-analyzer h3 {
  color: var(--color-text-primary);
  margin: 0 0 0.5rem 0;
}

.error-analyzer p {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.analyzer-input {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.error-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  font-size: 1rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  resize: vertical;
  min-height: 80px;
}

.error-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.analyze-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.analyze-button:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.analyze-button:disabled {
  background: var(--color-text-secondary);
  cursor: not-allowed;
}

.analysis-results {
  margin-top: 1.5rem;
}

.analysis-results h4 {
  color: var(--color-text-primary);
  margin: 0 0 1rem 0;
}

.analysis-result {
  background: var(--color-background-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.confidence-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.confidence-high {
  background: #d4edda;
  color: #155724;
}

.confidence-medium {
  background: #fff3cd;
  color: #856404;
}

.confidence-low {
  background: #f8d7da;
  color: #721c24;
}

.result-header h5 {
  color: var(--color-text-primary);
  margin: 0;
}

.result-description {
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}

.suggested-fix {
  margin-top: 1rem;
}

.fix-code {
  background: #e8f5e8;
  border: 1px solid #c3e6c3;
  border-radius: 4px;
  padding: 0.75rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #2f855a;
  margin: 0.5rem 0 0 0;
}

.search-section {
  margin-bottom: 2rem;
}

.search-wrapper {
  position: relative;
  max-width: 400px;
  margin: 0 auto 1rem auto;
}

.search-wrapper svg {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  font-size: 1rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.category-filters {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.category-button {
  padding: 0.5rem 1rem;
  border: 2px solid var(--color-border);
  background: var(--color-background-primary);
  color: var(--color-text-secondary);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.category-button:hover {
  border-color: var(--color-primary);
  color: var(--color-text-primary);
}

.category-button.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.ad-section {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

.error-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.error-item {
  background: var(--color-background-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
  scroll-margin-top: 2rem;
}

.error-item.severity-high {
  border-left: 4px solid #dc3545;
}

.error-item.severity-medium {
  border-left: 4px solid #ffc107;
}

.error-item.severity-low {
  border-left: 4px solid #28a745;
}

.error-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--color-border);
}

.error-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.error-icon {
  color: var(--color-error);
}

.severity-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.severity-badge.severity-high {
  background: #f8d7da;
  color: #721c24;
}

.severity-badge.severity-medium {
  background: #fff3cd;
  color: #856404;
}

.severity-badge.severity-low {
  background: #d4edda;
  color: #155724;
}

.error-header h3 {
  color: var(--color-text-primary);
  margin: 0;
}

.error-description {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.common-causes,
.error-example,
.error-solution,
.error-tips,
.related-errors {
  margin-bottom: 1.5rem;
}

.common-causes h4,
.error-example h4,
.error-solution h4,
.error-tips h4,
.related-errors h4 {
  color: var(--color-text-primary);
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
}

.common-causes ul,
.error-tips ul {
  margin: 0;
  padding-left: 1.5rem;
}

.common-causes li,
.error-tips li {
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.error-code {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 4px;
  padding: 1rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #c53030;
  margin: 0;
}

.solution-code {
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  border-radius: 4px;
  padding: 1rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #2f855a;
  margin: 0;
}

.related-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.related-link {
  padding: 0.5rem 1rem;
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  color: var(--color-primary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.related-link:hover {
  background: var(--color-primary);
  color: white;
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
  .analyzer-input {
    flex-direction: column;
  }
  
  .analyze-button {
    align-self: flex-start;
  }
  
  .category-filters {
    justify-content: flex-start;
  }
  
  .error-item {
    padding: 1rem;
  }
  
  .error-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .error-meta {
    width: 100%;
    justify-content: space-between;
  }
  
  :deep(.guide-ad) {
    min-height: 200px;
    padding: 0.5rem;
  }
}
</style>