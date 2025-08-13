export interface AdSenseConfig {
  publisherId: string
  adSlots: {
    header: string
    sidebar: string
    content: string
    footer: string
  }
}

export interface AdSenseState {
  isLoaded: boolean
  isBlocked: boolean
  error: string | null
}

export interface AdSenseProps {
  adSlot: string
  adFormat: 'auto' | 'rectangle' | 'banner' | 'vertical'
  adLayout?: string
  className?: string
  fullWidthResponsive?: boolean
}

export interface AdPerformanceMetrics {
  loadTime: number
  renderTime: number
  viewability: number
  clickThroughRate: number
}

export interface AnalyticsEvent {
  category: 'tutorial' | 'tool' | 'sample' | 'ad'
  action: string
  label?: string
  value?: number
  timestamp: Date
}

export interface PageView {
  path: string
  title: string
  referrer: string
  timestamp: Date
  sessionId: string
}