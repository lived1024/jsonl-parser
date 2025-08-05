# 설계 문서

## 개요

JSON Tree Viewer 애플리케이션에 다국어 지원을 추가하는 기능입니다. Vue 3 Composition API와 Pinia를 활용하여 영어와 한국어 간 실시간 언어 전환을 구현합니다. 언어 선택기는 헤더에 위치하며, 모든 UI 텍스트가 선택된 언어로 즉시 업데이트됩니다.

## 아키텍처

### 핵심 구성 요소

1. **i18n Store (Pinia)**: 언어 상태 관리 및 번역 로직
2. **Language Selector Component**: 헤더의 언어 선택 UI
3. **Translation Files**: 언어별 번역 데이터
4. **Composable**: 번역 기능을 위한 재사용 가능한 로직
5. **LocalStorage Integration**: 언어 설정 지속성

### 기술 스택 통합

- **Vue 3 Composition API**: `<script setup>` 구문으로 반응형 번역 시스템
- **Pinia**: 전역 언어 상태 관리
- **TypeScript**: 번역 키와 언어 타입 안전성
- **CSS Variables**: 언어별 텍스트 방향 및 스타일링 지원

## 컴포넌트 및 인터페이스

### 1. i18n Store (`src/stores/i18nStore.ts`)

```typescript
interface I18nState {
  currentLanguage: Language
  translations: Record<Language, TranslationMap>
}

interface TranslationMap {
  [key: string]: string | TranslationMap
}

enum Language {
  EN = 'en',
  KO = 'ko'
}
```

**주요 기능:**
- 현재 언어 상태 관리
- 번역 데이터 로드 및 캐싱
- localStorage와 동기화
- 언어 변경 시 반응형 업데이트

### 2. Language Selector Component (`src/components/ui/LanguageSelector.vue`)

헤더에 통합되는 드롭다운 형태의 언어 선택기:

```vue
<template>
  <div class="language-selector">
    <button class="language-button" @click="toggleDropdown">
      <span class="current-language">{{ currentLanguageLabel }}</span>
      <ChevronDownIcon />
    </button>
    <div v-if="isOpen" class="language-dropdown">
      <button 
        v-for="lang in availableLanguages" 
        :key="lang.code"
        @click="selectLanguage(lang.code)"
        :class="{ active: lang.code === currentLanguage }"
      >
        <span class="language-flag">{{ lang.flag }}</span>
        <span class="language-name">{{ lang.name }}</span>
      </button>
    </div>
  </div>
</template>
```

### 3. Translation Composable (`src/composables/useI18n.ts`)

```typescript
export function useI18n() {
  const i18nStore = useI18nStore()
  
  const t = (key: string, params?: Record<string, any>): string => {
    // 번역 키를 현재 언어의 텍스트로 변환
  }
  
  const changeLanguage = (language: Language): void => {
    // 언어 변경 및 localStorage 저장
  }
  
  return {
    t,
    currentLanguage: computed(() => i18nStore.currentLanguage),
    changeLanguage
  }
}
```

### 4. Translation Files

**영어 (`src/locales/en.ts`):**
```typescript
export default {
  header: {
    title: 'JSON Tree Viewer',
    subtitle: 'Parse & Visualize JSON Data'
  },
  input: {
    title: 'JSON Input',
    description: 'Paste your JSON or JSONL data',
    placeholder: 'Enter your JSON data here...'
  },
  // ... 기타 번역
}
```

**한국어 (`src/locales/ko.ts`):**
```typescript
export default {
  header: {
    title: 'JSON 트리 뷰어',
    subtitle: 'JSON 데이터 파싱 및 시각화'
  },
  input: {
    title: 'JSON 입력',
    description: 'JSON 또는 JSONL 데이터를 붙여넣으세요',
    placeholder: '여기에 JSON 데이터를 입력하세요...'
  },
  // ... 기타 번역
}
```

## 데이터 모델

### Language Enum
```typescript
enum Language {
  EN = 'en',
  KO = 'ko'
}
```

### Translation Structure
```typescript
interface TranslationMap {
  header: {
    title: string
    subtitle: string
  }
  input: {
    title: string
    description: string
    placeholder: string
    json: {
      name: string
      description: string
    }
    jsonl: {
      name: string
      description: string
    }
  }
  output: {
    title: string
    description: string
    stats: {
      nodes: string
      levels: string
      lines: string
    }
    controls: {
      expandAll: string
      collapseAll: string
      preserveBreaks: string
    }
    empty: {
      title: string
      description: string
    }
    error: {
      title: string
      suggestions: string[]
      actions: {
        retry: string
        clear: string
      }
    }
  }
  shortcuts: {
    title: string
    subtitle: string
    sections: {
      global: string
      editor: string
      navigation: string
      control: string
    }
    // ... 각 단축키 설명
  }
}
```

### LocalStorage Schema
```typescript
interface I18nSettings {
  language: Language
  lastUpdated: number
}
```

## 오류 처리

### 번역 키 누락 처리
- 번역 키가 없을 경우 키 이름을 그대로 표시
- 개발 모드에서 콘솔 경고 출력
- 폴백 언어(영어)로 자동 전환

### LocalStorage 오류 처리
- localStorage 접근 실패 시 메모리 상태로 폴백
- 잘못된 데이터 형식 시 기본값으로 초기화

### 언어 파일 로드 오류
- 동적 import 실패 시 기본 영어로 폴백
- 네트워크 오류 시 캐시된 번역 사용

## 테스팅 전략

### 단위 테스트
- i18n Store의 언어 변경 로직
- Translation composable의 번역 함수
- LocalStorage 동기화 기능

### 통합 테스트
- 언어 선택기와 Store 간 상호작용
- 컴포넌트별 번역 적용 확인
- 페이지 새로고침 시 언어 지속성

### E2E 테스트
- 전체 애플리케이션의 언어 전환 시나리오
- 모든 UI 요소의 번역 확인
- 브라우저 새로고침 후 언어 유지

## 성능 고려사항

### 번역 데이터 최적화
- 언어별 파일 분할로 초기 로드 크기 최소화
- 동적 import를 통한 지연 로딩
- 번역 데이터 메모이제이션

### 반응성 최적화
- computed를 활용한 번역 결과 캐싱
- 불필요한 재렌더링 방지
- 언어 변경 시 배치 업데이트

### 메모리 관리
- 사용하지 않는 언어 데이터 정리
- 번역 캐시 크기 제한
- WeakMap을 활용한 컴포넌트별 번역 캐시

## 접근성 고려사항

### 언어 선택기 접근성
- 적절한 ARIA 라벨 및 역할
- 키보드 네비게이션 지원
- 스크린 리더 호환성

### 다국어 콘텐츠 접근성
- `lang` 속성 동적 업데이트
- 텍스트 방향(LTR) 지원
- 폰트 및 타이포그래피 최적화

## 확장성 설계

### 추가 언어 지원
- 새로운 언어 추가를 위한 확장 가능한 구조
- 언어별 날짜/숫자 형식 지원 준비
- RTL 언어 지원을 위한 CSS 구조

### 고급 번역 기능
- 복수형 처리 (pluralization)
- 변수 치환 (interpolation)
- 컨텍스트별 번역 (contextual translations)

### 번역 관리 도구 통합
- 번역 키 자동 추출
- 번역 완성도 체크
- 번역 파일 검증