import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import App from '../../App.vue'
import router from '../../router'

describe('콘텐츠 페이지 스모크 테스트', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mountAt = async (path: string) => {
    await router.push(path)
    await router.isReady()
    const wrapper = mount(App, {
      global: { plugins: [router] }
    })
    await flushPromises()
    return wrapper
  }

  it('/privacy 페이지에 개인정보처리방침 내용이 렌더링된다', async () => {
    const wrapper = await mountAt('/privacy')
    expect(wrapper.text()).toContain('lived1024@taxai.co.kr')
    expect(wrapper.text()).toContain('AdSense')
  })

  it('/about 페이지에 서비스 소개가 렌더링된다', async () => {
    const wrapper = await mountAt('/about')
    expect(wrapper.text()).toContain('JSONL Parser')
    expect(wrapper.text()).toContain('lived1024@taxai.co.kr')
  })

  it('/guide 페이지에 가이드 섹션들이 렌더링된다', async () => {
    const wrapper = await mountAt('/guide')
    expect(wrapper.text()).toContain('JSON / JSONL')
    expect(wrapper.find('.data-type-guide').exists()).toBe(true)
    expect(wrapper.find('.troubleshooting-guide').exists()).toBe(true)
    expect(wrapper.find('.performance-tips').exists()).toBe(true)
  })

  it('/faq 페이지에 FAQ 섹션이 렌더링된다', async () => {
    const wrapper = await mountAt('/faq')
    expect(wrapper.find('.faq-section').exists()).toBe(true)
  })

  it('푸터에 콘텐츠 페이지 링크가 표시된다', async () => {
    const wrapper = await mountAt('/')
    const hrefs = wrapper
      .findAll('.footer-links a')
      .map((link) => link.attributes('href'))
    expect(hrefs).toEqual(['/', '/guide', '/faq', '/about', '/privacy'])
  })

  it('존재하지 않는 경로는 홈으로 리다이렉트된다', async () => {
    await router.push('/no-such-page')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/')
  })
})
