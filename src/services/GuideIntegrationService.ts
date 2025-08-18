import { useRouter } from 'vue-router'
import type { InteractiveExample } from './ContentService'

export interface ToolConnection {
  id: string
  name: string
  description: string
  icon: any
  category: string
  relatedGuides: string[]
}

export interface ExampleConnection {
  id: string
  guideId: string
  example: InteractiveExample
  relatedTools: string[]
}

class GuideIntegrationService {
  private static instance: GuideIntegrationService | null = null
  private toolConnections = new Map<string, ToolConnection>()
  private exampleConnections = new Map<string, ExampleConnection>()

  constructor() {
    this.initializeConnections()
  }

  static getInstance(): GuideIntegrationService {
    if (!GuideIntegrationService.instance) {
      GuideIntegrationService.instance = new GuideIntegrationService()
    }
    return GuideIntegrationService.instance
  }

  private initializeConnections() {
    // 도구와 가이드 간의 연결 관계 정의
    this.setupToolConnections()
    this.setupExampleConnections()
  }

  private setupToolConnections() {
    // JSON 검증기와 관련된 가이드들
    this.toolConnections.set('json-validator', {
      id: 'json-validator',
      name: 'JSON 검증기',
      description: 'JSON 구문과 구조를 검증합니다',
      icon: 'Shield',
      category: 'validation',
      relatedGuides: ['json-basics', 'error-handling', 'json-schema-guide']
    })

    // 데이터 변환기와 관련된 가이드들
    this.toolConnections.set('data-converter', {
      id: 'data-converter',
      name: '데이터 변환기',
      description: 'JSON을 다양한 형식으로 변환합니다',
      icon: 'Settings',
      category: 'conversion',
      relatedGuides: ['data-transformation', 'large-datasets', 'jsonl-introduction']
    })

    // 스키마 생성기와 관련된 가이드들
    this.toolConnections.set('schema-generator', {
      id: 'schema-generator',
      name: '스키마 생성기',
      description: 'JSON 스키마를 자동으로 생성합니다',
      icon: 'Database',
      category: 'schema',
      relatedGuides: ['json-schema-guide', 'rest-api-design', 'api-versioning']
    })

    // API 테스터와 관련된 가이드들
    this.toolConnections.set('api-tester', {
      id: 'api-tester',
      name: 'API 테스터',
      description: 'REST API를 테스트하고 검증합니다',
      icon: 'Globe',
      category: 'api',
      relatedGuides: ['rest-api-design', 'api-versioning', 'json-schema-guide']
    })
  }

  private setupExampleConnections() {
    // 예제와 도구 간의 연결 관계 정의
    // 실제 구현에서는 ContentService에서 가져온 예제들을 기반으로 설정
  }

  /**
   * 특정 가이드와 관련된 도구들을 반환
   */
  getRelatedTools(guideId: string): ToolConnection[] {
    const relatedTools: ToolConnection[] = []
    
    for (const [toolId, connection] of this.toolConnections) {
      if (connection.relatedGuides.includes(guideId)) {
        relatedTools.push(connection)
      }
    }
    
    return relatedTools
  }

  /**
   * 특정 도구와 관련된 가이드들을 반환
   */
  getRelatedGuides(toolId: string): string[] {
    const connection = this.toolConnections.get(toolId)
    return connection ? connection.relatedGuides : []
  }

  /**
   * 예제를 파서에서 로드
   */
  async loadExampleInParser(example: InteractiveExample): Promise<void> {
    try {
      // localStorage에 예제 데이터 저장
      localStorage.setItem('parser-example-data', example.data)
      localStorage.setItem('parser-example-type', example.type)
      localStorage.setItem('parser-example-title', example.title)
      
      // 파서 페이지를 새 탭에서 열기
      const parserUrl = `/?example=${example.id}&title=${encodeURIComponent(example.title)}`
      window.open(parserUrl, '_blank')
      
      // 분석 이벤트 추적
      this.trackExampleUsage(example)
    } catch (error) {
      console.error('Failed to load example in parser:', error)
      throw error
    }
  }

