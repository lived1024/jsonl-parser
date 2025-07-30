# 프로젝트 구조

## 루트 디렉토리
```
├── src/                 # 소스 코드
├── dist/                # 빌드 출력 (생성됨)
├── node_modules/        # 의존성 (생성됨)
├── .kiro/               # Kiro AI 어시스턴트 설정
├── .vscode/             # VS Code 설정
├── index.html           # 진입점 HTML 파일
├── package.json         # 프로젝트 설정
├── vite.config.ts       # Vite 빌드 설정
├── tsconfig.json        # TypeScript 설정
└── README.md            # 프로젝트 문서
```

## 소스 코드 구성 (`src/`)

### 핵심 애플리케이션 파일
- `main.ts` - Pinia와 라우터 설정이 포함된 애플리케이션 진입점
- `App.vue` - 루트 컴포넌트 (라우터 아웃렛만 포함)

### 기능 기반 구조
```
src/
├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── common/         # 기능 간 공유 컴포넌트
│   ├── feature/        # 기능별 전용 컴포넌트
│   ├── ui/             # 기본 UI 구성 요소
│   ├── icons/          # 커스텀 아이콘 컴포넌트
│   └── transitions/    # 애니메이션/전환 컴포넌트
├── pages/              # 라우트 레벨 페이지 컴포넌트
├── layouts/            # 레이아웃 래퍼 컴포넌트
├── stores/             # Pinia 상태 관리
├── router/             # Vue Router 설정
├── composables/        # 재사용 가능한 컴포지션 함수
├── utils/              # 순수 유틸리티 함수
├── types/              # TypeScript 타입 정의
├── styles/             # 전역 CSS 파일
├── assets/             # 정적 자산 (이미지, 폰트)
└── __tests__/          # 테스트 파일 및 설정
```

## 명명 규칙

### 파일 및 디렉토리
- **컴포넌트**: PascalCase (예: `TreeNode.vue`, `JsonEditor.vue`)
- **페이지**: "Page" 접미사가 있는 PascalCase (예: `HomePage.vue`)
- **스토어**: "Store" 접미사가 있는 camelCase (예: `jsonTreeStore.ts`)
- **타입**: 파일은 camelCase, 인터페이스/열거형은 PascalCase
- **유틸리티**: camelCase (예: `parseJson.ts`, `formatError.ts`)

### 코드 규칙
- **인터페이스**: 설명적인 이름의 PascalCase (예: `ParsedNode`, `JsonTreeState`)
- **열거형**: PascalCase (예: `DataType`, `InputType`)
- **상수**: UPPER_SNAKE_CASE (예: `LOCAL_STORAGE_KEYS`, `DEFAULT_CONFIG`)
- **함수**: 동사-명사 패턴의 camelCase (예: `parseJsonData`, `formatErrorMessage`)

## 컴포넌트 아키텍처

### 컴포넌트 카테고리
1. **UI 컴포넌트** (`components/ui/`) - 기본 구성 요소 (버튼, 입력, 패널)
2. **공통 컴포넌트** (`components/common/`) - 여러 기능에서 공유
3. **기능 컴포넌트** (`components/feature/`) - JSON 트리 기능 전용
4. **페이지 컴포넌트** (`pages/`) - 라우트 레벨 컨테이너

### 상태 관리 패턴
- **Pinia 스토어**: 전역 상태 (파싱 결과, UI 상태)
- **로컬 컴포넌트 상태**: UI 전용 관심사
- **컴포저블**: 재사용 가능한 상태 로직

## 임포트 규칙
- 로컬 파일에 대한 상대 임포트: `./`, `../`
- 주요 경계를 넘을 때 `src/` 루트에서 절대 임포트
- 임포트 그룹화: Vue/프레임워크 먼저, 라이브러리, 로컬 파일 순