<template>
  <div class="search-bar">
    <div class="search-wrapper">
      <Search :size="20" class="search-icon" />
      <input
        :value="modelValue"
        type="text"
        :placeholder="computedPlaceholder"
        class="search-input"
        @input="updateValue"
        @keydown.escape="clearSearch"
      />
      <button 
        v-if="modelValue" 
        @click="clearSearch"
        class="clear-button"
        :title="t('faq.clearSearch')"
      >
        <X :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Search, X } from 'lucide-vue-next'
import { useI18n } from '../../composables/useI18n'

interface Props {
  modelValue: string
  placeholder?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: ''
})

const { t } = useI18n()

const computedPlaceholder = computed(() => {
  return props.placeholder || t('faq.searchPlaceholder')
})

const emit = defineEmits<Emits>()

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const clearSearch = () => {
  emit('update:modelValue', '')
}
</script>

<style scoped>
.search-bar {
  margin-bottom: 2rem;
}

.search-wrapper {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  font-size: 1rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.search-input::placeholder {
  color: var(--color-text-secondary);
}

.clear-button {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-button:hover {
  color: var(--color-text-primary);
  background: var(--color-background-secondary);
}

@media (max-width: 768px) {
  .search-bar {
    margin-bottom: 1.5rem;
  }
  
  .search-wrapper {
    max-width: 100%;
  }
  
  .search-input {
    padding: 1rem 3.5rem 1rem 3rem;
    font-size: 16px; /* Prevent zoom on iOS */
    border-radius: 12px;
    min-height: 48px;
    border-width: 2px;
  }
  
  .search-input:focus {
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
  
  .search-icon {
    left: 1rem;
    width: 18px;
    height: 18px;
  }
  
  .clear-button {
    right: 1rem;
    padding: 0.5rem;
    min-width: 32px;
    min-height: 32px;
    border-radius: 6px;
  }
  
  .clear-button:hover {
    background: var(--color-background-tertiary);
  }
}

@media (max-width: 480px) {
  .search-bar {
    margin-bottom: 1rem;
  }
  
  .search-input {
    padding: 0.875rem 3rem 0.875rem 2.75rem;
    font-size: 16px;
    min-height: 44px;
  }
  
  .search-icon {
    left: 0.875rem;
    width: 16px;
    height: 16px;
  }
  
  .clear-button {
    right: 0.875rem;
    padding: 0.375rem;
    min-width: 28px;
    min-height: 28px;
  }
}

/* Touch-specific improvements */
@media (hover: none) and (pointer: coarse) {
  .clear-button:hover {
    background: none;
  }
  
  .clear-button:active {
    background: var(--color-background-tertiary);
    transform: translateY(-50%) scale(0.95);
  }
  
  .search-input {
    /* Better touch interaction */
    -webkit-appearance: none;
    -webkit-border-radius: 12px;
  }
}
</style>