<template>
  <div class="faq-section">
    <div class="faq-header">
      <h3>{{ t('faq.title') }}</h3>
      <p>{{ t('faq.subtitle') }}</p>
    </div>

    <div class="faq-controls">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('faq.searchPlaceholder')"
          class="search-input"
        />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="clear-search"
          :title="t('faq.clearSearch')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="category-filters">
        <button
          v-for="category in categories"
          :key="category"
          @click="selectedCategory = category"
          class="category-filter"
          :class="{ active: selectedCategory === category }"
        >
          {{ t(`faq.categories.${category}`) }}
        </button>
      </div>
    </div>

    <div class="faq-content">
      <div v-if="filteredFAQs.length === 0" class="no-results">
        <div class="no-results-icon">🔍</div>
        <h4>{{ t('faq.noResults') }}</h4>
        <p>{{ t('faq.noResultsDescription') }}</p>
        <button @click="clearFilters" class="clear-filters-btn">
          {{ t('faq.clearFilters') }}
        </button>
      </div>

      <div v-else class="faq-list">
        <div
          v-for="faq in filteredFAQs"
          :key="faq.id"
          class="faq-item"
          :class="{ expanded: expandedItems.has(faq.id) }"
        >
          <button
            @click="toggleFAQ(faq.id)"
            class="faq-question"
            :aria-expanded="expandedItems.has(faq.id)"
          >
            <span class="question-text">{{ t(`faq.items.${faq.id}.question`) }}</span>
            <span class="expand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6,9 12,15 18,9"/>
              </svg>
            </span>
          </button>
          
          <div v-if="expandedItems.has(faq.id)" class="faq-answer">
            <p>{{ t(`faq.items.${faq.id}.answer`) }}</p>
            
            <div v-if="faq.example" class="faq-example">
              <div class="example-label">{{ t('faq.example') }}</div>
              <div class="example-content">
                <pre><code>{{ faq.example }}</code></pre>
              </div>
            </div>

            <div v-if="faq.relatedLinks" class="related-links">
              <div class="related-label">{{ t('faq.relatedLinks') }}</div>
              <ul class="related-list">
                <li v-for="link in faq.relatedLinks" :key="link">
                  <button @click="scrollToFAQ(link)" class="related-link">
                    {{ t(`faq.items.${link}.question`) }}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()

const searchQuery = ref('')
const selectedCategory = ref('all')
const expandedItems = ref(new Set<string>())

interface FAQItem {
  id: string
  category: string
  example?: string
  relatedLinks?: string[]
}

const categories = ['all', 'basics', 'parsing', 'navigation', 'performance', 'troubleshooting']

const faqItems: FAQItem[] = [
  {
    id: 'whatIsJsonl',
    category: 'basics',
    example: '{"name": "John", "age": 30}\n{"name": "Jane", "age": 25}'
  },
  {
    id: 'jsonVsJsonl',
    category: 'basics',
    relatedLinks: ['whatIsJsonl', 'largeFiles']
  },
  {
    id: 'largeFiles',
    category: 'performance',
    relatedLinks: ['parsingErrors']
  },
  {
    id: 'parsingErrors',
    category: 'parsing',
    example: '{\n  "name": "John",  // ❌ Comments not allowed\n  "age": 30,      // ❌ Trailing comma\n}'
  },
  {
    id: 'keyboardShortcuts',
    category: 'navigation'
  },
  {
    id: 'dataPersistence',
    category: 'basics'
  }
]

const filteredFAQs = computed(() => {
  let filtered = faqItems

  // Category filter
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(faq => faq.category === selectedCategory.value)
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(faq => {
      const question = t(`faq.items.${faq.id}.question`).toLowerCase()
      const answer = t(`faq.items.${faq.id}.answer`).toLowerCase()
      return question.includes(query) || answer.includes(query)
    })
  }

  return filtered
})

const toggleFAQ = (id: string) => {
  if (expandedItems.value.has(id)) {
    expandedItems.value.delete(id)
  } else {
    expandedItems.value.add(id)
  }
}

const clearSearch = () => {
  searchQuery.value = ''
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = 'all'
}

const scrollToFAQ = (id: string) => {
  expandedItems.value.add(id)
  // In a real implementation, you would scroll to the FAQ item
}
</script>

<style scoped>
.faq-section {
  padding: 0;
}

.faq-header {
  margin-bottom: 2rem;
}

.faq-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.faq-header p {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.faq-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 2.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.clear-search {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.clear-search:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.category-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-filter {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-filter:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.category-filter.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.no-results {
  text-align: center;
  padding: 3rem 2rem;
}

.no-results-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.no-results h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.no-results p {
  margin: 0 0 1.5rem 0;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.clear-filters-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-filters-btn:hover {
  background: var(--color-primary-hover);
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.faq-item {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 0.2s ease;
}

.faq-item.expanded {
  border-color: var(--color-primary);
}

.faq-question {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.faq-question:hover {
  background: var(--color-surface-hover);
}

.question-text {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text-primary);
  line-height: 1.5;
}

.expand-icon {
  color: var(--color-text-secondary);
  transition: transform 0.2s ease;
  flex-shrink: 0;
  margin-left: 1rem;
}

.faq-item.expanded .expand-icon {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 0 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
}

.faq-answer p {
  margin: 1rem 0;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.faq-example {
  margin: 1.5rem 0;
}

.example-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.example-content {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  overflow-x: auto;
}

.example-content pre {
  margin: 0;
  padding: 1rem;
  font-family: 'Fira Code', 'Monaco', 'Cascadia Code', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-text-primary);
}

.related-links {
  margin: 1.5rem 0 0 0;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.related-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 0.75rem;
}

.related-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.related-list li {
  margin-bottom: 0.5rem;
}

.related-link {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: underline;
  text-align: left;
  padding: 0;
  transition: color 0.2s ease;
}

.related-link:hover {
  color: var(--color-primary-hover);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .search-box {
    max-width: none;
  }
  
  .faq-question {
    padding: 1rem;
  }
  
  .faq-answer {
    padding: 0 1rem 1rem 1rem;
  }
  
  .question-text {
    font-size: 0.875rem;
  }
}
</style>