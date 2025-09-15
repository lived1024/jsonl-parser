# Design Document

## Overview

이 설계 문서는 JSONL Parser 애플리케이션에 다국어 기능을 순차적으로 적용하기 위한 기술적 설계를 정의합니다. 현재 다국어 인프라는 완전히 구축되어 있으며, 언어 선택기도 구현되어 있습니다. 이 프로젝트는 기존 컴포넌트들을 다국어 지원으로 점진적으로 마이그레이션하는 것을 목표로 합니다.

## Architecture

### 현재 다국어 인프라 상태

1. **완전 구현된 요소들**:
   - i18n Pinia Store (`src/stores/i18nStore.ts`)
   - useI18n Composable (`src/composables/useI18n.ts`)
   - 번역 파일 (한국어/영어) (`src/locales/`)
   - 타입 정의 (`src/types/i18n.ts`)
   - 상수 정의 (`src/constants/i18n.ts`)
   - 언어 선택기 컴포넌트 (`src/components/ui/LanguageSelector.vue`)

2. **초기화 상태**:
   - `main.ts`에서 i18n 스토어 초기화 완료
   - localStorage 기반 언어 설정 저장/복원 구현

3. **미적용 상태**:
   - 대부분의 Vue 컴포넌트에서 하드코딩된 텍스트 사용
   - SEO 메타데이터 다국어화 미적용
   - 접근성 텍스트 다국어화 미적용

### 마이그레이션 전략

**점진적 적용 방식 (Progressive Enhancement)**:
1. 핵심 기능부터 시작 (InputPanel, OutputPanel)
2. 네비게이션 및 레이아웃
3. 학습 센터 및 콘텐츠
4. 도움말 및 지원 기능
5. SEO 및 접근성

## Components and Interfaces

### 1. 핵심 파싱 컴포넌트 마이그레이션

#### InputPanel 컴포넌트 (`src/components/feature/InputPanel.vue`)

**현재 상태**: 하드코딩된 한국어 텍스트 사용
**마이그레이션 계획**:

```typescript
// Before (하드코딩)
placeholder: '여기에 JSON 데이터를 입력하세요...'

// After (다국어 지원)
const { t } = useI18n()
placeholder: computed(() => t('editor.placeholder'))
```

**주요 변경 영역**:
- 플레이스홀더 텍스트
- 버튼 라벨 (Format, Clear)
- 툴팁 텍스트
- 드래그 앤 드롭 메시지
- 파일 로딩 메시지

#### OutputPanel 컴포넌트 (`src/components/feature/OutputPanel.vue`)

**마이그레이션 계획**:
- 트리 제어 버튼 텍스트
- 통계 정보 라벨
- 빈 상태 메시지
- 오류 메시지

#### 오류 처리 컴포넌트

**JSON 파싱 오류 메시지**:
```typescript
// 동적 오류 메시지 생성
const getErrorMessage = (error: ParseError) => {
  return t('output.error.location.line', { line: error.line })
}
```

### 2. 네비게이션 컴포넌트 마이그레이션

#### MainNavigation 컴포넌트 (`src/components/common/MainNavigation.vue`)

**마이그레이션 계획**:
```typescript
// 네비게이션 메뉴 항목
const navigationItems = computed(() => [
  {
    path: '/',
    label: t('navigation.items.parser.label'),
    description: t('navigation.items.parser.description')
  },
  {
    path: '/learn',
    label: t('navigation.items.learn.label'),
    description: t('navigation.items.learn.description')
  }
  // ... 기타 메뉴 항목
])
```

#### 언어 선택기 통합

**현재 상태**: 이미 완전히 구현됨
**통합 계획**: MainNavigation에 LanguageSelector 추가

### 3. 학습 센터 컴포넌트 마이그레이션

#### LearningCenterPage (`src/pages/LearningCenterPage.vue`)

**현재 문제**: 하드코딩된 한국어 텍스트
**마이그레이션 계획**:

```typescript
// 페이지 제목 및 설명
const pageTitle = computed(() => t('learn.title'))
const pageDescription = computed(() => t('learn.description'))

// 필터 섹션
const filterSections = computed(() => [
  {
    key: 'difficulty',
    title: t('learn.filters.difficulty'),
    options: [
      { key: 'beginner', label: t('learn.difficulty.beginner') },
      { key: 'intermediate', label: t('learn.difficulty.intermediate') },
      { key: 'advanced', label: t('learn.difficulty.advanced') }
    ]
  }
])
```

#### TutorialViewer 컴포넌트

