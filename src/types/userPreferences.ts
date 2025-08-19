/**
 * User preferences and tracking types
 * Implements privacy-conscious client-side user behavior tracking
 */

// User preference categories
export interface UserPreferences {
  // Theme and UI preferences
  theme: 'light' | 'dark' | 'auto'
  language: 'ko' | 'en'
  
  // Learning and tutorial preferences
  tutorialProgress: Record<string, number> // tutorialId -> progress percentage
  completedTutorials: string[]
  favoriteTopics: string[]
  learningPath: string[] // ordered list of preferred learning sequence
  
  // Tool usage preferences
  favoriteTools: string[]
  recentTools: string[]
  toolSettings: Record<string, any> // tool-specific settings
  defaultInputFormat: 'json' | 'jsonl'
  
  // Sample data preferences
  recentSamples: string[]
  favoriteSamples: string[]
  preferredSampleCategories: string[]
  
  // Content preferences
  preferredContentTypes: string[]
  bookmarkedContent: string[]
  recentlyViewedContent: string[]
  
  // Privacy and ad preferences
  adPreferences: {
    allowPersonalized: boolean
    categories: string[]
    frequency: 'low' | 'medium' | 'high'
  }
  
  // Accessibility preferences
  accessibility: {
    highContrast: boolean
    reducedMotion: boolean
    fontSize: 'small' | 'medium' | 'large'
    keyboardNavigation: boolean
  }
  
  // Metadata
  createdAt: number
  lastUpdated: number
  version: string
}

// User behavior tracking data
export interface UserBehaviorData {
  // Session information
  sessionId: string
  sessionStartTime: number
  sessionDuration: number
  pageViews: PageViewData[]
  
  // Interaction patterns
  clickPatterns: ClickPattern[]
  scrollBehavior: ScrollBehavior[]
  searchQueries: SearchQuery[]
  
  // Feature usage
  featureUsage: FeatureUsage[]
  toolUsage: ToolUsageData[]
  contentEngagement: ContentEngagement[]
  
  // Performance metrics
  performanceMetrics: PerformanceMetric[]
  
  // Error tracking
  errorEvents: ErrorEvent[]
  
  // Metadata
  timestamp: number
  userAgent: string
  screenResolution: string
  viewportSize: string
}

// Page view tracking
export interface PageViewData {
  path: string
  title: string
  timestamp: number
  duration: number
  referrer?: string
  exitPath?: string
}

// Click pattern tracking
export interface ClickPattern {
  element: string
  elementType: string
  position: { x: number; y: number }
  timestamp: number
  context: string // page or section context
}

// Scroll behavior tracking
export interface ScrollBehavior {
  maxScrollDepth: number
  scrollSpeed: number
  pausePoints: number[] // scroll positions where user paused
  timestamp: number
  pageHeight: number
}

// Search query tracking
export interface SearchQuery {
  query: string
  resultsCount: number
  selectedResult?: string
  timestamp: number
  context: string
}

// Feature usage tracking
export interface FeatureUsage {
  featureName: string
  action: string
  frequency: number
  lastUsed: number
  averageUsageTime: number
  successRate: number
}

// Tool usage detailed tracking
export interface ToolUsageData {
  toolName: string
  inputSize: 'small' | 'medium' | 'large'
  processingTime: number
  success: boolean
  errorType?: string
  timestamp: number
  context: string
}

// Content engagement tracking
export interface ContentEngagement {
  contentId: string
  contentType: 'tutorial' | 'reference' | 'sample' | 'guide'
  engagementTime: number
  completionRate: number
  interactions: number
  rating?: number
  timestamp: number
}

// Performance metric tracking
export interface PerformanceMetric {
  metricName: string
  value: number
  unit: string
  context: string
  timestamp: number
}

// Error event tracking
export interface ErrorEvent {
  errorType: string
  errorMessage: string
  stackTrace?: string
  context: string
  timestamp: number
  fatal: boolean
  userAction?: string
}

// User preference analytics
export interface UserPreferenceAnalytics {
  // Usage patterns
  mostUsedFeatures: string[]
  preferredWorkflow: string[]
  peakUsageHours: number[]
  averageSessionDuration: number
  