  /**
   * 예제 데이터를 클립보드에 복사
   */
  async copyExampleData(data: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(data)
      console.log('Example data copied to clipboard')
      
      // 성공 알림 (실제 구현에서는 토스트 메시지 등 사용)
      this.showCopySuccess()
    } catch (error) {
      console.error('Failed to copy example data:', error)
      
      // 폴백: 텍스트 선택 방식
      this.fallbackCopy(data)
    }
  }

  /**
   * 도구로 직접 이동
   */
  navigateToTool(toolId: string, context?: { guideId?: string; exampleId?: string }): void {
    const router = useRouter()
    
    // 컨텍스트 정보를 쿼리 파라미터로 전달
    const query: Record<string, string> = {}
    if (context?.guideId) {
      query.from = context.guideId
    }
    if (context?.exampleId) {
      query.example = context.exampleId
    }
    
    router.push({
      path: `/tools/${toolId}`,
      query
    })
    
    // 분석 이벤트 추적
    this.trackToolNavigation(toolId, context)
  }

  /**
   * 가이드 간 연결 관계 분석
   */
  getGuideConnections(guideId: string): {
    relatedTools: ToolConnection[]
    suggestedGuides: string[]
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  } {
    const relatedTools = this.getRelatedTools(guideId)
    
    // 관련 도구들을 통해 추천 가이드 찾기
    const suggestedGuides = new Set<string>()
    relatedTools.forEach(tool => {
      tool.relatedGuides.forEach(relatedGuide => {
        if (relatedGuide !== guideId) {
          suggestedGuides.add(relatedGuide)
        }
      })
    })
    
    // 가이드 난이도 추정 (실제로는 ContentService에서 가져와야 함)
    const difficulty = this.estimateGuideDifficulty(guideId)
    
    return {
      relatedTools,
      suggestedGuides: Array.from(suggestedGuides),
      difficulty
    }
  }

  /**
   * 학습 경로 추천
   */
  getLearningPath(currentGuideId: string): {
    previous?: string
    next?: string
    alternatives: string[]
  } {
    // 학습 경로 매핑 (실제로는 더 복잡한 로직 필요)
    const learningPaths: Record<string, { next?: string; previous?: string }> = {
      'json-basics': { next: 'jsonl-introduction' },
      'jsonl-introduction': { previous: 'json-basics', next: 'parser-overview' },
      'parser-overview': { previous: 'jsonl-introduction', next: 'rest-api-design' },
      'rest-api-design': { previous: 'parser-overview', next: 'json-schema-guide' },
      'json-schema-guide': { previous: 'rest-api-design', next: 'api-versioning' },
      'api-versioning': { previous: 'json-schema-guide' }
    }
    
    const path = learningPaths[currentGuideId] || {}
    const connections = this.getGuideConnections(currentGuideId)
    
    return {
      previous: path.previous,
      next: path.next,
      alternatives: connections.suggestedGuides.slice(0, 3)
    }
  }

  private estimateGuideDifficulty(guideId: string): 'beginner' | 'intermediate' | 'advanced' {
    const beginnerGuides = ['json-basics', 'jsonl-introduction', 'parser-overview']
    const advancedGuides = ['api-versioning', 'optimization-tips', 'caching-strategies']
    
    if (beginnerGuides.includes(guideId)) return 'beginner'
    if (advancedGuides.includes(guideId)) return 'advanced'
    return 'intermediate'
  }

  private trackExampleUsage(example: InteractiveExample): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'example_loaded', {
        event_category: 'guide_interaction',
        event_label: example.id,
        custom_parameter_1: example.type
      })
    }
  }

  private trackToolNavigation(toolId: string, context?: { guideId?: string; exampleId?: string }): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'tool_navigation', {
        event_category: 'guide_interaction',
        event_label: toolId,
        custom_parameter_1: context?.guideId || 'direct'
      })
    }
  }

  private showCopySuccess(): void {
    // 실제 구현에서는 토스트 메시지나 알림 시스템 사용
    console.log('✓ 예제 데이터가 클립보드에 복사되었습니다')
  }

  private fallbackCopy(data: string): void {
    // 클립보드 API가 지원되지 않는 경우의 폴백
    const textArea = document.createElement('textarea')
    textArea.value = data
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    
    try {
      document.execCommand('copy')
      this.showCopySuccess()
    } catch (error) {
      console.error('Fallback copy failed:', error)
    } finally {
      document.body.removeChild(textArea)
    }
  }
}

export default GuideIntegrationService