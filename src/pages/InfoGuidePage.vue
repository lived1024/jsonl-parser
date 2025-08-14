<template>
  <div class="info-guide">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ $t('common.loading') }}</p>
    </div>

    <div v-else-if="error" class="error-state">
      <h2>{{ $t('common.error') }}</h2>
      <p>{{ error }}</p>
      <button @click="$router.push('/info')" class="back-btn">
        {{ $t('common.backToHub') }}
      </button>
    </div>

    <div v-else-if="guide" class="guide-content">
      <!-- Guide Header -->
      <header class="guide-header">
        <nav class="breadcrumb">
          <router-link to="/info" class="breadcrumb-link">
            {{ $t('infoHub.title') }}
          </router-link>
          <ChevronRight class="breadcrumb-separator" />
          <span class="breadcrumb-current">{{ guide.title }}</span>
        </nav>

        <div class="guide-meta-header">
          <h1 class="guide-title">{{ guide.metadata.title }}</h1>
          <div class="guide-badges">
            <span class="difficulty-badge" :class="`difficulty-${guide.metadata.difficulty}`">
              {{ $t(`common.difficulty.${guide.metadata.difficulty}`) }}
            </span>
            <span class="read-time-badge">
              <Clock class="badge-icon" />
              {{ guide.metadata.estimatedReadTime }}{{ $t('common.minutes') }}
            </span>
          </div>
        </div>

        <p class="guide-description">{{ guide.metadata.description }}</p>

        <div class="guide-meta">
          <div class="meta-item">
            <Calendar class="meta-icon" />
            <span>{{ $t('common.lastUpdated') }}: {{ formatDate(guide.metadata.lastUpdated) }}</span>
          </div>
          <div class="meta-item">
            <User class="meta-icon" />
            <span>{{ $t('common.author') }}: {{ guide.metadata.author }}</span>
          </div>
        </div>

        <div class="guide-tags">
          <span
            v-for="tag in guide.metadata.tags"
            :key="tag"
            class="tag"
          >
            {{ $t(`tags.${tag}`) }}
          </span>
        </div>
      </header>

      <!-- Table of Contents -->
      <aside class="table-of-contents">
        <h3>{{ $t('guide.tableOfContents') }}</h3>
        <nav class="toc-nav">
          <a
            v-for="heading in tableOfContents"
            :key="heading.id"
            :href="`#${heading.id}`"
            :class="['toc-link', `toc-level-${heading.level}`]"
            @click="scrollToHeading(heading.id)"
          >
            {{ heading.text }}
          </a>
        </nav>
      </aside>

      <!-- Guide Content -->
      <main class="guide-main">
        <div class="content-wrapper" v-html="renderedContent"></div>

        <!-- Related Tools Section -->
        <section v-if="relatedTools.length > 0" class="related-tools">
          <h3>{{ $t('guide.relatedTools') }}</h3>
          <div class="tools-list">
            <router-link
              v-for="tool in relatedTools"
              :key="tool.id"
              :to="`/tools/${tool.id}`"
              class="tool-link"
            >
              <component :is="tool.icon" class="tool-icon" />
              <div class="tool-info">
                <h4>{{ $t(`tools.${tool.id}.name`) }}</h4>
                <p>{{ $t(`tools.${tool.id}.description`) }}</p>
              </div>
              <ExternalLink class="external-icon" />
            </router-link>
          </div>
        </section>

        <!-- Interactive Examples -->
        <section v-if="interactiveExamples.length > 0" class="interactive-examples">
          <h3>{{ $t('guide.tryItOut') }}</h3>
          <div class="examples-list">
            <div
              v-for="example in interactiveExamples"
              :key="example.id"
              class="example-card"
            >
              <h4>{{ example.title }}</h4>
              <p>{{ example.description }}</p>
              <button
                @click="loadExampleInParser(example)"
                class="try-example-btn"
              >
                {{ $t('guide.loadInParser') }}
              </button>
            </div>
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
              <span class="nav-label">{{ $t('guide.previous') }}</span>
              <span class="nav-title">{{ previousGuide.title }}</span>
            </div>
          </router-link>

          <router-link
            v-if="nextGuide"
            :to="`/info/${nextGuide.id}`"
            class="nav-link next-link"
          >
            <div class="nav-content">
              <span class="nav-label">{{ $t('guide.next') }}</span>
              <span class="nav-title">{{ nextGuide.title }}</span>
            </div>
            <ChevronRight class="nav-icon" />
          </router-link>
        </nav>
      </main>

      <!-- Sidebar with ads -->
      <aside class="guide-sidebar">
        <AdSenseContainer
          ad-slot="guide-sidebar"
          ad-format="vertical"
          class="sidebar-ad"
        />

        <!-- Related Guides -->
        <div class="related-guides">
          <h3>{{ $t('guide.relatedGuides') }}</h3>
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
                {{ relatedGuide.estimatedReadTime }}{{ $t('common.minutes') }}
              </span>
            </router-link>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { marked } from 'marked'
