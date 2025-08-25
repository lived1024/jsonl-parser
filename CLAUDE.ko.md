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
# 의존성 설치
npm install

# 개발 서버 실행 (localhost:5173)
npm run dev

# 프로덕션 빌드 (dist/ 폴더로)
npm run build

# 프로덕션 빌드 로컬 미리보기
npm run preview

# 워치 모드로 테스트 실행
npm run test

# 테스트 한 번 실행
npm run test:run

# 커버리지 리포트와 함께 테스트 실행
npm run test:coverage
```

### 개발 워크플로우
- 로컬 개발에는 `npm run dev` 사용 (`localhost:5173`)
- 변경사항 커밋 전에 항상 `npm run test` 실행
- 프로덕션 준비 상태 확인을 위해 `npm run build` 사용
- 포괄적인 린팅 규칙과 함께 TypeScript 엄격 모드 활성화

## 아키텍처 개요

### 기술 스택
- **Vue 3** with Composition API (`<script setup>` 구문)
- **TypeScript** 포괄적인 타입 정의를 가진 엄격 모드
- **Pinia** Composition API 패턴을 사용한 상태 관리
- **Vue Router 4** 클라이언트 사이드 라우팅
- **Vite** HMR 지원 빌드 도구
- **Vitest** jsdom 환경에서의 테스팅
- **Highlight.js** 구문 강조
- **Marked** 마크다운 처리
- **Lucide Vue Next** 일관된 아이콘 표현

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

### 핵심 스토어 패턴 (`jsonTreeStore`)
메인 Pinia 스토어는 다음을 관리합니다:
- JSON/JSONL 입력 텍스트 및 파싱 상태
- 캐싱 메커니즘을 가진 파싱된 트리 데이터 (10개 항목, 5분 만료)
- 오류 상태 및 로딩 표시기
- localStorage 자동 저장 기능
- 입력 타입 감지 (JSON vs JSONL)

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

### 테스트 전략
- **단위 테스트**: 스토어 로직, 유틸리티 함수, 검증기 (`src/__tests__/`)
- **컴포넌트 테스트**: Vue Test Utils를 사용한 Vue 컴포넌트 렌더링 및 상호작용
- **통합 테스트**: i18n 통합을 포함한 전체 애플리케이션 워크플로우 테스트
- **E2E 테스트**: 완전한 사용자 시나리오
- **설정**: `src/__tests__/setup.ts`에 구성된 전역 테스트 환경

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