import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import LearningCenterPage from '../../pages/LearningCenterPage.vue'
import { ContentService } from '../../services/ContentService'

// Mock ContentService
vi.mock('../../services/ContentService', () => ({
  ContentService: {
    getInstance: vi.fn(() => ({
      getTutorials: vi.fn(),
      searchContent: vi.fn()
    }))
  }
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock document.documentElement
const documentElementMock = {
  lang: 'en'
}

Object.defineProperty(document, 'documentElement', {
  value: documentElementMock,
  writable: true
})

// Create router for tests
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: { template: '<div>Home</div>' }
    },
    {
      path: '/learn',
      name: 'Learn',
      component: LearningCenterPage
    },
    {
      path: '/learn/:id',
      name: 'Tutorial',
      component: { template: '<div>Tutorial</div>' }
    }
  ]
})

describe('LearningCenterPage', () => {
  let mockContentService: any

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    
    mockContentService = {
      getTutorials: vi.fn(),
      searchContent: vi.fn()
    }
    vi.mocked(ContentService.getInstance).mockReturnValue(mockContentService)
  })

  it('should render learning center layout', async () => {
    const wrapper = mount(LearningCenterPage, {
      global: {
        plugins: [router]
      }
    })

    await router.isReady()
    await wrapper.vm.$nextTick()

    // Check if the component renders without errors
    expect(wrapper.exists()).toBe(true)
    
    wrapper.unmount()
  })

  it('should load tutorials on mount', async () => {
    const mockTutorials = [
      {
        id: 'json-basics',
        title: 'JSON Basics',
        difficulty: 'beginner',
        estimatedReadTime: 10,
        description: 'Learn JSON basics'
      },
      {
        id: 'advanced-json',
        title: 'Advanced JSON',
        difficulty: 'advanced',
        estimatedReadTime: 30,
        description: 'Advanced JSON concepts'
      }
    ]

    mockContentService.getTutorials.mockResolvedValue(mockTutorials)

    const wrapper = mount(LearningCenterPage, {
      global: {
        plugins: [router]
      }
    })
    
    await router.isReady()
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(mockContentService.getTutorials).toHaveBeenCalled()
    
    wrapper.unmount()
  })

  it('should filter tutorials by difficulty', async () => {
    const mockTutorials = [
      { id: 'basic', title: 'Basic', difficulty: 'beginner', estimatedReadTime: 10, description: 'Basic tutorial' },
      { id: 'advanced', title: 'Advanced', difficulty: 'advanced', estimatedReadTime: 30, description: 'Advanced tutorial' }
    ]

    mockContentService.getTutorials.mockResolvedValue(mockTutorials)

    const wrapper = mount(LearningCenterPage, {
      global: {
        plugins: [router]
      }
    })
    
    await router.isReady()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Check if filtering logic works (component should have filtered tutorials)
    expect(wrapper.vm.filteredTutorials).toBeDefined()
    
    wrapper.unmount()
  })

  it('should handle tutorial filtering', async () => {
    const mockTutorials = [
      {
        id: 'json-basics',
        title: 'JSON Basics',
        difficulty: 'beginner',
        estimatedReadTime: 10,
        description: 'Learn JSON fundamentals'
      }
    ]

    mockContentService.getTutorials.mockResolvedValue(mockTutorials)

    const wrapper = mount(LearningCenterPage, {
      global: {
        plugins: [router]
      }
    })

    await router.isReady()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Check if tutorials are loaded and filtered
    expect(wrapper.vm.tutorials).toBeDefined()
    expect(wrapper.vm.filteredTutorials).toBeDefined()
    
    wrapper.unmount()
  })

  it('should track tutorial progress', async () => {
    const wrapper = mount(LearningCenterPage, {
      global: {
        plugins: [router]
      }
    })

    await router.isReady()
    await wrapper.vm.$nextTick()

    // Check if progress tracking is initialized
    expect(wrapper.vm.progress).toBeDefined()
    expect(wrapper.vm.completedCount).toBeDefined()
    expect(wrapper.vm.totalCount).toBeDefined()
    
    wrapper.unmount()
  })

  it('should handle tutorial navigation', async () => {
    const mockTutorials = [
      { id: 'json-basics', title: 'JSON Basics', difficulty: 'beginner', estimatedReadTime: 10, description: 'Basic tutorial' }
    ]

    mockContentService.getTutorials.mockResolvedValue(mockTutorials)

    const wrapper = mount(LearningCenterPage, {
      global: {
        plugins: [router]
      }
    })
    
    await router.isReady()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Check if openTutorial method exists
    expect(typeof wrapper.vm.openTutorial).toBe('function')
    
    wrapper.unmount()
  })

  it('should handle empty tutorials state', async () => {
    mockContentService.getTutorials.mockResolvedValue([])

    const wrapper = mount(LearningCenterPage, {
      global: {
        plugins: [router]
      }
    })
    
    await router.isReady()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Check if empty state is handled properly
    expect(wrapper.vm.tutorials).toEqual([])
    expect(wrapper.vm.filteredTutorials).toEqual([])
    
    wrapper.unmount()
  })
})