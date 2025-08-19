/**
 * User Preference Service
 * Provides high-level API for user preference management and analytics
 */

import type {
  UserPreferences,
  UserBehaviorData,
  UserPreferenceAnalytics,
  PrivacySettings,
  UserPreferenceEvent
} from '../types/userPreferences'
import { USER_PREFERENCE_CONSTANTS } from '../types/userPreferences'

export class UserPreferenceService {
  private static instance: UserPreferenceService
  private initialized = false
  private eventListeners: Map<string, Function[]> = new Map()

  static getInstance(): UserPreferenceService {
    if (!UserPreferenceService.instance) {
      UserPreferenceService.instance = new UserPreferenceService()
    }
    return UserPreferenceService.instance
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // Set up automatic session tracking
      this.setupSessionTracking()
      
      // Set up page visibility tracking
      this.setupVisibilityTracking()
      
      // Set up performance monitoring
      this.setupPerformanceMonitoring()
      
      // Set up error tracking
      this.setupErrorTracking()
      
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize UserPreferenceService:', error)
      throw error
    }
  }

  /**
   * Track user interaction with automatic context detection
   */
  trackInteraction(
    element: HTMLElement,
    action: string,
    customData?: Record<string, any>
  ): void {
    try {
      const elementInfo = this.extractElementInfo(element)
      const context = this.detectContext()
      
      this.emitEvent('interaction', {
        element: elementInfo,
        action,
        context,
        customData,
        timestamp: Date.now()
      })
    } catch (error) {
      console.warn('Failed to track interaction:', error)
    }
  }

  /**
   * Track form interactions with detailed field analysis
   */
  trackFormInteraction(
    formElement: HTMLFormElement,
    action: 'focus' | 'blur' | 'change' | 'submit' | 'error',
    fieldElement?: HTMLElement,
    value?: any
  ): void {
    try {
      const formInfo = this.extractFormInfo(formElement)
      const fieldInfo = fieldElement ? this.extractElementInfo(fieldElement) : null
      
      this.emitEvent('form_interaction', {
        form: formInfo,
        field: fieldInfo,
        action,
        value: this.sanitizeValue(value),
        timestamp: Date.now()
      })
    } catch (error) {
      console.warn('Failed to track form interaction:', error)
    }
  }

  /**
   * Track search behavior with query analysis
   */
  trackSearch(
    query: string,
    resultsCount: number,
    searchType: string = 'general',
    selectedResult?: string,
    customData?: Record<string, any>
  ): void {
    try {
      const searchData = {
        query: this.sanitizeSearchQuery(query),
        resultsCount,
        searchType,
        selectedResult,
        queryLength: query.length,
        wordCount: query.split(/\s+/).length,
        hasSpecialChars: /[^a-zA-Z0-9\s]/.test(query),
        customData,
        timestamp: Date.now()
      }
      
      this.emitEvent('search', searchData)
    } catch (error) {
      console.warn('Failed to track search:', error)
    }
  }

  /**
   * Track content consumption patterns
   */
  trackContentConsumption(
    contentId: string,
    contentType: 'tutorial' | 'reference' | 'sample' | 'guide',
    action: 'start' | 'progress' | 'complete' | 'abandon',
    metadata?: {
      duration?: number
      progress?: number
      interactions?: number
      scrollDepth?: number
      rating?: number
    }
  ): void {
    try {
      const contentData = {
        contentId,
        contentType,
        action,
        metadata: metadata || {},
        timestamp: Date.now(),
        sessionContext: this.getSessionContext()
      }
      
      this.emitEvent('content_consumption', contentData)
    } catch (error) {
      console.warn('Failed to track content consumption:', error)
    }
  }

  /**
   * Track tool usage with performance metrics
   */
  trackToolUsage(
    toolName: string,
    action: 'start' | 'success' | 'error' | 'cancel',
    metadata?: {
      inputSize?: 'small' | 'medium' | 'large'
      processingTime?: number
      errorType?: string
      outputSize?: number
      memoryUsage?: number
    }
  ): void {
    try {
      const toolData = {
        toolName,
        action,
        metadata: metadata || {},
        timestamp: Date.now(),
        performanceMetrics: this.getPerformanceMetrics()
      }
      
      this.emitEvent('tool_usage', toolData)
    } catch (error) {
      console.warn('Failed to track tool usage:', error)
    }
  }

  /**
   * Track navigation patterns
   */
  trackNavigation(
    fromPath: string,
    toPath: string,
    method: 'click' | 'keyboard' | 'programmatic' | 'back' | 'forward',
    customData?: Record<string, any>
  ): void {
    try {
      const navigationData = {
        fromPath,
        toPath,
        method,
        customData,
        timestamp: Date.now(),
        referrer: document.referrer,
        userAgent: navigator.userAgent
      }
      
      this.emitEvent('navigation', navigationData)
    } catch (error) {
      console.warn('Failed to track navigation:', error)
    }
  }

  /**
   * Track accessibility usage
   */
  trackAccessibility(
    feature: string,
    action: 'enable' | 'disable' | 'use',
    customData?: Record<string, any>
  ): void {
    try {
      const accessibilityData = {
        feature,
        action,
        customData,
        timestamp: Date.now(),
        assistiveTechnology: this.detectAssistiveTechnology()
      }
      
      this.emitEvent('accessibility', accessibilityData)
    } catch (error) {
      console.warn('Failed to track accessibility:', error)
    }
  }

  /**
   * Track performance issues
   */
  trackPerformanceIssue(
    issueType: 'slow_load' | 'memory_high' | 'error' | 'timeout',
    severity: 'low' | 'medium' | 'high',
    details: Record<string, any>
  ): void {
    try {
      const performanceData = {
        issueType,
        severity,
        details,
        timestamp: Date.now(),
        performanceMetrics: this.getPerformanceMetrics(),
        systemInfo: this.getSystemInfo()
      }
      
      this.emitEvent('performance_issue', performanceData)
    } catch (error) {
      console.warn('Failed to track performance issue:', error)
    }
  }

  /**
   * Generate personalized recommendations
   */
  generateRecommendations(
    preferences: UserPreferences,
    analytics: UserPreferenceAnalytics | null
  ): {
    tutorials: string[]
    tools: string[]
    content: string[]
    features: string[]
  } {
    try {
      const recommendations = {
        tutorials: this.recommendTutorials(preferences, analytics),
        tools: this.recommendTools(preferences, analytics),
        content: this.recommendContent(preferences, analytics),
        features: this.recommendFeatures(preferences, analytics)
      }
      
      return recommendations
    } catch (error) {
      console.warn('Failed to generate recommendations:', error)
      return { tutorials: [], tools: [], content: [], features: [] }
    }
  }

  /**
   * Analyze user behavior patterns
   */
  analyzeUserBehavior(behaviorData: UserBehaviorData[]): {
    patterns: string[]
    insights: string[]
    recommendations: string[]
    riskFactors: string[]
  } {
    try {
      const analysis = {
        patterns: this.identifyBehaviorPatterns(behaviorData),
        insights: this.generateBehaviorInsights(behaviorData),
        recommendations: this.generateBehaviorRecommendations(behaviorData),
        riskFactors: this.identifyRiskFactors(behaviorData)
      }
      
      return analysis
    } catch (error) {
      console.warn('Failed to analyze user behavior:', error)
      return { patterns: [], insights: [], recommendations: [], riskFactors: [] }
    }
  }

  /**
   * Export user data for privacy compliance
   */
  exportUserData(): {
    preferences: UserPreferences | null
    behaviorData: UserBehaviorData[]
    analytics: UserPreferenceAnalytics | null
    privacySettings: PrivacySettings | null
  } {
    try {
      const preferences = this.loadFromStorage(USER_PREFERENCE_CONSTANTS.STORAGE_KEY)
      const behaviorData = this.loadFromStorage(USER_PREFERENCE_CONSTANTS.BEHAVIOR_STORAGE_KEY) || []
      const analytics = this.loadFromStorage(USER_PREFERENCE_CONSTANTS.ANALYTICS_STORAGE_KEY)
      const privacySettings = this.loadFromStorage(USER_PREFERENCE_CONSTANTS.PRIVACY_STORAGE_KEY)
      
      return {
        preferences,
        behaviorData,
        analytics,
        privacySettings
      }
    } catch (error) {
      console.error('Failed to export user data:', error)
      return { preferences: null, behaviorData: [], analytics: null, privacySettings: null }
    }
  }

  /**
   * Validate data privacy compliance
   */
  validatePrivacyCompliance(privacySettings: PrivacySettings): {
    compliant: boolean
    issues: string[]
    recommendations: string[]
  } {
    const issues: string[] = []
    const recommendations: string[] = []
    
    // Check consent requirements
    if (!privacySettings.cookieConsent) {
      issues.push('Cookie consent not obtained')
      recommendations.push('Request cookie consent before storing data')
    }
    
    if (privacySettings.trackingEnabled && !privacySettings.analyticsConsent) {
      issues.push('Analytics tracking enabled without consent')
      recommendations.push('Disable tracking or obtain analytics consent')
    }
    
    // Check data retention
    if (privacySettings.dataRetentionDays > 365) {
      issues.push('Data retention period exceeds recommended maximum')
      recommendations.push('Reduce data retention to 365 days or less')
    }
    
    // Check personalization settings
    if (privacySettings.personalizedContent && !privacySettings.analyticsConsent) {
      issues.push('Personalized content enabled without analytics consent')
      recommendations.push('Disable personalization or obtain consent')
    }
    
    return {
      compliant: issues.length === 0,
      issues,
      recommendations
    }
  }

  // Private helper methods

  private setupSessionTracking(): void {
    // Track session start
    this.emitEvent('session_start', {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language
    })

    // Track session end on page unload
    window.addEventListener('beforeunload', () => {
      this.emitEvent('session_end', {
        timestamp: Date.now(),
        duration: Date.now() - performance.timeOrigin
      })
    })
  }

  private setupVisibilityTracking(): void {
    document.addEventListener('visibilitychange', () => {
      this.emitEvent('visibility_change', {
        hidden: document.hidden,
        timestamp: Date.now()
      })
    })
  }

  private setupPerformanceMonitoring(): void {
    // Monitor performance metrics
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.emitEvent('performance_metric', {
              name: entry.name,
              type: entry.entryType,
              startTime: entry.startTime,
              duration: entry.duration,
              timestamp: Date.now()
            })
          })
        })
        
        observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] })
      } catch (error) {
        console.warn('Performance monitoring not available:', error)
      }
    }
  }

  private setupErrorTracking(): void {
    window.addEventListener('error', (event) => {
      this.emitEvent('error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.toString(),
        timestamp: Date.now()
      })
    })

    window.addEventListener('unhandledrejection', (event) => {
      this.emitEvent('unhandled_rejection', {
        reason: event.reason?.toString(),
        timestamp: Date.now()
      })
    })
  }

  private extractElementInfo(element: HTMLElement): Record<string, any> {
    return {
      tagName: element.tagName.toLowerCase(),
      id: element.id,
      className: element.className,
      textContent: element.textContent?.substring(0, 100),
      attributes: this.getRelevantAttributes(element)
    }
  }

  private extractFormInfo(form: HTMLFormElement): Record<string, any> {
    return {
      id: form.id,
      name: form.name,
      action: form.action,
      method: form.method,
      fieldCount: form.elements.length
    }
  }

  private getRelevantAttributes(element: HTMLElement): Record<string, string> {
    const relevantAttrs = ['data-track', 'data-category', 'data-action', 'role', 'aria-label']
    const attrs: Record<string, string> = {}
    
    relevantAttrs.forEach(attr => {
      const value = element.getAttribute(attr)
      if (value) {
        attrs[attr] = value
      }
    })
    
    return attrs
  }

  private detectContext(): string {
    const path = window.location.pathname
    if (path.includes('/learn')) return 'learning'
    if (path.includes('/tools')) return 'tools'
    if (path.includes('/reference')) return 'reference'
    if (path.includes('/samples')) return 'samples'
    return 'main'
  }

  private getSessionContext(): Record<string, any> {
    return {
      path: window.location.pathname,
      referrer: document.referrer,
      timestamp: Date.now(),
      scrollPosition: window.scrollY,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`
    }
  }

  private getPerformanceMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {}
    
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart
        metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
        metrics.firstPaint = performance.getEntriesByName('first-paint')[0]?.startTime
        metrics.firstContentfulPaint = performance.getEntriesByName('first-contentful-paint')[0]?.startTime
      }
      
      if ('memory' in performance) {
        const memory = (performance as any).memory
        metrics.memoryUsed = memory.usedJSHeapSize
        metrics.memoryTotal = memory.totalJSHeapSize
        metrics.memoryLimit = memory.jsHeapSizeLimit
      }
    }
    
    return metrics
  }

  private getSystemInfo(): Record<string, any> {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  }

  private detectAssistiveTechnology(): Record<string, boolean> {
    return {
      screenReader: this.isScreenReaderActive(),
      highContrast: this.isHighContrastMode(),
      reducedMotion: this.isReducedMotionPreferred(),
      keyboardNavigation: this.isKeyboardNavigationActive()
    }
  }

  private isScreenReaderActive(): boolean {
    // Check for common screen reader indicators
    return !!(
      window.speechSynthesis ||
      navigator.userAgent.includes('NVDA') ||
      navigator.userAgent.includes('JAWS') ||
      navigator.userAgent.includes('VoiceOver')
    )
  }

  private isHighContrastMode(): boolean {
    return window.matchMedia('(prefers-contrast: high)').matches
  }

  private isReducedMotionPreferred(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  private isKeyboardNavigationActive(): boolean {
    // This would need to be tracked based on user interactions
    return document.body.classList.contains('keyboard-navigation')
  }

  private sanitizeValue(value: any): any {
    if (typeof value === 'string') {
      // Remove potential PII patterns
      return value
        .replace(/\b[\w\.-]+@[\w\.-]+\.\w+\b/g, '[email]')
        .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[phone]')
        .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '[card]')
    }
    return value
  }

  private sanitizeSearchQuery(query: string): string {
    // Remove potential PII from search queries
    return this.sanitizeValue(query)
  }

  private recommendTutorials(preferences: UserPreferences, analytics: UserPreferenceAnalytics | null): string[] {
    const recommendations: string[] = []
    
    // Based on completed tutorials, recommend next level
    if (preferences.completedTutorials.length > 0) {
      recommendations.push('advanced-json-patterns', 'performance-optimization')
    } else {
      recommendations.push('json-basics', 'jsonl-introduction')
    }
    
    // Based on struggling areas
    if (analytics?.strugglingAreas) {
      analytics.strugglingAreas.forEach(area => {
        recommendations.push(`${area}-help`)
      })
    }
    
    return recommendations.slice(0, 5)
  }

  private recommendTools(preferences: UserPreferences, analytics: UserPreferenceAnalytics | null): string[] {
    const recommendations: string[] = []
    
    // Based on recent tools, recommend related ones
    preferences.recentTools.forEach(tool => {
      if (tool === 'json-validator') {
        recommendations.push('json-formatter', 'schema-generator')
      } else if (tool === 'data-converter') {
        recommendations.push('json-validator', 'json-minifier')
      }
    })
    
    // Based on tool efficiency, recommend alternatives for low-efficiency tools
    if (analytics?.toolEfficiency) {
      Object.entries(analytics.toolEfficiency).forEach(([tool, efficiency]) => {
        if (efficiency < 0.5) {
          recommendations.push(`${tool}-alternative`)
        }
      })
    }
    
    return [...new Set(recommendations)].slice(0, 5)
  }

  private recommendContent(preferences: UserPreferences, analytics: UserPreferenceAnalytics | null): string[] {
    const recommendations: string[] = []
    
    // Based on preferred content types
    preferences.preferredContentTypes.forEach(type => {
      recommendations.push(`${type}-advanced`, `${type}-examples`)
    })
    
    // Based on content preferences from analytics
    if (analytics?.contentPreferences) {
      const topContent = Object.entries(analytics.contentPreferences)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([content]) => content)
      
      recommendations.push(...topContent)
    }
    
    return [...new Set(recommendations)].slice(0, 5)
  }

  private recommendFeatures(preferences: UserPreferences, analytics: UserPreferenceAnalytics | null): string[] {
    const recommendations: string[] = []
    
    // Based on accessibility preferences
    if (preferences.accessibility.keyboardNavigation) {
      recommendations.push('keyboard-shortcuts', 'accessibility-tools')
    }
    
    // Based on most used features, recommend related ones
    if (analytics?.mostUsedFeatures) {
      analytics.mostUsedFeatures.forEach(feature => {
        if (feature === 'json-parser') {
          recommendations.push('syntax-highlighting', 'error-detection')
        }
      })
    }
    
    return [...new Set(recommendations)].slice(0, 5)
  }

  private identifyBehaviorPatterns(behaviorData: UserBehaviorData[]): string[] {
    const patterns: string[] = []
    
    // Analyze session patterns
    const sessionLengths = behaviorData.map(session => session.sessionDuration)
    const avgSessionLength = sessionLengths.reduce((sum, len) => sum + len, 0) / sessionLengths.length
    
    if (avgSessionLength > 30 * 60 * 1000) { // 30 minutes
      patterns.push('long-session-user')
    } else if (avgSessionLength < 5 * 60 * 1000) { // 5 minutes
      patterns.push('quick-task-user')
    }
    
    // Analyze tool usage patterns
    const toolUsage = behaviorData.flatMap(session => session.toolUsage)
    const toolCounts = toolUsage.reduce((counts, usage) => {
      counts[usage.toolName] = (counts[usage.toolName] || 0) + 1
      return counts
    }, {} as Record<string, number>)
    
    const mostUsedTool = Object.entries(toolCounts)
      .sort(([, a], [, b]) => b - a)[0]
    
    if (mostUsedTool) {
      patterns.push(`${mostUsedTool[0]}-power-user`)
    }
    
    return patterns
  }

  private generateBehaviorInsights(behaviorData: UserBehaviorData[]): string[] {
    const insights: string[] = []
    
    // Analyze error patterns
    const errors = behaviorData.flatMap(session => session.errorEvents)
    if (errors.length > 0) {
      const commonErrors = errors.reduce((counts, error) => {
        counts[error.errorType] = (counts[error.errorType] || 0) + 1
        return counts
      }, {} as Record<string, number>)
      
      const mostCommonError = Object.entries(commonErrors)
        .sort(([, a], [, b]) => b - a)[0]
      
      if (mostCommonError) {
        insights.push(`Most common issue: ${mostCommonError[0]}`)
      }
    }
    
    // Analyze learning progress
    const contentEngagement = behaviorData.flatMap(session => session.contentEngagement)
    const tutorialEngagement = contentEngagement.filter(engagement => engagement.contentType === 'tutorial')
    
    if (tutorialEngagement.length > 0) {
      const avgCompletion = tutorialEngagement.reduce((sum, engagement) => sum + engagement.completionRate, 0) / tutorialEngagement.length
      
      if (avgCompletion > 0.8) {
        insights.push('High tutorial completion rate - dedicated learner')
      } else if (avgCompletion < 0.3) {
        insights.push('Low tutorial completion rate - may need shorter content')
      }
    }
    
    return insights
  }

  private generateBehaviorRecommendations(behaviorData: UserBehaviorData[]): string[] {
    const recommendations: string[] = []
    
    // Based on session patterns
    const avgSessionLength = behaviorData.reduce((sum, session) => sum + session.sessionDuration, 0) / behaviorData.length
    
    if (avgSessionLength < 10 * 60 * 1000) { // Less than 10 minutes
      recommendations.push('Consider bookmarking frequently used tools')
      recommendations.push('Try the quick-start tutorial for faster workflows')
    }
    
    // Based on error patterns
    const errors = behaviorData.flatMap(session => session.errorEvents)
    if (errors.length > 5) {
      recommendations.push('Check out the troubleshooting guide')
      recommendations.push('Consider using the validation tools before processing')
    }
    
    return recommendations
  }

  private identifyRiskFactors(behaviorData: UserBehaviorData[]): string[] {
    const riskFactors: string[] = []
    
    // High error rate
    const totalActions = behaviorData.reduce((sum, session) => sum + session.toolUsage.length, 0)
    const totalErrors = behaviorData.reduce((sum, session) => sum + session.errorEvents.length, 0)
    
    if (totalActions > 0 && totalErrors / totalActions > 0.3) {
      riskFactors.push('High error rate - user may be struggling')
    }
    
    // Very short sessions
    const shortSessions = behaviorData.filter(session => session.sessionDuration < 2 * 60 * 1000).length
    if (shortSessions / behaviorData.length > 0.7) {
      riskFactors.push('Many short sessions - user may be frustrated')
    }
    
    return riskFactors
  }

  private loadFromStorage(key: string): any {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.warn(`Failed to load from storage key ${key}:`, error)
      return null
    }
  }

  private emitEvent(eventType: string, data: any): void {
    const listeners = this.eventListeners.get(eventType) || []
    listeners.forEach(listener => {
      try {
        listener(data)
      } catch (error) {
        console.warn(`Error in event listener for ${eventType}:`, error)
      }
    })
  }

  /**
   * Add event listener
   */
  addEventListener(eventType: string, listener: Function): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, [])
    }
    this.eventListeners.get(eventType)!.push(listener)
  }

  /**
   * Remove event listener
   */
  removeEventListener(eventType: string, listener: Function): void {
    const listeners = this.eventListeners.get(eventType)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }
}