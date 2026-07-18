import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AdBanner from '../../components/common/AdBanner.vue'

describe('AdBanner', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    document.getElementById('adsbygoogle-js')?.remove()
  })

  it('애드센스 ID가 설정되지 않으면 아무것도 렌더링하지 않는다', () => {
    vi.stubEnv('VITE_ADSENSE_CLIENT', '')
    vi.stubEnv('VITE_ADSENSE_SLOT', '')
    const wrapper = mount(AdBanner)
    expect(wrapper.find('.adsbygoogle').exists()).toBe(false)
    expect(document.getElementById('adsbygoogle-js')).toBeNull()
  })

  it('애드센스 ID가 설정되면 광고 영역과 스크립트를 추가한다', () => {
    vi.stubEnv('VITE_ADSENSE_CLIENT', 'ca-pub-test')
    const wrapper = mount(AdBanner, { props: { adSlot: '1234567890' } })

    const ins = wrapper.find('ins.adsbygoogle')
    expect(ins.exists()).toBe(true)
    expect(ins.attributes('data-ad-client')).toBe('ca-pub-test')
    expect(ins.attributes('data-ad-slot')).toBe('1234567890')

    const script = document.getElementById('adsbygoogle-js') as HTMLScriptElement
    expect(script).not.toBeNull()
    expect(script.src).toContain('client=ca-pub-test')
  })
})
