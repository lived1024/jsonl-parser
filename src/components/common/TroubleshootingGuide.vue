<template>
  <div class="troubleshooting-guide">
    <div class="guide-header">
      <h3>{{ t('troubleshooting.title') }}</h3>
      <p>{{ t('troubleshooting.subtitle') }}</p>
    </div>

    <div class="guide-controls">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('troubleshooting.searchPlaceholder')"
          class="search-input"
        />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="clear-search"
          :title="t('troubleshooting.clearSearch')"
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
          {{ t(`troubleshooting.categories.${category}`) }}
        </button>
      </div>
    </div>

    <div class="guide-content">
      <div v-if="filteredProblems.length === 0" class="no-results">
        <div class="no-results-icon">🔍</div>
        <h4>{{ t('troubleshooting.noResults') }}</h4>
        <p>{{ t('troubleshooting.noResultsDescription') }}</p>
        <button @click="clearFilters" class="clear-filters-btn">
          {{ t('troubleshooting.clearFilters') }}
        </button>
      </div>

      <div v-else class="problems-list">
        <div
          v-for="problem in filteredProblems"
          :key="problem.id"
          class="problem-item"
          :class="{ expanded: expandedItems.has(problem.id) }"
        >
          <div class="problem-header" @click="toggleProblem(problem.id)">
            <div class="problem-info">
              <div class="problem-title">
                <span class="severity-indicator" :class="problem.severity"></span>
                {{ t(`troubleshooting.problems.${problem.id}.title`) }}
              </div>
              <div class="problem-description">
                {{ t(`troubleshooting.problems.${problem.id}.description`) }}
              </div>
              <div class="problem-meta">
                <span class="frequency-badge">
                  {{ t(`troubleshooting.frequency.${problem.frequency}`) }}
                </span>
              </div>
            </div>
            <button class="expand-button" :aria-expanded="expandedItems.has(problem.id)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6,9 12,15 18,9"/>
              </svg>
            </button>
          </div>

          <div v-if="expandedItems.has(problem.id)" class="problem-content">
            <!-- Quick Fixes -->
            <div class="solution-section">
              <h5>{{ t('troubleshooting.quickFix') }}</h5>
              <ul class="quick-fixes">
                <li v-for="(fix, key) in problem.quickFixes" :key="key">
                  {{ t(`troubleshooting.problems.${problem.id}.quickFixes.${key}`) }}
                </li>
              </ul>
            </div>

            <!-- Detailed Steps -->
            <div class="solution-section">
              <h5>{{ t('troubleshooting.detailedSteps') }}</h5>
              <ol class="detailed-steps">
                <li v-for="(step, key) in problem.steps" :key="key">
                  {{ t(`troubleshooting.problems.${problem.id}.steps.${key}`) }}
                </li>
              </ol>
            </div>

            <!-- Examples -->
            <div v-if="problem.examples" class="solution-section">
              <h5>{{ t('troubleshooting.example') }}</h5>
              <div class="example-grid">
                <div v-if="problem.examples.wrong" class="example-item wrong">
                  <div class="example-label">{{ t('troubleshooting.wrongExample') }}</div>
                  <div class="example-code">
                    <pre><code>{{ problem.examples.wrong }}</code></pre>
                  </div>
                </div>
                <div v-if="problem.examples.correct" class="example-item correct">
                  <div class="example-label">{{ t('troubleshooting.correctExample') }}</div>
                  <div class="example-code">
                    <pre><code>{{ problem.examples.correct }}</code></pre>
                  </div>
                </div>
              </div>
            </div>

            <!-- Prevention -->
            <div v-if="problem.prevention" class="solution-section">
              <h5>{{ t('troubleshooting.prevention') }}</h5>
              <ul class="prevention-tips">
                <li v-for="(tip, key) in problem.prevention" :key="key">
                  {{ t(`troubleshooting.problems.${problem.id}.prevention.${key}`) }}
                </li>
              </ul>
            </div>

            <!-- Related Problems -->
            <div v-if="problem.relatedProblems" class="solution-section">
              <h5>{{ t('troubleshooting.relatedProblems') }}</h5>
              <div class="related-problems">
                <button
                  v-for="relatedId in problem.relatedProblems"
                  :key="relatedId"
                  @click="scrollToProblem(relatedId)"
                  class="related-problem-link"
                >
                  {{ t(`troubleshooting.problems.${relatedId}.title`) }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Help Section -->
    <div class="help-section">
      <h4>{{ t('troubleshooting.stillNeedHelp') }}</h4>
      <p>{{ t('troubleshooting.contactDescription') }}</p>
      <div class="help-actions">
        <button class="help-action-btn primary">
          {{ t('troubleshooting.checkFAQ') }}
        </button>
        <button class="help-action-btn secondary">
          {{ t('troubleshooting.reportIssue') }}
        </button>
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

interface Problem {
  id: string
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  frequency: 'rare' | 'occasional' | 'common' | 'frequent'
  quickFixes: Record<string, string>
  steps: Record<string, string>
  examples?: {
    wrong?: string
    correct?: string
  }
  prevention?: Record<string, string>
  relatedProblems?: string[]
}

const categories = ['all', 'parsing', 'display', 'performance', 'navigation', 'input']

const problems: Problem[] = [
  {
    id: 'jsonSyntaxError',
    category: 'parsing',
    severity: 'high',
    frequency: 'common',
    quickFixes: {
      checkCommas: 'Check commas',
      checkQuotes: 'Check quotes',
      checkBrackets: 'Check brackets'
    },
    steps: {
      locate: 'Locate error position',
      identify: 'Identify error type',
      fix: 'Fix syntax error',
      validate: 'Validate fix'
    },
    examples: {
      wrong: `{
  "name": "John",
  "age": 30,  // ❌ Trailing comma
}`,
      correct: `{
  "name": "John",
  "age": 30
}`
    },
    prevention: {
      validator: 'Use JSON validators',
      formatter: 'Use JSON formatters',
      careful: 'Edit carefully'
    },
    relatedProblems: ['jsonlNotDetected']
  },
  {
    id: 'largeFileSlow',
    category: 'performance',
    severity: 'medium',
    frequency: 'occasional',
    quickFixes: {
      reduce: 'Reduce file size',
      collapse: 'Collapse nodes',
      refresh: 'Refresh page'
    },
    steps: {
      check: 'Check file size',
      split: 'Split file',
      optimize: 'Remove unnecessary data',
      monitor: 'Monitor performance'
    },
    prevention: {
      limit: 'Keep under 5MB',
      jsonl: 'Use JSONL format',
      sample: 'Test with samples'
    },
    relatedProblems: ['memoryError']
  },
  {
    id: 'treeNotExpanding',
    category: 'navigation',
    severity: 'medium',
    frequency: 'occasional',
    quickFixes: {
      click: 'Click node icon',
      keyboard: 'Use keyboard',
      refresh: 'Refresh page'
    },
    steps: {
      verify: 'Verify child elements',
      try: 'Try other nodes',
      check: 'Check console',
      reload: 'Reload page'
    }
  },
  {
    id: 'jsonlNotDetected',
    category: 'parsing',
    severity: 'medium',
    frequency: 'common',
    quickFixes: {
      manual: 'Select JSONL manually',
      format: 'Check line format',
      validate: 'Check line breaks'
    },
    relatedProblems: ['jsonSyntaxError']
  },
  {
    id: 'memoryError',
    category: 'performance',
    severity: 'critical',
    frequency: 'rare',
    quickFixes: {
      close: 'Close tabs',
      reduce: 'Reduce data',
      restart: 'Restart browser'
    },
    steps: {
      save: 'Save work',
      close: 'Close unused tabs',
      restart: 'Restart browser',
      reduce: 'Use smaller data'
    },
    prevention: {
      monitor: 'Monitor memory',
      limit: 'Follow limits',
      close: 'Clean up tabs'
    },
    relatedProblems: ['largeFileSlow']
  }
]

const filteredProblems = computed(() => {
  let filtered = problems

  // Category filter
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(problem => problem.category === selectedCategory.value)
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(problem => {
      const title = t(`troubleshooting.problems.${problem.id}.title`).toLowerCase()
      const description = t(`troubleshooting.problems.${problem.id}.description`).toLowerCase()
      return title.includes(query) || description.includes(query)
    })
  }

  return filtered
})

