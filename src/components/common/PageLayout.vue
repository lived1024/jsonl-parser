<template>
  <div class="page-layout">
    <!-- 페이지 제목 섹션 (DefaultLayout 헤더 아래) -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">{{ title }}</h1>
        <p v-if="description" class="page-description">{{ description }}</p>
      </div>
    </div>
    
    <!-- 페이지 본문 -->
    <div class="page-body">
      <div class="page-container">
        <aside v-if="$slots.sidebar" class="page-sidebar">
          <slot name="sidebar" />
        </aside>
        
        <main class="page-main" :class="{ 'full-width': !$slots.sidebar }">
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
  border-bottom: 1px solid var(--color-border);
  padding: 1.5rem 0;
  margin-bottom: 1rem;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
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
  .header-content,
  .page-container {
    padding: 0 1rem;
  }
  
  .page-title {
    font-size: 1.75rem;
    line-height: 1.3;
  }
  
  .page-description {
    font-size: 1rem;
    line-height: 1.5;
  }
  
  .page-body {
    padding: 1rem 0;
  }
  
  .page-header {
    padding: 1rem 0;
  }
  
  /* Mobile-specific sidebar improvements */
  .page-sidebar {
    background: var(--color-background-secondary);
    padding: 1rem;
    border-radius: 12px;
    margin-bottom: 1rem;
  }
}

@media (max-width: 480px) {
  .header-content,
  .page-container {
    padding: 0 0.75rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .page-description {
    font-size: 0.9rem;
  }
  
  .page-header {
    padding: 0.75rem 0;
  }
  
  .page-body {
    padding: 0.75rem 0;
  }
  
  .page-container {
    gap: 1rem;
  }
}

/* Landscape mobile adjustments */
@media (max-width: 768px) and (orientation: landscape) {
  .page-header {
    padding: 0.75rem 0;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .page-description {
    font-size: 0.9rem;
  }
}
</style>