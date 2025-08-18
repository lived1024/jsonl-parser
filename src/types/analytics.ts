// Google Analytics 4 configuration interface
export interface AnalyticsConfig {
  measurementId: string
  enableDebug?: boolean
  customDimensions?: Record<string, string>
}

// Analytics event interface
export interface AnalyticsEvent {
  category: 'tutorial' | 'tool' | 'sample' | 'ad' | 'navigation' | 'user_interaction'
  action: string
  label?: string
  value?: number
  customParameters?: Record<string, any>
}

// Page view tracking interface
export interface PageView {
  path: string
  title: string
  referrer?: string
  customParameters?: Record<string, any>
}

// Analytics state interface
export interface AnalyticsState {
  isInitialized: boolean
  isEnabled: boolean
  error: string | null
  debugMode: boolean
}

// User properties interface for enhanced tracking
export interface UserProperties {
  user_language?: string
  user_theme?: string
  user_type?: 'developer' | 'analyst' | 'student' | 'other'
  session_count?: number
}

// Enhanced event tracking for specific features
export interface TutorialEvent extends AnalyticsEvent {
  category: 'tutorial'
  action: 'start' | 'complete' | 'progress' | 'abandon'
  tutorial_id?: string
  progress_percentage?: number
}

export interface ToolEvent extends AnalyticsEvent {
  category: 'tool'
  action: 'use' | 'error' | 'success' | 'share'
  tool_name?: string
  input_size?: 'small' | 'medium' | 'large'
  processing_time?: number
}

export interface SampleEvent extends AnalyticsEvent {
  category: 'sample'
  action: 'load' | 'download' | 'copy' | 'view'
  sample_id?: string
  sample_category?: string
  sample_complexity?: string
}

export interface NavigationEvent extends AnalyticsEvent {
  category: 'navigation'
  action: 'page_view' | 'section_change' | 'menu_click' | 'search'
  from_page?: string
  to_page?: string
  search_term?: string
}

// Declare global gtag function
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}