// Error guide related types

export interface ErrorGuideItem {
  id: string
  title: string
  description: string
  category: 'syntax' | 'structure' | 'data-type' | 'encoding'
  severity: 'low' | 'medium' | 'high'
  commonCauses?: string[]
  badExample: string
  solution: string
  tips?: string[]
  relatedErrors?: string[]
}

export interface ErrorPattern {
  id: string
  regex: RegExp
  errorType: string
  confidence: number
  keywords: string[]
}

export interface ErrorMatchResult {
  errorGuide: ErrorGuideItem
  confidence: number
  matchedPattern: string
  matchedKeywords?: string[]
  suggestedFix?: string
}

// Reference content types
export interface ReferenceSection {
  id: string
  title: string
  content: string
  examples?: CodeExample[]
  relatedTopics?: string[]
}

export interface CodeExample {
  title: string
  code: string
  language: string
  description?: string
}

export interface CheatSheet {
  category: string
  items: CheatSheetItem[]
}

export interface CheatSheetItem {
  syntax: string
  description: string
  example: string
  category?: string
}

// Performance guide types
export interface PerformanceTip {
  id: string
  title: string
  description: string
  category: 'parsing' | 'memory' | 'rendering' | 'network'
  impact: 'low' | 'medium' | 'high'
  difficulty: 'easy' | 'medium' | 'hard'
  example?: {
    before: string
    after: string
    explanation: string
  }
}

export interface PerformanceMetric {
  name: string
  value: string
  type: 'improvement' | 'reduction' | 'neutral'
}

export interface ParsingResult {
  time: number
  size: number
  error?: string
}

export interface ProfilerResult {
  operation: string
  time: number
}

export interface MemoryInfo {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

export interface ProfilerOptions {
  includeStringify: boolean
  includeDeepCopy: boolean
  includeTraversal: boolean
}

// API guide types
export interface ApiEndpoint {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  description: string
  parameters?: ApiParameter[]
  requestExample?: string
  responseExample?: string
  errorCodes?: ApiErrorCode[]
}

export interface ApiParameter {
  name: string
  type: string
  required: boolean
  description: string
  example?: any
}

export interface ApiErrorCode {
  code: number
  message: string
  description: string
}