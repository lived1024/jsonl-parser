import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TutorialViewer from '../components/feature/TutorialViewer.vue'
import { ContentService } from '../services/ContentService'

// Mock ContentService
vi.mock('../services/ContentService', () => ({
  ContentService: {
    getInstance: vi.fn(() => ({
      getGuide: vi.fn()
    }))
  }
}))

// Mock router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

// Mock highlight.js
vi.mock('highlight.js', () => ({
  default: {
    highlight: vi.fn(() => ({ value: 'highlighted code' })),
    highlightAuto: vi.fn(() => ({ value: 'highlighted code' })),
    getLanguage: vi.fn(() => true)
  }
}))

// Mock i18n composable
vi.mock('../composables/useI18n', () => ({
  useI18n: () => ({
    t: vi.fn((key: string, params?: any) => {
      // Return mock translations
      const translations: Record<string, string> = {
        'tutorial.loading': 'Loading tutorial...',
        'tutorial.error.title': 'An error occurred',
        'tutorial.error.retry': 'Try Again',
        'tutorial.error.notFound': 'Tutorial not found.',
        'tutorial.error.loadFailed': 'Failed to load tutorial.',
        'tutorial.progress.label': 'Progress: {{progress}}%',
        'tutorial.duration.minutes': '{{count}} min',
        'tutorial.status.completedBadge': '✓ Completed',
        'tutorial.actions.markCompleted': 'Mark as Completed',
        'tutorial.actions.markIncomplete': 'Mark as Incomplete',
        'tutorial.actions.backToList': '← Back to List',
        'tutorial.examples.title': 'Code Examples',
        'tutorial.examples.copy': 'Copy',
        'tutorial.examples.copied': 'Copied!',
        'tutorial.examples.loadInParser': 'Load in Parser',
        'tutorial.difficulty.beginner': 'Beginner',
        'tutorial.difficulty.intermediate': 'Intermediate',
        'tutorial.difficulty.advanced': 'Advanced'
      }
      
      let result = translations[key] || key
      
      // Handle parameter substitution
      if (params && typeof params === 'object') {
        Object.keys(params).forEach(paramKey => {
          result = result.replace(`{{${paramKey}}}`, params[paramKey])
        })
      }
      
      return result
    })
  })
}))

describe('TutorialViewer', () => {
  let mockContentService: any

  beforeEach(() => {
    // Set up Pinia
    setActivePinia(createPinia())
    
    mockContentService = {
      getGuide: vi.fn()
    }
    vi.mocked(ContentService.getInstance).mockReturnValue(mockContentService)
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn()
      }
    })
  })

  it('should load tutorial on mount', async () => {
    const mockTutorial = {
      id: 'test-tutorial',
      metadata: {
        title: 'Test Tutorial',
        description: 'Test Description',
        difficulty: 'beginner',
        estimatedReadTime: 5,
        interactiveExamples: []
      },
      content: '# Test Content',
      renderedContent: '<h1>Test Content</h1>'
    }

    mockContentService.getGuide.mockResolvedValue(mockTutorial)

    const wrapper = mount(TutorialViewer, {
      props: {
        tutorialId: 'test-tutorial'
      }
    })

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(mockContentService.getGuide).toHaveBeenCalledWith('test-tutorial')
  })

  it('should track reading progress', async () => {
    const mockTutorial = {
      id: 'test-tutorial',
      metadata: {
        title: 'Test Tutorial',
        description: 'Test Description',
        difficulty: 'beginner',
        estimatedReadTime: 5,
        interactiveExamples: []
      },
      content: '# Test Content',
      renderedContent: '<h1>Test Content</h1>'
    }

    mockContentService.getGuide.mockResolvedValue(mockTutorial)

    const wrapper = mount(TutorialViewer, {
      props: {
        tutorialId: 'test-tutorial'
      }
    })

    // Wait for component to load
    await new Promise(resolve => setTimeout(resolve, 100))

    // Check if progress tracking is initialized
    expect(wrapper.vm.readingProgress).toBeDefined()
  })

  it('should save progress to localStorage', async () => {
    const mockTutorial = {
      id: 'test-tutorial',
      metadata: {
        title: 'Test Tutorial',
        description: 'Test Description',
        difficulty: 'beginner',
        estimatedReadTime: 5,
        interactiveExamples: []
      },
      content: '# Test Content',
      renderedContent: '<h1>Test Content</h1>'
    }

    mockContentService.getGuide.mockResolvedValue(mockTutorial)

    const wrapper = mount(TutorialViewer, {
      props: {
        tutorialId: 'test-tutorial'
      }
    })

    // Wait for component to load
    await new Promise(resolve => setTimeout(resolve, 100))

    // Simulate marking as completed
    const completeButton = wrapper.find('.complete-button')
    if (completeButton.exists()) {
      await completeButton.trigger('click')
    }

    expect(localStorage.setItem).toHaveBeenCalled()
  })
})