<template>
  <div class="performance-tips">
    <div class="tips-header">
      <h3>{{ t('performanceTips.title') }}</h3>
      <p>{{ t('performanceTips.subtitle') }}</p>
    </div>

    <!-- Performance Monitor -->
    <div class="performance-monitor">
      <h4>{{ t('performanceTips.monitor.title') }}</h4>
      <p>{{ t('performanceTips.monitor.description') }}</p>
      
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon">📄</div>
          <div class="metric-info">
            <div class="metric-label">{{ t('performanceTips.monitor.fileSize') }}</div>
            <div class="metric-value">2.3 MB</div>
            <div class="metric-status optimal">{{ t('performanceTips.optimal') }}</div>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon">🌳</div>
          <div class="metric-info">
            <div class="metric-label">{{ t('performanceTips.monitor.nodeCount') }}</div>
            <div class="metric-value">1,247</div>
            <div class="metric-status warning">{{ t('performanceTips.warning') }}</div>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon">⚡</div>
          <div class="metric-info">
            <div class="metric-label">{{ t('performanceTips.monitor.parseTime') }}</div>
            <div class="metric-value">156ms</div>
            <div class="metric-status optimal">{{ t('performanceTips.optimal') }}</div>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon">💾</div>
          <div class="metric-info">
            <div class="metric-label">{{ t('performanceTips.monitor.memoryUsage') }}</div>
            <div class="metric-value">45 MB</div>
            <div class="metric-status optimal">{{ t('performanceTips.optimal') }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Categories -->
    <div class="performance-categories">
      <div
        v-for="(category, key) in performanceCategories"
        :key="key"
        class="category-section"
      >
        <div class="category-header">
          <div class="category-icon">{{ category.icon }}</div>
          <div class="category-info">
            <h4>{{ t(`performanceTips.categories.${key}.title`) }}</h4>
            <p>{{ t(`performanceTips.categories.${key}.description`) }}</p>
          </div>
        </div>

        <div class="category-tips">
          <div
            v-for="(tip, tipKey) in category.tips"
            :key="tipKey"
            class="tip-item"
          >
            <div class="tip-header">
              <h5>{{ t(`performanceTips.categories.${key}.tips.${tipKey}.title`) }}</h5>
              <div class="tip-metrics" v-if="tip.metrics">
                <span class="metric-badge" v-for="metric in tip.metrics" :key="metric.key">
                  {{ t(`performanceTips.${metric.key}`) }}: {{ metric.value }}
                </span>
              </div>
            </div>
            
            <p class="tip-description">
              {{ t(`performanceTips.categories.${key}.tips.${tipKey}.description`) }}
            </p>

            <div v-if="tip.actions" class="tip-actions">
              <div class="actions-label">{{ t('performanceTips.actions') }}:</div>
              <ul class="actions-list">
                <li v-for="(action, actionKey) in tip.actions" :key="actionKey">
                  {{ t(`performanceTips.categories.${key}.tips.${tipKey}.actions.${actionKey}`) }}
                </li>
              </ul>
            </div>

            <div v-if="tip.example" class="tip-example">
              <div class="example-label">{{ t('performanceTips.example') }}</div>
              <div class="example-content">
                <pre><code>{{ tip.example }}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Thresholds -->
    <div class="performance-thresholds">
      <h4>{{ t('performanceTips.metrics') }}</h4>
      <div class="thresholds-grid">
        <div class="threshold-item">
          <div class="threshold-label">{{ t('performanceTips.lazyLoading') }}</div>
          <div class="threshold-value">
            <span class="threshold-number">50+</span>
            <span class="threshold-unit">{{ t('performanceTips.threshold') }}</span>
          </div>
        </div>
        
        <div class="threshold-item">
          <div class="threshold-label">{{ t('performanceTips.batchSize') }}</div>
          <div class="threshold-value">
            <span class="threshold-number">25</span>
            <span class="threshold-unit">nodes</span>
          </div>
        </div>
        
        <div class="threshold-item">
          <div class="threshold-label">{{ t('performanceTips.cacheSize') }}</div>
          <div class="threshold-value">
            <span class="threshold-number">10</span>
            <span class="threshold-unit">items</span>
          </div>
        </div>
        
        <div class="threshold-item">
          <div class="threshold-label">{{ t('performanceTips.cacheExpiry') }}</div>
          <div class="threshold-value">
            <span class="threshold-number">5</span>
            <span class="threshold-unit">min</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()

interface PerformanceTip {
  metrics?: Array<{ key: string; value: string }>
  actions?: Record<string, string>
  example?: string
}

interface PerformanceCategory {
  icon: string
  tips: Record<string, PerformanceTip>
}

const performanceCategories: Record<string, PerformanceCategory> = {
  fileSize: {
    icon: '📁',
    tips: {
      largeFiles: {
        metrics: [
          { key: 'recommended', value: '< 5MB' },
          { key: 'maximum', value: '10MB' }
        ],
        actions: {
          split: 'Split into chunks',
          compress: 'Remove unnecessary data',
          sample: 'Test with samples'
        }
      },
      jsonlStreaming: {
        example: `// Instead of one large JSON file:
{
  "data": [
    {"id": 1, "name": "Item 1"},
    {"id": 2, "name": "Item 2"},
    // ... thousands more
  ]
}

// Use JSONL format:
{"id": 1, "name": "Item 1"}
{"id": 2, "name": "Item 2"}
{"id": 3, "name": "Item 3"}`
      }
    }
  },
  structure: {
    icon: '🏗️',
    tips: {
      deepNesting: {
        metrics: [
          { key: 'recommended', value: '< 5 levels' },
          { key: 'maximum', value: '10 levels' }
        ],
        example: `// Avoid deep nesting:
{
  "level1": {
    "level2": {
      "level3": {
        "level4": {
          "level5": {
            "data": "too deep!"
          }
        }
      }
    }
  }
}

// Better structure:
{
  "id": "item1",
  "data": "accessible",
  "metadata": {
    "created": "2024-01-01",
    "tags": ["important"]
  }
}`
      },
      arraySize: {
        metrics: [
          { key: 'lazyLoading', value: '50+ items' }
        ]
      }
    }
  },
  memory: {
    icon: '💾',
    tips: {
      browserLimits: {
        metrics: [
          { key: 'warning', value: '> 100MB' },
          { key: 'critical', value: '> 500MB' }
        ],
        actions: {
          close: 'Close unused tabs',
          reduce: 'Reduce data size',
          refresh: 'Refresh page'
        }
      },
      caching: {
        metrics: [
          { key: 'cacheSize', value: '10 items' },
          { key: 'cacheExpiry', value: '5 minutes' }
        ]
      }
    }
  },
  rendering: {
    icon: '🎨',
    tips: {
      lazyLoading: {
        metrics: [
          { key: 'threshold', value: '50 nodes' }
        ]
      },
      expandLevels: {
        actions: {
          selective: 'Expand selectively',
          levels: 'Use level controls',
          collapse: 'Collapse unused'
        },
        example: `// Instead of expanding everything:
expandAll() // ❌ Can be slow

// Use selective expansion:
expandToLevel(2) // ✅ Better performance
expandNode(specificNodeId) // ✅ Only what you need`
      }
    }
  }
}
</script>

<style scoped>
.performance-tips {
  padding: 0;
}

.tips-header {
  margin-bottom: 2rem;
}

.tips-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.tips-header p {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.performance-monitor {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.performance-monitor h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.performance-monitor p {
  margin: 0 0 1.5rem 0;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 1rem;
}

.metric-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.metric-info {
  flex: 1;
}

.metric-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
}

.metric-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 0.25rem;
}

.metric-status {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
  font-weight: 500;
}

.metric-status.optimal {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.metric-status.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.metric-status.critical {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.performance-categories {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
}

.category-section {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  overflow: hidden;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.category-icon {
  font-size: 1.5rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: white;
  border-radius: 0.5rem;
  flex-shrink: 0;
}

.category-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.category-info p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.category-tips {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tip-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 1.25rem;
}

.tip-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.tip-header h5 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.tip-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.metric-badge {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.tip-description {
  margin: 0 0 1rem 0;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.tip-actions {
  margin: 1rem 0;
}

.actions-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.actions-list {
  margin: 0;
  padding-left: 1.5rem;
  color: var(--color-text-secondary);
}

.actions-list li {
  margin-bottom: 0.25rem;
  line-height: 1.5;
}

.tip-example {
  margin-top: 1rem;
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

.performance-thresholds {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.performance-thresholds h4 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.thresholds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.threshold-item {
  text-align: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 1rem;
}

.threshold-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}

.threshold-value {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.threshold-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.threshold-unit {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .tip-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .thresholds-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .category-header {
    padding: 1rem;
  }
  
  .category-tips {
    padding: 1rem;
  }
  
  .tip-item {
    padding: 1rem;
  }
}
</style>