import hljs from 'highlight.js'
import {
  ChevronRight,
  ChevronLeft,
  Clock,
  Calendar,
  User,
  ExternalLink,
  Code,
  Settings,
  Database
} from 'lucide-vue-next'
import AdSenseContainer from '../components/common/AdSenseContainer.vue'
import contentService, { type GuideContent, type InteractiveExample, type TableOfContentsItem } from '../services/ContentService'

interface RelatedTool {
  id: string
  icon: any
}

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const loading = ref(true)
const error = ref<string | null>(null)
const guide = ref<GuideContent | null>(null)
const tableOfContents = ref<TableOfContentsItem[]>([])

const relatedTools: RelatedTool[] = [
  { id: 'json-validator', icon: Code },
  { id: 'data-converter', icon: Settings },
  { id: 'schema-generator', icon: Database }
]

const renderedContent = computed(() => {
  return guide.value?.renderedContent || ''
})

const interactiveExamples = computed(() => {
  return guide.value?.metadata.interactiveExamples || []
})

const relatedGuides = ref<any[]>([])

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
    error.value = t('guide.loadError') || 'Failed to load guide'
    console.error('Failed to load guide:', err)
  } finally {
    loading.value = false
  }
}

const scrollToHeading = (headingId: string) => {
  const element = document.getElementById(headingId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const loadExampleInParser = (example: InteractiveExample) => {
  // Store example data in localStorage for the parser to pick up
  localStorage.setItem('parser-example-data', example.data)
  localStorage.setItem('parser-example-type', example.type)
  
  // Navigate to parser with query parameter
  router.push(`/?example=${example.id}`)
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
.info-guide {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
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
}

.guide-content {
  display: grid;
  grid-template-columns: 250px 1fr 300px;
  gap: 2rem;
  grid-template-areas:
    "header header header"
    "toc main sidebar";
}

.guide-header {
  grid-area: header;
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
  background: var(--color-success-light);
  color: var(--color-success);
}

.difficulty-intermediate {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.difficulty-advanced {
  background: var(--color-error-light);
  color: var(--color-error);
}

.read-time-badge {
  background: var(--color-background-elevated);
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
  background: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.table-of-contents {
  grid-area: toc;
  position: sticky;
  top: 2rem;
  height: fit-content;
  background: var(--color-background-elevated);
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
  padding: 0.5rem 0;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  border-left: 2px solid transparent;
  transition: all 0.2s;
}

.toc-link:hover {
  color: var(--color-primary);
  border-left-color: var(--color-primary);
}

.toc-level-2 { padding-left: 1rem; }
.toc-level-3 { padding-left: 2rem; }
.toc-level-4 { padding-left: 3rem; }

.guide-main {
  grid-area: main;
}

.content-wrapper {
  line-height: 1.7;
  color: var(--color-text-primary);
}

.content-wrapper :deep(h1),
.content-wrapper :deep(h2),
.content-wrapper :deep(h3),
.content-wrapper :deep(h4) {
  margin: 2rem 0 1rem 0;
  color: var(--color-text-primary);
}

.content-wrapper :deep(pre) {
  background: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.content-wrapper :deep(code) {
  background: var(--color-background-elevated);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9em;
}

.related-tools,
.interactive-examples {
  margin: 3rem 0;
  padding: 2rem;
  background: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.related-tools h3,
.interactive-examples h3 {
  margin: 0 0 1.5rem 0;
  color: var(--color-text-primary);
}

.tools-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tool-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
}

.tool-link:hover {
  border-color: var(--color-primary);
  transform: translateX(4px);
}

.tool-icon {
  width: 2rem;
  height: 2rem;
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
}

.tool-info p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.external-icon {
  width: 1rem;
  height: 1rem;
  color: var(--color-text-secondary);
}

.examples-list {
  display: grid;
  gap: 1rem;
}

.example-card {
  padding: 1.5rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.example-card h4 {
  margin: 0 0 0.5rem 0;
  color: var(--color-text-primary);
}

.example-card p {
  margin: 0 0 1rem 0;
  color: var(--color-text-secondary);
}

.try-example-btn {
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.try-example-btn:hover {
  background: var(--color-primary-dark);
}

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
  background: var(--color-background-elevated);
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

.guide-sidebar {
  grid-area: sidebar;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.sidebar-ad {
  position: sticky;
  top: 2rem;
}

.related-guides {
  background: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
}

.related-guides h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.related-guide-link {
  display: block;
  padding: 1rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
}

.related-guide-link:hover {
  border-color: var(--color-primary);
}

.related-guide-link h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 600;
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

@media (max-width: 1024px) {
  .guide-content {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "main"
      "sidebar";
  }

  .table-of-contents {
    display: none;
  }
}

@media (max-width: 768px) {
  .info-guide {
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
}
</style>