<template>
  <div class="info-hub">
    <div class="info-hub__header">
      <h1 class="info-hub__title">{{ $t('infoHub.title') }}</h1>
      <p class="info-hub__description">{{ $t('infoHub.description') }}</p>
    </div>

    <div class="info-hub__content">
      <!-- Search and Filter -->
      <div class="info-hub__controls">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('infoHub.searchPlaceholder')"
            class="search-input"
          />
        </div>
        <div class="category-filter">
          <button
            v-for="category in categories"
            :key="category.id"
            :class="['category-btn', { active: selectedCategory === category.id }]"
            @click="selectedCategory = category.id"
          >
            {{ $t(`infoHub.categories.${category.id}`) }}
          </button>
        </div>
      </div>

      <!-- Guide Categories -->
      <div class="guide-categories">
        <div
          v-for="category in filteredCategories"
          :key="category.id"
          class="category-section"
        >
          <h2 class="category-title">
            <component :is="category.icon" class="category-icon" />
            {{ $t(`infoHub.categories.${category.id}`) }}
          </h2>
          <p class="category-description">
            {{ $t(`infoHub.categoryDescriptions.${category.id}`) }}
          </p>
          
          <div class="guides-grid">
            <div
              v-for="guide in category.guides"
              :key="guide.id"
              class="guide-card"
              @click="navigateToGuide(guide.id)"
            >
              <div class="guide-card__header">
                <h3 class="guide-title">{{ $t(`guides.${guide.id}.title`) }}</h3>
                <span class="guide-difficulty" :class="`difficulty-${guide.difficulty}`">
                  {{ $t(`common.difficulty.${guide.difficulty}`) }}
                </span>
              </div>
              <p class="guide-description">
                {{ $t(`guides.${guide.id}.description`) }}
              </p>
              <div class="guide-meta">
                <span class="read-time">
                  <Clock class="meta-icon" />
                  {{ guide.estimatedReadTime }}{{ $t('common.minutes') }}
                </span>
                <span class="last-updated">
                  <Calendar class="meta-icon" />
                  {{ formatDate(guide.lastUpdated) }}
                </span>
              </div>
              <div class="guide-tags">
                <span
                  v-for="tag in guide.tags"
                  :key="tag"
                  class="tag"
                >
                  {{ $t(`tags.${tag}`) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Tools Section -->
      <div class="related-tools">
        <h2 class="section-title">{{ $t('infoHub.relatedTools') }}</h2>
        <div class="tools-grid">
          <router-link
            v-for="tool in relatedTools"
            :key="tool.id"
            :to="`/tools/${tool.id}`"
            class="tool-card"
          >
            <component :is="tool.icon" class="tool-icon" />
            <h3 class="tool-name">{{ $t(`tools.${tool.id}.name`) }}</h3>
            <p class="tool-description">{{ $t(`tools.${tool.id}.description`) }}</p>
          </router-link>
        </div>
      </div>
    </div>

    <!-- AdSense Integration -->
    <AdSenseContainer
      ad-slot="info-hub-sidebar"
      ad-format="vertical"
      class="info-hub__ad"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Clock, Calendar, Book, Code, Settings, Database, Globe, Zap } from 'lucide-vue-next'
import AdSenseContainer from '../components/common/AdSenseContainer.vue'
import contentService, { type GuideCategory } from '../services/ContentService'

interface GuideInfo {
  id: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedReadTime: number
  lastUpdated: Date
  tags: string[]
}

interface DisplayCategory {
  id: string
  icon: any
  guides: GuideInfo[]
}

interface RelatedTool {
  id: string
  icon: any
}

const router = useRouter()
const { t } = useI18n()

const searchQuery = ref('')
const selectedCategory = ref('all')
const loading = ref(true)
const categories = ref<DisplayCategory[]>([])

const categoryIcons: Record<string, any> = {
  'getting-started': Book,
  'api-development': Globe,
  'data-processing': Database,
  'performance': Zap
}

const relatedTools: RelatedTool[] = [
  { id: 'json-validator', icon: Code },
  { id: 'data-converter', icon: Settings },
  { id: 'schema-generator', icon: Database }
]

const loadCategories = async () => {
  try {
    loading.value = true
    const guideCategories = await contentService.getGuideCategories()
    
    categories.value = guideCategories.map(category => ({
      id: category.id,
      icon: categoryIcons[category.id] || Book,
      guides: category.guides.map(guideId => ({
        id: guideId,
        difficulty: getGuideDifficulty(guideId),
        estimatedReadTime: getGuideReadTime(guideId),
        lastUpdated: getGuideLastUpdated(guideId),
        tags: getGuideTags(guideId)
      }))
    }))
  } catch (error) {
    console.error('Failed to load categories:', error)
  } finally {
    loading.value = false
  }
}

// Helper functions to get guide metadata (in real implementation, this would come from ContentService)
const getGuideDifficulty = (guideId: string): 'beginner' | 'intermediate' | 'advanced' => {
  const difficulties: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
    'json-basics': 'beginner',
    'jsonl-introduction': 'beginner',
    'parser-overview': 'beginner',
    'rest-api-design': 'intermediate',
    'json-schema-guide': 'intermediate',
    'api-versioning': 'advanced',
    'large-datasets': 'intermediate',
    'data-transformation': 'intermediate',
    'error-handling': 'advanced',
    'optimization-tips': 'advanced',
    'caching-strategies': 'advanced'
  }
  return difficulties[guideId] || 'beginner'
}

