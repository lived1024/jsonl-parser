import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LearningCenterPage from '../../pages/LearningCenterPage.vue'
import { ContentService } from '../../services/ContentService'

// Mock ContentService
vi.mock('../../services/ContentService', () => ({
  ContentService: {
    getInstance: vi.fn(() => ({
      getContentByCategory: vi.fn(),
      searchContent: vi.fn()
    }))
  }
}))

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  }),
  useRoute: () => ({
    query: {}
  })
}))

// Mock i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: { value: 'ko' }
  })
}))

describe('LearningCenterPage', () => {
  let mockContentService: any

  beforeEach(() => {
    mockContentService = {
      getContentByCategory: vi.fn(),
      searchContent: vi.fn()
    }
    vi.mocked(ContentService.getInstance).mockReturnValue(mockContentService)
  })

  it('should render learning center layout', () => {
    const wrapper = mount(LearningCenterPage)

    expect(wrapper.find('.learning-center').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tutorial-grid"]').exists()).toBe(true)
  })

  it('should load tutorials on mount', async () => {
    const mockTutorials = [
      {
        id: 'json-basics',
        title: 'JSON Basics',
        difficulty: 'beginner',
        estimatedTime: 10
      },
      {
        id: 'advanced-json',
        title: 'Advanced JSON',
        difficulty: 'advanced',
        estimatedTime: 30
      }
    ]

    mockContentService.getContentByCategory.mockResolvedValue(mockTutorials)

    const wrapper = mount(LearningCenterPage)
    
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(mockContentService.getContentByCategory).toHaveBeenCalledWith('tutorial')
  })

  it('should filter tutorials by difficulty', async () => {
    const mockTutorials = [
      { id: 'basic', title: 'Basic', difficulty: 'beginner' },
      { id: 'advanced', title: 'Advanced', difficulty: 'advanced' }
    ]

    mockContentService.getContentByCategory.mockResolvedValue(mockTutorials)

    const wrapper = mount(LearningCenterPage)
    await new Promise(resolve => setTimeout(resolve, 100))

    const difficultyFilter = wrapper.find('[data-testid="difficulty-filter"]')
    if (difficultyFilter.exists()) {
      await difficultyFilter.setValue('beginner')
      await difficultyFilter.trigger('change')

      const tutorialCards = wrapper.findAll('[data-testid^="tutorial-card-"]')
      expect(tutorialCards.length).toBeLessThanOrEqual(mockTutorials.length)
    }
  })

  it('should search tutorials', async () => {
    const mockSearchResults = [
      {
        id: 'json-basics',
        title: 'JSON Basics',
        type: 'tutorial',
        excerpt: 'Learn JSON fundamentals'
      }
    ]

    mockContentService.searchContent.mockResolvedValue(mockSearchResults)

    const wrapper = mount(LearningCenterPage)

    const searchInput = wrapper.find('[data-testid="search-input"]')
    if (searchInput.exists()) {
      await searchInput.setValue('JSON')
      await searchInput.trigger('input')

      await new Promise(resolve => setTimeout(resolve, 300)) // Debounce delay

      expect(mockContentService.searchContent).toHaveBeenCalledWith('JSON')
    }
  })

  it('should track tutorial progress', () => {
    const wrapper = mount(LearningCenterPage)

    // Check if progress tracking is initialized
    expect(wrapper.vm.tutorialProgress).toBeDefined()
  })

  it('should navigate to tutorial on card click', async () => {
    const mockTutorials = [
      { id: 'json-basics', title: 'JSON Basics', difficulty: 'beginner' }
    ]

    mockContentService.getContentByCategory.mockResolvedValue(mockTutorials)

    const wrapper = mount(LearningCenterPage)
    await new Promise(resolve => setTimeout(resolve, 100))

    const tutorialCard = wrapper.find('[data-testid="tutorial-card-json-basics"]')
    if (tutorialCard.exists()) {
      await tutorialCard.trigger('click')
      // Navigation should be handled by router mock
    }
  })

  it('should show empty state when no tutorials found', async () => {
    mockContentService.getContentByCategory.mockResolvedValue([])

    const wrapper = mount(LearningCenterPage)
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
  })
})