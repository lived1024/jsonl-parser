import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useSEO, configureSEO } from '../../composables/useSEO'

// Mock DOM environment
const mockDocument = {
  title: '',
  head: {
    appendChild: vi.fn(),
    removeChild: vi.fn()
  },
  querySelector: vi.fn(),
  createElement: vi.fn(() => ({
    setAttribute: vi.fn(),
    textContent: ''
  }))
}

const mockRoute = {
  path: '/test'
}

// Mock Vue composables
vi.mock('vue-router', () => ({
  useRoute: () => mockRoute
}))

vi.mock('../useI18n', () => ({
  useI18n: () => ({
    currentLanguage: { value: 'en' }
  })
}))

// Mock global document
Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true
})

describe('useSEO', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDocument.title = ''
    
    // Configure SEO for tests
    configureSEO({
      titleTemplate: '%s | Test Site',
      defaultTitle: 'Test Site',
      defaultDescription: 'Test description',
      defaultKeywords: ['test', 'site'],
      siteUrl: 'https://test.com',
      siteName: 'Test Site'
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default metadata', () => {
    const { metadata } = useSEO()
    
    expect(metadata.value.title).toBe('Test Site')
    expect(metadata.value.description).toBe('Test description')
    expect(metadata.value.keywords).toEqual(['test', 'site'])
  })

  it('should accept initial metadata', () => {
    const initialMetadata = {
      title: 'Custom Title',
      description: 'Custom description',
      keywords: ['custom', 'keywords']
    }
    
    const { metadata } = useSEO(initialMetadata)
    
    expect(metadata.value.title).toBe('Custom Title')
    expect(metadata.value.description).toBe('Custom description')
    expect(metadata.value.keywords).toEqual(['custom', 'keywords'])
  })

  it('should update metadata', () => {
    const { metadata, setMetadata } = useSEO()
    
    setMetadata({
      title: 'Updated Title',
      description: 'Updated description'
    })
    
    expect(metadata.value.title).toBe('Updated Title')
    expect(metadata.value.description).toBe('Updated description')
  })

  it('should generate breadcrumb structured data', () => {
    const { generateBreadcrumbStructuredData } = useSEO()
    
    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: 'Products', url: '/products' },
      { name: 'Product', url: '/products/123' }
    ]
    
    const structuredData = generateBreadcrumbStructuredData(breadcrumbs)
    
    expect(structuredData).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': 'https://test.com/'
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Products',
          'item': 'https://test.com/products'
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': 'Product',
          'item': 'https://test.com/products/123'
        }
      ]
    })
  })

  it('should generate article structured data', () => {
    const { generateArticleStructuredData } = useSEO()
    
    const article = {
      title: 'Test Article',
      description: 'Test article description',
      author: 'Test Author',
      publishedTime: '2024-01-01T00:00:00Z',
      modifiedTime: '2024-01-02T00:00:00Z',
      image: '/test-image.jpg'
    }
    
    const structuredData = generateArticleStructuredData(article)
    
    expect(structuredData).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': 'Test Article',
      'description': 'Test article description',
      'author': {
        '@type': 'Person',
        'name': 'Test Author'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Test Site',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://test.com/logo.png'
        }
      },
      'datePublished': '2024-01-01T00:00:00Z',
      'dateModified': '2024-01-02T00:00:00Z',
      'image': 'https://test.com/test-image.jpg',
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': 'https://test.com/test'
      }
    })
  })

  it('should generate web application structured data', () => {
    const { generateWebApplicationStructuredData } = useSEO()
    
    const structuredData = generateWebApplicationStructuredData()
    
    expect(structuredData).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'Test Site',
      'description': 'Test description',
      'url': 'https://test.com',
      'applicationCategory': 'DeveloperApplication',
      'operatingSystem': 'Web Browser',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      },
      'featureList': [
        'JSON parsing and validation',
        'JSONL file processing',
        'Interactive tree visualization',
        'Data conversion tools',
        'Educational tutorials',
        'Sample data library'
      ]
    })
  })
})