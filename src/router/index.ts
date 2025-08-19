import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { AnalyticsService } from '../services/AnalyticsService'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/HomePage.vue')
  },
  {
    path: '/learn',
    name: 'LearningCenter',
    component: () => import('../pages/LearningCenterPage.vue')
  },
  {
    path: '/learn/:id',
    name: 'Tutorial',
    component: () => import('../pages/TutorialPage.vue')
  },
  {
    path: '/tools',
    name: 'ToolsHub',
    component: () => import('../pages/ToolsHubPage.vue')
  },
  {
    path: '/tools/:toolId',
    name: 'Tool',
    component: () => import('../pages/ToolPage.vue')
  },
  {
    path: '/reference',
    name: 'ReferenceHub',
    component: () => import('../pages/ReferenceHubPage.vue')
  },
  {
    path: '/reference/:referenceId',
    name: 'Reference',
    component: () => import('../pages/ReferencePage.vue')
  },
  {
    path: '/samples',
    name: 'SampleLibrary',
    component: () => import('../pages/SampleLibraryPage.vue')
  },
  {
    path: '/info',
    name: 'InfoHub',
    component: () => import('../pages/InfoHubPage.vue')
  },
  {
    path: '/info/:guideId',
    name: 'InfoGuide',
    component: () => import('../pages/InfoGuidePage.vue')
  },
  {
    path: '/preferences',
    name: 'UserPreferences',
    component: () => import('../pages/UserPreferencesPage.vue')
  },
  {
    path: '/privacy',
    name: 'PrivacySettings',
    component: () => import('../pages/PrivacySettingsPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Add analytics tracking to router
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
    'InfoGuide': 'Info Guide',
    'UserPreferences': 'User Preferences',
    'PrivacySettings': 'Privacy Settings'
  }

  return titleMap[routeName] || routeName
}

export default router