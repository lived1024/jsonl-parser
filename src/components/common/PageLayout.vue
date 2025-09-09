<template>
  <div class="page-layout">
    <!-- 브레드크럼 네비게이션 -->
    <nav v-if="showBreadcrumb" class="breadcrumb-nav" :aria-label="t('accessibility.breadcrumbNavigation')">
      <div class="breadcrumb-content">
        <ol class="breadcrumb-list">
          <li class="breadcrumb-item">
            <router-link to="/" class="breadcrumb-link">
              {{ t('breadcrumb.home') }}
            </router-link>
          </li>
          <li v-for="(crumb, index) in breadcrumbs" :key="index" class="breadcrumb-item">
            <span class="breadcrumb-separator" :aria-hidden="true">{{ t('breadcrumb.separator') }}</span>
            <router-link 
              v-if="crumb.url && index < breadcrumbs.length - 1" 
              :to="crumb.url" 
              class="breadcrumb-link"
            >
              {{ crumb.name }}
            </router-link>
            <span v-else class="breadcrumb-current" :aria-current="index === breadcrumbs.length - 1 ? 'page' : undefined">
              {{ crumb.name }}
            </span>
          </li>
        </ol>
      </div>
    </nav>
    
    <!-- 페이지 제목 섹션 (DefaultLayout 헤더 아래) -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">{{ computedTitle }}</h1>
        <p v-if="computedDescription" class="page-description">{{ computedDescription }}</p>
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
import { computed } from 'vue'
import { useI18n } from '../../composables/useI18n'

interface BreadcrumbItem {
  name: string
  url?: string
}

interface Props {
  title?: string
  titleKey?: string
  description?: string
  descriptionKey?: string
  breadcrumbs?: BreadcrumbItem[]
  showBreadcrumb?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showBreadcrumb: true,
  breadcrumbs: () => []
})

const { t } = useI18n()

const computedTitle = computed(() => {
  if (props.titleKey) {
    return t(props.titleKey)
  }
  return props.title || ''
})

const computedDescription = computed(() => {
  if (props.descriptionKey) {
    return t(props.descriptionKey)
  }
  return props.description || ''
})
</script>

<style scoped>
.page-layout {
  min-height: 100%;
  background: var(--color-background-primary);
}

.breadcrumb-nav {
  background: var(--color-background-primary);
  border-bottom: 1px solid var(--color-border);
  padding: 0.75rem 0;
}

.breadcrumb-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 0.875rem;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-link {
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

.breadcrumb-separator {
  margin: 0 0.5rem;
  color: var(--color-text-tertiary);
}

.breadcrumb-current {
  color: var(--color-text-primary);
  font-weight: 500;
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
  .breadcrumb-content,
  .header-content,
  .page-container {
    padding: 0 1rem;
  }
  
  .breadcrumb-nav {
    padding: 0.5rem 0;
  }
  
  .breadcrumb-list {
    font-size: 0.8rem;
  }
  
  .breadcrumb-separator {
    margin: 0 0.375rem;
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