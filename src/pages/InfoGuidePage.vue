<template>
  <DefaultLayout>
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>가이드를 불러오는 중...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <h2>오류가 발생했습니다</h2>
      <p>{{ error }}</p>
      <button @click="$router.push('/info')" class="back-btn">
        정보 허브로 돌아가기
      </button>
    </div>

    <div v-else-if="guide" class="guide-content">
      <!-- Guide Header -->
      <header class="guide-header">
        <nav class="breadcrumb">
          <router-link to="/info" class="breadcrumb-link">
            정보 허브
          </router-link>
          <ChevronRight class="breadcrumb-separator" />
          <span class="breadcrumb-current">{{ guide.metadata.title }}</span>
        </nav>

        <div class="guide-meta-header">
          <h1 class="guide-title">{{ guide.metadata.title }}</h1>
          <div class="guide-badges">
            <span class="difficulty-badge" :class="`difficulty-${guide.metadata.difficulty}`">
              {{ getDifficultyLabel(guide.metadata.difficulty) }}
            </span>
            <span class="read-time-badge">
              <Clock class="badge-icon" />
              {{ guide.metadata.estimatedReadTime }}분
            </span>
          </div>
        </div>

        <p class="guide-description">{{ guide.metadata.description }}</p>

        <div class="guide-meta">
          <div class="meta-item">
            <Calendar class="meta-icon" />
            <span>최종 업데이트: {{ formatDate(guide.metadata.lastUpdated) }}</span>
          </div>
          <div class="meta-item">
            <User class="meta-icon" />
            <span>작성자: {{ guide.metadata.author }}</span>
          </div>
        </div>

        <div class="guide-tags">
          <span
            v-for="tag in guide.metadata.tags"
            :key="tag"
            class="tag"
          >
            {{ tag }}
          </span>
        </div>
      </header>

      <!-- 상단 광고 -->
      <SafeAdContainer 
        ad-slot="guide-header-banner"
        ad-format="banner"
        class-name="guide-header-ad"
      />

      <div class="guide-layout">
        <!-- Table of Contents -->
        <aside class="table-of-contents">
          <h3>목차</h3>
          <nav class="toc-nav">
            <button
              v-for="heading in tableOfContents"
              :key="heading.id"
              :class="['toc-link', `toc-level-${heading.level}`]"
              @click.prevent="scrollToHeading(heading.id)"
              type="button"
            >
              {{ heading.text }}
            </button>
          </nav>
        </aside>

        <!-- Guide Content -->
        <main class="guide-main">
          <div class="content-wrapper" v-html="renderedContent"></div>

          <!-- Interactive Examples -->
          <section v-if="interactiveExamples.length > 0" class="interactive-examples">
            <h3>
              <Play class="section-icon" />
              실습해보기
            </h3>
            <p class="section-description">
              아래 예제들을 파서에서 직접 실행해보세요. 클릭하면 자동으로 데이터가 로드됩니다.
            </p>
            <div class="examples-grid">
              <div
                v-for="example in interactiveExamples"
                :key="example.id"
                class="example-card"
              >
                <div class="example-header">
                  <h4>{{ example.title }}</h4>
                  <span class="example-type" :class="`type-${example.type}`">
                    {{ example.type.toUpperCase() }}
                  </span>
                </div>
                <p class="example-description">{{ example.description }}</p>
                <div class="example-preview">
                  <pre><code>{{ getPreviewData(example.data) }}</code></pre>
                </div>
                <div class="example-actions">
                  <button
                    @click="loadExampleInParser(example)"
                    class="try-example-btn"
                  >
                    <ExternalLink class="btn-icon" />
                    파서에서 열기
                  </button>
                  <button
                    @click="copyExampleData(example.data)"
                    class="copy-example-btn"
                  >
                    <Copy class="btn-icon" />
                    복사
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- Related Tools Section -->
          <section v-if="relatedToolsData.length > 0" class="related-tools">
            <h3>
              <Wrench class="section-icon" />
              관련 도구
            </h3>
            <p class="section-description">
              이 가이드에서 다룬 내용을 실습할 수 있는 도구들입니다.
            </p>
            <div class="tools-grid">
              <router-link
                v-for="tool in relatedToolsData"
                :key="tool.id"
                :to="`/tools/${tool.id}`"
                class="tool-card"
              >
                <component :is="tool.icon" class="tool-icon" />
                <div class="tool-info">
                  <h4>{{ tool.name }}</h4>
                  <p>{{ tool.description }}</p>
                </div>
                <ExternalLink class="external-icon" />
              </router-link>
            </div>
          </section>

          <!-- Navigation -->
          <nav class="guide-navigation">
            <router-link
              v-if="previousGuide"
              :to="`/info/${previousGuide.id}`"
              class="nav-link prev-link"
            >
              <ChevronLeft class="nav-icon" />
              <div class="nav-content">
                <span class="nav-label">이전</span>
                <span class="nav-title">{{ previousGuide.title }}</span>
              </div>
            </router-link>

            <router-link
              v-if="nextGuide"
              :to="`/info/${nextGuide.id}`"
              class="nav-link next-link"
            >
              <div class="nav-content">
                <span class="nav-label">다음</span>
                <span class="nav-title">{{ nextGuide.title }}</span>
              </div>
              <ChevronRight class="nav-icon" />
            </router-link>
          </nav>
        </main>

        <!-- Sidebar -->
        <aside class="guide-sidebar">
          <!-- 사이드바 광고 -->
          <SafeAdContainer
            ad-slot="guide-sidebar"
            ad-format="vertical"
            class-name="sidebar-ad"
          />

          <!-- Related Guides -->
          <div class="related-guides">
            <h3>관련 가이드</h3>
            <div class="related-list">
              <router-link
                v-for="relatedGuide in relatedGuides"
                :key="relatedGuide.id"
                :to="`/info/${relatedGuide.id}`"
                class="related-guide-link"
              >
                <h4>{{ relatedGuide.title }}</h4>
                <p>{{ relatedGuide.description }}</p>
                <span class="read-time">
                  <Clock class="time-icon" />
                  {{ relatedGuide.estimatedReadTime }}분
                </span>
              </router-link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ChevronRight,
  ChevronLeft,
  Clock,
  Calendar,
  User,
  ExternalLink,
  Code,
  Settings,
  Database,
  Play,
  Wrench,
  Copy,
  Shield,
  Globe,
  Layers,
  Zap,
  HardDrive
} from 'lucide-vue-next'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import SafeAdContainer from '../components/tools/SafeAdContainer.vue'
import { ContentService, type GuideContent, type InteractiveExample, type TableOfContentsItem } from '../services/ContentService'
import GuideIntegrationService from '../services/GuideIntegrationService'

