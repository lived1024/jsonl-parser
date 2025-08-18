<template>
  <div class="related-tools-widget">
    <h3 class="widget-title">
      <Wrench class="title-icon" />
      관련 도구
    </h3>
    <div class="tools-list">
      <router-link
        v-for="tool in tools"
        :key="tool.id"
        :to="`/tools/${tool.id}`"
        class="tool-item"
        :title="tool.description"
      >
        <component :is="tool.icon" class="tool-icon" />
        <span class="tool-name">{{ tool.name }}</span>
        <ExternalLink class="external-icon" />
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Wrench, ExternalLink } from 'lucide-vue-next'

interface Tool {
  id: string
  name: string
  description: string
  icon: any
}

interface Props {
  tools: Tool[]
}

defineProps<Props>()
</script>

<style scoped>
.related-tools-widget {
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

.tools-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--color-background-primary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
}

.tool-item:hover {
  border-color: var(--color-primary);
  transform: translateX(2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tool-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-primary);
  flex-shrink: 0;
}

.tool-name {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.external-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--color-text-secondary);
  opacity: 0;
  transition: opacity 0.2s;
}

.tool-item:hover .external-icon {
  opacity: 1;
}

@media (max-width: 768px) {
  .related-tools-widget {
    padding: 1rem;
  }
  
  .tools-list {
    gap: 0.5rem;
  }
  
  .tool-item {
    padding: 0.5rem;
  }
}
</style>