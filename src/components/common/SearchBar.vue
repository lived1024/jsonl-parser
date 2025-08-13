<template>
  <div class="search-bar">
    <div class="search-wrapper">
      <Search :size="20" class="search-icon" />
      <input
        :value="modelValue"
        type="text"
        :placeholder="placeholder"
        class="search-input"
        @input="updateValue"
        @keydown.escape="clearSearch"
      />
      <button 
        v-if="modelValue" 
        @click="clearSearch"
        class="clear-button"
        title="검색어 지우기"
      >
        <X :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, X } from 'lucide-vue-next'

interface Props {
  modelValue: string
  placeholder?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '검색...'
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
  .search-wrapper {
    max-width: 100%;
  }
  
  .search-input {
    padding: 0.75rem 1rem 0.75rem 2.75rem;
    font-size: 0.9rem;
  }
  
  .search-icon {
    left: 0.875rem;
  }
  
  .clear-button {
    right: 0.875rem;
  }
}
</style>