<template>
  <div class="mobile-optimized-layout" :class="layoutClasses">
    <header v-if="$slots.header" class="layout-header">
      <slot name="header" />
    </header>
    
    <nav v-if="$slots.navigation" class="layout-navigation">
      <slot name="navigation" />
    </nav>
    
    <main class="layout-main" :class="mainClasses">
      <aside v-if="$slots.sidebar && showSidebar" class="layout-sidebar" :class="sidebarClasses">
        <div class="sidebar-content">
          <slot name="sidebar" />
        </div>
      </aside>
      
      <div class="layout-content" :class="contentClasses">
        <slot />
      </div>
    </main>
    
    <footer v-if="$slots.footer" class="layout-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from '../../composables/useApp'

interface Props {
  sidebarPosition?: 'left' | 'right'
  sidebarCollapsible?: boolean
  fullHeight?: boolean
  padding?: 'none' | 'small' | 'medium' | 'large'
  mobileStackOrder?: 'content-first' | 'sidebar-first'
}

const props = withDefaults(defineProps<Props>(), {
  sidebarPosition: 'left',
  sidebarCollapsible: true,
  fullHeight: true,
  padding: 'medium',
  mobileStackOrder: 'content-first'
})

const { isMobile, isMobileSm, isTablet, deviceType, orientation } = useApp()

// Show sidebar based on device type and props
const showSidebar = computed(() => {
  if (!props.sidebarCollapsible) return true
  return !isMobile.value
})

// Layout classes
const layoutClasses = computed(() => [
  `device-${deviceType.value}`,
  `orientation-${orientation.value}`,
  {
    'full-height': props.fullHeight,
    'has-sidebar': showSidebar.value,
    [`padding-${props.padding}`]: props.padding !== 'none'
  }
])

// Main section classes
const mainClasses = computed(() => [
  'layout-main',
  {
    'has-sidebar': showSidebar.value,
    [`sidebar-${props.sidebarPosition}`]: showSidebar.value,
    'mobile-stack': isMobile.value
  }
])

// Sidebar classes
const sidebarClasses = computed(() => [
  'layout-sidebar',
  `sidebar-${props.sidebarPosition}`,
  {
    'mobile-hidden': isMobile.value && props.sidebarCollapsible,
    [`mobile-order-${props.mobileStackOrder}`]: isMobile.value
  }
])

// Content classes
const contentClasses = computed(() => [
  'layout-content',
  {
    'full-width': !showSidebar.value,
    [`mobile-order-${props.mobileStackOrder}`]: isMobile.value
  }
])
</script>

<style scoped>
.mobile-optimized-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.mobile-optimized-layout.full-height {
  height: 100vh;
  overflow: hidden;
}

/* Header */
.layout-header {
  flex-shrink: 0;
  z-index: 100;
}

/* Navigation */
.layout-navigation {
  flex-shrink: 0;
  z-index: 99;
}

/* Main content area */
.layout-main {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
}

.layout-main.has-sidebar {
  gap: 1.5rem;
}

.layout-main.sidebar-right {
  flex-direction: row-reverse;
}

/* Sidebar */
.layout-sidebar {
  flex-shrink: 0;
  width: 280px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.sidebar-content {
  padding: 1rem;
  height: 100%;
}

/* Content */
.layout-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  min-width: 0;
}

.layout-content.full-width {
  width: 100%;
}

/* Footer */
.layout-footer {
  flex-shrink: 0;
  margin-top: auto;
}

/* Padding variations */
.padding-small .layout-content {
  padding: 0.5rem;
}

.padding-medium .layout-content {
  padding: 1rem;
}

.padding-large .layout-content {
  padding: 2rem;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .layout-main.mobile-stack {
    flex-direction: column;
    gap: 1rem;
  }
  
  .layout-sidebar {
    width: 100%;
    order: 2;
    max-height: 40vh;
    background: var(--color-background-secondary);
    border-radius: 12px;
    margin: 0 1rem;
  }
  
  .layout-content {
    order: 1;
    padding: 0 1rem;
  }
  
  /* Mobile stack order variations */
  .mobile-order-sidebar-first .layout-sidebar {
    order: 1;
  }
  
  .mobile-order-sidebar-first .layout-content {
    order: 2;
  }
  
  .mobile-order-content-first .layout-sidebar {
    order: 2;
  }
  
  .mobile-order-content-first .layout-content {
    order: 1;
  }
  
  /* Padding adjustments for mobile */
  .padding-small .layout-content {
    padding: 0.5rem;
  }
  
  .padding-medium .layout-content {
    padding: 0.75rem;
  }
  
  .padding-large .layout-content {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .layout-main.mobile-stack {
    gap: 0.75rem;
  }
  
  .layout-sidebar {
    margin: 0 0.75rem;
    max-height: 35vh;
  }
  
  .layout-content {
    padding: 0 0.75rem;
  }
  
  .sidebar-content {
    padding: 0.75rem;
  }
  
  /* Tighter padding for small screens */
  .padding-small .layout-content {
    padding: 0.375rem;
  }
  
  .padding-medium .layout-content {
    padding: 0.5rem;
  }
  
  .padding-large .layout-content {
    padding: 0.75rem;
  }
}

/* Landscape mobile adjustments */
@media (max-width: 768px) and (orientation: landscape) {
  .layout-sidebar {
    max-height: 50vh;
  }
  
  .layout-main.mobile-stack {
    gap: 0.5rem;
  }
}

/* Device-specific optimizations */
.device-mobile-sm .layout-content {
  font-size: 14px;
}

.device-mobile-md .layout-content {
  font-size: 15px;
}

.device-tablet .layout-sidebar {
  width: 320px;
}

/* Touch-specific improvements */
@media (hover: none) and (pointer: coarse) {
  .layout-sidebar,
  .layout-content {
    scroll-behavior: smooth;
  }
  
  /* Better touch scrolling */
  .layout-sidebar::-webkit-scrollbar,
  .layout-content::-webkit-scrollbar {
    width: 4px;
  }
  
  .layout-sidebar::-webkit-scrollbar-thumb,
  .layout-content::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .layout-sidebar {
    border: 1px solid var(--color-border);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .layout-sidebar,
  .layout-content {
    scroll-behavior: auto;
  }
}
</style>