/**
 * Korean translations
 */

export default {
  header: {
    title: 'JSONL 파서',
    subtitle: 'JSON 데이터 파싱 및 시각화'
  },
  input: {
    title: 'JSON 입력',
    description: 'JSON 또는 JSONL 데이터를 붙여넣으세요',
    placeholder: '여기에 JSON 데이터를 입력하세요...',
    json: {
      name: 'JSON',
      description: '단일 객체'
    },
    jsonl: {
      name: 'JSONL',
      description: '여러 줄'
    }
  },
  output: {
    title: 'JSON 트리',
    description: '대화형 트리 시각화',
    stats: {
      nodes: '노드',
      levels: '레벨',
      lines: '줄'
    },
    controls: {
      expandAll: '모두 펼치기',
      collapseAll: '모두 접기',
      preserveBreaks: '줄바꿈 유지',
      byLevel: '레벨별:'
    },
    empty: {
      title: 'JSON을 시각화할 준비가 되었습니다',
      description: '입력 패널에 JSON 또는 JSONL 데이터를 입력하면 여기에 아름다운 트리 구조가 표시됩니다',
      tips: {
        focus: '{{key}}를 사용하여 입력 영역에 포커스',
        parse: '{{key}}를 사용하여 파싱'
      }
    },
    error: {
      title: 'JSON 파싱 오류',
      detailsHeader: '오류 세부사항',
      location: {
        line: '{{line}}번째 줄',
        column: '{{column}}번째 열',
        position: '{{position}}번째 위치'
      },
      suggestions: {
        title: '일반적인 해결책:',
        items: [
          '누락되거나 추가된 쉼표 확인',
          '모든 문자열이 올바르게 인용되었는지 확인',
          '대괄호와 중괄호 일치 확인',
          '객체/배열의 후행 쉼표 제거'
        ]
      },
      actions: {
        retry: '다시 시도',
        clear: '입력 지우기'
      },
      partial: {
        title: '부분 파싱 성공'
      },
      jsonlDetected: {
        title: 'JSONL 형식이 감지되었습니다',
        description: '입력된 데이터가 JSONL(JSON Lines) 형식인 것 같습니다. JSON 타입을 JSONL로 변경하시겠습니까?',
        switchButton: 'JSONL로 변경'
      }
    }
  },
  shortcuts: {
    title: '키보드 단축키',
    subtitle: '작업 흐름을 빠르게 하세요',
    close: '닫기',
    sections: {
      global: '전역',
      editor: '텍스트 편집기',
      navigation: '트리 탐색',
      control: '트리 제어'
    },
    global: {
      focusInput: '입력 영역에 포커스',
      parseJson: 'JSON 파싱',
      clearFocus: '포커스 해제'
    },
    editor: {
      addIndent: '들여쓰기 추가',
      removeIndent: '들여쓰기 제거',
      formatJson: 'JSON 포맷'
    },
    navigation: {
      toggleNode: '노드 토글',
      expandNode: '노드 펼치기',
      collapseNode: '노드 접기'
    },
    control: {
      expandAll: '모든 노드 펼치기',
      collapseAll: '모든 노드 접기',
      expandToLevel: '레벨까지 펼치기'
    }
  },
  status: {
    loading: 'JSON 파싱 중...',
    error: '파싱 오류',
    warning: '부분 성공',
    success: '파싱 성공',
    idle: '파싱 준비',
    idleDescription: 'JSON 또는 JSONL 데이터를 입력하여 시각화하세요',
    location: {
      line: '{{line}}번째 줄',
      column: '{{column}}번째 열'
    }
  },
  editor: {
    placeholder: '여기에 JSON 데이터를 입력하세요...',
    placeholders: {
      json: `JSON 데이터를 입력하세요...

예시:
{
  "name": "홍길동",
  "age": 30,
  "hobbies": ["독서", "영화감상"]
}`,
      jsonl: `JSONL 데이터를 입력하세요 (한 줄에 하나의 JSON)...

예시:
{"name": "홍길동", "age": 30}
{"name": "김철수", "age": 25}
{"name": "이영희", "age": 28}`
    },
    descriptions: {
      json: '단일 JSON 객체나 배열을 입력하세요. 예: {"name": "홍길동", "age": 30}',
      jsonl: '한 줄에 하나씩 JSON 객체를 입력하세요. 각 줄은 유효한 JSON이어야 합니다.'
    },
    info: {
      chars: '{{count}}자',
      lines: '{{count}}줄'
    },
    actions: {
      format: '포맷',
      clear: '지우기',
      formatTitle: 'JSON 포맷 (Alt+Shift+F)',
      clearTitle: '입력 지우기 (Alt+I)'
    }
  },
  validation: {
    jsonlRequired: 'JSONL 형식에는 최소 한 줄의 JSON 데이터가 필요합니다.',
    inputTooLarge: '입력 크기가 너무 큽니다. 최대 {{maxSize}}MB까지 지원됩니다.',
    memoryWarning: '입력 데이터가 너무 커서 메모리 부족이 예상됩니다. 더 작은 데이터를 사용해주세요.',
    jsonlTooManyLines: 'JSONL 형식에서는 최대 10,000줄까지 지원됩니다.',
    tooManyErrors: '너무 많은 오류가 발생했습니다. 처음 10개 오류만 표시됩니다.',
    partialSuccess: '{{errorCount}}개 줄에서 오류가 발생했습니다. {{successCount}}개 줄이 성공적으로 파싱되었습니다.'
  },
  accessibility: {
    mainArea: 'JSONL 파서 메인 영역',
    inputPanel: 'JSON 입력 패널',
    outputPanel: 'JSON 트리 출력 패널',
    keyboardHelp: '키보드 단축키 도움말',
    expandAllNodes: '모든 노드 펼치기',
    collapseAllNodes: '모든 노드 접기',
    toggleLineBreaks: '줄바꿈 유지 토글',
    expandToLevel: '{{level}} 레벨까지 펼치기',
    treeStructure: 'JSON 트리 구조',
    languageSelector: {
      label: '언어 선택기',
      currentLanguage: '현재 언어: {{language}}'
    },
    panelResizer: '패널 크기 조정',
    jsonInput: 'JSON 데이터 입력',
    errorLocation: '오류 위치 정보'
  },
  help: {
    title: '도움말',
    close: '닫기',
    openHelp: '도움말 열기',
    whatIs: {
      title: 'JSONL 파서란?',
      description: 'JSON과 JSONL 데이터를 대화형 트리 구조로 시각화하는 웹 애플리케이션입니다. 복잡한 JSON 데이터를 쉽게 탐색하고 이해할 수 있도록 도와줍니다.'
    },
    howToUse: {
      title: '사용 방법',
      step1: '왼쪽 패널에 JSON 또는 JSONL 데이터를 입력하세요',
      step2: '데이터 형식(JSON/JSONL)을 선택하세요',
      step3: '오른쪽에서 자동으로 생성되는 트리 구조를 확인하세요',
      step4: '노드를 클릭하여 펼치거나 접을 수 있습니다'
    },
    features: {
      title: '주요 기능',
      multiFormat: {
        title: '다중 형식 지원',
        description: 'JSON과 JSONL 형식을 모두 지원합니다'
      },
      treeView: {
        title: '대화형 트리 뷰',
        description: '데이터 타입별 색상 구분과 확장/축소 기능'
      },
      realtime: {
        title: '실시간 파싱',
        description: '입력과 동시에 자동으로 파싱하고 오류를 표시'
      },
      responsive: {
        title: '반응형 디자인',
        description: '모든 기기에서 최적화된 사용자 경험'
      }
    },
    shortcuts: {
      title: '키보드 단축키',
      focusInput: '입력 영역에 포커스',
      parseJson: 'JSON 파싱',
      expandAll: '모든 노드 펼치기',
      collapseAll: '모든 노드 접기',
      formatJson: 'JSON 포맷',
      help: '도움말 열기'
    },
    examples: {
      title: '예제',
      complex: '복합 구조',
      tryIt: '시도해보기'
    }
  },
  meta: {
    title: 'JSONL 파서',
    description: '대화형 트리 구조로 JSON 데이터를 파싱하고 시각화하세요'
  }
} as const