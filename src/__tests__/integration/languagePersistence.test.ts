/**
 * 언어 설정 지속성 통합 테스트
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useI18nStore } from '../../stores/i18nStore'
import { useI18n } from '../../composables/useI18n'
import { Language } from '../../types/i18n'
import { I18N_STORAGE_KEY } from '../../constants/i18n'

// Mock localStorage for consistent testing
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

describe('Language Persistence Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    })
    
    // Reset mocks
    vi.clearAllMocks()
    
    // Reset document.documentElement.lang
    document.documentElement.lang = ''
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should persist language changes across store instances', async () => {
    // Mock localStorage to return null initially (no stored settings)
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockImplementation(() => {})
    
    // Create first store instance
    const store1 = useI18nStore()
    await store1.initialize()
    
    // Change language to Korean
    await store1.changeLanguage(Language.KO)
    expect(store1.currentLanguage).toBe(Language.KO)
    
    // Verify localStorage.setItem was called
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      I18N_STORAGE_KEY,
      expect.stringContaining('"language":"ko"')
    )
    
    // Mock localStorage to return the Korean settings for the next store instance
    const mockSettings = {
      language: Language.KO,
      lastUpdated: Date.now()
    }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSettings))
    
    // Create new store instance (simulating page refresh)
    setActivePinia(createPinia())
    const store2 = useI18nStore()
    await store2.initialize()
    
    // Should load Korean from localStorage
    expect(store2.currentLanguage).toBe(Language.KO)
    expect(document.documentElement.lang).toBe(Language.KO)
  })

  it('should work correctly with useI18n composable', async () => {
    // Mock localStorage
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockImplementation(() => {})
    
    const { changeLanguage, currentLanguage, getLanguageStatus } = useI18n()
    
    // Initial state
    expect(currentLanguage.value).toBe(Language.EN)
    
    // Change to Korean
    await changeLanguage(Language.KO)
    expect(currentLanguage.value).toBe(Language.KO)
    
    // Mock that localStorage now has the Korean setting
    const mockSettings = {
      language: Language.KO,
      lastUpdated: Date.now()
    }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSettings))
    
    // Check status
    const status = getLanguageStatus()
    expect(status.current).toBe(Language.KO)
    expect(status.hasStoredSettings).toBe(true)
    expect(status.isStoredLanguage).toBe(true)
  })

  it('should handle browser language detection on first visit', async () => {
    // Mock localStorage to return null (no stored settings)
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockImplementation(() => {})
    
    // Mock Korean browser language
    Object.defineProperty(navigator, 'language', {
      value: 'ko-KR',
      configurable: true
    })
    Object.defineProperty(navigator, 'languages', {
      value: ['ko-KR', 'ko', 'en-US'],
      configurable: true
    })
    
    const store = useI18nStore()
    await store.initialize()
    
    // Should detect and use Korean
    expect(store.currentLanguage).toBe(Language.KO)
    
    // Should attempt to save to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      I18N_STORAGE_KEY,
      expect.stringContaining('"language":"ko"')
    )
  })

  it('should prioritize localStorage over browser language', async () => {
    // Mock localStorage with English settings
    const settings = {
      language: Language.EN,
      lastUpdated: Date.now()
    }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(settings))
    
    // Mock Korean browser language
    Object.defineProperty(navigator, 'language', {
      value: 'ko-KR',
      configurable: true
    })
    Object.defineProperty(navigator, 'languages', {
      value: ['ko-KR', 'ko'],
      configurable: true
    })
    
    const store = useI18nStore()
    await store.initialize()
    
    // Should use English from localStorage, not Korean from browser
    expect(store.currentLanguage).toBe(Language.EN)
  })

  it('should handle localStorage corruption gracefully', async () => {
    // Mock corrupted localStorage data
    localStorageMock.getItem.mockReturnValue('invalid json')
    localStorageMock.setItem.mockImplementation(() => {})
    
    const store = useI18nStore()
    await store.initialize()
    
    // Should fallback to browser/default language
    expect([Language.EN, Language.KO]).toContain(store.currentLanguage)
    
    // Should attempt to repair localStorage by saving current language
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })

  it('should update HTML lang attribute consistently', async () => {
    const store = useI18nStore()
    await store.initialize()
    
    // Change to Korean
    await store.changeLanguage(Language.KO)
    expect(document.documentElement.lang).toBe(Language.KO)
    
    // Change to English
    await store.changeLanguage(Language.EN)
    expect(document.documentElement.lang).toBe(Language.EN)
  })

  it('should provide accurate language status information', async () => {
    // Mock localStorage with Korean settings
    const mockSettings = {
      language: Language.KO,
      lastUpdated: Date.now()
    }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSettings))
    
    // Mock browser language
    Object.defineProperty(navigator, 'language', {
      value: 'ko-KR',
      configurable: true
    })
    Object.defineProperty(navigator, 'languages', {
      value: ['ko-KR', 'ko'],
      configurable: true
    })
    
    const store = useI18nStore()
    await store.initialize()
    
    const status = store.getLanguageStatus()
    
    expect(status.current).toBe(Language.KO)
    expect(status.browser).toBe(Language.KO)
    expect(status.stored).toBe(Language.KO)
    expect(status.isBrowserLanguage).toBe(true)
    expect(status.isStoredLanguage).toBe(true)
    expect(status.hasStoredSettings).toBe(true)
  })
})