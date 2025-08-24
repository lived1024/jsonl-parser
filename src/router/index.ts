import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { AnalyticsService } from '../services/AnalyticsService'

// Route-based code splitting with named chunks and preloading
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "home" */ '../pages/HomePage.vue')
  },
  {
    path: '/learn',
    name: 'LearningCenter',
    component: () => import(/* webpackChunkName: "learning-center" */ '../pages/LearningCenterPage.vue'),
    meta: {
      preload: true, // Preload this route as it's commonly accessed
      chunkGroup: 'learning'
    }
  },
  {
    path: '/learn/:id',
    name: 'Tutorial',
    component: () => import(/* webpackChunkName: "tutorial" */ '../pages/TutorialPage.vue'),
    meta: {
      chunkGroup: 'learning'
    }
  },
  {
    path: '/tools',
    name: 'ToolsHub',
    component: () => import(/* webpackChunkName: "tools-hub" */ '../pages/ToolsHubPage.vue'),
    meta: {
      preload: true, // Preload this route as it's commonly accessed
      chunkGroup: 'tools'
    }
  },
  {
    path: '/tools/:toolId',
    name: 'Tool',
    component: () => import(/* webpackChunkName: "tool" */ '../pages/ToolPage.vue'),
    meta: {
      chunkGroup: 'tools'
    }
  },
  {
    path: '/reference',
    name: 'ReferenceHub',
    component: () => import(/* webpackChunkName: "reference-hub" */ '../pages/ReferenceHubPage.vue'),
    meta: {
      chunkGroup: 'reference'
    }
  },
  {
    path: '/reference/:referenceId',
    name: 'Reference',
    component: () => import(/* webpackChunkName: "reference" */ '../pages/ReferencePage.vue'),
    meta: {
      chunkGroup: 'reference'
    }
  },
  {
    path: '/samples',
    name: 'SampleLibrary',
    component: () => import(/* webpackChunkName: "sample-library" */ '../pages/SampleLibraryPage.vue'),
    meta: {
      chunkGroup: 'content'
    }
  },
  {
    path: '/info',
    name: 'InfoHub',
    component: () => import(/* webpackChunkName: "info-hub" */ '../pages/InfoHubPage.vue'),
    meta: {
      chunkGroup: 'content'
    }
  },
  {
    path: '/info/:guideId',
    name: 'InfoGuide',
    component: () => import(/* webpackChunkName: "info-guide" */ '../pages/InfoGuidePage.vue'),
    meta: {
      chunkGroup: 'content'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Preload critical routes for better performance
function preloadCriticalRoutes() {
  const criticalRoutes = routes.filter(route => route.meta?.preload)
  
  criticalRoutes.forEach(route => {
    if (typeof route.component === 'function') {
      // Preload the component in the background
      setTimeout(() => {
        (route.component as () => Promise<any>)().catch(() => {
          // Silently handle preload errors
        })
      }, 100)
    }
  })
}

// Preload related chunks when navigating to a route group
function preloadRelatedChunks(chunkGroup: string) {
  const relatedRoutes = routes.filter(route => route.meta?.chunkGroup === chunkGroup)
  
  relatedRoutes.forEach(route => {
    if (typeof route.component === 'function') {
      setTimeout(() => {
        (route.component as () => Promise<any>)().catch(() => {
          // Silently handle preload errors
        })
      }, 200)
    }
  })
}

// Initialize preloading after router is ready
router.isReady().then(() => {
  preloadCriticalRoutes()
})

// Add analytics tracking and chunk preloading to router
router.beforeEach((to, from, next) => {
  // Track navigation events
  const analyticsService = AnalyticsService.getInstance()
  
  if (analyticsService.getState().isInitialized) {
    // Track page view
    analyticsService.trackPageView({
      path: to.path,
      title: getPageTitle(to.name as string),
      customParameters: {
        route_name: to.name,
        route_params: to.params,
        from_route: from.name
      }
    })

    // Track navigation event if coming from another page
    if (from.name && from.name !== to.name) {
      analyticsService.trackNavigationEvent({
        category: 'navigation',
        action: 'page_view',
        from_page: from.name as string,
        to_page: to.name as string,
        customParameters: {
          from_path: from.path,
          to_path: to.path
        }
      })
    }
  }

  // Preload related chunks when navigating to a new chunk group
  if (to.meta?.chunkGroup && to.meta.chunkGroup !== from.meta?.chunkGroup) {
    preloadRelatedChunks(to.meta.chunkGroup as string)
  }
  
  next()
})

// Helper function to get page titles for analytics
function getPageTitle(routeName: string): string {
  const titleMap: Record<string, string> = {
    'Home': 'JSONL Parser - Home',
    'LearningCenter': 'Learning Center',
    'Tutorial': 'Tutorial',
    'ToolsHub': 'Tools Hub',
    'Tool': 'Tool',
    'ReferenceHub': 'Reference Hub',
    'Reference': 'Reference',
    'SampleLibrary': 'Sample Library',
    'InfoHub': 'Info Hub',
    'InfoGuide': 'Info Guide'
  }
  
  return titleMap[routeName] || routeName
}

export default router