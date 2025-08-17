<template>
  <div class="interactive-examples-widget">
    <h3 class="widget-title">
      <Play class="title-icon" />
      실습 예제
    </h3>
    <div class="examples-list">
      <div
        v-for="example in examples"
        :key="example.id"
        class="example-item"
      >
        <div class="example-header">
          <h4 class="example-title">{{ example.title }}</h4>
          <span class="example-type" :class="`type-${example.type}`">
            {{ example.type.toUpperCase() }}
          </span>
        </div>
        <p class="example-description">{{ example.description }}</p>
        <div class="example-actions">
          <button
            @click="loadExample(example)"
            class="load-btn"
            :title="`${example.title} 예제를 파서에서 열기`"
          >
            <ExternalLink class="btn-icon" />
            파서에서 열기
          </button>
          <button
            @click="copyExample(example.data)"
            class="copy-btn"
            :title="예제 데이터 복사"
          >
            <Copy class="btn-icon" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Play, ExternalLink, Copy } from 'lucide-vue-next'

interface InteractiveExample {
  id: string
  title: string
  description: string
  data: string
  type: 'json' | 'jsonl'
}

interface Props {
  examples: InteractiveExample[]
}

interface Emits {
  (e: 'load-example', example: InteractiveExample): void
  (e: 'copy-example', data: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const loadExample = (example: InteractiveExample) => {
  emit('load-example', example)
}

const copyExample = (data: string) => {
  emit('copy-example', data)
}
</script>

<style scoped>
.interactive-examples-widget {
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
}

.widget-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.title-icon {
  width: 1rem;
  height: 1rem;
  color: var(--color-primary);
}

.examples-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.example-item {
  background: var(--color-background-primary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 1rem;
  transition: all 0.2s;
}

.example-item:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.example-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.example-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-primary);
  flex: 1;
}

.example-type {
  padding: 0.2rem 0.4rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-left: 0.5rem;
}

.type-json {
  background: #e3f2fd;
  color: #1976d2;
}

.type-jsonl {
  background: #f3e5f5;
  color: #7b1fa2;
}

.example-description {
  margin: 0 0 0.75rem 0;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.example-actions {
  display: flex;
  gap: 0.5rem;
}

.load-btn,
.copy-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s;
}

.load-btn {
  background: var(--color-primary);
  color: white;
  flex: 1;
}

.load-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.copy-btn {
  background: var(--color-background-secondary);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  padding: 0.4rem;
}

.copy-btn:hover {
  background: var(--color-background-tertiary);
  border-color: var(--color-primary);
}

.btn-icon {
  width: 0.875rem;
  height: 0.875rem;
}

@media (max-width: 768px) {
  .interactive-examples-widget {
    padding: 1rem;
  }
  
  .examples-list {
    gap: 0.75rem;
  }
  
  .example-item {
    padding: 0.75rem;
  }
  
  .example-actions {
    flex-direction: column;
  }
  
  .load-btn {
    justify-content: center;
  }
}
</style>