import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router