const getGuideReadTime = (guideId: string): number => {
  const readTimes: Record<string, number> = {
    'json-basics': 5,
    'jsonl-introduction': 7,
    'parser-overview': 10,
    'rest-api-design': 15,
    'json-schema-guide': 12,
    'api-versioning': 20,
    'large-datasets': 18,
    'data-transformation': 14,
    'error-handling': 16,
    'optimization-tips': 22,
    'caching-strategies': 19
  }
  return readTimes[guideId] || 10
}

const getGuideLastUpdated = (guideId: string): Date => {
  const dates: Record<string, Date> = {
    'json-basics': new Date('2024-01-15'),
    'jsonl-introduction': new Date('2024-01-20'),
    'parser-overview': new Date('2024-02-01'),
    'rest-api-design': new Date('2024-01-25'),
    'json-schema-guide': new Date('2024-02-05'),
    'api-versioning': new Date('2024-02-10'),
    'large-datasets': new Date('2024-01-30'),
    'data-transformation': new Date('2024-02-08'),
    'error-handling': new Date('2024-02-12'),
    'optimization-tips': new Date('2024-02-15'),
    'caching-strategies': new Date('2024-02-18')
  }
  return dates[guideId] || new Date()
}

const getGuideTags = (guideId: string): string[] => {
  const tags: Record<string, string[]> = {
    'json-basics': ['json', 'basics', 'syntax'],
    'jsonl-introduction': ['jsonl', 'format', 'streaming'],
    'parser-overview': ['parser', 'tool', 'features'],
    'rest-api-design': ['api', 'rest', 'design', 'best-practices'],
    'json-schema-guide': ['schema', 'validation', 'api'],
    'api-versioning': ['api', 'versioning', 'maintenance'],
    'large-datasets': ['performance', 'streaming', 'memory'],
    'data-transformation': ['transformation', 'etl', 'processing'],
    'error-handling': ['errors', 'validation', 'debugging'],
    'optimization-tips': ['performance', 'optimization', 'memory'],
    'caching-strategies': ['caching', 'performance', 'scalability']
  }
  return tags[guideId] || []
}

const filteredCategories = computed(() => {
  let filtered = categories

  if (selectedCategory.value !== 'all') {
    filtered = categories.filter(cat => cat.id === selectedCategory.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.map(category => ({
      ...category,
      guides: category.guides.filter(guide => 
        t(`guides.${guide.id}.title`).toLowerCase().includes(query) ||
        t(`guides.${guide.id}.description`).toLowerCase().includes(query) ||
        guide.tags.some(tag => tag.toLowerCase().includes(query))
      )
    })).filter(category => category.guides.length > 0)
  }

  return filtered
})

const navigateToGuide = (guideId: string) => {
  router.push(`/info/${guideId}`)
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

onMounted(async () => {
  await loadCategories()
  
  // Track page view for analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
      page_title: 'Info Hub',
      page_location: window.location.href
    })
  }
})
</script>

<style scoped>
.info-hub {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

.info-hub__header {
  grid-column: 1 / -1;
  text-align: center;
  margin-bottom: 2rem;
}

.info-hub__title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 1rem;
}

.info-hub__description {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.info-hub__content {
  grid-column: 1;
}

.info-hub__controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-btn {
  padding: 0.5rem 1rem;
  border: 2px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text-secondary);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.category-btn:hover,
.category-btn.active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: white;
}

.category-section {
  margin-bottom: 3rem;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.category-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--color-primary);
}

.category-description {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
}

.guides-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.guide-card {
  background: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.guide-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.guide-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.guide-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  flex: 1;
}

.guide-difficulty {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  margin-left: 0.5rem;
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

.guide-description {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.guide-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.read-time,
.last-updated {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.meta-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.guide-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.5rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.related-tools {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 1rem;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.tool-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem;
  background: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
}

.tool-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.tool-icon {
  width: 2rem;
  height: 2rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.tool-name {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.tool-description {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.info-hub__ad {
  grid-column: 2;
  position: sticky;
  top: 2rem;
  height: fit-content;
}

@media (max-width: 1024px) {
  .info-hub {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .info-hub__ad {
    grid-column: 1;
    position: static;
    margin-top: 2rem;
  }
}

@media (max-width: 768px) {
  .info-hub__title {
    font-size: 2rem;
  }

  .guides-grid {
    grid-template-columns: 1fr;
  }

  .tools-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .category-filter {
    justify-content: center;
  }
}
</style>