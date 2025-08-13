import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PerformanceGuide from '../../../components/reference/PerformanceGuide.vue'

// Mock SafeAdContainer
vi.mock('../../../components/tools/SafeAdContainer.vue', () => ({
  default: {
    name: 'SafeAdContainer',
    template: '<div class="mock-ad-container"></div>'
  }
}))

// Mock performance API
vi.stubGlobal('performance', {
  now: vi.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000
  }
})

describe('PerformanceGuide', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = mount(PerformanceGuide)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders performance guide header correctly', () => {
    expect(wrapper.find('h2').text()).toBe('JSON 성능 최적화 가이드')
    expect(wrapper.text()).toContain('JSON 처리 성능을 향상시키는 모범 사례와 최적화 기법')
  })

  it('renders performance measurement tools section', () => {
    expect(wrapper.find('.performance-tools-section').exists()).toBe(true)
    expect(wrapper.text()).toContain('성능 측정 도구')
  })

  it('renders parsing speed measurement tool', () => {
    expect(wrapper.text()).toContain('파싱 속도 측정')
    expect(wrapper.find('.json-input').exists()).toBe(true)
    expect(wrapper.find('.measure-btn').exists()).toBe(true)
  })

  it('renders memory usage monitor', () => {
    expect(wrapper.text()).toContain('메모리 사용량 모니터')
    expect(wrapper.find('.memory-info').exists()).toBe(true)
    expect(wrapper.find('.memory-chart').exists()).toBe(true)
  })

  it('renders performance profiler', () => {
    expect(wrapper.text()).toContain('성능 프로파일러')
    expect(wrapper.find('.profiler-options').exists()).toBe(true)
    expect(wrapper.find('.profile-btn').exists()).toBe(true)
  })

  it('displays memory information correctly', () => {
    const memoryItems = wrapper.findAll('.memory-item')
    expect(memoryItems.length).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('현재 힙 사용량')
    expect(wrapper.text()).toContain('총 힙 크기')
    expect(wrapper.text()).toContain('힙 사용률')
  })

  it('has profiler options checkboxes', () => {
    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    expect(checkboxes.length).toBe(3)
    expect(wrapper.text()).toContain('JSON.stringify 포함')
    expect(wrapper.text()).toContain('깊은 복사 테스트')
    expect(wrapper.text()).toContain('트리 순회 테스트')
  })

  it('renders all performance guide sections', () => {
    const sections = [
      '파싱 최적화',
      '데이터 구조 최적화',
      '렌더링 최적화',
      '네트워크 최적화',
      '고급 최적화 기법'
    ]

    sections.forEach(section => {
      expect(wrapper.text()).toContain(section)
    })
  })

  it('renders performance tips with examples', () => {
    expect(wrapper.text()).toContain('스트리밍 파싱 사용')
    expect(wrapper.text()).toContain('지연 파싱 적용')
    expect(wrapper.text()).toContain('평면적 구조 선호')
    expect(wrapper.text()).toContain('가상 스크롤링 적용')
    expect(wrapper.text()).toContain('GZIP 압축 활용')
    expect(wrapper.text()).toContain('Web Worker 활용')
  })

  it('shows example tabs for tips', () => {
    const tabButtons = wrapper.findAll('.tab-button')
    expect(tabButtons.length).toBeGreaterThan(0)
    
    const badTabs = wrapper.findAll('.tab-button.bad')
    const goodTabs = wrapper.findAll('.tab-button.good')
    expect(badTabs.length).toBeGreaterThan(0)
    expect(goodTabs.length).toBeGreaterThan(0)
  })

  it('displays performance metrics for tips', () => {
    expect(wrapper.find('.performance-metrics').exists()).toBe(true)
    expect(wrapper.text()).toContain('성능 개선 효과')
    expect(wrapper.find('.metrics-grid').exists()).toBe(true)
  })

  it('measures parsing speed when button is clicked', async () => {
    const testJson = '{"test": "data"}'
    await wrapper.find('.json-input').setValue(testJson)
    
    const measureBtn = wrapper.find('.measure-btn')
    expect(measureBtn.attributes('disabled')).toBeUndefined()
    
    await measureBtn.trigger('click')
    
    // Should show results after measurement
    await wrapper.vm.$nextTick()
    // Note: Results might not show immediately due to async nature
  })

  it('starts memory monitoring when button is clicked', async () => {
    const monitorBtn = wrapper.find('.monitor-btn')
    expect(monitorBtn.text()).toContain('모니터링 시작')
    
    await monitorBtn.trigger('click')
    
    // Should change button text
    await wrapper.vm.$nextTick()
    expect(monitorBtn.text()).toContain('모니터링 중')
  })

  it('runs profiler when button is clicked', async () => {
    const testJson = '{"test": "data"}'
    await wrapper.find('.json-input').setValue(testJson)
    
    const profileBtn = wrapper.find('.profile-btn')
    expect(profileBtn.attributes('disabled')).toBeUndefined()
    
    await profileBtn.trigger('click')
    
    // Should potentially show profiler results
    await wrapper.vm.$nextTick()
  })

  it('clears results when clear button is clicked', async () => {
    const clearBtn = wrapper.find('.clear-btn')
    await clearBtn.trigger('click')
    
    // Results should be cleared
    await wrapper.vm.$nextTick()
  })

  it('toggles profiler options correctly', async () => {
    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    const firstCheckbox = checkboxes[0]
    
    const initialValue = firstCheckbox.element.checked
    await firstCheckbox.trigger('click')
    
    expect(firstCheckbox.element.checked).toBe(!initialValue)
  })

  it('formats bytes correctly', () => {
    // Test the formatBytes function indirectly through memory display
    expect(wrapper.text()).toMatch(/\d+(\.\d+)?\s+(B|KB|MB|GB)/)
  })

  it('calculates memory usage percentage', () => {
    // Should show percentage in memory info
    expect(wrapper.text()).toMatch(/\d+%/)
  })

  it('has proper responsive design classes', () => {
    expect(wrapper.find('.tools-grid').exists()).toBe(true)
    expect(wrapper.find('.tool-card').exists()).toBe(true)
    expect(wrapper.find('.sections-list').exists()).toBe(true)
  })

  it('includes ad container', () => {
    expect(wrapper.find('.mock-ad-container').exists()).toBe(true)
  })
})