# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 가이드를 제공합니다.

## 프로젝트 개요

이것은 Amazon의 Kiro 에디터를 사용하여 개발된 **JSONL Parser** 웹 애플리케이션입니다. 원래 간단한 JSON/JSONL 파싱 도구였지만, JSON 데이터를 다루는 개발자들을 위한 종합적인 콘텐츠 허브로 발전했습니다. 교육용 튜토리얼, 데이터 조작 도구, 참조 가이드, 샘플 데이터 라이브러리를 포함합니다.

### 대상 사용자
개발자, 데이터 분석가, 복잡한 중첩 구조의 효율적인 시각화와 탐색이 필요한 JSON 데이터 작업자

### 핵심 가치 제안
1. **즉시 시각화**: 실시간 파싱 및 트리 표시
2. **대용량 데이터 처리**: 1000개 이상의 노드를 가진 데이터셋에 최적화
3. **사용자 경험**: 반응형 디자인, 키보드 단축키, 상황별 도움말
4. **안정성**: 포괄적인 오류 처리 및 부분 파싱 지원

### 현재 개발 상태
**핵심 기능**: ✅ 완료
- JSON/JSONL 파싱 및 트리 시각화
- 국제화 (영어/한국어)
- 기본 UI 컴포넌트 및 반응형 디자인

**콘텐츠 확장**: ✅ 대부분 완료
- 교육 튜토리얼 및 학습 센터
- 추가 데이터 조작 도구
- 참조 가이드 및 샘플 라이브러리
- Google AdSense 통합

**진행 중/남은 작업**:
- [ ] 사용자 선호도 추적 시스템
- [ ] 성능 최적화
- [ ] SEO 향상 및 메타데이터 최적화
- [ ] 포괄적인 테스트 커버리지

## 개발 명령어

### 필수 명령어
```bash
npm install            # 의존성 설치
npm run dev            # HMR 개발 서버 (localhost:5173)
npm run build          # generate:sitemap → vite build → optimize:build
npm run build:only     # 순수 vite build (sitemap/optimize 생략)
npm run build:fast     # generate:sitemap + vite build (optimize 생략)
npm run build:production # + check:compliance (AdSense 광고 밀도 검사)
npm run preview        # 프로덕션 빌드 로컬 미리보기

npm run test           # Vitest 워치 모드
npm run test:run       # 전체 테스트 한 번 실행
npm run test:coverage  # 커버리지 리포트

# 단일 테스트 파일 실행 / 이름으로 필터
npx vitest run src/__tests__/validators.test.ts
npx vitest run -t "detects JSONL"
```

### 빌드 파이프라인 (`scripts/`)
`npm run build`는 단순 `vite build`가 아니라 다단계다:
- `generate:sitemap` (`generate-sitemap.js`) — 라우트 목록으로 `public/sitemap.xml` 생성
- `optimize:build` (`optimize-build.js`) — 빌드 후 `dist/` 에셋 최적화
- `check:compliance` (`check-ad-compliance.js`) — AdSense 정책용 광고/콘텐츠 비율 검증 (`build:production`에서만 실행)

sitemap/optimize 단계가 필요 없는 반복 개발 시엔 `build:only` 사용.

### 개발 워크플로우
- 커밋 전 `npm run test:run` 실행.
- TypeScript 엄격 모드 활성화. **ESLint 설정 없음** — `vue-tsc` 타입 체크가 lint 게이트다.

## 아키텍처 개요

### 기술 스택
- **Vue 3** — 컴포넌트는 `<script setup>` 사용. 단, **Pinia 스토어는 Options API** (`defineStore('jsonTree', { state, getters, actions })`) 방식이며 setup/composition 스타일이 아니다. 스토어 수정 시 기존 스타일을 따를 것.
- **TypeScript** 엄격 모드
- **Vue Router 4** — lazy 라우트 import (아래 라우팅 참조)
- **Vite 4** — 커스텀 `manualChunks` 사용 (아래 참조)
- **Vitest** + jsdom + Vue Test Utils
- **Highlight.js** (구문 강조), **Marked** (마크다운 → 콘텐츠 렌더링), **Lucide Vue Next** (아이콘), **vue-i18n** (현지화)

### 앱 부트스트랩 (`src/main.ts`)
시작은 비동기이며 순서가 있다: `initializeSEO()` → `i18nStore` 동적 import 후 `await initialize()` → `AnalyticsService` 초기화 (GA id `G-PX3P01GVCR`) → `AdSenseService`는 **`import.meta.env.PROD`에서만** 초기화 → `app.mount('#app')` → `index.html`의 `#initial-loading` 스플래시 제거. 초기화 실패 시에도 앱은 마운트된다(기본 언어로 폴백). 서비스는 `.getInstance()` 싱글턴이다.

