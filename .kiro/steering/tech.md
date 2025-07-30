# 기술 스택

## 핵심 프레임워크
- **Vue 3**: `<script setup>` 구문을 사용한 Composition API
- **TypeScript**: 포괄적인 타입 검사가 활성화된 엄격 모드
- **Vite**: HMR을 지원하는 빌드 도구 및 개발 서버

## 상태 관리 및 라우팅
- **Pinia**: Composition API 패턴을 사용한 스토어 관리
- **Vue Router 4**: 클라이언트 사이드 라우팅

## UI 및 스타일링
- **CSS3**: CSS Variables, Grid, Flexbox를 사용한 모던 CSS
- **Lucide Vue Next**: 일관된 아이콘 표현을 위한 아이콘 라이브러리
- **반응형 디자인**: 768px, 1024px 브레이크포인트를 가진 모바일 우선 접근법

## 테스팅
- **Vitest**: 글로벌 설정이 활성화된 단위 및 통합 테스트
- **Vue Test Utils**: 컴포넌트 테스트 유틸리티
- **jsdom**: 테스트를 위한 DOM 환경
- **Coverage**: 내장 커버리지 리포팅

## 빌드 구성
- 모던 브라우저 지원을 위한 **ES2020** 타겟
- 최적의 트리 셰이킹을 위한 **번들러 모듈 해석**
- 사용하지 않는 변수 감지가 포함된 **엄격한 TypeScript**

## 주요 명령어

### 개발
```bash
npm run dev          # 개발 서버 시작 (localhost:5173)
npm install          # 의존성 설치
```

### 빌드
```bash
npm run build        # dist/로 프로덕션 빌드
npm run preview      # 프로덕션 빌드 로컬 미리보기
```

### 테스트
```bash
npm run test         # 워치 모드로 테스트 실행
npm run test:run     # 테스트 한 번 실행
npm run test:coverage # 커버리지 리포트와 함께 테스트 실행
```

## 성능 고려사항
- 대용량 데이터셋을 위한 지연 로딩 (50개 이상의 자식 노드)
- 파싱 결과 캐싱 (10개 항목, 5분 만료)
- 트리 노드를 위한 컴포넌트 메모이제이션
- 향후 구현을 위한 가상 스크롤링 준비