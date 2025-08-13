# 프로젝트 구조 및 조직

## 디렉토리 구조

```
src/
├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── common/         # 기능 간 공유 컴포넌트
│   ├── feature/        # 기능별 전용 컴포넌트
│   ├── ui/             # 기본 UI 구성 요소
│   ├── icons/          # 아이콘 컴포넌트
│   ├── tools/          # 도구별 컴포넌트
│   └── transitions/    # 애니메이션/전환 컴포넌트
├── pages/              # 라우트 레벨 페이지 컴포넌트
├── layouts/            # 레이아웃 래퍼 컴포넌트
├── stores/             # Pinia 상태 관리
├── router/             # Vue Router 설정
├── composables/        # 재사용 가능한 컴포지션 함수
├── utils/              # 순수 유틸리티 함수
├── types/              # TypeScript 타입 정의
├── styles/             # 전역 CSS 파일
├── locales/            # 국제화 파일
├── services/           # 외부 서비스 통합
├── constants/          # 애플리케이션 상수
└── __tests__/          # 테스트 파일 및 설정
```

## 명명 규칙

### 컴포넌트
- **PascalCase** - 모든 Vue 컴포넌트 (예: `TreeNode.vue`, `JsonEditor.vue`)
- **페이지**: "Page" 접미사가 있는 PascalCase (예: `HomePage.vue`, `TutorialPage.vue`)
- **레이아웃**: 설명적인 이름의 PascalCase (예: `MainLayout.vue`)

### 파일 및 디렉토리
- **camelCase** - JavaScript/TypeScript 파일 (예: `jsonTreeStore.ts`, `parseJson.ts`)
- **kebab-case** - 필요시 디렉토리명
- **PascalCase** - 컴포넌트 디렉토리

### 코드 규칙
- **스토어**: "Store" 접미사가 있는 camelCase (예: `jsonTreeStore`, `i18nStore`)
- **컴포저블**: "use" 접두사가 있는 camelCase (예: `useJsonParser`, `useKeyboard`)
- **타입/인터페이스**: PascalCase (예: `ParsedNode`, `JsonTreeState`)
- **열거형**: PascalCase (예: `DataType`, `InputType`)
- **상수**: UPPER_SNAKE_CASE (예: `LOCAL_STORAGE_KEYS`, `DEFAULT_CONFIG`)

## 컴포넌트 조직

### 컴포넌트 카테고리
- **common/**: 여러 기능에서 공유 (네비게이션, 모달, 도움말 시스템)
- **feature/**: 주요 애플리케이션 기능 전용 (InputPanel, OutputPanel)
- **ui/**: 기본 재사용 가능한 UI 요소 (버튼, 입력, 트리 노드)
- **icons/**: 일관된 API를 가진 SVG 아이콘 컴포넌트
- **tools/**: 도구별 기능 컴포넌트
- **transitions/**: 애니메이션 및 전환 컴포넌트

### 컴포넌트 구조
복잡한 컴포넌트는 다음을 포함해야 합니다:
- `.vue` 파일 - 템플릿 및 스크립트
- `.ts` 파일 - 로직 (상당한 경우)
- `.css` 파일 - 스타일 (상당한 경우)

## 상태 관리

### 스토어 조직
- **도메인당 하나의 스토어** (예: `jsonTreeStore`, `i18nStore`)
- **Pinia와 함께 Composition API 패턴**
- **computed 게터가 있는 반응형 상태**
- **변경 및 비동기 작업을 위한 액션**

### 스토어 패턴
- Composition API 구문과 함께 `defineStore` 사용
- 비용이 많이 드는 작업에 대한 캐싱 구현
- 사용자 피드백과 함께 오류를 우아하게 처리
- 중요한 상태를 localStorage에 지속

## 타입 시스템

### 타입 조직
- **index.ts**: 주요 애플리케이션 타입 및 인터페이스
- **도메인별 파일**: 별개 도메인을 위한 별도 파일 (i18n.ts, ads.ts 등)
- **엄격한 타이핑**: 모든 함수와 컴포넌트 완전 타입화
- **열거형 사용**: 제어된 어휘를 위해 (DataType, InputType)

## 테스트 구조

### 테스트 조직
- **`__tests__/`에서 소스 구조 미러링**
- **단위 테스트**: 개별 함수 및 컴포넌트
- **통합 테스트**: 컴포넌트 상호작용 및 워크플로우
- **E2E 테스트**: 전체 애플리케이션 시나리오

### 테스트 패턴
- Vue Test Utils와 함께 Vitest 사용
- 외부 의존성 모킹
- 사용자 상호작용 및 엣지 케이스 테스트
- 중요한 경로에 대한 높은 커버리지 유지

## 파일 명명 패턴

### Vue 컴포넌트
- 단일 단어: `App.vue`
- 다중 단어: `TreeNode.vue`, `InputPanel.vue`
- 페이지: `HomePage.vue`, `LearningCenterPage.vue`

### TypeScript 파일
- 스토어: `jsonTreeStore.ts`, `i18nStore.ts`
- 유틸리티: `parseJson.ts`, `validators.ts`
- 타입: `index.ts`, `i18n.ts`
- 서비스: `AdSenseService.ts`

## 가져오기/내보내기 패턴

### 배럴 내보내기
- 깔끔한 가져오기를 위해 `index.ts` 파일 사용
- 일반적으로 사용되는 유틸리티 및 타입 내보내기
- 관련 기능 그룹화

### 가져오기 조직
- Vue 프레임워크 가져오기 먼저
- 서드파티 라이브러리 두 번째
- 로컬 가져오기 마지막
- 기능별로 그룹화