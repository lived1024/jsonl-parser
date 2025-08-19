/**
 * User Preference Store
 * Manages user preferences and behavior tracking with privacy-conscious approach
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type {
  UserPreferences,
  UserBehaviorData,
  UserPreferenceAnalytics,
  UserPreferenceStorage,
  PrivacySettings,
  UserPreferenceEvent,
  PageViewData,
  ClickPattern,
  ScrollBehavior,
  FeatureUsage,
  ToolUsageData,
  ContentEngagement
} from '../types/userPreferences'
import {
  USER_PREFERENCE_CONSTANTS,
  isValidUserPreferences,
  isValidUserBehaviorData
} from '../types/userPreferences'

export const useUserPreferenceStore = defineStore('userPreference', () => {
  // State
  const preferences = ref<UserPreferences>({ ...USER_PREFERENCE_CONSTANTS.DEFAULT_PREFERENCES })
  const privacySettings = ref<PrivacySettings>({ ...USER_PREFERENCE_CONSTANTS.DEFAULT_PRIVACY })
  const currentSession = ref<UserBehaviorData | null>(null)
  const analytics = ref<UserPreferenceAnalytics | null>(null)
  const isInitialized = ref(false)
  const isLoading = ref(false)

  // Computed
  const trackingEnabled = computed(() => privacySettings.value.trackingEnabled)
  const personalizedContentEnabled = computed(() => privacySettings.value.personalizedContent)
  const analyticsEnabled = computed(() => privacySettings.value.analyticsConsent)

  // Session management
  const sessionId = computed(() => currentSession.value?.sessionId || generateSessionId())
  const sessionStartTime = computed(() => currentSession.value?.sessionStartTime || Date.now())

  /**
   * Initialize the user preference store
   */
  const initialize = async (): Promise<void> => {
    if (isInitialized.value) return

    try {
      isLoading.value = true
      
      // Load preferences from localStorage
      await loadPreferences()
      await loadPrivacySettings()
      
      // Initialize current session
      initializeSession()
      
      // Set up watchers for auto-save
      setupWatchers()
      
      // Clean up old data
      await cleanupOldData()
      
      isInitialized.value = true
    } catch (error) {
      console.error('Failed to initialize user preference store:', error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load user preferences from localStorage
   */
  const loadPreferences = async (): Promise<void> => {
    try {
      const stored = localStorage.getItem(USER_PREFERENCE_CONSTANTS.STORAGE_KEY)
      if (stored) {
        const parsedData = JSON.parse(stored)
        if (isValidUserPreferences(parsedData)) {
          preferences.value = {
            ...USER_PREFERENCE_CONSTANTS.DEFAULT_PREFERENCES,
            ...parsedData,
            lastUpdated: Date.now()
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load user preferences:', error)
      preferences.value = { ...USER_PREFERENCE_CONSTANTS.DEFAULT_PREFERENCES }
    }
  }

  /**
   * Save user preferences to localStorage
   */
  const savePreferences = async (): Promise<void> => {
    try {
      preferences.value.lastUpdated = Date.now()
      localStorage.setItem(
        USER_PREFERENCE_CONSTANTS.STORAGE_KEY,
        JSON.stringify(preferences.value)
      )
    } catch (error) {
      console.warn('Failed to save user preferences:', error)
    }
  }

  /**
   * Load privacy settings from localStorage
   */
  const loadPrivacySettings = async (): Promise<void> => {
    try {
      const stored = localStorage.getItem(USER_PREFERENCE_CONSTANTS.PRIVACY_STORAGE_KEY)
      if (stored) {
        const parsedData = JSON.parse(stored)
        privacySettings.value = {
          ...USER_PREFERENCE_CONSTANTS.DEFAULT_PRIVACY,
          ...parsedData
        }
      }
    } catch (error) {
      console.warn('Failed to load privacy settings:', error)
      privacySettings.value = { ...USER_PREFERENCE_CONSTANTS.DEFAULT_PRIVACY }
    }
  }

  /**
   * Save privacy settings to localStorage
   */
  const savePrivacySettings = async (): Promise<void> => {
    try {
      localStorage.setItem(
        USER_PREFERENCE_CONSTANTS.PRIVACY_STORAGE_KEY,
        JSON.stringify(privacySettings.value)
      )
    } catch (error) {
      console.warn('Failed to save privacy settings:', error)
    }
  }

  /**
   * Initialize current session
   */
  const initializeSession = (): void => {
    if (!trackingEnabled.value) return

    currentSession.value = {
      sessionId: generateSessionId(),
      sessionStartTime: Date.now(),
      sessionDuration: 0,
      pageViews: [],
      clickPatterns: [],
      scrollBehavior: [],
      searchQueries: [],
      featureUsage: [],
      toolUsage: [],
      contentEngagement: [],
      performanceMetrics: [],
      errorEvents: [],
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`
    }
  }

  /**
   * Update user preference
   */
  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): void => {
    preferences.value[key] = value
    preferences.value.lastUpdated = Date.now()
    
    // Track preference change
    trackPreferenceEvent('preference_change', key as string, value)
  }

  /**
   * Update privacy setting
   */
  const updatePrivacySetting = <K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K]
  ): void => {
    privacySettings.value[key] = value
    
    // If tracking is disabled, clear current session
    if (key === 'trackingEnabled' && !value) {
      currentSession.value = null
    } else if (key === 'trackingEnabled' && value) {
      initializeSession()
    }
  }

  /**
   * Track page view
   */
  const trackPageView = (path: string, title: string, referrer?: string): void => {
    if (!trackingEnabled.value || !currentSession.value) return

    const pageView: PageViewData = {
      path,
      title,
      timestamp: Date.now(),
      duration: 0,
      referrer
    }

    currentSession.value.pageViews.push(pageView)
    
    // Update session duration
    currentSession.value.sessionDuration = Date.now() - currentSession.value.sessionStartTime
  }

  /**
   * Track click pattern
   */
  const trackClick = (
    element: string,
    elementType: string,
    position: { x: number; y: number },
    context: string
  ): void => {
    if (!trackingEnabled.value || !currentSession.value) return

    const clickPattern: ClickPattern = {
      element,
      elementType,
      position,
      timestamp: Date.now(),
      context
    }

    currentSession.value.clickPatterns.push(clickPattern)
  }

  /**
   * Track scroll behavior
   */
  const trackScrollBehavior = (
    maxScrollDepth: number,
    scrollSpeed: number,
    pausePoints: number[]
  ): void => {
    if (!trackingEnabled.value || !currentSession.value) return

    const scrollBehavior: ScrollBehavior = {
      maxScrollDepth,
      scrollSpeed,
      pausePoints,
      timestamp: Date.now(),
      pageHeight: document.documentElement.scrollHeight
    }

    currentSession.value.scrollBehavior.push(scrollBehavior)
  }

  /**
   * Track feature usage
   */
  const trackFeatureUsage = (
    featureName: string,
    action: string,
    usageTime: number,
    success: boolean
  ): void => {
    if (!trackingEnabled.value || !currentSession.value) return

    // Find existing feature usage or create new one
    let featureUsage = currentSession.value.featureUsage.find(f => f.featureName === featureName)
    
    if (!featureUsage) {
      featureUsage = {
        featureName,
        action,
        frequency: 0,
        lastUsed: Date.now(),
        averageUsageTime: 0,
        successRate: 0
      }
      currentSession.value.featureUsage.push(featureUsage)
    }

    // Update feature usage statistics
    featureUsage.frequency += 1
    featureUsage.lastUsed = Date.now()
    featureUsage.averageUsageTime = (featureUsage.averageUsageTime + usageTime) / 2
    featureUsage.successRate = success 
      ? (featureUsage.successRate + 1) / featureUsage.frequency
      : featureUsage.successRate * (featureUsage.frequency - 1) / featureUsage.frequency
  }

  /**
   * Track tool usage
   */
  const trackToolUsage = (
    toolName: string,
    inputSize: 'small' | 'medium' | 'large',
    processingTime: number,
    success: boolean,
    errorType?: string,
    context?: string
  ): void => {
    if (!trackingEnabled.value || !currentSession.value) return

    const toolUsage: ToolUsageData = {
      toolName,
      inputSize,
      processingTime,
      success,
      errorType,
      timestamp: Date.now(),
      context: context || 'unknown'
    }

    currentSession.value.toolUsage.push(toolUsage)

    // Update tool preferences
    if (success) {
      addToRecentTools(toolName)
    }
  }

  /**
   * Track content engagement
   */
  const trackContentEngagement = (
    contentId: string,
    contentType: 'tutorial' | 'reference' | 'sample' | 'guide',
    engagementTime: number,
    completionRate: number,
    interactions: number,
    rating?: number
  ): void => {
    if (!trackingEnabled.value || !currentSession.value) return

    const contentEngagement: ContentEngagement = {
      contentId,
      contentType,
      engagementTime,
      completionRate,
      interactions,
      rating,
      timestamp: Date.now()
    }

    currentSession.value.contentEngagement.push(contentEngagement)

    // Update content preferences
    addToRecentlyViewedContent(contentId)
    
    // If high engagement, add to preferred content types
    if (completionRate > 0.8 && engagementTime > 60000) { // 1 minute
      addToPreferredContentTypes(contentType)
    }
  }

  /**
   * Add tool to recent tools list
   */
  const addToRecentTools = (toolName: string): void => {
    const recentTools = [...preferences.value.recentTools]
    const index = recentTools.indexOf(toolName)
    
    if (index > -1) {
      recentTools.splice(index, 1)
    }
    
    recentTools.unshift(toolName)
    preferences.value.recentTools = recentTools.slice(0, 10) // Keep only 10 recent tools
  }

  /**
   * Add tool to favorites
   */
  const addToFavoriteTools = (toolName: string): void => {
    if (!preferences.value.favoriteTools.includes(toolName)) {
      preferences.value.favoriteTools.push(toolName)
    }
  }

  /**
   * Remove tool from favorites
   */
  const removeFromFavoriteTools = (toolName: string): void => {
    preferences.value.favoriteTools = preferences.value.favoriteTools.filter(t => t !== toolName)
  }

  /**
   * Add content to recently viewed
   */
  const addToRecentlyViewedContent = (contentId: string): void => {
    const recentContent = [...preferences.value.recentlyViewedContent]
    const index = recentContent.indexOf(contentId)
    
    if (index > -1) {
      recentContent.splice(index, 1)
    }
    
    recentContent.unshift(contentId)
    preferences.value.recentlyViewedContent = recentContent.slice(0, 20) // Keep only 20 recent items
  }

  /**
   * Add content type to preferred types
   */
  const addToPreferredContentTypes = (contentType: string): void => {
    if (!preferences.value.preferredContentTypes.includes(contentType)) {
      preferences.value.preferredContentTypes.push(contentType)
    }
  }

  /**
   * Update tutorial progress
   */
  const updateTutorialProgress = (tutorialId: string, progress: number): void => {
    preferences.value.tutorialProgress[tutorialId] = progress
    
    // Mark as completed if progress is 100%
    if (progress >= 100 && !preferences.value.completedTutorials.includes(tutorialId)) {
      preferences.value.completedTutorials.push(tutorialId)
    }
  }

  /**
   * Track preference event
   */
  const trackPreferenceEvent = (
    type: 'preference_change' | 'behavior_track' | 'analytics_update',
    category: string,
    data: any
  ): void => {
    if (!trackingEnabled.value) return

    const event: UserPreferenceEvent = {
      type,
      category,
      action: 'update',
      data,
      timestamp: Date.now(),
      sessionId: sessionId.value
    }

    // Store event in session data
    if (currentSession.value) {
      // Add to a general events array if needed
      // For now, we'll just log it
      console.debug('User preference event:', event)
    }
  }

  /**
   * Generate analytics from behavior data
   */
  const generateAnalytics = async (): Promise<void> => {
    if (!trackingEnabled.value || !analyticsEnabled.value) return

    try {
      // Load historical behavior data
      const behaviorData = await loadBehaviorData()
      
      if (behaviorData.length < USER_PREFERENCE_CONSTANTS.MIN_DATA_POINTS) {
        return // Not enough data for meaningful analytics
      }

      // Generate analytics
      const newAnalytics: UserPreferenceAnalytics = {
        // Usage patterns
        mostUsedFeatures: calculateMostUsedFeatures(behaviorData),
        preferredWorkflow: calculatePreferredWorkflow(behaviorData),
        peakUsageHours: calculatePeakUsageHours(behaviorData),
        averageSessionDuration: calculateAverageSessionDuration(behaviorData),
        
        // Learning patterns
        learningVelocity: calculateLearningVelocity(),
        preferredLearningStyle: calculatePreferredLearningStyle(behaviorData),
        strugglingAreas: calculateStrugglingAreas(),
        
        // Tool preferences
        toolEfficiency: calculateToolEfficiency(behaviorData),
        preferredDataSizes: calculatePreferredDataSizes(behaviorData),
        commonErrorPatterns: calculateCommonErrorPatterns(behaviorData),
        
        // Content preferences
        contentPreferences: calculateContentPreferences(behaviorData),
        readingSpeed: calculateReadingSpeed(behaviorData),
        attentionSpan: calculateAttentionSpan(behaviorData),
        
        // Behavioral insights
        navigationPatterns: calculateNavigationPatterns(behaviorData),
        searchBehavior: calculateSearchBehavior(behaviorData),
        
        // Metadata
        analysisDate: Date.now(),
        dataPoints: behaviorData.length,
        confidenceScore: calculateConfidenceScore(behaviorData.length)
      }

      analytics.value = newAnalytics
      await saveAnalytics()
      
    } catch (error) {
      console.error('Failed to generate analytics:', error)
    }
  }

  /**
   * Save current session data
   */
  const saveSessionData = async (): Promise<void> => {
    if (!trackingEnabled.value || !currentSession.value) return

    try {
      // Update session duration
      currentSession.value.sessionDuration = Date.now() - currentSession.value.sessionStartTime

      // Load existing behavior data
      const existingData = await loadBehaviorData()
      
      // Add current session
      existingData.push(currentSession.value)
      
      // Keep only recent data (within retention period)
      const retentionPeriod = privacySettings.value.dataRetentionDays * 24 * 60 * 60 * 1000
      const cutoffTime = Date.now() - retentionPeriod
      const filteredData = existingData.filter(session => session.timestamp > cutoffTime)
      
      // Limit number of records
      const limitedData = filteredData.slice(-USER_PREFERENCE_CONSTANTS.MAX_BEHAVIOR_RECORDS)
      
      // Save to localStorage
      localStorage.setItem(
        USER_PREFERENCE_CONSTANTS.BEHAVIOR_STORAGE_KEY,
        JSON.stringify(limitedData)
      )
      
    } catch (error) {
      console.warn('Failed to save session data:', error)
    }
  }

  /**
   * Load behavior data from localStorage
   */
  const loadBehaviorData = async (): Promise<UserBehaviorData[]> => {
    try {
      const stored = localStorage.getItem(USER_PREFERENCE_CONSTANTS.BEHAVIOR_STORAGE_KEY)
      if (stored) {
        const parsedData = JSON.parse(stored)
        if (Array.isArray(parsedData)) {
          return parsedData.filter(isValidUserBehaviorData)
        }
      }
    } catch (error) {
      console.warn('Failed to load behavior data:', error)
    }
    return []
  }

  /**
   * Save analytics to localStorage
   */
  const saveAnalytics = async (): Promise<void> => {
    if (!analytics.value) return

    try {
      localStorage.setItem(
        USER_PREFERENCE_CONSTANTS.ANALYTICS_STORAGE_KEY,
        JSON.stringify(analytics.value)
      )
    } catch (error) {
      console.warn('Failed to save analytics:', error)
    }
  }

  /**
   * Clean up old data
   */
  const cleanupOldData = async (): Promise<void> => {
    try {
      const retentionPeriod = privacySettings.value.dataRetentionDays * 24 * 60 * 60 * 1000
      const cutoffTime = Date.now() - retentionPeriod

      // Clean up behavior data
      const behaviorData = await loadBehaviorData()
      const filteredBehaviorData = behaviorData.filter(session => session.timestamp > cutoffTime)
      
      if (filteredBehaviorData.length !== behaviorData.length) {
        localStorage.setItem(
          USER_PREFERENCE_CONSTANTS.BEHAVIOR_STORAGE_KEY,
          JSON.stringify(filteredBehaviorData)
        )
      }

    } catch (error) {
      console.warn('Failed to cleanup old data:', error)
    }
  }

  /**
   * Clear all user data
   */
  const clearAllData = async (): Promise<void> => {
    try {
      localStorage.removeItem(USER_PREFERENCE_CONSTANTS.STORAGE_KEY)
      localStorage.removeItem(USER_PREFERENCE_CONSTANTS.BEHAVIOR_STORAGE_KEY)
      localStorage.removeItem(USER_PREFERENCE_CONSTANTS.ANALYTICS_STORAGE_KEY)
      localStorage.removeItem(USER_PREFERENCE_CONSTANTS.PRIVACY_STORAGE_KEY)
      
      // Reset state
      preferences.value = { ...USER_PREFERENCE_CONSTANTS.DEFAULT_PREFERENCES }
      privacySettings.value = { ...USER_PREFERENCE_CONSTANTS.DEFAULT_PRIVACY }
      currentSession.value = null
      analytics.value = null
      
    } catch (error) {
      console.error('Failed to clear all data:', error)
    }
  }

  /**
   * Setup watchers for auto-save
   */
  const setupWatchers = (): void => {
    // Watch preferences for changes (debounced to avoid recursive updates)
    let preferencesTimeout: NodeJS.Timeout
    watch(
      preferences,
      () => {
        clearTimeout(preferencesTimeout)
        preferencesTimeout = setTimeout(() => {
          savePreferences()
        }, 100)
      },
      { deep: true }
    )

    // Watch privacy settings for changes (debounced to avoid recursive updates)
    let privacyTimeout: NodeJS.Timeout
    watch(
      privacySettings,
      () => {
        clearTimeout(privacyTimeout)
        privacyTimeout = setTimeout(() => {
          savePrivacySettings()
        }, 100)
      },
      { deep: true }
    )

    // Save session data periodically
    setInterval(() => {
      if (currentSession.value) {
        saveSessionData()
      }
    }, 30000) // Every 30 seconds

    // Generate analytics periodically
    setInterval(() => {
      generateAnalytics()
    }, 300000) // Every 5 minutes
  }

  /**
   * Generate unique session ID
   */
  const generateSessionId = (): string => {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
  }

  // Analytics calculation helper functions
  const calculateMostUsedFeatures = (behaviorData: UserBehaviorData[]): string[] => {
    const featureCount: Record<string, number> = {}
    
    behaviorData.forEach(session => {
      session.featureUsage.forEach(feature => {
        featureCount[feature.featureName] = (featureCount[feature.featureName] || 0) + feature.frequency
      })
    })
    
    return Object.entries(featureCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([feature]) => feature)
  }

  const calculatePreferredWorkflow = (behaviorData: UserBehaviorData[]): string[] => {
    // Analyze page view sequences to determine common workflows
    const workflows: Record<string, number> = {}
    
    behaviorData.forEach(session => {
      const pageSequence = session.pageViews.map(pv => pv.path).join(' -> ')
      workflows[pageSequence] = (workflows[pageSequence] || 0) + 1
    })
    
    return Object.entries(workflows)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([workflow]) => workflow)
  }

  const calculatePeakUsageHours = (behaviorData: UserBehaviorData[]): number[] => {
    const hourCounts: Record<number, number> = {}
    
    behaviorData.forEach(session => {
      const hour = new Date(session.sessionStartTime).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })
    
    return Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour))
  }

  const calculateAverageSessionDuration = (behaviorData: UserBehaviorData[]): number => {
    if (behaviorData.length === 0) return 0
    
    const totalDuration = behaviorData.reduce((sum, session) => sum + session.sessionDuration, 0)
    return totalDuration / behaviorData.length
  }

  const calculateLearningVelocity = (): number => {
    const completedCount = preferences.value.completedTutorials.length
    const accountAge = Date.now() - preferences.value.createdAt
    const weeksActive = accountAge / (7 * 24 * 60 * 60 * 1000)
    
    return weeksActive > 0 ? completedCount / weeksActive : 0
  }

  const calculatePreferredLearningStyle = (behaviorData: UserBehaviorData[]): 'visual' | 'hands-on' | 'reading' => {
    // Analyze content engagement patterns to determine learning style
    let visualScore = 0
    let handsOnScore = 0
    let readingScore = 0
    
    behaviorData.forEach(session => {
      session.contentEngagement.forEach(engagement => {
        if (engagement.contentType === 'tutorial' && engagement.interactions > 5) {
          handsOnScore += engagement.completionRate
        } else if (engagement.contentType === 'reference' && engagement.engagementTime > 120000) {
          readingScore += engagement.completionRate
        } else if (engagement.contentType === 'sample' && engagement.interactions > 3) {
          visualScore += engagement.completionRate
        }
      })
    })
    
    if (handsOnScore >= visualScore && handsOnScore >= readingScore) return 'hands-on'
    if (visualScore >= readingScore) return 'visual'
    return 'reading'
  }

  const calculateStrugglingAreas = (): string[] => {
    const struggles: string[] = []
    
    // Analyze tutorial progress for incomplete tutorials
    Object.entries(preferences.value.tutorialProgress).forEach(([tutorialId, progress]) => {
      if (progress < 50 && progress > 0) {
        struggles.push(tutorialId)
      }
    })
    
    return struggles.slice(0, 5)
  }

  const calculateToolEfficiency = (behaviorData: UserBehaviorData[]): Record<string, number> => {
    const toolStats: Record<string, { success: number; total: number }> = {}
    
    behaviorData.forEach(session => {
      session.toolUsage.forEach(usage => {
        if (!toolStats[usage.toolName]) {
          toolStats[usage.toolName] = { success: 0, total: 0 }
        }
        
        toolStats[usage.toolName].total += 1
        if (usage.success) {
          toolStats[usage.toolName].success += 1
        }
      })
    })
    
    const efficiency: Record<string, number> = {}
    Object.entries(toolStats).forEach(([tool, stats]) => {
      efficiency[tool] = stats.total > 0 ? stats.success / stats.total : 0
    })
    
    return efficiency
  }

  const calculatePreferredDataSizes = (behaviorData: UserBehaviorData[]): string[] => {
    const sizeCount: Record<string, number> = {}
    
    behaviorData.forEach(session => {
      session.toolUsage.forEach(usage => {
        if (usage.success) {
          sizeCount[usage.inputSize] = (sizeCount[usage.inputSize] || 0) + 1
        }
      })
    })
    
    return Object.entries(sizeCount)
      .sort(([, a], [, b]) => b - a)
      .map(([size]) => size)
  }

  const calculateCommonErrorPatterns = (behaviorData: UserBehaviorData[]): string[] => {
    const errorCount: Record<string, number> = {}
    
    behaviorData.forEach(session => {
      session.errorEvents.forEach(error => {
        errorCount[error.errorType] = (errorCount[error.errorType] || 0) + 1
      })
    })
    
    return Object.entries(errorCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([error]) => error)
  }

  const calculateContentPreferences = (behaviorData: UserBehaviorData[]): Record<string, number> => {
    const contentScores: Record<string, number> = {}
    
    behaviorData.forEach(session => {
      session.contentEngagement.forEach(engagement => {
        const score = engagement.completionRate * (engagement.engagementTime / 60000) // minutes
        contentScores[engagement.contentType] = (contentScores[engagement.contentType] || 0) + score
      })
    })
    
    return contentScores
  }

  const calculateReadingSpeed = (behaviorData: UserBehaviorData[]): number => {
    // Estimate reading speed based on content engagement time
    let totalWords = 0
    let totalTime = 0
    
    behaviorData.forEach(session => {
      session.contentEngagement.forEach(engagement => {
        if (engagement.contentType === 'reference' || engagement.contentType === 'guide') {
          // Estimate 500 words per content piece
          totalWords += 500 * engagement.completionRate
          totalTime += engagement.engagementTime / 60000 // minutes
        }
      })
    })
    
    return totalTime > 0 ? totalWords / totalTime : 200 // default 200 WPM
  }

  const calculateAttentionSpan = (behaviorData: UserBehaviorData[]): number => {
    const engagementTimes: number[] = []
    
    behaviorData.forEach(session => {
      session.contentEngagement.forEach(engagement => {
        engagementTimes.push(engagement.engagementTime)
      })
    })
    
    if (engagementTimes.length === 0) return 300000 // 5 minutes default
    
    return engagementTimes.reduce((sum, time) => sum + time, 0) / engagementTimes.length
  }

  const calculateNavigationPatterns = (behaviorData: UserBehaviorData[]): string[] => {
    const patterns: Record<string, number> = {}
    
    behaviorData.forEach(session => {
      for (let i = 0; i < session.pageViews.length - 1; i++) {
        const pattern = `${session.pageViews[i].path} -> ${session.pageViews[i + 1].path}`
        patterns[pattern] = (patterns[pattern] || 0) + 1
      }
    })
    
    return Object.entries(patterns)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([pattern]) => pattern)
  }

  const calculateSearchBehavior = (behaviorData: UserBehaviorData[]): {
    averageQueryLength: number
    commonSearchTerms: string[]
    searchSuccessRate: number
  } => {
    let totalQueryLength = 0
    let totalQueries = 0
    let successfulSearches = 0
    const termCount: Record<string, number> = {}
    
    behaviorData.forEach(session => {
      session.searchQueries.forEach(query => {
        totalQueryLength += query.query.length
        totalQueries += 1
        
        if (query.selectedResult) {
          successfulSearches += 1
        }
        
        // Count individual terms
        query.query.toLowerCase().split(' ').forEach(term => {
          if (term.length > 2) {
            termCount[term] = (termCount[term] || 0) + 1
          }
        })
      })
    })
    
    const commonTerms = Object.entries(termCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([term]) => term)
    
    return {
      averageQueryLength: totalQueries > 0 ? totalQueryLength / totalQueries : 0,
      commonSearchTerms: commonTerms,
      searchSuccessRate: totalQueries > 0 ? successfulSearches / totalQueries : 0
    }
  }

  const calculateConfidenceScore = (dataPoints: number): number => {
    // Simple confidence calculation based on data points
    if (dataPoints < USER_PREFERENCE_CONSTANTS.MIN_DATA_POINTS) return 0
    if (dataPoints < 50) return 0.5
    if (dataPoints < 100) return 0.7
    if (dataPoints < 500) return 0.8
    return 0.9
  }

  return {
    // State
    preferences,
    privacySettings,
    currentSession,
    analytics,
    isInitialized,
    isLoading,
    
    // Computed
    trackingEnabled,
    personalizedContentEnabled,
    analyticsEnabled,
    sessionId,
    sessionStartTime,
    
    // Actions
    initialize,
    updatePreference,
    updatePrivacySetting,
    trackPageView,
    trackClick,
    trackScrollBehavior,
    trackFeatureUsage,
    trackToolUsage,
    trackContentEngagement,
    addToRecentTools,
    addToFavoriteTools,
    removeFromFavoriteTools,
    addToRecentlyViewedContent,
    updateTutorialProgress,
    generateAnalytics,
    saveSessionData,
    clearAllData
  }
})