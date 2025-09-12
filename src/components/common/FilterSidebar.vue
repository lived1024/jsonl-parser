<template>
  <div class="filter-sidebar">
    <div class="filter-header">
      <h3>{{ t('learn.filters.title') }}</h3>
      <button @click="clearAll" class="clear-button">
        {{ t('learn.filters.clearAll') }}
      </button>
    </div>
    
    <div class="filter-sections">
      <div 
        v-for="section in filterSections" 
        :key="section.key"
        class="filter-section"
      >
        <h4 class="section-title">{{ section.title }}</h4>
        
        <div class="filter-options">
          <label 
            v-for="option in section.options" 
            :key="option.key"
            class="filter-option"
          >
            <input
              :checked="modelValue[option.key]"
              type="checkbox"
              @change="updateFilter(option.key, $event)"
            />
            <span class="checkmark"></span>
            <span class="option-label">{{ option.label }}</span>
          </label>
        </div>
      </div>
    </div>
    
    <!-- Slot for additional content like search or progress -->
    <slot name="additional"></slot>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()

export interface FilterOption {
  key: string
  label: string
}

export interface FilterSection {
  key: string
  title: string
  options: FilterOption[]
}

interface Props {
  modelValue: Record<string, boolean>
  filterSections: FilterSection[]
}

interface Emits {
  (e: 'update:modelValue', value: Record<string, boolean>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const updateFilter = (key: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const newValue = { ...props.modelValue }
  newValue[key] = target.checked
  emit('update:modelValue', newValue)
}

const clearAll = () => {
  const newValue = { ...props.modelValue }
  Object.keys(newValue).forEach(key => {
    newValue[key] = false
  })
  emit('update:modelValue', newValue)
}
</script>

<style scoped>
.filter-sidebar {
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.filter-header h3 {
  color: var(--color-text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.clear-button {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.clear-button:hover {
  background: var(--color-background-primary);
}

.filter-section {
  margin-bottom: 1.5rem;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.section-title {
  color: var(--color-text-primary);
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.75rem 0;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.25rem 0;
  transition: color 0.2s;
}

.filter-option:hover {
  color: var(--color-primary);
}

.filter-option input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-border);
  border-radius: 3px;
  position: relative;
  transition: all 0.2s;
  flex-shrink: 0;
}

.filter-option input[type="checkbox"]:checked + .checkmark {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.filter-option input[type="checkbox"]:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.option-label {
  color: var(--color-text-primary);
  font-size: 0.9rem;
  user-select: none;
}

@media (max-width: 1024px) {
  .filter-sidebar {
    padding: 1rem;
  }
  
  .filter-header {
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
  }
  
  .filter-section {
    margin-bottom: 1rem;
  }
}

@media (max-width: 768px) {
  .filter-sidebar {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .filter-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .filter-header h3 {
    font-size: 1.125rem;
  }
  
  .clear-button {
    align-self: flex-start;
    padding: 0.5rem 1rem;
    background: var(--color-primary);
    color: white;
    border-radius: 6px;
    font-weight: 500;
  }
  
  .clear-button:hover {
    background: var(--color-primary-dark);
  }
  
  .filter-option {
    padding: 0.5rem 0;
    gap: 1rem;
  }
  
  .checkmark {
    width: 20px;
    height: 20px;
  }
  
  .option-label {
    font-size: 1rem;
    line-height: 1.4;
  }
  
  .section-title {
    font-size: 1.05rem;
    margin-bottom: 1rem;
  }
}

@media (max-width: 480px) {
  .filter-sidebar {
    padding: 0.75rem;
  }
  
  .filter-header h3 {
    font-size: 1rem;
  }
  
  .clear-button {
    font-size: 0.9rem;
    padding: 0.4rem 0.8rem;
  }
  
  .section-title {
    font-size: 1rem;
  }
  
  .option-label {
    font-size: 0.95rem;
  }
}
</style>