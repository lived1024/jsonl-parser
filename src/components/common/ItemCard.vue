<template>
  <div class="item-card" @click="$emit('click')">
    <div class="card-header">
      <div class="card-icon">
        <component :is="icon" :size="24" />
      </div>
      <div class="card-title-section">
        <h3 class="card-title">{{ title }}</h3>
        <div v-if="meta && meta.length > 0" class="card-meta">
          <span 
            v-for="metaItem in meta" 
            :key="metaItem.key"
            class="meta-item"
            :class="metaItem.type"
          >
            {{ metaItem.label }}
          </span>
        </div>
      </div>
    </div>
    
    <div class="card-content">
      <p class="card-description">{{ description }}</p>
    </div>
    
    <div v-if="$slots.actions" class="card-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface MetaItem {
  key: string
  label: string
  type?: string
}

interface Props {
  title: string
  description: string
  icon: any
  meta?: MetaItem[]
}

interface Emits {
  (e: 'click'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.item-card {
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.item-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.card-icon {
  color: var(--color-primary);
  flex-shrink: 0;
  padding: 0.5rem;
  background: var(--color-background-primary);
  border-radius: 6px;
  border: 1px solid var(--color-border);
}

.card-title-section {
  flex: 1;
  min-width: 0;
}

.card-title {
  color: var(--color-text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.meta-item {
  background: var(--color-background-primary);
  color: var(--color-text-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  border: 1px solid var(--color-border);
}

.meta-item.category-cheatsheet {
  background: #e3f2fd;
  color: #1565c0;
  border-color: #bbdefb;
}

.meta-item.category-troubleshooting {
  background: #fff3e0;
  color: #ef6c00;
  border-color: #ffcc02;
}

.meta-item.category-performance {
  background: #e8f5e8;
  color: #2e7d32;
  border-color: #c8e6c9;
}

.meta-item.category-guide {
  background: #f3e5f5;
  color: #7b1fa2;
  border-color: #e1bee7;
}

.card-content {
  flex: 1;
  margin-bottom: 1rem;
}

.card-description {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.card-actions {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

@media (max-width: 768px) {
  .item-card {
    padding: 1rem;
  }
  
  .card-header {
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }
  
  .card-title {
    font-size: 1rem;
  }
  
  .card-description {
    font-size: 0.85rem;
  }
}
</style>