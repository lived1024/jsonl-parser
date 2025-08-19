/**
 * Tests for User Preference Store
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserPreferenceStore } from '../../stores/userPreferenceStore'
import { USER_PREFERENCE_CONSTANTS } from '../../types/userPreferences'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock UserPreferenceService
vi.mock('../../services/UserPreferenceService', () => ({
  UserPreferenceService: {
    getInstance: () => ({
      initialize: vi.fn().mockResolvedValue(undefined),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
  }
}))

describe('useUserPreferenceStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with default preferences', () => {
      const store = useUserPreferenceStore()
      
      expect(store.preferences).toEqual(USER_PREFERENCE_CONSTANTS.DEFAULT_PREFERENCES)
      expect(store.privacySettings).toEqual(USER_PREFERENCE_CONSTANTS.DEFAULT_PRIVACY)
      expect(store.isInitialized).toBe(false)
    })

    it('should initialize store and load preferences', async () => {
      const mockPreferences = {
        ...USER_PREFERENCE_CONSTANTS.DEFAULT_PREFERENCES,
        theme: 'dark' as const,
        favoriteTools: ['json-validator']
      }

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === USER_PREFERENCE_CONSTANTS.STORAGE_KEY) {
          return JSON.stringify(mockPreferences)
        }
        if (key === USER_PREFERENCE_CONSTANTS.PRIVACY_STORAGE_KEY) {
          return JSON.stringify(USER_PREFERENCE_CONSTANTS.DEFAULT_PRIVACY)
        }
        return null
      })

      const store = useUserPreferenceStore()
      await store.initialize()

      expect(store.isInitialized).toBe(true)
      expect(store.preferences.theme).toBe('dark')
      expect(store.preferences.favoriteTools).toEqual(['json-validator'])
    })

    it('should handle corrupted localStorage data gracefully', async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === USER_PREFERENCE_CONSTANTS.STORAGE_KEY) {
          return 'invalid-json'
        }
        return null
      })

      const store = useUserPreferenceStore()
      await store.initialize()

      expect(store.preferences).toEqual(USER_PREFERENCE_CONSTANTS.DEFAULT_PREFERENCES)
      expect(store.isInitialized).toBe(true)
    })
  })

  describe('preference updates', () => {
    it('should update user preferences', async () => {
      const store = useUserPreferenceStore()
      await store.initialize()

      store.updatePreference('theme', 'dark')

      expect(store.preferences.theme).toBe('dark')
      expect(store.preferences.lastUpdated).toBeGreaterThan(0)
    })

    it('should update privacy settings', async () => {
      const store = useUserPreferenceStore()
      await store.initialize()

      store.updatePrivacySetting('trackingEnabled', false)

      expect(store.privacySettings.trackingEnabled).toBe(false)
    })

    it('should clear session when tracking is disabled', async () => {
      const store = useUserPreferenceStore()
      await store.initialize()

      // Initialize session first
      store.updatePrivacySetting('trackingEnabled', true)
      expect(store.currentSession).toBeTruthy()

      // Disable tracking
      store.updatePrivacySetting('trackingEnabled', false)
      expect(store.currentSession).toBeNull()
    })
  })

  describe('tracking functionality', () => {
    it('should track page views when tracking is enabled', async () => {
      const store = useUserPreferenceStore()
      store.updatePrivacySetting('trackingEnabled', true)
      await store.initialize()

      store.trackPageView('/test-page', 'Test Page', 'https://example.com')

      expect(store.currentSession?.pageViews).toHaveLength(1)
      expect(store.currentSession?.pageViews[0]).toMatchObject({
        path: '/test-page',
        title: 'Test Page',
        referrer: 'https://example.com'
      })
    })

    it('should not track when tracking is disabled', async () => {
      const store = useUserPreferenceStore()
      store.updatePrivacySetting('trackingEnabled', false)
      await store.initialize()

      store.trackPageView('/test-page', 'Test Page')

      expect(store.currentSession).toBeNull()
    })

    it('should track click interactions', async () => {
      const store = useUserPreferenceStore()
      store.updatePrivacySetting('trackingEnabled', true)
      await store.initialize()

      store.trackClick('button', 'click', { x: 100, y: 200 }, 'main')

      expect(store.currentSession?.clickPatterns).toHaveLength(1)
      expect(store.currentSession?.clickPatterns[0]).toMatchObject({
        element: 'button',
        elementType: 'click',
        position: { x: 100, y: 200 },
        context: 'main'
      })
    })

    it('should track tool usage', async () => {
      const store = useUserPreferenceStore()
      store.updatePrivacySetting('trackingEnabled', true)
      await store.initialize()

      store.trackToolUsage('json-validator', 'medium', 1500, true, undefined, 'tools')

      expect(store.currentSession?.toolUsage).toHaveLength(1)
      expect(store.currentSession?.toolUsage[0]).toMatchObject({
        toolName: 'json-validator',
        inputSize: 'medium',
        processingTime: 1500,
        success: true,
        context: 'tools'
      })

      // Should also update recent tools
      expect(store.preferences.recentTools).toContain('json-validator')
    })

    it('should track content engagement', async () => {
      const store = useUserPreferenceStore()
      store.updatePrivacySetting('trackingEnabled', true)
      await store.initialize()

      store.trackContentEngagement('tutorial-1', 'tutorial', 120000, 0.8, 5, 4)

      expect(store.currentSession?.contentEngagement).toHaveLength(1)
      expect(store.currentSession?.contentEngagement[0]).toMatchObject({
        contentId: 'tutorial-1',
        contentType: 'tutorial',
        engagementTime: 120000,
        completionRate: 0.8,
        interactions: 5,
        rating: 4
      })

      // Should update recently viewed content
      expect(store.preferences.recentlyViewedContent).toContain('tutorial-1')
    })
  })

  describe('tutorial progress', () => {
    it('should update tutorial progress', async () => {
      const store = useUserPreferenceStore()
      await store.initialize()

      store.updateTutorialProgress('json-basics', 75)

      expect(store.preferences.tutorialProgress['json-basics']).toBe(75)
    })

    it('should mark tutorial as completed when progress reaches 100%', async () => {
      const store = useUserPreferenceStore()
      await store.initialize()

      store.updateTutorialProgress('json-basics', 100)

      expect(store.preferences.tutorialProgress['json-basics']).toBe(100)
      expect(store.preferences.completedTutorials).toContain('json-basics')
    })
  })

  describe('tool management', () => {
    it('should add tool to recent tools', async () => {
      const store = useUserPreferenceStore()
      await store.initialize()

      store.addToRecentTools('json-validator')
      store.addToRecentTools('data-converter')

      expect(store.preferences.recentTools).toEqual(['data-converter', 'json-validator'])
    })

    it('should move existing tool to front of recent tools', async () => {
      const store = useUserPreferenceStore()
      await store.initialize()

      store.addToRecentTools('json-validator')
      store.addToRecentTools('data-converter')
      store.addToRecentTools('json-validator') // Move to front

      expect(store.preferences.recentTools).toEqual(['json-validator', 'data-converter'])
    })

    it('should limit recent tools to 10 items', async () => {
      const store = useUserPreferenceStore()
      await store.initialize()

      // Add 12 tools
      for (let i = 1; i <= 12; i++) {
        store.addToRecentTools(`tool-${i}`)
      }

      expect(store.preferences.recentTools).toHaveLength(10)
      expect(store.preferences.recentTools[0]).toBe('tool-12') // Most recent first
    })

    it('should add and remove favorite tools', async () => {
      const store = useUserPreferenceStore()
      await store.initialize()

      store.addToFavoriteTools('json-validator')
      expect(store.preferences.favoriteTools).toContain('json-validator')

      store.removeFromFavoriteTools('json-validator')
      expect(store.preferences.favoriteTools).not.toContain('json-validator')
    })

    it('should not add duplicate favorite tools', async () => {
      const store = useUserPreferenceStore()
      await store.initialize()

      store.addToFavoriteTools('json-validator')
      store.addToFavoriteTools('json-validator') // Duplicate

      expect(store.preferences.favoriteTools.filter(tool => tool === 'json-validator')).toHaveLength(1)
    })
  })

  describe('data management', () => {
    it('should save session data', async () => {
      const store = useUserPreferenceStore()
      store.updatePrivacySetting('trackingEnabled', true)
      await store.initialize()

      // Add some session data
      store.trackPageView('/test', 'Test')
      store.trackClick('button', 'click', { x: 0, y: 0 }, 'test')

      await store.saveSessionData()

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        USER_PREFERENCE_CONSTANTS.BEHAVIOR_STORAGE_KEY,
        expect.any(String)
      )
    })

    it('should clear all user data', async () => {
      const store = useUserPreferenceStore()
      await store.initialize()

      await store.clearAllData()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(USER_PREFERENCE_CONSTANTS.STORAGE_KEY)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(USER_PREFERENCE_CONSTANTS.BEHAVIOR_STORAGE_KEY)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(USER_PREFERENCE_CONSTANTS.ANALYTICS_STORAGE_KEY)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(USER_PREFERENCE_CONSTANTS.PRIVACY_STORAGE_KEY)

      // Check that preferences are reset (ignoring timestamps which may differ)
      expect(store.preferences.theme).toBe(USER_PREFERENCE_CONSTANTS.DEFAULT_PREFERENCES.theme)
      expect(store.preferences.language).toBe(USER_PREFERENCE_CONSTANTS.DEFAULT_PREFERENCES.language)
      expect(store.preferences.favoriteTools).toEqual(USER_PREFERENCE_CONSTANTS.DEFAULT_PREFERENCES.favoriteTools)
      
      expect(store.privacySettings).toEqual(USER_PREFERENCE_CONSTANTS.DEFAULT_PRIVACY)
      expect(store.currentSession).toBeNull()
      expect(store.analytics).toBeNull()
    })
  })

  describe('computed properties', () => {
    it('should compute tracking enabled correctly', async () => {
      const store = useUserPreferenceStore()
      await store.initialize()

      expect(store.trackingEnabled).toBe(true) // Default

      store.updatePrivacySetting('trackingEnabled', false)
      expect(store.trackingEnabled).toBe(false)
    })

    it('should compute personalized content enabled correctly', async () => {
      const store = useUserPreferenceStore()
      await store.initialize()

      expect(store.personalizedContentEnabled).toBe(true) // Default

      store.updatePrivacySetting('personalizedContent', false)
      expect(store.personalizedContentEnabled).toBe(false)
    })

    it('should compute analytics enabled correctly', async () => {
      const store = useUserPreferenceStore()
      await store.initialize()

      expect(store.analyticsEnabled).toBe(false) // Default

      store.updatePrivacySetting('analyticsConsent', true)
      expect(store.analyticsEnabled).toBe(true)
    })
  })
})