interface RelatedTool {
  id: string
  name: string
  description: string
  icon: any
}

const route = useRoute()
const router = useRouter()
const contentService = ContentService.getInstance()
const integrationService = GuideIntegrationService.getInstance()

const loading = ref(true)
const error = ref<string | null>(null)
const guide = ref<GuideContent | null>(null)
const tableOfContents = ref<TableOfContentsItem[]>([])
const relatedGuides = ref<any[]>([])
const relatedToolsData = ref<RelatedTool[]>([])

// 아이콘 매핑
const iconMap: Record<string, any> = {
  Shield,
  Settings,
  Database,
  Globe,
  Code,
  Layers,
  Zap,
  HardDrive
}

const renderedContent = computed(() => {
  return guide.value?.renderedContent || ''
})

const interactiveExamples = computed(() => {
  return guide.value?.metadata.interactiveExamples || []
})

const previousGuide = computed(() => {
  // Mock navigation - in real implementation, this would be based on guide order
  return null
})

const nextGuide = computed(() => {
  // Mock navigation - in real implementation, this would be based on guide order
  return null
})

const loadGuide = async (guideId: string) => {
  loading.value = true
  error.value = null

  try {
    const guideContent = await contentService.getGuide(guideId)
    if (!guideContent) {
      throw new Error('Guide not found')
    }
    guide.value = guideContent
    tableOfContents.value = guideContent.tableOfContents
  } catch (err) {
    error.value = 'Failed to load guide'
    console.error('Failed to load guide:', err)
  } finally {
    loading.value = false
  }
}

const loadRelatedGuides = async () => {
  if (!guide.value) return
  
  try {
    const related = await contentService.getRelatedGuides(guide.value.id, 3)
    relatedGuides.value = related.map(g => ({
      id: g.id,
      title: g.metadata.title,
      description: g.metadata.description,
      estimatedReadTime: g.metadata.estimatedReadTime
    }))
  } catch (error) {
    console.error('Failed to load related guides:', error)
  }
}

const loadRelatedTools = () => {
  if (!guide.value) return
  
  try {
    const tools = integrationService.getRelatedTools(guide.value.id)
    relatedToolsData.value = tools.map(tool => ({
      id: tool.id,
      name: tool.name,
      description: tool.description,
      icon: iconMap[tool.icon] || Settings
    }))
  } catch (error) {
    console.error('Failed to load related tools:', error)
  }
}