  // Learning patterns
  learningVelocity: number // tutorials completed per week
  preferredLearningStyle: 'visual' | 'hands-on' | 'reading'
  strugglingAreas: string[]
  
  // Tool preferences
  toolEfficiency: Record<string, number> // tool -> success rate
  preferredDataSizes: string[]
  commonErrorPatterns: string[]
  
  // Content preferences
  contentPreferences: Record<string, number> // content type -> engagement score
  readingSpeed: number // words per minute
  attentionSpan: number // average engagement time
  
  // Behavioral insights
  navigationPatterns: string[]
  searchBehavior: {
    averageQueryLength: number
    commonSearchTerms: string[]
    searchSuccessRate: number
  }
  
  // Metadata
  analysisDate: number
  dataPoints: number
  confidenceScore: number
}

// Local storage schema for user preferences
export interface UserPreferenceStorage {
  preferences: UserPreferences
  behaviorData: UserBehaviorData[]
  analytics: UserPreferenceAnalytics
  metadata: {
    version: string
    lastCleanup: number
    dataRetentionDays: number
  }
}

// Privacy settings
export interface PrivacySettings {
  trackingEnabled: boolean
  dataRetentionDays: number
  shareAnalytics: boolean
  personalizedContent: boolean
  cookieConsent: boolean
  analyticsConsent: boolean
  marketingConsent: boolean
}

// User preference events for tracking
export interface UserPreferenceEvent {
  type: 'preference_change' | 'behavior_track' | 'analytics_update'
  category: string
  action: string
  data: any
  timestamp: number
  sessionId: string
}

// Constants for user preference tracking
export const USER_PREFERENCE_CONSTANTS = {
  STORAGE_KEY: 'jsonl-parser-user-preferences',
  BEHAVIOR_STORAGE_KEY: 'jsonl-parser-user-behavior',
  ANALYTICS_STORAGE_KEY: 'jsonl-parser-user-analytics',
  PRIVACY_STORAGE_KEY: 'jsonl-parser-privacy-settings',
  
  // Data retention
  DEFAULT_RETENTION_DAYS: 90,
  MAX_BEHAVIOR_RECORDS: 1000,
  MAX_SESSION_DURATION: 8 * 60 * 60 * 1000, // 8 hours
  
  // Analytics thresholds
  MIN_DATA_POINTS: 10,
  CONFIDENCE_THRESHOLD: 0.7,
  
  // Default preferences
  DEFAULT_PREFERENCES: {
    theme: 'auto',
    language: 'ko',
    tutorialProgress: {},
    completedTutorials: [],
    favoriteTopics: [],
    learningPath: [],
    favoriteTools: [],
    recentTools: [],
    toolSettings: {},
    defaultInputFormat: 'json',
    recentSamples: [],
    favoriteSamples: [],
    preferredSampleCategories: [],
    preferredContentTypes: [],
    bookmarkedContent: [],
    recentlyViewedContent: [],
    adPreferences: {
      allowPersonalized: false,
      categories: [],
      frequency: 'low'
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      fontSize: 'medium',
      keyboardNavigation: false
    },
    createdAt: Date.now(),
    lastUpdated: Date.now(),
    version: '1.0.0'
  } as UserPreferences,
  
  // Default privacy settings
  DEFAULT_PRIVACY: {
    trackingEnabled: true,
    dataRetentionDays: 90,
    shareAnalytics: false,
    personalizedContent: true,
    cookieConsent: false,
    analyticsConsent: false,
    marketingConsent: false
  } as PrivacySettings
} as const

// Type guards
export function isValidUserPreferences(data: any): data is UserPreferences {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.theme === 'string' &&
    typeof data.language === 'string' &&
    typeof data.createdAt === 'number' &&
    typeof data.lastUpdated === 'number' &&
    typeof data.version === 'string'
  )
}

export function isValidUserBehaviorData(data: any): data is UserBehaviorData {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.sessionId === 'string' &&
    typeof data.sessionStartTime === 'number' &&
    typeof data.timestamp === 'number' &&
    Array.isArray(data.pageViews)
  )
}