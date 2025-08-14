import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
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

describe('TutorialViewer', () => {
  let mockContentService: any

  beforeEach(() => {
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