const scrollToHeading = async (headingId: string) => {
  // DOM 업데이트를 기다림
  await nextTick()
  
  console.log('Scrolling to heading:', headingId)
  console.log('Available TOC items:', tableOfContents.value)
  
  // 먼저 ID로 찾기
  let element = document.getElementById(headingId)
  console.log('Found element by ID:', element)
  
  // ID로 찾지 못하면 텍스트 내용으로 찾기
  if (!element) {
    const headings = document.querySelectorAll('.content-wrapper h1, .content-wrapper h2, .content-wrapper h3, .content-wrapper h4, .content-wrapper h5, .content-wrapper h6')
    console.log('All headings in content:', Array.from(headings).map(h => ({ tag: h.tagName, text: h.textContent, id: h.id })))
    
    const targetHeading = tableOfContents.value.find(h => h.id === headingId)
    console.log('Target heading from TOC:', targetHeading)
    
    if (targetHeading) {
      element = Array.from(headings).find(h => 
        h.textContent?.trim() === targetHeading.text.trim()
      ) as HTMLElement
      console.log('Found element by text match:', element)
    }
  }
  
  if (element) {
    console.log('Scrolling to element:', element)
    
    // 먼저 scrollIntoView 시도
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start',
      inline: 'nearest'
    })
    
    // 헤더 오프셋을 위해 추가 조정
    setTimeout(() => {
      const headerOffset = 100
      const currentTop = window.pageYOffset || document.documentElement.scrollTop
      window.scrollTo({
        top: currentTop - headerOffset,
        behavior: 'smooth'
      })
    }, 100)
  } else {
    console.warn(`Heading with id "${headingId}" not found`)
    // 모든 가능한 헤딩 요소 출력
    const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    console.log('All headings in document:', Array.from(allHeadings).map(h => ({ tag: h.tagName, text: h.textContent, id: h.id, classes: h.className })))
  }
}

const loadExampleInParser = async (example: InteractiveExample) => {
  try {
    await integrationService.loadExampleInParser(example)
  } catch (error) {
    console.error('Failed to load example in parser:', error)
  }
}

const copyExampleData = async (data: string) => {
  try {
    await integrationService.copyExampleData(data)
  } catch (error) {
    console.error('Failed to copy example data:', error)
  }
}

const getPreviewData = (data: string): string => {
  // Show first few lines of the data as preview
  const lines = data.split('\n')
  const preview = lines.slice(0, 3).join('\n')
  return lines.length > 3 ? preview + '\n...' : preview
}

const getDifficultyLabel = (difficulty: string): string => {
  const labels: Record<string, string> = {
    beginner: '초급',
    intermediate: '중급',
    advanced: '고급'
  }
  return labels[difficulty] || difficulty
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

watch(() => route.params.guideId, async (newGuideId) => {
  if (newGuideId && typeof newGuideId === 'string') {
    await loadGuide(newGuideId)
    await loadRelatedGuides()
    loadRelatedTools()
  }
}, { immediate: true })

onMounted(() => {
  // Track page view for analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
      page_title: `Guide: ${route.params.guideId}`,
      page_location: window.location.href
    })
  }
})
</script>

<style scoped>
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.back-btn {
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background: var(--color-primary-dark);
}