**마이그레이션 계획**:
- 튜토리얼 메타데이터 (난이도, 소요시간)
- 진행률 표시 텍스트
- 네비게이션 버튼 (이전/다음)

### 4. 도움말 및 지원 컴포넌트

#### HelpModal (`src/components/common/HelpModal.vue`)

**마이그레이션 계획**:
```typescript
// 탭 구성
const helpTabs = computed(() => [
  { key: 'overview', label: t('help.tabs.overview') },
  { key: 'shortcuts', label: t('help.tabs.shortcuts') },
  { key: 'examples', label: t('help.tabs.examples') }
])
```

#### KeyboardShortcuts 컴포넌트

**마이그레이션 계획**:
- 단축키 설명 텍스트
- 카테고리 라벨
- 도움말 텍스트

#### FAQSection 및 TroubleshootingGuide

**마이그레이션 계획**:
- 질문과 답변 텍스트
- 검색 플레이스홀더
- 카테고리 필터 라벨

## Data Models

### 번역 키 구조 확장

**현재 번역 파일 구조 분석**:
```typescript
// 이미 잘 구조화된 번역 키 존재
{
  header: { title, subtitle },
  input: { title, description, placeholder, ... },
  output: { title, description, stats, controls, ... },
  // ... 기타 섹션
}
```

**추가 필요한 번역 키**:

```typescript
// 학습 센터 관련
learn: {
  title: string,
  description: string,
  filters: {
    difficulty: string,
    category: string
  },
  difficulty: {
    beginner: string,
    intermediate: string,
    advanced: string
  },
  progress: {
    completed: string,
    inProgress: string,
    notStarted: string
  }
}

// 네비게이션 관련 (이미 존재)
navigation: {
  items: {
    parser: { label, description },
    learn: { label, description },
    // ...
  }
}
```

### 컴포넌트별 번역 키 매핑

**InputPanel 번역 키**:
- `editor.placeholder`
- `editor.actions.format`
- `editor.actions.clear`
- `editor.dragDrop.title`
- `editor.loading.title`

**OutputPanel 번역 키**:
- `output.controls.expandAll`
- `output.controls.collapseAll`
- `output.stats.nodes`
- `output.empty.title`

## Error Handling

### 번역 키 누락 처리

**현재 구현 상태**: 이미 구현됨
```typescript
// useI18n.ts에서 이미 처리
const hasTranslation = (key: string): boolean => {
  const translation = i18nStore.getTranslation(key)
  return translation !== key // 키 자체가 반환되면 번역이 없음
}
```

### 폴백 전략

**현재 구현 상태**: 이미 구현됨
- 번역 키 누락 시 키 이름 표시
- 언어 로딩 실패 시 기본 언어로 폴백
- 개발 환경에서 누락된 키 콘솔 경고

### 동적 콘텐츠 오류 처리

**새로운 요구사항**:
```typescript
// 동적 번역 오류 처리
const safeTranslate = (key: string, params?: Record<string, any>, fallback?: string) => {
  try {
    const result = t(key, params)
    return result !== key ? result : (fallback || key)
  } catch (error) {
    console.warn(`Translation error for key: ${key}`, error)
    return fallback || key
  }
}
```

## Testing Strategy

### 단위 테스트

**컴포넌트 번역 테스트**:
```typescript
// 예시: InputPanel 테스트
describe('InputPanel i18n', () => {
  it('should display Korean text when language is ko', async () => {
    const { changeLanguage } = useI18n()
    await changeLanguage(Language.KO)
    
    const wrapper = mount(InputPanel)
    expect(wrapper.find('[data-testid="format-button"]').text()).toBe('포맷')
  })
  
  it('should display English text when language is en', async () => {
    const { changeLanguage } = useI18n()
    await changeLanguage(Language.EN)
    
    const wrapper = mount(InputPanel)
    expect(wrapper.find('[data-testid="format-button"]').text()).toBe('Format')
  })
})
```

### 통합 테스트

**언어 변경 플로우 테스트**:
```typescript
describe('Language switching integration', () => {
  it('should update all components when language changes', async () => {
    // 언어 선택기 클릭
    // 모든 컴포넌트 텍스트 변경 확인
    // localStorage 저장 확인
  })
})
```

### E2E 테스트

**사용자 시나리오 테스트**:
- 언어 변경 후 페이지 새로고침 시 언어 유지
- 모든 페이지에서 언어 일관성 확인
- 접근성 도구로 다국어 지원 확인

## SEO 및 메타데이터 다국어화

