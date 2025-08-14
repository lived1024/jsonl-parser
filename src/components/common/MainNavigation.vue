<template>
  <nav class="main-navigation" role="navigation" :aria-label="t('navigation.mainLabel')">
    <div class="nav-container">
      <!-- Desktop Navigation -->
      <ul class="nav-menu desktop-nav" v-if="!isMobile">
        <li v-for="item in navigationItems" :key="item.path" class="nav-item">
          <router-link 
            :to="item.path" 
            class="nav-link"
            :class="{ active: isActive(item.path) }"
            :aria-current="isActive(item.path) ? 'page' : undefined"
          >
            <component :is="item.icon" :size="18" class="nav-icon" />
            <span class="nav-label">{{ item.label }}</span>
          </router-link>
        </li>
      </ul>

      <!-- Mobile Navigation Toggle -->
      <div class="mobile-nav-toggle" v-if="isMobile">
        <button 
          @click="toggleMobileMenu"
          class="mobile-menu-button"
          :aria-expanded="isMobileMenuOpen"
          aria-controls="mobile-menu"
          :aria-label="t('navigation.toggleMenu')"
        >
          <Menu v-if="!isMobileMenuOpen" :size="20" />
          <X v-else :size="20" />
        </button>
      </div>
    </div>

    <!-- Mobile Navigation Menu -->
    <div 
      v-if="isMobile && isMobileMenuOpen" 
      id="mobile-menu"
      class="mobile-nav-menu"
      role="menu"
    >
      <ul class="mobile-nav-list">
        <li v-for="item in navigationItems" :key="item.path" class="mobile-nav-item">
          <router-link 
            :to="item.path" 
            class="mobile-nav-link"
            :class="{ active: isActive(item.path) }"
            @click="closeMobileMenu"
            role="menuitem"
          >
            <component :is="item.icon" :size="20" class="mobile-nav-icon" />
            <div class="mobile-nav-content">
              <span class="mobile-nav-label">{{ item.label }}</span>
              <span class="mobile-nav-description">{{ item.description }}</span>
            </div>
          </router-link>
        </li>
      </ul>
    </div>

    <!-- Mobile Menu Overlay -->
    <div 
      v-if="isMobile && isMobileMenuOpen" 
      class="mobile-menu-overlay"
      @click="closeMobileMenu"
      aria-hidden="true"
    ></div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useApp } from '../../composables/useApp'
import { useI18nStore } from '../../stores/i18nStore'
import { 
  Home, 
  BookOpen, 
  Wrench, 
  FileText, 
  Database,
  Menu,
  X
} from 'lucide-vue-next'

interface NavigationItem {
  path: string
  label: string
  icon: any
  description: string
}

const route = useRoute()
const { isMobile } = useApp()
const { getTranslation } = useI18nStore()
const isMobileMenuOpen = ref(false)

// 번역 함수 단축키
const t = (key: string) => getTranslation(key)

const navigationItems = computed((): NavigationItem[] => [
  {
    path: '/',
    label: t('navigation.items.parser.label'),
    icon: Home,
    description: t('navigation.items.parser.description')
  },
  {
    path: '/learn',
    label: t('navigation.items.learn.label'),
    icon: BookOpen,
    description: t('navigation.items.learn.description')
  },
  {
    path: '/tools',
    label: t('navigation.items.tools.label'),
    icon: Wrench,
    description: t('navigation.items.tools.description')
  },
  {
    path: '/reference',
    label: t('navigation.items.reference.label'),
    icon: FileText,
    description: t('navigation.items.reference.description')
  },
  {
    path: '/samples',
    label: t('navigation.items.samples.label'),
    icon: Database,
    description: t('navigation.items.samples.description')
  }
])

const isActive = (path: string): boolean => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}
</script>

<style scoped>
.main-navigation {
  position: relative;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Desktop Navigation */
.desktop-nav {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2rem;
  padding: 0.5rem;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.nav-item {
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 1.5rem;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.nav-link:hover::before {
  opacity: 1;
}

.nav-link:hover {
  color: white;
  transform: translateY(-1px);
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.nav-icon {
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.nav-link:hover .nav-icon {
  transform: scale(1.1);
}

.nav-label {
  white-space: nowrap;
}

/* Mobile Navigation */
.mobile-nav-toggle {
  display: flex;
  align-items: center;
}

.mobile-menu-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.mobile-menu-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.mobile-nav-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  z-index: 999;
  padding: 1rem;
  padding-top: 5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.mobile-nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-nav-item {
  margin: 0;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1rem;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transform: translateX(4px);
}

.mobile-nav-icon {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.8);
}

.mobile-nav-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mobile-nav-label {
  font-weight: 600;
  font-size: 1rem;
}

.mobile-nav-description {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .nav-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
  
  .nav-icon {
    width: 16px;
    height: 16px;
  }
  
  .mobile-nav-menu {
    padding-top: 4rem;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .nav-link,
  .mobile-menu-button,
  .mobile-nav-link {
    transition: none;
  }
  
  .mobile-nav-menu {
    animation: none;
  }
}

/* Focus styles for keyboard navigation */
.nav-link:focus,
.mobile-menu-button:focus,
.mobile-nav-link:focus {
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}
</style>