<template>
  <div class="data-type-guide">
    <div class="guide-intro">
      <h3>{{ t('dataTypeGuide.title') }}</h3>
      <p>{{ t('dataTypeGuide.subtitle') }}</p>
    </div>

    <div class="type-sections">
      <div 
        v-for="(type, key) in dataTypes" 
        :key="key" 
        class="type-section"
      >
        <div class="type-header">
          <div class="type-icon" :class="`type-${key}`">
            {{ type.icon }}
          </div>
          <div class="type-info">
            <h4>{{ t(`dataTypeGuide.types.${key}.name`) }}</h4>
            <p>{{ t(`dataTypeGuide.types.${key}.description`) }}</p>
          </div>
        </div>

        <div class="type-content">
          <!-- Examples -->
          <div class="content-section">
            <h5>{{ t('dataTypeGuide.examples') }}</h5>
            <div class="examples-grid">
              <div 
                v-for="(example, exampleKey) in type.examples" 
                :key="exampleKey"
                class="example-item"
              >
                <div class="example-label">
                  {{ t(`dataTypeGuide.types.${key}.examples.${exampleKey}`) }}
                </div>
                <div class="example-code">
                  <code>{{ example }}</code>
                </div>
              </div>
            </div>
          </div>

          <!-- Rules -->
          <div class="content-section">
            <h5>{{ t('dataTypeGuide.rules') }}</h5>
            <ul class="rules-list">
              <li v-for="(rule, index) in type.rules" :key="index">
                {{ t(`dataTypeGuide.types.${key}.rules.${index}`) }}
              </li>
            </ul>
          </div>

          <!-- Tips -->
          <div class="content-section">
            <h5>{{ t('dataTypeGuide.tips') }}</h5>
            <ul class="tips-list">
              <li v-for="(tip, index) in type.tips" :key="index">
                {{ t(`dataTypeGuide.types.${key}.tips.${index}`) }}
              </li>
            </ul>
          </div>

          <!-- Common Errors (if any) -->
          <div v-if="type.commonErrors" class="content-section">
            <h5>{{ t('dataTypeGuide.commonErrors') }}</h5>
            <div class="error-examples">
              <div class="error-item">
                <div class="error-label wrong">{{ t('dataTypeGuide.wrong') }}</div>
                <div class="error-code">
                  <code>{{ type.commonErrors.wrong }}</code>
                </div>
              </div>
              <div class="error-item">
                <div class="error-label correct">{{ t('dataTypeGuide.correct') }}</div>
                <div class="error-code">
                  <code>{{ type.commonErrors.correct }}</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Nesting Section -->
    <div class="nesting-section">
      <h3>{{ t('dataTypeGuide.nesting.title') }}</h3>
      <p>{{ t('dataTypeGuide.nesting.description') }}</p>
      <div class="nesting-example">
        <pre><code>{{nestingExample}}</code></pre>
      </div>
    </div>

    <!-- Validation Tips -->
    <div class="validation-section">
      <h3>{{ t('dataTypeGuide.validation.title') }}</h3>
      <ul class="validation-tips">
        <li v-for="(tip, index) in validationTips" :key="index">
          {{ t(`dataTypeGuide.validation.tips.${index}`) }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()

interface DataType {
  icon: string
  examples: Record<string, string>
  rules: string[]
  tips: string[]
  commonErrors?: {
    wrong: string
    correct: string
  }
}

const dataTypes: Record<string, DataType> = {
  string: {
    icon: '📝',
    examples: {
      basic: '"Hello World"',
      empty: '""',
      special: '"Line 1\\nLine 2\\tTabbed"',
      unicode: '"안녕하세요 🌍"'
    },
    rules: ['Must be enclosed in double quotes', 'Escape special characters', 'Unicode support'],
    tips: ['Use \\n for newlines', 'Single quotes are invalid'],
    commonErrors: {
      wrong: "'single quotes'",
      correct: '"double quotes"'
    }
  },
  number: {
    icon: '🔢',
    examples: {
      integer: '42',
      decimal: '3.14159',
      negative: '-273.15',
      scientific: '1.23e-4'
    },
    rules: ['No quotes', 'Use period for decimal', 'Scientific notation supported'],
    tips: ['Large numbers may lose precision', 'Infinity/NaN are invalid']
  },
  boolean: {
    icon: '✅',
    examples: {
      true: 'true',
      false: 'false'
    },
    rules: ['Lowercase only', 'No quotes'],
    tips: ['Used for conditional logic', 'Useful for flags'],
    commonErrors: {
      wrong: 'True',
      correct: 'true'
    }
  },
  null: {
    icon: '∅',
    examples: {
      basic: 'null'
    },
    rules: ['Lowercase only', 'No quotes'],
    tips: ['Represents missing values', 'undefined is invalid'],
    commonErrors: {
      wrong: 'undefined',
      correct: 'null'
    }
  },
  array: {
    icon: '📋',
    examples: {
      numbers: '[1, 2, 3, 4, 5]',
      strings: '["apple", "banana", "cherry"]',
      mixed: '[1, "text", true, null]',
      empty: '[]'
    },
    rules: ['Square brackets []', 'Comma separated', 'No trailing comma'],
    tips: ['Order matters', 'Nesting allowed'],
    commonErrors: {
      wrong: '[1, 2, 3,]',
      correct: '[1, 2, 3]'
    }
  },
  object: {
    icon: '🗂️',
    examples: {
      simple: '{"name": "John", "age": 30}',
      nested: '{"user": {"id": 1, "profile": {"name": "John"}}}',
      empty: '{}'
    },
    rules: ['Curly braces {}', 'String keys only', 'Colon separator', 'Comma separated pairs'],
    tips: ['Key order not guaranteed', 'Deep nesting possible'],
    commonErrors: {
      wrong: '{name: "John"}',
      correct: '{"name": "John"}'
    }
  }
}

const nestingExample = `{
  "company": {
    "name": "Tech Corp",
    "employees": [
      {
        "id": 1,
        "name": "Alice",
        "skills": ["JavaScript", "Python"],
        "contact": {
          "email": "alice@techcorp.com",
          "phone": "+1-555-0123"
        }
      },
      {
        "id": 2,
        "name": "Bob",
        "skills": ["Java", "Go"],
        "contact": {
          "email": "bob@techcorp.com",
          "phone": "+1-555-0124"
        }
      }
    ]
  }
}`

const validationTips = [
  'Check bracket matching',
  'Verify string quotes',
  'Remove trailing commas',
  'Validate data types',
  'Test overall structure'
]
</script>

<style scoped>
.data-type-guide {
  padding: 0;
}

.guide-intro {
  margin-bottom: 2rem;
}

.guide-intro h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.guide-intro p {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.type-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.type-section {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  overflow: hidden;
}

.type-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.type-icon {
  font-size: 1.5rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  flex-shrink: 0;
}

.type-icon.type-string { background: rgba(59, 130, 246, 0.1); }
.type-icon.type-number { background: rgba(16, 185, 129, 0.1); }
.type-icon.type-boolean { background: rgba(245, 158, 11, 0.1); }
.type-icon.type-null { background: rgba(107, 114, 128, 0.1); }
.type-icon.type-array { background: rgba(139, 92, 246, 0.1); }
.type-icon.type-object { background: rgba(236, 72, 153, 0.1); }

.type-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.type-info p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.type-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.content-section h5 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.example-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  overflow: hidden;
}

.example-label {
  padding: 0.5rem 0.75rem;
  background: var(--color-surface-elevated);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
}

.example-code {
  padding: 0.75rem;
}

.example-code code {
  font-family: 'Fira Code', 'Monaco', 'Cascadia Code', monospace;
  font-size: 0.875rem;
  color: var(--color-text-primary);
}

.rules-list,
.tips-list,
.validation-tips {
  margin: 0;
  padding-left: 1.5rem;
  color: var(--color-text-secondary);
}

.rules-list li,
.tips-list li,
.validation-tips li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.error-examples {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.error-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  overflow: hidden;
}

.error-label {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-bottom: 1px solid var(--color-border);
}

.error-label.wrong {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.error-label.correct {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.error-code {
  padding: 0.75rem;
}

.error-code code {
  font-family: 'Fira Code', 'Monaco', 'Cascadia Code', monospace;
  font-size: 0.875rem;
  color: var(--color-text-primary);
}

.nesting-section,
.validation-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}

.nesting-section h3,
.validation-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.nesting-section p {
  margin: 0 0 1rem 0;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.nesting-example {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  overflow-x: auto;
}

.nesting-example pre {
  margin: 0;
  padding: 1rem;
  font-family: 'Fira Code', 'Monaco', 'Cascadia Code', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-text-primary);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .examples-grid {
    grid-template-columns: 1fr;
  }
  
  .error-examples {
    grid-template-columns: 1fr;
  }
  
  .type-header {
    padding: 1rem;
  }
  
  .type-content {
    padding: 1rem;
  }
}
</style>