<template>
  <div class="item-grid">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>로딩 중...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p>오류가 발생했습니다.</p>
      <button @click="$emit('retry')" class="retry-button">
        다시 시도
      </button>
    </div>
    
    <div v-else-if="items.length === 0" class="empty-state">
      <p>{{ emptyText }}</p>
      <button v-if="onReset" @click="onReset" class="reset-button">
        {{ resetButtonText }}
      </button>
    </div>
    
    <div v-else class="grid-container">
      <template v-for="(item, index) in items" :key="getItemKey(item, index)">
        <div class="grid-item">
          <slot name="item" :item="item" :index="index" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  items: any[]
  loading?: boolean
  error?: boolean
  emptyText?: string
  resetButtonText?: string
  showAd?: boolean
  adAfterIndex?: number
  onReset?: () => void
}

interface Emits {
  (e: 'retry'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: false,
  emptyText: '항목이 없습니다.',
  resetButtonText: '초기화',
  showAd: false
})

defineEmits<Emits>()

const getItemKey = (item: any, index: number) => {
  return item.id || item.key || index
}
</script>

<style scoped>
.item-grid {
  width: 100%;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-button,
.reset-button {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 1rem;
  transition: background-color 0.2s;
}

.retry-button:hover,
.reset-button:hover {
  background: var(--color-primary-dark);
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  align-items: start;
}

.grid-item {
  width: 100%;
}

.grid-ad {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .loading-state,
  .error-state,
  .empty-state {
    padding: 2rem 1rem;
  }
}

@media (max-width: 480px) {
  .grid-container {
    gap: 0.75rem;
  }
}
</style>