### 현재 SEO 구현 상태

**분석 결과**: 
- `useSEO` 컴포저블 존재하지만 다국어 미지원
- 하드코딩된 메타데이터 사용

### 다국어 SEO 설계

**메타데이터 다국어화**:
```typescript
// useSEO 컴포저블 확장
const useSEO = (options: SEOOptions) => {
  const { t, currentLanguage } = useI18n()
  
  const updateMetadata = () => {
    document.title = t(options.titleKey)
    document.querySelector('meta[name="description"]')?.setAttribute('content', t(options.descriptionKey))
    document.documentElement.lang = currentLanguage.value
  }
  
  // 언어 변경 시 메타데이터 업데이트
  watch(currentLanguage, updateMetadata, { immediate: true })
}
```

**구조화된 데이터 다국어화**:
```typescript
const generateStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": t('meta.title'),
    "description": t('meta.description'),
    "inLanguage": currentLanguage.value
  }
}
```

## 접근성 다국어화

### 현재 접근성 구현 상태

**분석 결과**: 
- `useAccessibility` 컴포저블 존재
- 하드코딩된 aria-label 사용

### 접근성 텍스트 다국어화

**aria-label 다국어화**:
```typescript
// 컴포넌트에서 사용
<button :aria-label="t('accessibility.expandAllNodes')">
  {{ t('output.controls.expandAll') }}
</button>
```

**스크린 리더 알림 다국어화**:
```typescript
const announceToScreenReader = (messageKey: string, params?: Record<string, any>) => {
  const message = t(messageKey, params)
  // 기존 접근성 유틸리티 사용
  accessibility.announce(message)
}
```

## 성능 최적화

### 번역 파일 지연 로딩

**현재 구현 상태**: 이미 구현됨
```typescript
// i18nStore.ts에서 이미 동적 import 사용
const translationModule = await import(`../locales/${language}`)
```

### 번역 캐싱

**현재 구현 상태**: 이미 구현됨
- 로드된 번역은 메모리에 캐시
- localStorage에 언어 설정 저장

### 컴포넌트 최적화

**반응성 최적화**:
```typescript
// computed를 사용한 번역 캐싱
const translatedText = computed(() => t('some.key'))

// 불필요한 재렌더링 방지
const memoizedTranslation = useMemo(() => t('complex.key', params), [params])
```

## 마이그레이션 단계별 계획

### Phase 1: 핵심 기능 (우선순위: 높음)
1. InputPanel 컴포넌트
2. OutputPanel 컴포넌트  
3. 오류 메시지 처리
4. 키보드 단축키 도움말

### Phase 2: 네비게이션 (우선순위: 높음)
1. MainNavigation 컴포넌트
2. 언어 선택기 통합
3. 페이지 제목 및 브레드크럼

### Phase 3: 학습 센터 (우선순위: 중간)
1. LearningCenterPage
2. TutorialViewer
3. 필터 및 검색 기능

### Phase 4: 도움말 및 지원 (우선순위: 중간)
1. HelpModal
2. FAQSection
3. TroubleshootingGuide
4. DataTypeGuide

### Phase 5: SEO 및 접근성 (우선순위: 낮음)
1. 메타데이터 다국어화
2. 구조화된 데이터 다국어화
3. 접근성 텍스트 다국어화

### Phase 6: 고급 기능 (우선순위: 낮음)
1. 도구 페이지들
2. 참조 가이드들
3. 샘플 데이터 뷰어

## 품질 보증

### 번역 품질 관리

**번역 키 네이밍 컨벤션**:
- 계층적 구조 사용 (`section.subsection.key`)
- 명확하고 설명적인 키 이름
- 동사형/명사형 일관성 유지

**번역 검증 도구**:
```typescript
// 개발 도구: 누락된 번역 키 검사
const validateTranslations = () => {
  const englishKeys = extractKeys(enTranslations)
  const koreanKeys = extractKeys(koTranslations)
  
  const missingInKorean = englishKeys.filter(key => !koreanKeys.includes(key))
  const missingInEnglish = koreanKeys.filter(key => !englishKeys.includes(key))
  
  console.warn('Missing translations:', { missingInKorean, missingInEnglish })
}
```

### 사용자 경험 검증

**언어 전환 UX**:
- 즉시 반영 (페이지 새로고침 불필요)
- 로딩 상태 표시
- 오류 시 적절한 피드백

**일관성 검증**:
- 모든 페이지에서 동일한 용어 사용
- 톤앤매너 일관성 유지
- 문화적 적절성 고려