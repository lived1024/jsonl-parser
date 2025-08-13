export interface Tutorial {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number
  content: string
  examples: CodeExample[]
}

export interface CodeExample {
  language: string
  code: string
  description?: string
}

export interface SampleData {
  id: string
  name: string
  description: string
  category: 'api' | 'config' | 'data' | 'complex'
  difficulty: 'simple' | 'medium' | 'complex'
  size: 'small' | 'medium' | 'large'
  data: string
  metadata: SampleMetadata
}

export interface SampleMetadata {
  source: string
  useCase: string
  features: string[]
  learningPoints: string[]
}

export interface Tool {
  id: string
  name: string
  description: string
  category: 'validation' | 'conversion' | 'formatting' | 'generation'
  component: string
}

export interface ReferenceSection {
  id: string
  title: string
  content: string
  examples: CodeExample[]
  relatedTopics: string[]
}

export interface CheatSheet {
  category: string
  items: CheatSheetItem[]
}

export interface CheatSheetItem {
  syntax: string
  description: string
  example: string
}

export interface NavigationItem {
  path: string
  label: string
  icon: string
  description?: string
}

export interface LearningProgress {
  completedTutorials: string[]
  currentTutorial?: string
  lastAccessed: Date
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: 'ko' | 'en'
  tutorialProgress: Record<string, number>
  completedTutorials: string[]
  favoriteTools: string[]
  recentSamples: string[]
  adPreferences: {
    allowPersonalized: boolean
    categories: string[]
  }
}