import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/HomePage.vue')
  },
  {
    path: '/guide',
    name: 'Guide',
    component: () => import('../pages/GuidePage.vue'),
    meta: { title: 'JSON / JSONL Guide' }
  },
  {
    path: '/faq',
    name: 'Faq',
    component: () => import('../pages/FaqPage.vue'),
    meta: { title: 'FAQ' }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../pages/AboutPage.vue'),
    meta: { title: 'About' }
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('../pages/PrivacyPage.vue'),
    meta: { title: 'Privacy Policy' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} | JSONL Parser` : 'JSONL Parser'
})

export default router
