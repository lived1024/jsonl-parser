import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ContentService } from '../../services/ContentService'

// Mock fetch
global.fetch = vi.fn()

describe('ContentService', () => {
  let contentService: ContentService

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset singleton instance for testing
    ;(ContentService as any).instance = null
    contentService = ContentService.getInstance()
  })

  it('should be a singleton', () => {
    const instance1 = ContentService.getInstance()
    const instance2 = ContentService.getInstance()
    expect(instance1).toBe(instance2)
  })

  it('should load tutorial content', async () => {
    const mockTutorial = {
      id: 'json-basics',
      metadata: {
        title: 'JSON Basics',
        description: 'Learn JSON fundamentals',
        difficulty: 'beginner',
        estimatedReadTime: 10,
        interactiveExamples: []
      },
      content: '# JSON Basics\n\nJSON is...',
      renderedContent: '<h1>JSON Basics</h1><p>JSON is...</p>'
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTutorial)
    } as Response)

    const tutorial = await contentService.getTutorial('json-basics')
    
    expect(fetch).toHaveBeenCalledWith('/content/tutorials/json-basics.json')
    expect(tutorial).toEqual(mockTutorial)
  })

  it('should cache loaded content', async () => {
    const mockTutorial = {
      id: 'json-basics',
      metadata: { title: 'JSON Basics', difficulty: 'beginner', estimatedReadTime: 10, interactiveExamples: [] },
      content: '# JSON Basics',
      renderedContent: '<h1>JSON Basics</h1>'
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTutorial)
    } as Response)

    // First call
    await contentService.getTutorial('json-basics')
    
    // Second call should use cache
    await contentService.getTutorial('json-basics')
    
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('should load sample data', async () => {
    const mockSample = {
      id: 'api-response',
      name: 'API Response Sample',
      description: 'Sample API response data',
      category: 'api',
      difficulty: 'medium',
      size: 'small',
      data: '{"users": [{"id": 1, "name": "John"}]}',
      metadata: {
        source: 'REST API',
        useCase: 'User management',
        features: ['pagination', 'filtering'],
        learningPoints: ['JSON structure', 'API design']
      }
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSample)
    } as Response)

    const sample = await contentService.getSample('api-response')
    
    expect(fetch).toHaveBeenCalledWith('/content/samples/api-response.json')
    expect(sample).toEqual(mockSample)
  })

  it('should load reference guides', async () => {
    const mockGuide = {
      id: 'json-syntax',
      title: 'JSON Syntax Guide',
      content: '# JSON Syntax\n\nJSON syntax rules...',
      examples: [
        {
          title: 'Basic Object',
          code: '{"key": "value"}',
          language: 'json'
        }
      ],
      relatedTopics: ['json-validation', 'json-parsing']
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockGuide)
    } as Response)

    const guide = await contentService.getGuide('json-syntax')
    
    expect(fetch).toHaveBeenCalledWith('/content/reference/json-syntax.json')
    expect(guide).toEqual(mockGuide)
  })

  it('should handle fetch errors gracefully', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    await expect(contentService.getTutorial('non-existent')).rejects.toThrow('Network error')
  })

  it('should handle 404 responses', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    } as Response)

    await expect(contentService.getTutorial('non-existent')).rejects.toThrow('Failed to load tutorial: 404 Not Found')
  })

  it('should search content', async () => {
    const mockSearchResults = [
      {
        id: 'json-basics',
        title: 'JSON Basics',
        type: 'tutorial',
        excerpt: 'Learn the fundamentals of JSON...'
      }
    ]

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSearchResults)
    } as Response)

    const results = await contentService.searchContent('JSON basics')
    
    expect(results).toEqual(mockSearchResults)
  })

  it('should get content by category', async () => {
    const mockCategoryContent = [
      {
        id: 'json-basics',
        title: 'JSON Basics',
        category: 'beginner'
      },
      {
        id: 'advanced-json',
        title: 'Advanced JSON',
        category: 'beginner'
      }
    ]

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCategoryContent)
    } as Response)

    const content = await contentService.getContentByCategory('beginner')
    
    expect(content).toEqual(mockCategoryContent)
  })
})