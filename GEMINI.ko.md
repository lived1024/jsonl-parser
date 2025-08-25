# Gemini 프로젝트 컨텍스트: JSONL 파서

이 문서는 Gemini 에이전트를 위한 JSONL 파서 프로젝트의 핵심 컨텍스트를 제공합니다.

## 프로젝트 개요

이 프로젝트는 JSON(JavaScript Object Notation) 및 JSONL(JSON Lines) 데이터를 파싱하고 시각화하기 위해 설계된 웹 기반 유틸리티입니다. 데이터의 상호작용 가능한 트리 뷰를 제공하여 사용자가 복잡한 JSON 구조를 더 쉽게 검사하고 이해할 수 있도록 돕습니다. 애플리케이션은 단일 페이지 애플리케이션(SPA)으로 구축되었습니다.

최근 이 프로젝트는 단순한 도구를 넘어 JSON 관련 작업을 하는 개발자들을 위한 포괄적인 콘텐츠 허브로 확장되었습니다. 이제 교육용 튜토리얼, 추가적인 데이터 조작 도구, 참조 가이드, 샘플 데이터 라이브러리를 포함합니다. 수익화는 구글 애드센스를 통해 구현됩니다.

애플리케이션은 영어와 한국어를 지원하는 다국어(i18n) 기능을 갖추고 있습니다.

**현재 상태:** 핵심 파서와 다국어 기능은 완성되었습니다. 콘텐츠 확장 및 수익화 기능은 부분적으로 구현되었습니다. 남은 주요 작업으로는 분석 시스템 구현, 최종 성능 최적화, 종합적인 테스트, SEO 강화 등이 있습니다.

## 기술 스택

- **프레임워크**: Vue 3 (Composition API 및 `<script setup>` 사용)
- **빌드 도구**: Vite
- **상태 관리**: Pinia
- **언어**: TypeScript
- **라우팅**: Vue Router
- **테스팅**: Vitest와 Vue Test Utils
- **스타일링**: 표준 CSS, Vue 컴포넌트 내 범위 지정 스타일 사용

## 프로젝트 구조

- `src/`: 모든 애플리케이션 소스 코드를 포함합니다.
  - `src/components/`: 재사용 가능한 Vue 컴포넌트.
    - `ui/`: 범용 UI 요소 (예: `LanguageSelector.vue`).
    - `feature/`: 핵심 기능을 구현하는 컴포넌트 (예: `InputPanel.vue`, `OutputPanel.vue`).
    - `common/`: 확장된 콘텐츠 사이트를 위한 컴포넌트 (예: `AdSenseContainer.vue`, `MainNavigation.vue`).
  - `src/composables/`: Vue Composition API 함수 (예: `useI18n.ts`).
  - `src/stores/`: Pinia 상태 관리 스토어 (예: `jsonTreeStore.ts`, `i18nStore.ts`).
  - `src/locales/`: 다국어 지원을 위한 번역 파일.
  - `src/router/`: 콘텐츠 섹션을 위한 라우트를 포함한 Vue Router 설정.
  - `src/types/`: TypeScript 타입 정의.
  - `src/content/`: 튜토리얼, 가이드 등을 위한 정적 콘텐츠 (마크다운 파일).
  - `src/__tests__/`: Vitest로 작성된 테스트 파일.
- `package.json`: 프로젝트 의존성 및 스크립트 정의.
- `vite.config.ts`: Vite 빌드 설정.
- `tsconfig.json`: TypeScript 컴파일러 옵션.

## 개발 및 테스트

- **패키지 매니저**: `npm`을 사용하여 의존성을 관리합니다.
- **로컬에서 실행**: `npm run dev`를 사용하여 Vite 개발 서버를 시작합니다.
- **빌드**: `npm run build`를 사용하여 프로덕션 빌드를 생성합니다.
- **테스트**: `npm run test`를 사용하여 Vitest로 테스트 스위트를 실행합니다. 테스트 파일은 `src` 디렉토리 내의 `__tests__` 하위 디렉토리에 위치합니다.

## 다국어 지원 (i18n)

애플리케이션은 커스텀 i18n 구현을 통해 여러 언어(영어, 한국어)를 지원합니다.

- **상태 관리**: `src/stores/i18nStore.ts` (Pinia 스토어)가 현재 언어를 관리하고 번역을 로드합니다.
- **컴포저블**: `src/composables/useI18n.ts`가 컴포넌트에서 텍스트를 번역하기 위한 `t()` 함수를 제공합니다.
- **번역 파일**: 언어 파일은 `src/locales/`에 위치합니다.
- **UI**: `src/components/ui/LanguageSelector.vue` 컴포넌트를 통해 사용자가 언어를 전환할 수 있습니다.
- **지속성**: 선택된 언어는 세션 간 유지를 위해 `localStorage`에 저장됩니다.