.guide-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.guide-header {
  margin-bottom: 2rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.breadcrumb-link {
  color: var(--color-primary);
  text-decoration: none;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-separator {
  width: 1rem;
  height: 1rem;
  color: var(--color-text-secondary);
}

.breadcrumb-current {
  color: var(--color-text-secondary);
}

.guide-meta-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.guide-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  flex: 1;
}

.guide-badges {
  display: flex;
  gap: 0.5rem;
  margin-left: 1rem;
}

.difficulty-badge,
.read-time-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.difficulty-beginner {
  background: #e8f5e8;
  color: #2d5a2d;
}

.difficulty-intermediate {
  background: #fff3cd;
  color: #856404;
}

.difficulty-advanced {
  background: #f8d7da;
  color: #721c24;
}

.read-time-badge {
  background: var(--color-background-secondary);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.badge-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.guide-description {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  line-height: 1.6;
}

.guide-meta {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.meta-icon {
  width: 1rem;
  height: 1rem;
}

.guide-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

/* 광고 스타일 */
.guide-header-ad {
  margin: 2rem 0;
  padding: 1rem;
  background: var(--color-background-secondary);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.guide-layout {
  display: grid;
  grid-template-columns: 250px 1fr 300px;
  gap: 2rem;
}

.table-of-contents {
  position: sticky;
  top: 2rem;
  height: fit-content;
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
}

.table-of-contents h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.toc-nav {
  display: flex;
  flex-direction: column;
}

.toc-link {
  display: block;
  width: 100%;
  padding: 0.5rem 0;
  color: var(--color-text-secondary);
  background: none;
  border: none;
  border-left: 2px solid transparent;
  font-size: 0.9rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.toc-link:hover {
  color: var(--color-primary);
  border-left-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.05);
}

.toc-level-2 { padding-left: 1rem; }
.toc-level-3 { padding-left: 2rem; }
.toc-level-4 { padding-left: 3rem; }

.guide-main {
  min-width: 0;
}

.content-wrapper {
  line-height: 1.7;
  color: var(--color-text-primary);
  margin-bottom: 3rem;
}

.content-wrapper :deep(h1),
.content-wrapper :deep(h2),
.content-wrapper :deep(h3),
.content-wrapper :deep(h4) {
  margin: 2rem 0 1rem 0;
  color: var(--color-text-primary);
}

.content-wrapper :deep(pre) {
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.content-wrapper :deep(code) {
  background: var(--color-background-secondary);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9em;
}

/* 섹션 공통 스타일 */
.interactive-examples,
.related-tools {
  margin: 3rem 0;
  padding: 2rem;
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.interactive-examples h3,
.related-tools h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.5rem 0;
  color: var(--color-text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.section-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-primary);
}

.section-description {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

/* 인터랙티브 예제 스타일 */
.examples-grid {
  display: grid;
  gap: 1.5rem;
}

.example-card {
  padding: 1.5rem;
  background: var(--color-background-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: all 0.2s;
}

.example-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.example-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.example-header h4 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 1.1rem;
  font-weight: 600;
}

.example-type {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.type-json {
  background: #e3f2fd;
  color: #1976d2;
}

.type-jsonl {
  background: #f3e5f5;
  color: #7b1fa2;
}

.example-description {
  margin: 0 0 1rem 0;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.example-preview {
  margin: 1rem 0;
  background: var(--color-background-tertiary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  overflow: hidden;
}

.example-preview pre {
  margin: 0;
  padding: 1rem;
  font-size: 0.85rem;
  line-height: 1.4;
  overflow-x: auto;
}

.example-preview code {
  background: none;
  padding: 0;
  color: var(--color-text-primary);
}

.example-actions {
  display: flex;
  gap: 0.75rem;
}

.try-example-btn,
.copy-example-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.try-example-btn {
  background: var(--color-primary);
  color: white;
}

.try-example-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.copy-example-btn {
  background: var(--color-background-secondary);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.copy-example-btn:hover {
  background: var(--color-background-tertiary);
  border-color: var(--color-primary);
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

/* 관련 도구 스타일 */
.tools-grid {
  display: grid;
  gap: 1rem;
}

.tool-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--color-background-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
}

.tool-card:hover {
  border-color: var(--color-primary);
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tool-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--color-primary);
  flex-shrink: 0;
}

.tool-info {
  flex: 1;
}

.tool-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.tool-info p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.external-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-text-secondary);
}

/* 네비게이션 스타일 */
.guide-navigation {
  display: flex;
  justify-content: space-between;
  margin: 3rem 0;
  gap: 1rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
  max-width: 300px;
}

.nav-link:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.nav-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-primary);
}

.nav-content {
  display: flex;
  flex-direction: column;
}

.nav-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  font-weight: 500;
}

.nav-title {
  font-weight: 600;
  color: var(--color-text-primary);
}

/* 사이드바 스타일 */
.guide-sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.sidebar-ad {
  position: sticky;
  top: 2rem;
}

.related-guides {
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
}

.related-guides h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.related-guide-link {
  display: block;
  padding: 1rem;
  background: var(--color-background-primary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
}

.related-guide-link:hover {
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.related-guide-link h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.related-guide-link p {
  margin: 0 0 0.5rem 0;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.read-time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.time-icon {
  width: 0.75rem;
  height: 0.75rem;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .guide-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .table-of-contents {
    display: none;
  }
}

@media (max-width: 768px) {
  .guide-content {
    padding: 1rem;
  }

  .guide-title {
    font-size: 2rem;
  }

  .guide-meta-header {
    flex-direction: column;
    gap: 1rem;
  }

  .guide-badges {
    margin-left: 0;
  }

  .guide-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .guide-navigation {
    flex-direction: column;
  }

  .nav-link {
    max-width: none;
  }

  .example-actions {
    flex-direction: column;
  }

  .try-example-btn,
  .copy-example-btn {
    justify-content: center;
  }
}
</style>