const toggleProblem = (id: string) => {
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

const scrollToProblem = (id: string) => {
  expandedItems.value.add(id)
  // In a real implementation, you would scroll to the problem item
}
</script>

<style scoped>
.troubleshooting-guide {
  padding: 0;
}

.guide-header {
  margin-bottom: 2rem;
}

.guide-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.guide-header p {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.guide-controls {
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

.problems-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.problem-item {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 0.2s ease;
}

.problem-item.expanded {
  border-color: var(--color-primary);
}

.problem-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.problem-header:hover {
  background: var(--color-surface-hover);
}

.problem-info {
  flex: 1;
}

.problem-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.severity-indicator {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.severity-indicator.low { background: #10b981; }
.severity-indicator.medium { background: #f59e0b; }
.severity-indicator.high { background: #ef4444; }
.severity-indicator.critical { background: #dc2626; }

.problem-description {
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-bottom: 0.75rem;
}

.problem-meta {
  display: flex;
  gap: 0.5rem;
}

.frequency-badge {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.expand-button {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-left: 1rem;
}

.expand-button:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.problem-item.expanded .expand-button svg {
  transform: rotate(180deg);
}

.problem-content {
  padding: 0 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
}

.solution-section {
  margin: 1.5rem 0;
}

.solution-section:first-child {
  margin-top: 1.5rem;
}

.solution-section h5 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.quick-fixes,
.detailed-steps,
.prevention-tips {
  margin: 0;
  padding-left: 1.5rem;
  color: var(--color-text-secondary);
}

.quick-fixes li,
.detailed-steps li,
.prevention-tips li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.example-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.example-item {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  overflow: hidden;
}

.example-label {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-bottom: 1px solid var(--color-border);
}

.example-item.wrong .example-label {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.example-item.correct .example-label {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.example-code {
  padding: 0.75rem;
}

.example-code pre {
  margin: 0;
  font-family: 'Fira Code', 'Monaco', 'Cascadia Code', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-text-primary);
}

.related-problems {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.related-problem-link {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: var(--color-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.related-problem-link:hover {
  background: var(--color-primary);
  color: white;
}

.help-section {
  margin-top: 3rem;
  padding: 2rem;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  text-align: center;
}

.help-section h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.help-section p {
  margin: 0 0 1.5rem 0;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.help-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.help-action-btn {
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.help-action-btn.primary {
  background: var(--color-primary);
  color: white;
}

.help-action-btn.primary:hover {
  background: var(--color-primary-hover);
}

.help-action-btn.secondary {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.help-action-btn.secondary:hover {
  background: var(--color-surface-hover);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .search-box {
    max-width: none;
  }
  
  .example-grid {
    grid-template-columns: 1fr;
  }
  
  .help-actions {
    flex-direction: column;
  }
  
  .problem-header {
    padding: 1rem;
  }
  
  .problem-content {
    padding: 0 1rem 1rem 1rem;
  }
}
</style>