### 라우팅 & 코드 스플리팅 (`src/router/index.ts`)
모든 라우트는 `webpackChunkName` 힌트가 붙은 lazy `() => import(...)`다. 라우트 `meta`가 두 가지 커스텀 성능 동작을 제어한다: `preload: true`는 로드 후 ~100ms에 해당 라우트를 백그라운드 프리로드; `chunkGroup`은 네비게이션 시 같은 그룹의 형제 라우트를 프리로드. 라우트 구조는 hub + detail: `/learn` + `/learn/:id`, `/tools` + `/tools/:toolId`, `/reference` + `/reference/:referenceId`, 그리고 `/samples`, `/info` + `/info/:guideId`. 페이지 추가 시: `src/pages/`에 컴포넌트, 여기에 라우트, `vite.config.ts`의 `manualChunks` 항목까지 함께 추가.

### 프로젝트 구조 (Kiro 기반)
```
src/
├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── common/         # 기능 간 공유 컴포넌트
│   ├── feature/        # 기능별 전용 컴포넌트 (InputPanel, OutputPanel)
│   ├── ui/             # 기본 UI 구성 요소 (TreeNode, TextEditor)
│   ├── icons/          # 일관된 API를 가진 아이콘 컴포넌트
│   ├── tools/          # 도구별 기능 컴포넌트
│   ├── reference/      # 도움말 및 문서 컴포넌트
│   └── transitions/    # 애니메이션 및 전환 컴포넌트
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
├── content/            # 콘텐츠 관리 (가이드, 튜토리얼, 샘플)
└── __tests__/          # 테스트 파일 및 설정
```

### 컴포넌트 명명 규칙
- **컴포넌트**: PascalCase (예: `TreeNode.vue`, `JsonEditor.vue`)
- **페이지**: "Page" 접미사가 있는 PascalCase (예: `HomePage.vue`, `TutorialPage.vue`)
- **스토어**: "Store" 접미사가 있는 camelCase (예: `jsonTreeStore`, `i18nStore`)
- **컴포저블**: "use" 접두사가 있는 camelCase (예: `useJsonParser`, `useKeyboard`)
- **타입/인터페이스**: PascalCase (예: `ParsedNode`, `JsonTreeState`)
- **상수**: UPPER_SNAKE_CASE (예: `LOCAL_STORAGE_KEYS`, `DEFAULT_CONFIG`)

### 스토어 (`src/stores/`, Options API)
- **`jsonTreeStore`** — 핵심 스토어. 입력 텍스트, JSON/JSONL 감지, 파싱, `ParsedNode[]` 트리, 펼침/접힘(재귀 트리 순회), 오류를 관리한다. 수정 전 알아둘 두 가지 메커니즘:
  - **파싱 캐시** (`_parseCache`, `Map`): `inputType:content` 해시를 키로, 5분 TTL, 10개 초과 시 가장 오래된 항목 제거. 파싱 시 캐시를 먼저 확인한다.
  - **자동 저장**: 입력/트리를 `LOCAL_STORAGE_KEYS.JSON_TREE_DATA` 키로 `localStorage`에 저장하고 로드 시 복원한다.
  - 입력 가드: `MAX_INPUT_SIZE`(`DEFAULT_CONFIG`)와 ~100MB 추정 메모리 상한으로 과도한 입력을 파싱 전에 거부한다.
- **`i18nStore`** — 로케일 상태; `initialize()`는 부트스트랩에서 await된다.
- **`sampleLibraryStore`** — `/samples`용 샘플 데이터 카탈로그.

상수(`LOCAL_STORAGE_KEYS`, `DEFAULT_CONFIG`)는 `src/types/constants.ts`에 있다.

### 서비스 레이어 (`src/services/`, `.getInstance()` 싱글턴)
외부/횡단 관심사는 컴포넌트나 스토어가 아니라 여기에 격리된다: `AnalyticsService` (GA4), `AdSenseService` (프로덕션 전용 광고), `ContentService` + `ContentCacheService` (가이드/튜토리얼/샘플 마크다운 로드·캐시), `GuideIntegrationService`, `ErrorPatternService` + `errorMessageService` (i18n 대응, 라인 라벨이 붙은 파싱 오류), `PerformanceService`, `MediaOptimizationService`, `SitemapService`. `src/composables/`의 컴포저블(`useSEO`, `useAnalytics`, `useUserTracking`, `useAccessibility`, `useAria`, `useKeyboardNavigation`, `useMobile`, `useChunkLoading`, `useContentCache`, `useI18n`)이 이들을 컴포넌트에서 쓰도록 감싼다.

