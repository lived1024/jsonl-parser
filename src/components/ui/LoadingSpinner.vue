<template>
  <div v-if="isVisible" class="loading-overlay" role="dialog" aria-modal="true" aria-labelledby="loading-title">
    <div class="loading-content">
      <div class="spinner" aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
      </div>
      <h2 id="loading-title" class="loading-title">{{ computedTitle }}</h2>
      <p v-if="computedDescription" class="loading-description">{{ computedDescription }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../composables/useI18n'

interface Props {
  isVisible: boolean
  title?: string
  titleKey?: string
  description?: string
  descriptionKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  titleKey: 'status.loading',
  description: '',
  descriptionKey: ''
})

const { t } = useI18n()

const computedTitle = computed(() => {
  if (props.title) {
    return props.title
  }
  return t(props.titleKey)
})

const computedDescription = computed(() => {
  if (props.description) {
    return props.description
  }
  if (props.descriptionKey) {
    return t(props.descriptionKey)
  }
  return ''
})
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-out;
}

.loading-content {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  box-shadow: var(--shadow-lg);
  max-width: 320px;
  width: 90%;
}

.spinner {
  display: inline-block;
  margin-bottom: 1rem;
  color: var(--color-primary);
}

.spinner svg {
  animation: spin 1s linear infinite;
}

.loading-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.loading-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .loading-overlay {
    background: rgba(0, 0, 0, 0.8);
  }
}
</style>