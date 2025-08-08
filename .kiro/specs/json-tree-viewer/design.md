# 설계 문서

## 개요

JSONL Parser는 Vue 3 Composition API와 Pinia를 사용하여 구축되는 단일 페이지 애플리케이션입니다. 사용자가 JSON 또는 JSONL 텍스트를 입력하면 실시간으로 파싱하여 상호작용 가능한 트리 구조로 변환합니다.

## 아키텍처

### 기술 스택
- **프론트엔드**: Vue 3 (Composition API)
- **상태 관리**: Pinia
- **스타일링**: Tailwind CSS (유틸리티 우선 CSS 프레임워크)
- **빌드 도구**: Parcel (제로 설정 번들러)
- **저장소**: LocalStorage

### 컴포넌트 구조
```
App.vue
├── InputPanel.vue (왼쪽 패널)
│   ├── TextEditor.vue
│   └── StatusIndicator.vue
└── OutputPanel.vue (오른쪽 패널)
    └── TreeNode.vue (재귀 컴포넌트)
```

## 컴포넌트 및 인터페이스

### 1. App.vue (루트 컴포넌트)
- 전체 레이아웃 관리 (좌우 분할)
- 입력값 파싱을 위한 버튼
- JSON 모드 및 JSONL 모드 설정 버튼
- 반응형 디자인 구현
- 글로벌 스타일 정의

### 2. InputPanel.vue
- 텍스트 입력 영역 관리
- 파일 형식 선택 (JSON/JSONL)
- 상태 표시 (유효성 검사 결과)

### 3. TextEditor.vue
- 텍스트 입력/편집 기능
- 실시간 입력 감지
- LocalStorage 자동 저장

### 4. StatusIndicator.vue
- 파싱 상태 표시 (성공/오류)
- 오류 메시지 및 위치 정보
- 통계 정보 (노드 수, 깊이 등)

### 5. OutputPanel.vue
- 트리 구조 렌더링 컨테이너
- 스크롤 관리
- 빈 상태 처리

### 6. TreeNode.vue (재귀 컴포넌트)
- 개별 노드 렌더링
- 접기/펼치기 기능
- 데이터 타입별 스타일링

## 데이터 모델

### Pinia Store 구조

```typescript
interface JsonTreeStore {
  // 상태
  inputText: string
  inputType: 'json' | 'jsonl'
  parsedData: ParsedNode[]
  parseError: ParseError | null
  isLoading: boolean
  
  // 액션
  setInputText(text: string): void
  setInputType(type: 'json' | 'jsonl'): void
  parseInput(): void
  toggleNode(nodeId: string): void
  saveToLocalStorage(): void
  loadFromLocalStorage(): void
}

interface ParsedNode {
  id: string
  key?: string
  value: any
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'
  children?: ParsedNode[]
  isExpanded: boolean
  depth: number
}

interface ParseError {
  message: string
  line?: number
  column?: number
  position?: number
}
```

### 로컬 스토리지 스키마
```typescript
interface LocalStorageData {
  inputText: string
  inputType: 'json' | 'jsonl'
  timestamp: number
}
```

## 핵심 알고리즘

### JSON 파싱 및 트리 변환
```typescript
function parseJsonToTree(jsonText: string, type: 'json' | 'jsonl'): ParsedNode[] {
  if (type === 'json') {
    return [convertToNode(JSON.parse(jsonText), '', 0)]
  } else {
    return jsonText
      .split('\n')
      .filter(line => line.trim())
      .map((line, index) => convertToNode(JSON.parse(line), `Line ${index + 1}`, 0))
  }
}

function convertToNode(data: any, key: string, depth: number): ParsedNode {
  const nodeId = generateUniqueId()
  const type = getDataType(data)
  
  const node: ParsedNode = {
    id: nodeId,
    key,
    value: data,
    type,
    isExpanded: true,
    depth
  }
  
  if (type === 'object' || type === 'array') {
    node.children = Object.entries(data).map(([k, v]) => 
      convertToNode(v, k, depth + 1)
    )
  }
  
  return node
}
```

## 오류 처리

### 파싱 오류 처리
- JSON.parse() 예외 캐치
- 오류 위치 정보 추출
- 사용자 친화적 오류 메시지 제공

### JSONL 오류 처리
- 라인별 개별 파싱
- 오류가 있는 라인 식별
- 부분적 성공 처리 (유효한 라인만 표시)

### 입력 검증
- 빈 입력 처리
- 너무 큰 데이터 경고
- 메모리 사용량 모니터링

## 성능 최적화

### 가상 스크롤링
- 큰 트리 구조에 대한 성능 최적화
- 보이는 노드만 렌더링
- 스크롤 위치 기반 동적 로딩

### 지연 로딩
- 깊은 중첩 구조의 점진적 로딩
- 사용자 요청 시에만 하위 노드 렌더링

### 메모이제이션
- 파싱 결과 캐싱
- 동일한 입력에 대한 재계산 방지

## 사용자 인터페이스 설계

### 레이아웃
- **데스크톱**: 50:50 좌우 분할
- **태블릿**: 40:60 좌우 분할
- **모바일**: 상하 분할 (입력 30%, 출력 70%)

### 색상 스키마
- **배경**: #f8f9fa
- **패널**: #ffffff
- **경계선**: #e9ecef
- **텍스트**: #212529
- **강조**: #007bff
- **오류**: #dc3545
- **성공**: #28a745

### 타입별 색상 구분
- **객체**: #6f42c1 (보라)
- **배열**: #fd7e14 (주황)
- **문자열**: #28a745 (초록)
- **숫자**: #007bff (파랑)
- **불린**: #ffc107 (노랑)
- **null**: #6c757d (회색)

## 테스트 전략

### 단위 테스트
- 파싱 함수 테스트
- 트리 변환 로직 테스트
- 상태 관리 테스트

### 컴포넌트 테스트
- 각 Vue 컴포넌트의 렌더링 테스트
- 사용자 상호작용 테스트
- Props 및 이벤트 테스트

### 통합 테스트
- 전체 워크플로우 테스트
- LocalStorage 연동 테스트
- 오류 시나리오 테스트

### E2E 테스트
- 실제 사용자 시나리오 테스트
- 다양한 JSON 형식 테스트
- 반응형 디자인 테스트

## 접근성 고려사항

### 키보드 네비게이션
- Tab 키를 통한 포커스 이동
- Enter/Space 키를 통한 노드 토글
- 화살표 키를 통한 트리 탐색

### 스크린 리더 지원
- 적절한 ARIA 라벨
- 트리 구조에 대한 의미적 마크업
- 상태 변경 알림

### 시각적 접근성
- 충분한 색상 대비
- 색상에만 의존하지 않는 정보 전달
- 확대/축소 지원