### 주요 기능 구현
- **지연 로딩**: 50개 이상의 자식을 가진 트리 노드는 "더 보기" 버튼으로 점진적 로딩 사용
- **캐싱**: 성능 최적화를 위해 5분 만료 시간으로 파싱 결과 캐싱
- **자동 감지**: 다중 라인 검증을 사용한 자동 JSON vs JSONL 형식 감지
- **반응형 디자인**: 768px, 1024px 브레이크포인트를 가진 모바일 우선 접근법
- **i18n 지원**: vue-i18n을 통한 한국어/영어 현지화
- **성능 최적화**: 컴포넌트 메모이제이션, 가상 스크롤링 준비, 메모리 모니터링

### 데이터 처리 아키텍처
- **JSON 파싱**: 상세한 오류 보고 및 위치 정보를 가진 표준 JSON.parse
- **JSONL 감지**: 라인별 JSON 파싱 지원을 가진 다중 라인 검증
- **트리 생성**: 데이터 타입 감지 및 지연 로딩을 가진 재귀 노드 생성
- **오류 처리**: 사용자 친화적 메시지 및 부분 파싱 성공을 가진 포괄적 검증
- **데이터 타입**: 색상 코드 시각화 (객체: 보라색, 배열: 주황색, 문자열: 녹색, 숫자: 파란색, 불린: 노란색, null: 회색)

### Vite 청킹 (`vite.config.ts`)
`build.rollupOptions.output.manualChunks`는 수동 관리된다: vendor는 `vue-vendor` / `ui-vendor` / `content-vendor` / `vendor`로 분리; 각 페이지와 컴포넌트 그룹은 자체 청크; `content/` + `locales/`는 함께 번들. `chunkFileNames`는 출력을 `pages/`, `components/`, `services/` 하위 폴더로 정렬한다. **페이지나 무거운 컴포넌트를 추가하면 대응하는 `manualChunks` 분기도 추가**하지 않으면 일반 번들로 떨어진다.

### 테스트 (`src/__tests__/`)
- `src/` 구조를 미러링 (`components/`, `composables/`, `stores/`, `services/`, `utils/`, `integration/`, `pages/`).
- jsdom 환경; 전역 설정은 `src/__tests__/setup.ts`.
- 컴포넌트 테스트는 Vue Test Utils; `integration/`은 i18n 포함 횡단 플로우를 다룬다.

### 콘텐츠 관리 시스템
애플리케이션은 포괄적인 콘텐츠 시스템을 포함합니다:
- **가이드**: 고급 사용법, API 개발, 데이터 처리
- **튜토리얼**: 초급, 중급, 고급 JSON 파싱 가이드
- **샘플**: API 응답, 구성, 데이터셋
- **참조**: 모범 사례, 패턴, 구문 가이드

### 분석 및 사용자 추적
- 사용자 행동 추적을 위한 Google Analytics 4 통합
- 개인정보 보호를 고려한 클라이언트 사이드 분석
- 성능 모니터링 기능
- 수익화를 위한 Google AdSense 통합

### 구현 진행 상황 추적
Kiro 스펙을 기반으로 한 프로젝트의 구조적 개발 접근 방식은 3가지 주요 단계를 따릅니다:

1. **json-tree-viewer**: ✅ 핵심 파싱 기능 - 완료
2. **internationalization**: ✅ 다국어 지원 - 완료  
3. **monetization-content-expansion**: 🔄 콘텐츠 허브 확장 - 대부분 완료

### 주요 남은 작업들
현재 Kiro 작업 명세서에서:
- 사용자 선호도 추적 시스템 (localStorage 기반)
- 모바일 최적화 및 접근성 개선
- 성능 최적화 및 코드 분할
- 포괄적인 테스트 커버리지
- SEO 메타데이터 최적화

### Kiro를 활용한 개발 워크플로우
이 프로젝트는 구조적 개발을 위해 Amazon의 Kiro 에디터 사양을 사용합니다:
- 요구사항은 `.kiro/specs/[feature]/requirements.md`에 정의
- 설계 문서는 `.kiro/specs/[feature]/design.md`에 위치  
- 구현 추적은 `.kiro/specs/[feature]/tasks.md`에서 관리
- 제품 및 기술 가이드 문서가 전체 방향을 안내

이 Kiro로 개발된 애플리케이션은 성능, 접근성, 국제화, 통합 도움말 시스템과 광범위한 콘텐츠 관리를 통한 포괄적인 사용자 지원을 강조합니다.