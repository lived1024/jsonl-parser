<template>
  <div class="item-card" @click="$emit('click')">
    <div class="card-header">
      <div class="card-title-row">
        <div class="card-icon">
          <component :is="icon" :size="24" />
        </div>
        <div class="card-title-section">
          <h3 class="card-title">{{ title }}</h3>
        </div>
      </div>
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
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  min-width: 0;
  width: 100%;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
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
  display: flex;
  align-items: center;
}

.card-title {
  color: var(--color-text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
  width: 100%;
  justify-content: flex-start;
}

.meta-item {
  background: var(--color-background-primary);
  color: var(--color-text-secondary);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  border: 1px solid var(--color-border);
  white-space: nowrap;
  flex-shrink: 0;
  display: inline-block;
  min-width: fit-content;
  width: auto;
  box-sizing: border-box;
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

/* Sample library specific meta styles */
.meta-item.category-api {
  background: #e3f2fd;
  color: #1976d2;
  border-color: #bbdefb;
}

.meta-item.category-config {
  background: #f3e5f5;
  color: #7b1fa2;
  border-color: #e1bee7;
}

.meta-item.category-data {
  background: #e8f5e8;
  color: #388e3c;
  border-color: #c8e6c9;
}

.meta-item.category-complex {
  background: #fff3e0;
  color: #f57c00;
  border-color: #ffcc02;
}

.meta-item.difficulty-simple {
  background: #e8f5e8;
  color: #2e7d32;
  border-color: #c8e6c9;
}

.meta-item.difficulty-medium {
  background: #fff8e1;
  color: #f57c00;
  border-color: #ffcc02;
}

.meta-item.difficulty-complex {
  background: #ffebee;
  color: #d32f2f;
  border-color: #ffcdd2;
}

.meta-item.size-small {
  background: #f1f8e9;
  color: #558b2f;
  border-color: #dcedc8;
}

.meta-item.size-medium {
  background: #fff8e1;
  color: #f57c00;
  border-color: #ffcc02;
}

.meta-item.size-large {
  background: #fce4ec;
  color: #c2185b;
  border-color: #f8bbd9;
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
    padding: 1.25rem;
    border-radius: 12px;
    /* Better touch target */
    min-height: 120px;
  }
  
  .item-card:hover {
    transform: translateY(-1px);
  }
  
  .item-card:active {
    transform: scale(0.98);
  }
  
  .card-header {
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .card-title-row {
    gap: 0.75rem;
  }
  
  .card-icon {
    padding: 0.625rem;
    border-radius: 8px;
  }
  
  .card-title {
    font-size: 1.05rem;
    line-height: 1.4;
  }
  
  .card-description {
    font-size: 0.9rem;
    line-height: 1.6;
  }
  
  .card-meta {
    gap: 0.375rem;
  }
  
  .meta-item {
    padding: 0.375rem 0.75rem;
    font-size: 0.85rem;
    border-radius: 6px;
    /* Better touch targets for meta items */
    min-height: 28px;
    display: inline-flex;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .item-card {
    padding: 1rem;
    min-height: 100px;
  }
  
  .card-header {
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
  
  .card-title-row {
    gap: 0.5rem;
  }
  
  .card-icon {
    padding: 0.5rem;
  }
  
  .card-title {
    font-size: 1rem;
  }
  
  .card-description {
    font-size: 0.85rem;
  }
  
  .meta-item {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
    min-height: 26px;
  }
  
  .card-content {
    margin-bottom: 0.75rem;
  }
}

/* Touch device specific improvements */
@media (hover: none) and (pointer: coarse) {
  .item-card {
    /* Remove hover effects on touch devices */
    transition: transform 0.2s ease;
  }
  
  .item-card:hover {
    transform: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .item-card:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
}
</style>