# 설계 문서

## 개요

JSONL Parser 애플리케이션을 구글 애드센스 통합과 추가 콘텐츠로 확장하여 수익화하는 정적 사이트 솔루션입니다. 기존의 JSON/JSONL 파싱 기능을 유지하면서 교육 자료, 도구, 참조 자료를 추가하여 포괄적인 JSON 생태계를 구축합니다.

## 아키텍처

### 전체 구조
```
JSONL Parser (확장된 정적 사이트)
├── 핵심 파서 기능 (기존)
├── 교육 콘텐츠 섹션 (신규)
├── 도구 모음 섹션 (신규)
├── 참조 자료 섹션 (신규)
├── 샘플 데이터 라이브러리 (신규)
├── 구글 애드센스 통합 (신규)
└── 분석 및 추적 (신규)
```

### 라우팅 구조
```
/                    - 메인 파서 (기존 홈페이지)
/learn              - 학습 센터 (튜토리얼, 가이드)
/tools              - 도구 모음 (변환기, 검증기 등)
/reference          - 참조 자료 (치트시트, 문법 가이드)
/samples            - 샘플 데이터 라이브러리
/about              - 소개 및 정보
```

### 기술 스택 확장
- **기존 스택 유지**: Vue 3, TypeScript, Vite, Pinia
- **새로운 의존성**:
  - Google AdSense (스크립트 태그)
  - Google Analytics 4 (gtag)
  - 마크다운 파서 (교육 콘텐츠용)
  - 코드 하이라이터 (예제 표시용)

## 컴포넌트 및 인터페이스

### 0. UI
기존에 개발된 화면은 최대한 유지하면서 추가 개발을 진행한다.

### 1. 네비게이션 시스템

#### MainNavigation.vue
```typescript
interface NavigationItem {
  path: string
  label: string
  icon: string
  description?: string
}

interface NavigationProps {
  currentPath: string
  isMobile: boolean
}
```

#### MobileMenu.vue
```typescript
interface MobileMenuProps {
  isOpen: boolean
  navigationItems: NavigationItem[]
}
```

### 2. 광고 시스템

#### AdSenseContainer.vue
```typescript
interface AdSenseProps {
  adSlot: string
  adFormat: 'auto' | 'rectangle' | 'banner' | 'vertical'
  adLayout?: string
  className?: string
}

interface AdSenseState {
  isLoaded: boolean
  isBlocked: boolean
  error: string | null
}
```

#### AdSenseService.ts
```typescript
interface AdSenseConfig {
  publisherId: string
  adSlots: {
    header: string
    sidebar: string
    content: string
    footer: string
  }
}

class AdSenseService {
  init(config: AdSenseConfig): Promise<void>
  loadAd(element: HTMLElement, slot: string): void
  isAdBlockerActive(): boolean
}
```

### 3. 교육 콘텐츠 시스템

#### LearningCenter.vue
```typescript
interface Tutorial {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number
  content: string
  examples: CodeExample[]
}

interface LearningProgress {
  completedTutorials: string[]
  currentTutorial?: string
  lastAccessed: Date
}
```

#### TutorialViewer.vue
```typescript
interface TutorialViewerProps {
  tutorial: Tutorial
  progress: LearningProgress
}

interface TutorialViewerEmits {
  complete: (tutorialId: string) => void
  progress: (tutorialId: string, step: number) => void
}
```

### 4. 도구 모음 시스템

#### ToolsHub.vue
```typescript
interface Tool {
  id: string
  name: string
  description: string
  category: 'validation' | 'conversion' | 'formatting' | 'generation'
  component: string
}

interface ToolsState {
  availableTools: Tool[]
  activeTool: string | null
  toolHistory: string[]
}
```

#### JsonValidator.vue
```typescript
interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

interface ValidationError {
  line: number
  column: number
  message: string
  severity: 'error' | 'warning'
}
```

#### DataConverter.vue
```typescript
interface ConversionOptions {
  inputFormat: 'json' | 'jsonl'
  outputFormat: 'csv' | 'xml' | 'yaml' | 'tsv'
  includeHeaders: boolean
  delimiter?: string
}

interface ConversionResult {
  success: boolean
  data: string
  error?: string
}
```

### 5. 참조 자료 시스템

#### ReferenceHub.vue
```typescript
interface ReferenceSection {
  id: string
  title: string
  content: string
  examples: CodeExample[]
  relatedTopics: string[]
}

interface CheatSheet {
  category: string
  items: CheatSheetItem[]
}

interface CheatSheetItem {
  syntax: string
  description: string
  example: string
}
```

### 6. 샘플 데이터 시스템

#### SampleLibrary.vue
```typescript
interface SampleData {
  id: string
  name: string
  description: string
  category: 'api' | 'config' | 'data' | 'complex'
  difficulty: 'simple' | 'medium' | 'complex'
  size: 'small' | 'medium' | 'large'
  data: string
  metadata: SampleMetadata
}

interface SampleMetadata {
  source: string
  useCase: string
  features: string[]
  learningPoints: string[]
}
```

## 데이터 모델

### 1. 콘텐츠 관리

#### 정적 콘텐츠 구조
```
src/content/
├── tutorials/
│   ├── beginner/
│   ├── intermediate/
│   └── advanced/
├── reference/
│   ├── syntax/
│   ├── patterns/
│   └── best-practices/
├── samples/
│   ├── api-responses/
│   ├── configurations/
│   └── datasets/
└── guides/
    ├── getting-started/
    └── advanced-usage/
```

