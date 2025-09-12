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
    },
    dragDrop: {
      title: 'JSON 파일 드롭',
      description: 'JSON 또는 JSONL 파일을 여기에 드래그하세요'
    },
    loading: {
      title: '파일 처리 중...',
      description: '파일을 읽고 파싱하는 중입니다'
    },
    errors: {
      fileReadFailed: '파일을 읽을 수 없습니다',
      fileReadAsTextFailed: '파일을 텍스트로 읽는데 실패했습니다',
      unsupportedFileType: 'JSON과 JSONL 파일만 지원됩니다'
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
  errors: {
    parsing: {
      jsonSyntax: 'JSON 구문 오류: {{message}}',
      jsonlLine: '{{line}}번째 줄: {{message}}',
      unknownError: '알 수 없는 파싱 오류가 발생했습니다',
      invalidJson: '유효하지 않은 JSON입니다'
    },
    validation: {
      jsonlRequired: 'JSONL 형식에는 최소 한 줄의 JSON 데이터가 필요합니다',
      inputTooLarge: '입력 크기가 너무 큽니다. 최대 {{maxSize}}MB까지 지원됩니다',
      memoryWarning: '입력 데이터가 너무 커서 메모리 부족이 예상됩니다. 더 작은 데이터를 사용해주세요',
      jsonlTooManyLines: 'JSONL 형식에서는 최대 {{maxLines}}줄까지 지원됩니다',
      tooManyErrors: '너무 많은 오류가 발생했습니다. 처음 {{maxErrors}}개 오류만 표시됩니다',
      partialSuccess: '{{errorCount}}개 줄에서 오류가 발생했습니다. {{successCount}}개 줄이 성공적으로 파싱되었습니다'
    },
    jsonl: {
      linePrefix: '{{line}}번째 줄',
      detected: 'JSONL 형식이 감지되었습니다'
    }
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
    skipToMainContent: '메인 콘텐츠로 건너뛰기',
    languageSelector: {
      label: '언어 선택기',
      currentLanguage: '현재 언어: {{language}}'
    },
    panelResizer: '패널 크기 조정',
    jsonInput: 'JSON 데이터 입력',
    errorLocation: '오류 위치 정보',
    screenReader: {
      nodeExpanded: '노드가 펼쳐졌습니다',
      nodeCollapsed: '노드가 접혀졌습니다',
      allNodesExpanded: '모든 노드가 펼쳐졌습니다',
      allNodesCollapsed: '모든 노드가 접혀졌습니다',
      parsingStarted: 'JSON 파싱을 시작합니다',
      parsingCompleted: 'JSON 파싱이 완료되었습니다',
      parsingFailed: 'JSON 파싱에 실패했습니다',
      loadingMore: '더 많은 항목을 로딩 중입니다',
      loadingCompleted: '로딩이 완료되었습니다'
    },
    keyboardShortcuts: {
      title: '키보드 단축키',
      global: '전역 단축키',
      tree: '트리 네비게이션',
      treeNavigation: '트리 내 네비게이션',
      help: '도움말 표시',
      close: '닫기'
    },
    breadcrumbNavigation: '브레드크럼 네비게이션'
  },
  help: {
    title: '도움말',
    close: '닫기',
    openHelp: '도움말 열기',
    tabs: {
      overview: '개요',
      shortcuts: '단축키',
      examples: '예제',
      datatypes: '데이터 타입',
      faq: 'FAQ',
      performance: '성능',
      troubleshooting: '문제 해결'
    },
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
      },
      lineBreaks: {
        title: '줄바꿈 유지',
        description: '문자열 내 줄바꿈을 원본 그대로 표시합니다'
      },
      expandLevels: {
        title: '레벨별 확장',
        description: '원하는 깊이까지 트리를 자동으로 확장할 수 있습니다'
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
  onboarding: {
    close: '닫기',
    skip: '건너뛰기',
    next: '다음',
    previous: '이전',
    finish: '완료',
    steps: {
      welcome: {
        title: 'JSONL 파서에 오신 것을 환영합니다!',
        description: 'JSON과 JSONL 데이터를 아름다운 트리 구조로 시각화하는 도구입니다.',
        tip1: 'F1 키를 눌러 언제든지 도움말을 볼 수 있습니다',
        tip2: '키보드 단축키를 활용하면 더 빠르게 작업할 수 있습니다'
      },
      inputPanel: {
        title: '입력 패널',
        description: '여기에 JSON 또는 JSONL 데이터를 입력하세요. 실시간으로 파싱됩니다.',
        tip1: 'Alt+I를 눌러 빠르게 입력 영역에 포커스할 수 있습니다',
        tip2: '파일을 드래그 앤 드롭으로 업로드할 수도 있습니다'
      },
      formatSelector: {
        title: '형식 선택기',
        description: 'JSON과 JSONL 형식을 선택할 수 있습니다. 자동 감지도 지원합니다.'
      },
      outputPanel: {
        title: '출력 패널',
        description: '파싱된 데이터가 대화형 트리로 표시됩니다. 노드를 클릭하여 탐색하세요.',
        tip1: '노드를 클릭하거나 Enter/Space 키로 확장/축소할 수 있습니다',
        tip2: '데이터 타입별로 색상이 구분되어 표시됩니다'
      },
      shortcuts: {
        title: '키보드 단축키',
        description: '이 버튼을 클릭하면 사용 가능한 모든 키보드 단축키를 볼 수 있습니다.',
        tip1: 'Alt+H를 눌러 단축키 패널을 열 수 있습니다',
        tip2: '단축키를 익히면 작업 효율이 크게 향상됩니다'
      }
    }
  },
  tooltip: {
    shortcut: '단축키',
    tips: '팁'
  },
  faq: {
    title: '자주 묻는 질문',
    subtitle: '일반적인 질문과 답변을 확인하세요',
    searchPlaceholder: 'FAQ 검색...',
    clearSearch: '검색 지우기',
    noResults: '검색 결과가 없습니다',
    noResultsDescription: '다른 키워드로 검색하거나 필터를 초기화해보세요.',
    clearFilters: '필터 초기화',
    relatedLinks: '관련 링크',
    example: '예제',
    categories: {
      all: '전체',
      basics: '기본 사용법',
      parsing: '파싱',
      navigation: '탐색',
      performance: '성능',
      troubleshooting: '문제 해결'
    },
    items: {
      whatIsJsonl: {
        question: 'JSONL이 무엇인가요?',
        answer: 'JSONL(JSON Lines)은 각 줄에 하나의 JSON 객체가 있는 텍스트 형식입니다. 대용량 데이터 스트리밍과 로그 파일에 자주 사용됩니다.'
      },
      jsonVsJsonl: {
        question: 'JSON과 JSONL의 차이점은 무엇인가요?',
        answer: 'JSON은 단일 구조화된 데이터를 나타내고, JSONL은 여러 JSON 객체를 줄바꿈으로 구분하여 나열합니다. JSONL은 스트리밍 데이터 처리에 더 적합합니다.'
      },
      largeFiles: {
        question: '큰 파일을 처리할 수 있나요?',
        answer: '최대 10MB까지 지원하며, 대용량 데이터는 지연 로딩으로 성능을 최적화합니다. 50개 이상의 자식 노드가 있으면 점진적으로 로딩됩니다.'
      },
      parsingErrors: {
        question: '파싱 오류가 발생하면 어떻게 하나요?',
        answer: '오류 메시지에서 정확한 위치와 원인을 확인할 수 있습니다. 일반적인 원인은 누락된 쉼표, 잘못된 따옴표, 괄호 불일치입니다.'
      },
      keyboardShortcuts: {
        question: '키보드 단축키가 있나요?',
        answer: '네, 다양한 단축키를 지원합니다. Alt+H로 단축키 목록을 보거나, F1로 도움말을 열 수 있습니다.'
      },
      dataPersistence: {
        question: '입력한 데이터가 저장되나요?',
        answer: '입력 데이터는 브라우저의 로컬 스토리지에 자동 저장되어 페이지를 새로고침해도 유지됩니다. 서버로는 전송되지 않습니다.'
      }
    }
  },
  dataTypeGuide: {
    title: 'JSON 데이터 타입 가이드',
    subtitle: 'JSON에서 사용할 수 있는 모든 데이터 타입과 사용법을 알아보세요',
    examples: '예제',
    rules: '규칙',
    tips: '팁',
    commonErrors: '일반적인 오류',
    wrong: '잘못된 예',
    correct: '올바른 예',
    types: {
      string: {
        name: '문자열 (String)',
        description: '텍스트 데이터를 나타냅니다. 반드시 큰따옴표로 감싸야 합니다.',
        examples: {
          basic: '기본 문자열',
          empty: '빈 문자열',
          special: '특수 문자',
          unicode: '유니코드'
        },
        rules: [
          '반드시 큰따옴표(")로 감싸야 합니다',
          '특수 문자는 백슬래시(\\)로 이스케이프해야 합니다',
          '유니코드 문자를 지원합니다'
        ],
        tips: [
          '여러 줄 문자열은 \\n을 사용하세요',
          '작은따옴표(\')는 JSON에서 유효하지 않습니다'
        ]
      },
      number: {
        name: '숫자 (Number)',
        description: '정수와 소수를 나타냅니다. 따옴표 없이 작성합니다.',
        examples: {
          integer: '정수',
          decimal: '소수',
          negative: '음수',
          scientific: '과학적 표기법'
        },
        rules: [
          '따옴표로 감싸지 않습니다',
          '소수점은 마침표(.)를 사용합니다',
          '과학적 표기법(e, E)을 지원합니다'
        ],
        tips: [
          '매우 큰 숫자는 정밀도 손실이 있을 수 있습니다',
          'Infinity와 NaN은 JSON에서 유효하지 않습니다'
        ]
      },
      boolean: {
        name: '불린 (Boolean)',
        description: '참(true) 또는 거짓(false) 값을 나타냅니다.',
        examples: {
          true: '참',
          false: '거짓'
        },
        rules: [
          '소문자로만 작성합니다 (true, false)',
          '따옴표로 감싸지 않습니다'
        ],
        tips: [
          '조건부 로직에 사용됩니다',
          '플래그나 상태를 나타낼 때 유용합니다'
        ]
      },
      null: {
        name: '널 (Null)',
        description: '값이 없음을 나타냅니다.',
        examples: {
          basic: '기본 null'
        },
        rules: [
          '소문자로만 작성합니다 (null)',
          '따옴표로 감싸지 않습니다'
        ],
        tips: [
          '누락된 값이나 알 수 없는 값을 나타냅니다',
          'undefined는 JSON에서 유효하지 않습니다'
        ]
      },
      array: {
        name: '배열 (Array)',
        description: '순서가 있는 값들의 목록입니다. 대괄호로 감쌉니다.',
        examples: {
          numbers: '숫자 배열',
          strings: '문자열 배열',
          mixed: '혼합 타입',
          empty: '빈 배열'
        },
        rules: [
          '대괄호 []로 감쌉니다',
          '요소들은 쉼표로 구분합니다',
          '마지막 요소 뒤에는 쉼표를 붙이지 않습니다'
        ],
        tips: [
          '요소의 순서가 중요합니다',
          '중첩된 배열도 가능합니다'
        ]
      },
      object: {
        name: '객체 (Object)',
        description: '키-값 쌍의 집합입니다. 중괄호로 감쌉니다.',
        examples: {
          simple: '간단한 객체',
          nested: '중첩된 객체',
          empty: '빈 객체'
        },
        rules: [
          '중괄호 {}로 감쌉니다',
          '키는 반드시 문자열이어야 합니다',
          '키와 값은 콜론(:)으로 구분합니다',
          '키-값 쌍들은 쉼표로 구분합니다'
        ],
        tips: [
          '키의 순서는 보장되지 않습니다',
          '깊은 중첩도 가능합니다'
        ]
      }
    },
    nesting: {
      title: '중첩 구조',
      description: 'JSON은 객체와 배열을 중첩하여 복잡한 데이터 구조를 만들 수 있습니다.'
    },
    validation: {
      title: '유효성 검사 팁',
      tips: [
        '모든 괄호와 중괄호가 올바르게 닫혔는지 확인하세요',
        '문자열 키와 값에 따옴표가 있는지 확인하세요',
        '불필요한 쉼표가 없는지 확인하세요',
        '데이터 타입이 올바른지 확인하세요',
        '전체 구조가 유효한 JSON인지 확인하세요'
      ]
    }
  },
  performanceTips: {
    title: '성능 최적화 팁',
    subtitle: '대용량 데이터를 효율적으로 처리하는 방법을 알아보세요',
    example: '예제',
    metrics: '성능 지표',
    actions: '권장 조치',
    recommended: '권장',
    maximum: '최대',
    warning: '주의',
    critical: '위험',
    optimal: '최적',
    lazyLoading: '지연 로딩',
    threshold: '임계값',
    batchSize: '배치 크기',
    cacheSize: '캐시 크기',
    cacheExpiry: '캐시 만료',
    categories: {
      fileSize: {
        title: '파일 크기 최적화',
        description: '대용량 파일을 효율적으로 처리하는 방법',
        tips: {
          largeFiles: {
            title: '대용량 파일 처리',
            description: '5MB 이상의 파일은 성능에 영향을 줄 수 있습니다. 파일을 분할하거나 압축하는 것을 고려하세요.',
            actions: {
              split: '파일을 작은 단위로 분할하세요',
              compress: '불필요한 데이터를 제거하세요',
              sample: '샘플 데이터로 테스트하세요'
            }
          },
          jsonlStreaming: {
            title: 'JSONL 스트리밍 활용',
            description: '대용량 데이터는 JSONL 형식을 사용하면 메모리 효율성이 향상됩니다.'
          }
        }
      },
      structure: {
        title: '데이터 구조 최적화',
        description: '효율적인 JSON 구조 설계 방법',
        tips: {
          deepNesting: {
            title: '깊은 중첩 구조 피하기',
            description: '10레벨 이상의 깊은 중첩은 렌더링 성능을 저하시킬 수 있습니다.'
          },
          arraySize: {
            title: '배열 크기 관리',
            description: '50개 이상의 요소를 가진 배열은 지연 로딩으로 처리됩니다.'
          }
        }
      },
      memory: {
        title: '메모리 관리',
        description: '브라우저 메모리 사용량 최적화',
        tips: {
          browserLimits: {
            title: '브라우저 메모리 한계',
            description: '브라우저는 탭당 메모리 사용량에 제한이 있습니다. 메모리 부족 시 브라우저가 느려지거나 충돌할 수 있습니다.',
            actions: {
              close: '사용하지 않는 탭을 닫으세요',
              reduce: '입력 데이터 크기를 줄이세요',
              refresh: '페이지를 새로고침하세요'
            }
          },
          caching: {
            title: '캐싱 최적화',
            description: '파싱 결과는 자동으로 캐시되어 재사용됩니다. 캐시는 10개 항목까지 5분간 유지됩니다.'
          }
        }
      },
      rendering: {
        title: '렌더링 최적화',
        description: '트리 렌더링 성능 향상 방법',
        tips: {
          lazyLoading: {
            title: '지연 로딩 활용',
            description: '50개 이상의 자식 노드가 있는 경우 자동으로 지연 로딩이 적용됩니다.'
          },
          expandLevels: {
            title: '확장 레벨 제한',
            description: '모든 노드를 한 번에 확장하지 말고 필요한 부분만 선택적으로 확장하세요.',
            actions: {
              selective: '필요한 노드만 선택적으로 확장',
              levels: '레벨별 확장 기능 활용',
              collapse: '사용하지 않는 노드는 접기'
            }
          }
        }
      }
    },
    monitor: {
      title: '성능 모니터링',
      description: '현재 시스템 상태를 실시간으로 확인하세요',
      fileSize: '파일 크기',
      nodeCount: '노드 수',
      parseTime: '파싱 시간',
      memoryUsage: '메모리 사용량'
    }
  },
  troubleshooting: {
    title: '문제 해결 가이드',
    subtitle: '일반적인 문제와 해결 방법을 확인하세요',
    searchPlaceholder: '문제 검색...',
    clearSearch: '검색 지우기',
    noResults: '검색 결과가 없습니다',
    noResultsDescription: '다른 키워드로 검색하거나 필터를 초기화해보세요.',
    clearFilters: '필터 초기화',
    quickFix: '빠른 해결책',
    detailedSteps: '상세 단계',
    example: '예제',
    wrongExample: '잘못된 예',
    correctExample: '올바른 예',
    prevention: '예방 방법',
    relatedProblems: '관련 문제',
    stillNeedHelp: '여전히 도움이 필요하신가요?',
    contactDescription: '문제가 해결되지 않으면 아래 옵션을 이용해주세요.',
    checkFAQ: 'FAQ 확인',
    reportIssue: '문제 신고',
    frequency: {
      rare: '드물게',
      occasional: '가끔',
      common: '자주',
      frequent: '매우 자주'
    },
    categories: {
      all: '전체',
      parsing: '파싱',
      display: '표시',
      performance: '성능',
      navigation: '탐색',
      input: '입력'
    },
    problems: {
      jsonSyntaxError: {
        title: 'JSON 구문 오류',
        description: 'JSON 데이터에 구문 오류가 있어 파싱할 수 없습니다.',
        quickFixes: {
          checkCommas: '쉼표 누락이나 추가 확인',
          checkQuotes: '따옴표 누락 확인',
          checkBrackets: '괄호 일치 확인'
        },
        steps: {
          locate: '오류 메시지에서 정확한 위치 확인',
          identify: '오류 유형 식별 (쉼표, 따옴표, 괄호 등)',
          fix: '해당 위치의 구문 수정',
          validate: '수정 후 다시 파싱 시도'
        },
        prevention: {
          validator: 'JSON 검증 도구 사용',
          formatter: 'JSON 포맷터로 구조 확인',
          careful: '수동 편집 시 주의 깊게 작업'
        }
      },
      largeFileSlow: {
        title: '대용량 파일 처리 속도 저하',
        description: '파일이 너무 커서 파싱이나 렌더링이 느려집니다.',
        quickFixes: {
          reduce: '파일 크기 줄이기',
          collapse: '모든 노드 접기',
          refresh: '페이지 새로고침'
        },
        steps: {
          check: '파일 크기 확인 (5MB 이하 권장)',
          split: '파일을 작은 단위로 분할',
          optimize: '불필요한 데이터 제거',
          monitor: '성능 모니터 확인'
        },
        prevention: {
          limit: '파일 크기를 5MB 이하로 유지',
          jsonl: 'JSONL 형식 사용 고려',
          sample: '샘플 데이터로 먼저 테스트'
        }
      },
      treeNotExpanding: {
        title: '트리 노드가 확장되지 않음',
        description: '노드를 클릭해도 확장되지 않거나 반응이 없습니다.',
        quickFixes: {
          click: '노드 아이콘을 직접 클릭',
          keyboard: 'Enter 또는 Space 키 사용',
          refresh: '페이지 새로고침'
        },
        steps: {
          verify: '노드에 자식 요소가 있는지 확인',
          try: '다른 노드에서도 같은 문제인지 확인',
          check: '브라우저 콘솔에서 오류 확인',
          reload: '페이지 새로고침 후 재시도'
        }
      },
      jsonlNotDetected: {
        title: 'JSONL 형식이 감지되지 않음',
        description: 'JSONL 데이터가 JSON으로 잘못 인식되어 파싱 오류가 발생합니다.',
        quickFixes: {
          manual: '수동으로 JSONL 형식 선택',
          format: '각 줄이 유효한 JSON인지 확인',
          validate: '줄바꿈 문자 확인'
        }
      },
      memoryError: {
        title: '메모리 부족 오류',
        description: '브라우저 메모리가 부족하여 처리할 수 없습니다.',
        quickFixes: {
          close: '다른 탭 닫기',
          reduce: '데이터 크기 줄이기',
          restart: '브라우저 재시작'
        },
        steps: {
          save: '현재 작업 저장',
          close: '사용하지 않는 탭 모두 닫기',
          restart: '브라우저 완전히 재시작',
          reduce: '더 작은 데이터로 재시도'
        },
        prevention: {
          monitor: '메모리 사용량 정기적으로 확인',
          limit: '파일 크기 제한 준수',
          close: '사용하지 않는 탭 정리'
        }
      }
    }
  },
  infoHub: {
    title: '정보 허브',
    description: 'JSON과 API 개발에 대한 포괄적인 가이드와 정보를 제공합니다',
    searchPlaceholder: '가이드 검색...',
    relatedTools: '관련 도구',
    categories: {
      all: '전체',
      'getting-started': '시작하기',
      'api-development': 'API 개발',
      'data-processing': '데이터 처리',
      'performance': '성능 최적화'
    },
    categoryDescriptions: {
      'getting-started': 'JSON과 JSONL의 기본 개념을 학습합니다',
      'api-development': 'REST API 설계와 JSON 스키마 활용법을 배웁니다',
      'data-processing': '대용량 데이터 처리와 변환 기법을 다룹니다',
      'performance': 'JSON 처리 성능을 향상시키는 방법을 학습합니다'
    }
  },
  guide: {
    tableOfContents: '목차',
    relatedTools: '관련 도구',
    relatedGuides: '관련 가이드',
    tryItOut: '직접 해보기',
    loadInParser: '파서에서 실행',
    loadError: '가이드를 불러오는 중 오류가 발생했습니다',
    previous: '이전',
    next: '다음'
  },
  guides: {
    'json-basics': {
      title: 'JSON 기초',
      description: 'JSON의 기본 개념과 구조를 학습합니다'
    },
    'jsonl-introduction': {
      title: 'JSONL 소개',
      description: 'JSONL(JSON Lines) 형식의 특징과 활용법을 배웁니다'
    },
    'parser-overview': {
      title: '파서 개요',
      description: 'JSONL 파서의 주요 기능과 사용법을 알아봅니다'
    },
    'rest-api-design': {
      title: 'REST API 설계 모범 사례',
      description: 'JSON을 사용하는 REST API 설계의 모범 사례를 학습합니다'
    },
    'json-schema-guide': {
      title: 'JSON 스키마 가이드',
      description: 'JSON 스키마를 사용한 데이터 검증 방법을 배웁니다'
    },
    'api-versioning': {
      title: 'API 버전 관리',
      description: 'API 버전 관리 전략과 모범 사례를 다룹니다'
    },
    'large-datasets': {
      title: '대용량 데이터셋 처리',
      description: '대용량 JSON 데이터를 효율적으로 처리하는 방법을 학습합니다'
    },
    'data-transformation': {
      title: '데이터 변환 기법',
      description: 'JSON 데이터 변환과 ETL 프로세스를 다룹니다'
    },
    'error-handling': {
      title: '오류 처리',
      description: 'JSON 파싱과 처리 중 발생하는 오류를 다루는 방법을 배웁니다'
    },
    'optimization-tips': {
      title: '성능 최적화 팁',
      description: 'JSON 처리 성능을 향상시키는 다양한 기법을 학습합니다'
    },
    'caching-strategies': {
      title: '캐싱 전략',
      description: 'JSON 데이터 캐싱을 통한 성능 향상 방법을 다룹니다'
    }
  },
  tools: {
    'json-validator': {
      name: 'JSON 검증기',
      description: 'JSON 구문을 검증하고 오류를 찾아줍니다'
    },
    'data-converter': {
      name: '데이터 변환기',
      description: 'JSON을 다른 형식으로 변환합니다'
    },
    'schema-generator': {
      name: '스키마 생성기',
      description: 'JSON 데이터에서 스키마를 자동 생성합니다'
    },
    'api-tester': {
      name: 'API 테스터',
      description: 'REST API를 테스트하고 응답을 확인합니다'
    },
    'mock-server': {
      name: 'Mock 서버',
      description: 'API 개발을 위한 모킹 서버를 제공합니다'
    }
  },
  tags: {
    json: 'JSON',
    jsonl: 'JSONL',
    basics: '기초',
    syntax: '구문',
    format: '형식',
    streaming: '스트리밍',
    parser: '파서',
    tool: '도구',
    features: '기능',
    api: 'API',
    rest: 'REST',
    design: '설계',
    'best-practices': '모범 사례',
    schema: '스키마',
    validation: '검증',
    versioning: '버전 관리',
    maintenance: '유지보수',
    performance: '성능',
    memory: '메모리',
    transformation: '변환',
    etl: 'ETL',
    processing: '처리',
    errors: '오류',
    debugging: '디버깅',
    optimization: '최적화',
    caching: '캐싱',
    scalability: '확장성'
  },
  common: {
    loading: '로딩 중...',
    error: '오류가 발생했습니다',
    backToHub: '허브로 돌아가기',
    lastUpdated: '최종 업데이트',
    author: '작성자',
    minutes: '분',
    difficulty: {
      beginner: '초급',
      intermediate: '중급',
      advanced: '고급'
    }
  },
  navigation: {
    mainLabel: '주요 네비게이션',
    mobileMenuLabel: '모바일 네비게이션 메뉴',
    toggleMenu: '메뉴 열기/닫기',
    backTo: '로 돌아가기',
    items: {
      parser: {
        label: '파서',
        description: 'JSON/JSONL 파싱 도구'
      },
      learn: {
        label: '학습',
        description: '튜토리얼과 가이드'
      },
      info: {
        label: '정보 허브',
        description: 'JSON과 API 개발 가이드'
      },
      tools: {
        label: '도구',
        description: '변환 및 검증 도구'
      },
      reference: {
        label: '참조',
        description: '구문 및 패턴 가이드'
      },
      samples: {
        label: '샘플',
        description: '예제 데이터 라이브러리'
      }
    }
  },
  pages: {
    home: {
      title: 'JSONL 파서',
      description: 'JSON과 JSONL 데이터를 대화형 트리 구조로 시각화하세요'
    },
    learn: {
      title: '학습 센터',
      description: 'JSON과 JSONL 처리 기술을 향상시키는 튜토리얼과 가이드'
    },
    tutorial: {
      title: '튜토리얼',
      description: '단계별 학습 가이드'
    },
    tools: {
      title: '도구 허브',
      description: 'JSON 데이터 처리를 위한 유용한 도구 모음'
    },
    tool: {
      title: '도구',
      description: 'JSON 처리 도구'
    },
    reference: {
      title: '참조 허브',
      description: 'JSON 구문과 패턴에 대한 포괄적인 참조 자료'
    },
    referenceGuide: {
      title: '참조 가이드',
      description: '상세한 참조 문서'
    },
    samples: {
      title: '샘플 라이브러리',
      description: '다양한 JSON 예제 데이터와 실제 사용 사례'
    },
    info: {
      title: '정보 허브',
      description: 'JSON과 API 개발에 대한 포괄적인 가이드와 정보'
    },
    infoGuide: {
      title: '정보 가이드',
      description: '상세한 개발 가이드'
    }
  },
  breadcrumb: {
    home: '홈',
    separator: '/'
  },
  meta: {
    title: 'JSONL 파서',
    description: '대화형 트리 구조로 JSON 데이터를 파싱하고 시각화하세요'
  },
  learn: {
    title: '학습 센터',
    description: 'JSON과 JSONL 처리 기술을 향상시키는 튜토리얼과 가이드',
    loading: '튜토리얼을 불러오는 중...',
    error: '튜토리얼을 불러오는 중 오류가 발생했습니다.',
    empty: '선택한 조건에 맞는 튜토리얼이 없습니다.',
    resetFilters: '필터 초기화',
    progress: {
      title: '학습 진행률',
      completed: '완료',
      total: '전체',
      completedStatus: '완료',
      inProgress: '진행 중',
      notStarted: '시작 전'
    },
    filters: {
      title: '필터',
      clearAll: '모두 지우기',
      difficulty: '난이도',
      category: '카테고리'
    },
    search: {
      placeholder: '튜토리얼 검색...',
      noResults: '검색 결과가 없습니다',
      noResultsDescription: '다른 키워드로 검색하거나 필터를 초기화해보세요.',
      clearSearch: '검색 지우기'
    },
    difficulty: {
      beginner: '초급',
      intermediate: '중급',
      advanced: '고급'
    },
    categories: {
      basics: '기초',
      parsing: '파싱',
      validation: '검증',
      advanced_topics: '고급 주제'
    },
    duration: {
      minutes: '{{count}}분'
    }
  },
  seo: {
    home: {
      title: 'JSONL 파서 - JSON & JSONL 데이터 시각화 도구',
      description: '대화형 트리 뷰어로 JSON과 JSONL 데이터를 파싱, 시각화, 탐색하세요. 실시간 파싱, 계층적 표시, 포괄적인 JSON 도구를 제공합니다.'
    },
    learn: {
      title: '학습 센터 - JSON & JSONL 튜토리얼',
      description: '포괄적인 튜토리얼, 대화형 예제, 개발자를 위한 모범 사례로 JSON과 JSONL 처리를 학습하세요.'
    },
    tools: {
      title: 'JSON 도구 허브 - 검증, 변환 및 포맷팅',
      description: '개발자를 위한 검증기, 변환기, 포맷터, 스키마 생성기를 포함한 포괄적인 JSON 도구 모음입니다.'
    },
    reference: {
      title: 'JSON 참조 가이드 - 구문, 패턴 및 모범 사례',
      description: '구문 가이드, 일반적인 패턴, 오류 해결책, 성능 최적화 팁이 포함된 완전한 JSON 참조 자료입니다.'
    },
    samples: {
      title: 'JSON 샘플 데이터 라이브러리 - 실제 사례',
      description: '테스트와 학습을 위한 API, 설정, 실제 사용 사례의 JSON과 JSONL 샘플 데이터 큐레이션 모음입니다.'
    },
    info: {
      title: 'JSON & API 개발 가이드 - 정보 허브',
      description: 'JSON, API, 데이터 처리, 현대적인 개발 관행에 대한 포괄적인 가이드와 정보입니다.'
    }
  }
} as const