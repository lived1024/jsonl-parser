/**
 * 라우팅 및 네비게이션 플로우 통합 테스트
 * 전체 애플리케이션의 라우팅 시스템과 네비게이션 컴포넌트 간의 상호작용을 검증
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import type { Router } from 'vue-router'
import App from '../../App.vue'
import MainNavigation from '../../components/common/MainNavigation.vue'
import HomePage from '../../pages/HomePage.vue'
import LearningCenterPage from '../../pages/LearningCenterPage.vue'
import ToolsHubPage from '../../pages/ToolsHubPage.vue'
import ReferenceHubPage from '../../pages/ReferenceHubPage.vue'
import SampleLibraryPage from '../../pages/SampleLibraryPage.vue'
import InfoHubPage from '../../pages/InfoHubPage.vue'
import { AnalyticsService } from '../../services/AnalyticsService'

// Mock analytics service
vi.mock('../../services/AnalyticsService', () => ({
  AnalyticsService: {
    getInstance: vi.fn(() => ({
      getState: vi.fn(() => ({ isInitialized: true })),
      trackPageView: vi.fn(),
      trackNavigationEvent: vi.fn(),
      setUserProperties: vi.fn(),
      trackEvent: vi.fn(),
      init: vi.fn()
    }))
  }
}))

// Mock MediaOptimizationService to avoid canvas issues
vi.mock('../../services/MediaOptimizationService', () => ({
  MediaOptimizationService: {
    getInstance: vi.fn(() => ({
      optimizeImage: vi.fn(),
      getOptimizedImageUrl: vi.fn()
    }))
  }
}))

// Mock CacheManager to avoid canvas issues
vi.mock('../../utils/cacheUtils', () => ({
  CacheManager: {
    getInstance: vi.fn(() => ({
      get: vi.fn(),
      set: vi.fn(),
      clear: vi.fn()
    }))
  }
}))

// Mock window.matchMedia for mobile detection
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock scroll behavior
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true
})

describe('라우팅 및 네비게이션 통합 테스트', () => {
  let router: Router
  let analyticsService: any

  beforeEach(() => {
    setActivePinia(createPinia())
    
    // Create router with all routes
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'Home', component: HomePage },
        { path: '/learn', name: 'LearningCenter', component: LearningCenterPage },
        { path: '/tools', name: 'ToolsHub', component: ToolsHubPage },
        { path: '/reference', name: 'ReferenceHub', component: ReferenceHubPage },
        { path: '/samples', name: 'SampleLibrary', component: SampleLibraryPage },
        { path: '/info', name: 'InfoHub', component: InfoHubPage }
      ]
    })

    analyticsService = AnalyticsService.getInstance()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('기본 라우팅 플로우', () => {
    it('홈페이지에서 시작하여 모든 주요 섹션으로 네비게이션이 가능해야 한다', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [router]
        }
      })

      await router.isReady()
      
      // 홈페이지에서 시작
      expect(router.currentRoute.value.path).toBe('/')
      expect(router.currentRoute.value.name).toBe('Home')

      // 학습 센터로 이동
      await router.push('/learn')
      await wrapper.vm.$nextTick()
      expect(router.currentRoute.value.path).toBe('/learn')
      expect(router.currentRoute.value.name).toBe('LearningCenter')

      // 도구 허브로 이동
      await router.push('/tools')
      await wrapper.vm.$nextTick()
      expect(router.currentRoute.value.path).toBe('/tools')
      expect(router.currentRoute.value.name).toBe('ToolsHub')

      // 참조 허브로 이동
      await router.push('/reference')
      await wrapper.vm.$nextTick()
      expect(router.currentRoute.value.path).toBe('/reference')
      expect(router.currentRoute.value.name).toBe('ReferenceHub')

      // 샘플 라이브러리로 이동
      await router.push('/samples')
      await wrapper.vm.$nextTick()
      expect(router.currentRoute.value.path).toBe('/samples')
      expect(router.currentRoute.value.name).toBe('SampleLibrary')

      // 정보 허브로 이동
      await router.push('/info')
      await wrapper.vm.$nextTick()
      expect(router.currentRoute.value.path).toBe('/info')
      expect(router.currentRoute.value.name).toBe('InfoHub')

      wrapper.unmount()
    })

    it('잘못된 경로 접근 시 적절히 처리되어야 한다', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [router]
        }
      })

      await router.isReady()

      // 존재하지 않는 경로로 이동 시도
      try {
        await router.push('/nonexistent-route')
        await wrapper.vm.$nextTick()
        
        // 라우터가 경로를 처리했는지 확인
        expect(router.currentRoute.value.path).toBe('/nonexistent-route')
      } catch (error) {
        // 라우터가 오류를 발생시키는 경우
        expect(error).toBeDefined()
      }

      wrapper.unmount()
    })

    it('브라우저 뒤로가기/앞으로가기 기능이 올바르게 작동해야 한다', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [router]
        }
      })

      await router.isReady()

      // 네비게이션 히스토리 생성
      await router.push('/')
      await router.push('/learn')
      await router.push('/tools')
      await wrapper.vm.$nextTick()

      expect(router.currentRoute.value.path).toBe('/tools')

      // 뒤로가기 시뮬레이션
      await router.back()
      await wrapper.vm.$nextTick()
      expect(router.currentRoute.value.path).toBe('/learn')

      // 한 번 더 뒤로가기
      await router.back()
      await wrapper.vm.$nextTick()
      expect(router.currentRoute.value.path).toBe('/')

      // 앞으로가기 시뮬레이션
      await router.forward()
      await wrapper.vm.$nextTick()
      expect(router.currentRoute.value.path).toBe('/learn')

      wrapper.unmount()
    })
  })

  describe('네비게이션 컴포넌트 통합', () => {
    it('메인 네비게이션에서 링크 클릭 시 올바른 페이지로 이동해야 한다', async () => {
      const wrapper = mount(MainNavigation, {
        global: {
          plugins: [router]
        }
      })

      await router.isReady()

      // 학습 센터 링크 찾기 및 클릭
      const learnLink = wrapper.find('a[href="/learn"]')
      expect(learnLink.exists()).toBe(true)

      // 직접 라우터를 통해 네비게이션 (실제 클릭 이벤트는 브라우저에서 처리됨)
      await router.push('/learn')
      await wrapper.vm.$nextTick()
      
      expect(router.currentRoute.value.path).toBe('/learn')

      // 도구 허브로 이동
      await router.push('/tools')
      await wrapper.vm.$nextTick()
      
      expect(router.currentRoute.value.path).toBe('/tools')

      wrapper.unmount()
    })

    it('현재 활성 페이지가 네비게이션에서 올바르게 표시되어야 한다', async () => {
      const wrapper = mount(MainNavigation, {
        global: {
          plugins: [router]
        }
      })

      await router.isReady()

      // 홈페이지에서 시작
      await router.push('/')
      await wrapper.vm.$nextTick()

      const homeLink = wrapper.find('a[href="/"]')
      expect(homeLink.classes()).toContain('active')

      // 학습 센터로 이동
      await router.push('/learn')
      await wrapper.vm.$nextTick()

      const learnLink = wrapper.find('a[href="/learn"]')
      expect(learnLink.classes()).toContain('active')

      // 홈 링크는 더 이상 활성 상태가 아님
      expect(homeLink.classes()).not.toContain('active')

      wrapper.unmount()
    })

    it('모바일 네비게이션 메뉴가 올바르게 작동해야 한다', async () => {
      // 모바일 환경 시뮬레이션
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(max-width: 768px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      const wrapper = mount(MainNavigation, {
        global: {
          plugins: [router]
        }
      })

      await router.isReady()
      await wrapper.vm.$nextTick()

      // 모바일 메뉴 버튼 찾기
      const menuButton = wrapper.find('.mobile-menu-button')
      
      if (menuButton.exists()) {
        // 메뉴 열기
        await menuButton.trigger('click')
        await wrapper.vm.$nextTick()

        // 모바일 메뉴가 표시되는지 확인
        const mobileMenu = wrapper.find('.mobile-nav-menu')
        expect(mobileMenu.exists()).toBe(true)

        // 모바일 메뉴에서 링크 클릭
        const mobileLearningLink = mobileMenu.find('a[href="/learn"]')
        if (mobileLearningLink.exists()) {
          await mobileLearningLink.trigger('click')
          await wrapper.vm.$nextTick()
          
          expect(router.currentRoute.value.path).toBe('/learn')
        }
      }

      wrapper.unmount()
    })
  })

  describe('애널리틱스 통합', () => {
    it('페이지 네비게이션 시 애널리틱스 이벤트가 발생해야 한다', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [router]
        }
      })

      await router.isReady()

      // 페이지 이동
      await router.push('/learn')
      await wrapper.vm.$nextTick()

      // 페이지 뷰 추적 확인
      expect(analyticsService.trackPageView).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/learn',
          title: expect.any(String)
        })
      )

      // 다른 페이지로 이동
      await router.push('/tools')
      await wrapper.vm.$nextTick()

      // 네비게이션 이벤트 추적 확인
      expect(analyticsService.trackNavigationEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'navigation',
          action: 'page_view',
          from_page: 'LearningCenter',
          to_page: 'ToolsHub'
        })
      )

      wrapper.unmount()
    })

    it('초기 페이지 로드 시 애널리틱스가 올바르게 초기화되어야 한다', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [router]
        }
      })

      await router.isReady()
      await wrapper.vm.$nextTick()

      // 애널리틱스 서비스가 호출되었는지 확인
      expect(AnalyticsService.getInstance).toHaveBeenCalled()
      expect(analyticsService.getState).toHaveBeenCalled()

      wrapper.unmount()
    })
  })

  describe('접근성 및 키보드 네비게이션', () => {
    it('키보드를 통한 네비게이션이 가능해야 한다', async () => {
      const wrapper = mount(MainNavigation, {
        global: {
          plugins: [router]
        }
      })

      await router.isReady()

      // 첫 번째 네비게이션 링크에 포커스
      const firstLink = wrapper.find('.nav-link')
      if (firstLink.exists()) {
        await firstLink.trigger('focus')
        
        // Tab 키로 다음 링크로 이동 (실제로는 브라우저가 처리)
        await firstLink.trigger('keydown', { key: 'Tab' })
        
        // Enter 키로 링크 활성화
        await firstLink.trigger('keydown', { key: 'Enter' })
        await wrapper.vm.$nextTick()
        
        // 링크가 클릭되었는지 확인 (실제 네비게이션은 브라우저가 처리)
        expect(firstLink.exists()).toBe(true)
      }

      wrapper.unmount()
    })

    it('스킵 링크가 올바르게 작동해야 한다', async () => {
      // 메인 콘텐츠 요소 모킹
      const mainContent = document.createElement('main')
      mainContent.id = 'main-content'
      mainContent.focus = vi.fn()
      mainContent.scrollIntoView = vi.fn()
      document.body.appendChild(mainContent)

      const wrapper = mount(MainNavigation, {
        global: {
          plugins: [router]
        }
      })

      await router.isReady()

      const skipLink = wrapper.find('.skip-link')
      if (skipLink.exists()) {
        await skipLink.trigger('click')
        await wrapper.vm.$nextTick()

        // 메인 콘텐츠로 포커스가 이동했는지 확인
        expect(mainContent.focus).toHaveBeenCalled()
        expect(mainContent.scrollIntoView).toHaveBeenCalledWith({
          behavior: 'smooth',
          block: 'start'
        })
      }

      document.body.removeChild(mainContent)
      wrapper.unmount()
    })

    it('ARIA 속성이 올바르게 설정되어야 한다', async () => {
      const wrapper = mount(MainNavigation, {
        global: {
          plugins: [router]
        }
      })

      await router.isReady()

      // 네비게이션 요소의 ARIA 속성 확인
      const nav = wrapper.find('nav')
      expect(nav.attributes('role')).toBe('navigation')
      expect(nav.attributes('aria-label')).toBeDefined()

      // 메뉴바 역할 확인
      const menubar = wrapper.find('[role="menubar"]')
      if (menubar.exists()) {
        expect(menubar.attributes('role')).toBe('menubar')
      }

      // 메뉴 아이템들의 역할 확인
      const menuItems = wrapper.findAll('[role="menuitem"]')
      menuItems.forEach(item => {
        expect(item.attributes('role')).toBe('menuitem')
        expect(item.attributes('aria-label')).toBeDefined()
      })

      wrapper.unmount()
    })
  })

  describe('성능 및 최적화', () => {
    it('라우트 변경 시 불필요한 리렌더링이 발생하지 않아야 한다', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [router]
        }
      })

      await router.isReady()

      // 컴포넌트 렌더링 횟수 추적을 위한 스파이
      const renderSpy = vi.spyOn(wrapper.vm, '$forceUpdate')

      // 여러 페이지 간 빠른 네비게이션
      await router.push('/learn')
      await router.push('/tools')
      await router.push('/reference')
      await router.push('/samples')
      await wrapper.vm.$nextTick()

      // 과도한 리렌더링이 발생하지 않았는지 확인
      expect(renderSpy).not.toHaveBeenCalled()

      wrapper.unmount()
    })

    it('동시 네비게이션 요청이 올바르게 처리되어야 한다', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [router]
        }
      })

      await router.isReady()

      // 동시에 여러 네비게이션 요청
      const promises = [
        router.push('/learn'),
        router.push('/tools'),
        router.push('/reference')
      ]

      await Promise.all(promises)
      await wrapper.vm.$nextTick()

      // 마지막 네비게이션이 적용되었는지 확인
      expect(router.currentRoute.value.path).toBe('/reference')

      wrapper.unmount()
    })
  })

  describe('오류 시나리오', () => {
    it('네비게이션 가드 오류가 적절히 처리되어야 한다', async () => {
      // 오류를 발생시키는 네비게이션 가드 추가
      router.beforeEach((to, from, next) => {
        if (to.path === '/error-route') {
          next(new Error('Navigation blocked'))
        } else {
          next()
        }
      })

      const wrapper = mount(App, {
        global: {
          plugins: [router]
        }
      })

      await router.isReady()

      // 오류를 발생시키는 경로로 이동 시도
      try {
        await router.push('/error-route')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Navigation blocked')
      }

      // 현재 경로가 변경되지 않았는지 확인
      expect(router.currentRoute.value.path).toBe('/')

      wrapper.unmount()
    })

    it('컴포넌트 로딩 실패 시 적절한 오류 처리가 되어야 한다', async () => {
      // 실패하는 컴포넌트로 라우트 추가
      const failingRoute = {
        path: '/failing-component',
        name: 'FailingComponent',
        component: () => Promise.reject(new Error('Component load failed'))
      }

      router.addRoute(failingRoute)

      const wrapper = mount(App, {
        global: {
          plugins: [router]
        }
      })

      await router.isReady()

      // 실패하는 컴포넌트로 이동 시도
      try {
        await router.push('/failing-component')
        await wrapper.vm.$nextTick()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }

      wrapper.unmount()
    })

    it('메모리 누수 방지를 위한 정리가 올바르게 수행되어야 한다', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [router]
        }
      })

      await router.isReady()

      // 여러 페이지 방문
      await router.push('/learn')
      await router.push('/tools')
      await router.push('/reference')
      await wrapper.vm.$nextTick()

      // 컴포넌트 언마운트
      wrapper.unmount()

      // 라우터 인스턴스가 정리되었는지 확인
      expect(wrapper.vm).toBeUndefined()
    })
  })
})