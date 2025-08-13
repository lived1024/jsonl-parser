import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorGuide from '../../../components/reference/ErrorGuide.vue'
import { errorPatternService } from '../../../services/ErrorPatternService'

// Mock the SafeAdContainer component
vi.mock('../../../components/tools/SafeAdContainer.vue', () => ({
  default: {
    name: 'SafeAdContainer',
    template: '<div class="mock-ad">Ad Container</div>'
  }
}))

describe('ErrorGuide', () => {
  it('should render error guide header', () => {
    const wrapper = mount(ErrorGuide)
    
    expect(wrapper.find('h2').text()).toBe('JSON 오류 해결 가이드')
    expect(wrapper.text()).toContain('일반적인 JSON 파싱 오류와 해결 방법을 안내합니다')
  })

  it('should display error analyzer section', () => {
    const wrapper = mount(ErrorGuide)
    
    expect(wrapper.find('.error-analyzer').exists()).toBe(true)
    expect(wrapper.find('.error-analyzer h3').text()).toBe('오류 메시지 분석기')
    expect(wrapper.find('.error-input').exists()).toBe(true)
    expect(wrapper.find('.analyze-button').exists()).toBe(true)
  })

  it('should display search functionality', () => {
    const wrapper = mount(ErrorGuide)
    
    expect(wrapper.find('.search-input').exists()).toBe(true)
    expect(wrapper.find('.search-input').attributes('placeholder')).toBe('오류 검색...')
  })

  it('should display category filters', () => {
    const wrapper = mount(ErrorGuide)
    
    const categoryButtons = wrapper.findAll('.category-button')
    expect(categoryButtons.length).toBeGreaterThan(0)
    
    // Check for expected categories
    const buttonTexts = categoryButtons.map(btn => btn.text())
    expect(buttonTexts).toContain('전체')
    expect(buttonTexts).toContain('구문 오류')
    expect(buttonTexts).toContain('구조 오류')
  })

  it('should display error items from service', () => {
    const wrapper = mount(ErrorGuide)
    
    const errorItems = wrapper.findAll('.error-item')
    expect(errorItems.length).toBeGreaterThan(0)
    
    // Check that error items have required elements
    const firstError = errorItems[0]
    expect(firstError.find('.error-header').exists()).toBe(true)
    expect(firstError.find('.error-description').exists()).toBe(true)
    expect(firstError.find('.error-example').exists()).toBe(true)
    expect(firstError.find('.error-solution').exists()).toBe(true)
  })

  it('should filter errors by search query', async () => {
    const wrapper = mount(ErrorGuide)
    
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('unexpected')
    
    const errorItems = wrapper.findAll('.error-item')
    expect(errorItems.length).toBeGreaterThan(0)
    
    // All visible errors should contain the search term
    for (const item of errorItems) {
      const text = item.text().toLowerCase()
      expect(text).toContain('unexpected')
    }
  })

  it('should filter errors by category', async () => {
    const wrapper = mount(ErrorGuide)
    
    // Click on syntax category
    const syntaxButton = wrapper.findAll('.category-button').find(btn => 
      btn.text() === '구문 오류'
    )
    
    if (syntaxButton) {
      await syntaxButton.trigger('click')
      
      // Should show only syntax errors
      const errorItems = wrapper.findAll('.error-item')
      expect(errorItems.length).toBeGreaterThan(0)
    }
  })

  it('should analyze error message when analyze button is clicked', async () => {
    const wrapper = mount(ErrorGuide)
    
    const errorInput = wrapper.find('.error-input')
    const analyzeButton = wrapper.find('.analyze-button')
    
    // Input an error message
    await errorInput.setValue('Unexpected token , in JSON at position 25')
    await analyzeButton.trigger('click')
    
    // Should show analysis results
    await wrapper.vm.$nextTick()
    
    const analysisResults = wrapper.find('.analysis-results')
    expect(analysisResults.exists()).toBe(true)
  })

  it('should disable analyze button when no error message', () => {
    const wrapper = mount(ErrorGuide)
    
    const analyzeButton = wrapper.find('.analyze-button')
    expect(analyzeButton.attributes('disabled')).toBeDefined()
  })

  it('should enable analyze button when error message is provided', async () => {
    const wrapper = mount(ErrorGuide)
    
    const errorInput = wrapper.find('.error-input')
    const analyzeButton = wrapper.find('.analyze-button')
    
    await errorInput.setValue('Some error message')
    
    expect(analyzeButton.attributes('disabled')).toBeUndefined()
  })

  it('should display severity badges for errors', () => {
    const wrapper = mount(ErrorGuide)
    
    const severityBadges = wrapper.findAll('.severity-badge')
    expect(severityBadges.length).toBeGreaterThan(0)
    
    // Check that severity badges have appropriate classes
    for (const badge of severityBadges) {
      const classes = badge.classes()
      const hasSeverityClass = classes.some(cls => 
        cls.startsWith('severity-')
      )
      expect(hasSeverityClass).toBe(true)
    }
  })

  it('should display common causes when available', () => {
    const wrapper = mount(ErrorGuide)
    
    const commonCauses = wrapper.findAll('.common-causes')
    expect(commonCauses.length).toBeGreaterThan(0)
    
    // Check that common causes have list items
    for (const causes of commonCauses) {
      const listItems = causes.findAll('li')
      expect(listItems.length).toBeGreaterThan(0)
    }
  })

  it('should display related errors when available', () => {
    const wrapper = mount(ErrorGuide)
    
    const relatedErrors = wrapper.findAll('.related-errors')
    
    if (relatedErrors.length > 0) {
      // Check that related errors have clickable links
      const relatedLinks = wrapper.findAll('.related-link')
      expect(relatedLinks.length).toBeGreaterThan(0)
    }
  })

  it('should display ad container', () => {
    const wrapper = mount(ErrorGuide)
    
    expect(wrapper.find('.ad-section').exists()).toBe(true)
    expect(wrapper.find('.mock-ad').exists()).toBe(true)
  })

  it('should show confidence badges in analysis results', async () => {
    const wrapper = mount(ErrorGuide)
    
    const errorInput = wrapper.find('.error-input')
    const analyzeButton = wrapper.find('.analyze-button')
    
    await errorInput.setValue('Unexpected end of JSON input')
    await analyzeButton.trigger('click')
    
    await wrapper.vm.$nextTick()
    
    const confidenceBadges = wrapper.findAll('.confidence-badge')
    if (confidenceBadges.length > 0) {
      // Check that confidence badges show percentage
      for (const badge of confidenceBadges) {
        expect(badge.text()).toMatch(/\d+% 일치/)
      }
    }
  })

  it('should handle empty search results gracefully', async () => {
    const wrapper = mount(ErrorGuide)
    
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('nonexistenttermshouldnotmatch')
    
    const errorItems = wrapper.findAll('.error-item')
    expect(errorItems.length).toBe(0)
  })
})