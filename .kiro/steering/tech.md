# 기술 스택 및 빌드 시스템

## 핵심 프레임워크
- **Vue 3** - `<script setup>` 구문을 사용한 Composition API
- **TypeScript** - 포괄적인 타입 검사가 활성화된 엄격 모드
- **Vite** - HMR을 지원하는 빌드 도구 및 개발 서버

## 상태 관리 및 라우팅
- **Pinia** - Composition API 패턴을 사용한 상태 관리
- **Vue Router 4** - 클라이언트 사이드 라우팅

## UI 및 스타일링
- **모던 CSS3** - CSS Variables, Grid, Flexbox 사용
- **Lucide Vue Next** - 일관된 아이콘 표현을 위한 아이콘 라이브러리
- **반응형 디자인** - 모바일 우선 접근법 (768px, 1024px 브레이크포인트)

## 테스팅 프레임워크
- **Vitest** - 글로벌 설정이 활성화된 단위 및 통합 테스트
- **Vue Test Utils** - 컴포넌트 테스트 유틸리티
- **jsdom** - 테스트를 위한 DOM 환경
- **커버리지 리포팅** - 내장 커버리지 보고서

## 빌드 구성
- **ES2020** 타겟 - 모던 브라우저 지원
- **번들러 모듈 해석** - 최적의 트리 셰이킹
- **엄격한 TypeScript** - 사용하지 않는 변수 감지 포함

## 주요 명령어

### 개발
```bash
# 의존성 설치
npm install

# 개발 서버 실행 (localhost:5173)
npm run dev
```

### 빌드 및 배포
```bash
# dist/로 프로덕션 빌드
npm run build

# 프로덕션 빌드 로컬 미리보기
npm run preview
```

### 테스트
```bash
# 워치 모드로 테스트 실행
npm run test

# 테스트 한 번 실행
npm run test:run

# 커버리지 리포트와 함께 테스트 실행
npm run test:coverage
```

## 주요 의존성
- **Vue 3.4+** - 핵심 프레임워크
- **Pinia 2.1+** - 상태 관리
- **Vue Router 4.2+** - 라우팅
- **TypeScript 5.0+** - 타입 시스템
- **Highlight.js** - 구문 강조
- **Marked** - 마크다운 처리

## 개발 가이드라인
- `<script setup>`과 함께 Composition API 사용
- 엄격한 TypeScript 타이핑 구현
- 컴포넌트 기반 아키텍처 준수
- 공유 상태를 위한 Pinia 스토어 활용
- 포괄적인 오류 처리 구현
- 캐싱 및 지연 로딩을 통한 성능 최적화