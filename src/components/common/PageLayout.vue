<template>
  <div class="page-layout">
    <!-- 페이지 본문 -->
    <div class="page-body">
      <div class="page-container">
        <aside v-if="$slots.sidebar" class="page-sidebar">
          <slot name="sidebar" />
        </aside>
        
        <main class="page-main" :class="{ 'full-width': !$slots.sidebar }">
          <!-- 페이지 제목 섹션 (메인 콘텐츠 영역 내부) -->
          <div class="page-header">
            <h1 class="page-title">{{ title }}</h1>
            <p v-if="description" class="page-description">{{ description }}</p>
          </div>
          
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

defineProps<Props>()
</script>

<style scoped>
.page-layout {
  min-height: 100%;
  background: var(--color-background-primary);
}

.page-header {
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.page-title {
  color: var(--color-text-primary);
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.page-description {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  margin: 0;
  line-height: 1.6;
}

.page-body {
  padding: 2rem 0;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  align-items: start;
}

.page-sidebar {
  position: sticky;
  top: 2rem;
}

.page-main {
  min-height: 400px;
}

.page-main.full-width {
  grid-column: 1 / -1;
}

@media (max-width: 1024px) {
  .page-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .page-sidebar {
    position: static;
    order: 2;
  }
  
  .page-main {
    order: 1;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 0 1rem;
  }
  
  .page-header {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .page-description {
    font-size: 1rem;
  }
  
  .page-body {
    padding: 1rem 0;
  }
}
</style>