#### 콘텐츠 메타데이터
```typescript
interface ContentMetadata {
  title: string
  description: string
  author: string
  lastUpdated: Date
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedReadTime: number
}
```

### 2. 사용자 상태 관리

#### LocalStorage 스키마
```typescript
interface UserPreferences {
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
```

### 3. 분석 데이터

#### 클라이언트 사이드 추적
```typescript
interface AnalyticsEvent {
  category: 'tutorial' | 'tool' | 'sample' | 'ad'
  action: string
  label?: string
  value?: number
  timestamp: Date
}

interface PageView {
  path: string
  title: string
  referrer: string
  timestamp: Date
  sessionId: string
}
```

## 오류 처리

### 1. 광고 관련 오류

#### AdBlocker 감지
```typescript
class AdBlockerHandler {
  detect(): boolean
  showFallbackContent(): void
  trackAdBlockUsage(): void
}
```

#### 광고 로딩 실패
```typescript
interface AdErrorHandler {
  onAdLoadError(error: Error, adSlot: string): void
  showAlternativeContent(container: HTMLElement): void
  retryAdLoad(adSlot: string, maxRetries: number): Promise<boolean>
}
```

### 2. 콘텐츠 로딩 오류

#### 정적 콘텐츠 오류
```typescript
interface ContentErrorHandler {
  onContentLoadError(contentId: string, error: Error): void
  showErrorFallback(container: HTMLElement): void
  logContentError(error: ContentError): void
}
```

### 3. 도구 실행 오류

#### 변환/검증 오류
```typescript
interface ToolErrorHandler {
  onValidationError(error: ValidationError): void
  onConversionError(error: ConversionError): void
  showUserFriendlyError(error: Error): void
}
```

## 테스팅 전략

### 1. 단위 테스트

#### 컴포넌트 테스트
- 각 새로운 컴포넌트에 대한 Vue Test Utils 테스트
- 광고 컴포넌트의 로딩 상태 테스트
- 도구 컴포넌트의 입력/출력 검증

#### 서비스 테스트
- AdSense 서비스 모킹 테스트
- 콘텐츠 로더 테스트
- 로컬 스토리지 관리 테스트

### 2. 통합 테스트

#### 라우팅 테스트
- 새로운 페이지 라우팅 검증
- 네비게이션 상태 관리 테스트

#### 상태 관리 테스트
- Pinia 스토어 확장 테스트
- 사용자 진행 상황 추적 테스트

### 3. E2E 테스트

#### 사용자 플로우 테스트
- 튜토리얼 완료 플로우
- 도구 사용 플로우
- 샘플 데이터 로딩 플로우

#### 광고 통합 테스트
- 광고 표시 검증 (개발 환경)
- AdBlocker 시나리오 테스트

## 성능 고려사항

### 1. 코드 분할

#### 라우트 기반 분할
```typescript
// 각 주요 섹션을 별도 청크로 분할
const LearningCenter = () => import('../pages/LearningCenter.vue')
const ToolsHub = () => import('../pages/ToolsHub.vue')
const ReferenceHub = () => import('../pages/ReferenceHub.vue')
```

#### 컴포넌트 지연 로딩
```typescript
// 무거운 도구 컴포넌트들을 필요시에만 로딩
const DataConverter = defineAsyncComponent(() => import('../components/tools/DataConverter.vue'))
```

### 2. 콘텐츠 최적화

#### 정적 콘텐츠 압축
- 마크다운 파일 gzip 압축
- 이미지 최적화 (WebP 형식)
- 코드 예제 압축

#### 캐싱 전략
```typescript
interface ContentCache {
  tutorials: Map<string, Tutorial>
  samples: Map<string, SampleData>
  references: Map<string, ReferenceSection>
  maxAge: number
}
```

### 3. 광고 성능

#### 지연 로딩
- 뷰포트에 진입할 때만 광고 로드
- 사용자 상호작용 후 광고 활성화

#### 성능 모니터링
```typescript
interface AdPerformanceMetrics {
  loadTime: number
  renderTime: number
  viewability: number
  clickThroughRate: number
}
```

## 배포 및 SEO

### 1. 정적 사이트 최적화

#### 메타 태그 관리
```typescript
interface SEOMetadata {
  title: string
  description: string
  keywords: string[]
  ogImage: string
  canonicalUrl: string
}
```

#### 사이트맵 생성
- 모든 페이지와 콘텐츠에 대한 XML 사이트맵
- 동적 콘텐츠 인덱싱

### 2. 광고 정책 준수

#### 콘텐츠 정책
- 교육적이고 유용한 콘텐츠 제공
- 스팸성 콘텐츠 방지
- 사용자 경험 우선

#### 개인정보 보호
- GDPR 준수 쿠키 정책
- 사용자 동의 관리
- 데이터 최소화 원칙

## 확장성 고려사항

### 1. 콘텐츠 확장

#### 모듈화된 콘텐츠 구조
- 새로운 튜토리얼 쉽게 추가
- 도구 플러그인 시스템
- 다국어 지원 준비

### 2. 기능 확장

#### 플러그인 아키텍처
```typescript
interface ToolPlugin {
  id: string
  name: string
  category: string
  component: Component
  config: PluginConfig
}
```

#### API 통합 준비
- 외부 JSON 스키마 검증 서비스
- 온라인 샘플 데이터 소스
- 커뮤니티 콘텐츠 통합