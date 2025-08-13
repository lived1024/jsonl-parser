import type { ErrorGuideItem, ErrorPattern, ErrorMatchResult } from '../types/reference'

export class ErrorPatternService {
  private patterns: ErrorPattern[] = [
    {
      id: 'unexpected-token-comment',
      regex: /Unexpected token.*\/\//,
      errorType: 'unexpected-token',
      confidence: 0.9,
      keywords: ['comment', '//', '/*']
    },
    {
      id: 'unexpected-token-trailing-comma',
      regex: /Unexpected token.*,/,
      errorType: 'trailing-comma',
      confidence: 0.8,
      keywords: ['comma', 'trailing']
    },
    {
      id: 'unexpected-end-incomplete',
      regex: /Unexpected end of JSON input/,
      errorType: 'unexpected-end',
      confidence: 0.95,
      keywords: ['incomplete', 'truncated', 'end']
    },
    {
      id: 'invalid-string-quotes',
      regex: /Unexpected token.*"/,
      errorType: 'invalid-string',
      confidence: 0.7,
      keywords: ['quote', 'string', 'escape']
    },
    {
      id: 'invalid-property-name',
      regex: /Unexpected token.*in JSON at position/,
      errorType: 'invalid-property',
      confidence: 0.6,
      keywords: ['property', 'key', 'name']
    },
    {
      id: 'invalid-number-format',
      regex: /Unexpected token.*\d/,
      errorType: 'invalid-number',
      confidence: 0.6,
      keywords: ['number', 'decimal', 'integer']
    },
    {
      id: 'invalid-boolean-value',
      regex: /Unexpected token.*[tf]/,
      errorType: 'invalid-boolean',
      confidence: 0.7,
      keywords: ['boolean', 'true', 'false']
    },
    {
      id: 'invalid-null-value',
      regex: /Unexpected token.*n/,
      errorType: 'invalid-null',
      confidence: 0.7,
      keywords: ['null', 'undefined']
    }
  ]

  private errorDatabase: ErrorGuideItem[] = [
    {
      id: 'unexpected-token',
      title: 'Unexpected token 오류',
      description: 'JSON 구문에서 예상치 못한 문자가 발견되었을 때 발생하는 오류입니다.',
      category: 'syntax',
      severity: 'high',
      commonCauses: [
        'JSON에서 허용되지 않는 주석 사용',
        '잘못된 문자열 인용',
        '후행 쉼표 사용',
        '잘못된 속성명 형식'
      ],
      badExample: '{\n  "name": "John",\n  "age": 30,  // 주석은 허용되지 않음\n}',
      solution: '{\n  "name": "John",\n  "age": 30\n}',
      tips: [
        'JSON에서는 주석을 사용할 수 없습니다',
        '마지막 속성 뒤에 쉼표를 붙이지 마세요',
        '문자열은 반드시 큰따옴표를 사용하세요',
        '속성명도 반드시 큰따옴표로 감싸야 합니다'
      ],
      relatedErrors: ['trailing-comma', 'invalid-string', 'invalid-property']
    },
    {
      id: 'unexpected-end',
      title: 'Unexpected end of JSON input',
      description: 'JSON 데이터가 완전하지 않거나 갑자기 끝났을 때 발생하는 오류입니다.',
      category: 'structure',
      severity: 'high',
      commonCauses: [
        '불완전한 JSON 데이터 전송',
        '닫히지 않은 중괄호나 대괄호',
        '네트워크 오류로 인한 데이터 손실',
        '파일 읽기 중 중단'
      ],
      badExample: '{\n  "name": "John",\n  "age": 30',
      solution: '{\n  "name": "John",\n  "age": 30\n}',
      tips: [
        '모든 중괄호와 대괄호가 올바르게 닫혔는지 확인하세요',
        'JSON 데이터가 완전히 전송되었는지 확인하세요',
        '네트워크 연결 상태를 확인하세요',
        'JSON 유효성 검사기를 사용해 구조를 확인하세요'
      ],
      relatedErrors: ['unmatched-brackets']
    },
    {
      id: 'invalid-string',
      title: '잘못된 문자열 형식',
      description: '문자열이 올바르게 인용되지 않았거나 이스케이프 처리가 잘못된 경우입니다.',
      category: 'syntax',
      severity: 'medium',
      commonCauses: [
        '문자열 내 큰따옴표 이스케이프 누락',
        '잘못된 이스케이프 시퀀스 사용',
        '문자열 종료 따옴표 누락',
        '제어 문자 처리 오류'
      ],
      badExample: '{\n  "message": "He said "Hello""\n}',
      solution: '{\n  "message": "He said \\"Hello\\""\n}',
      tips: [
        '문자열 내의 큰따옴표는 백슬래시로 이스케이프하세요',
        '백슬래시 자체를 사용하려면 \\\\로 이스케이프하세요',
        '줄바꿈은 \\n, 탭은 \\t로 표현하세요',
        '유니코드 문자는 \\uXXXX 형식을 사용하세요'
      ],
      relatedErrors: ['unexpected-token']
    },
    {
      id: 'trailing-comma',
      title: '후행 쉼표 오류',
      description: '객체나 배열의 마지막 요소 뒤에 불필요한 쉼표가 있는 경우입니다.',
      category: 'syntax',
      severity: 'low',
      commonCauses: [
        'JavaScript 코드에서 JSON으로 변환 시 실수',
        '코드 편집기의 자동 완성 기능',
        '배열이나 객체 요소 삭제 후 쉼표 미제거'
      ],
      badExample: '{\n  "name": "John",\n  "age": 30,\n}',
      solution: '{\n  "name": "John",\n  "age": 30\n}',
      tips: [
        '마지막 속성이나 배열 요소 뒤에는 쉼표를 붙이지 마세요',
        'JavaScript와 달리 JSON은 후행 쉼표를 허용하지 않습니다',
        'JSON 린터를 사용해 자동으로 감지하세요'
      ],
      relatedErrors: ['unexpected-token']
    },
    {
      id: 'invalid-property',
      title: '잘못된 속성명',
      description: '객체의 속성명이 올바른 형식이 아닌 경우입니다.',
      category: 'syntax',
      severity: 'medium',
      commonCauses: [
        '속성명에 큰따옴표 누락',
        '작은따옴표 사용',
        '속성명에 특수문자 포함',
        '예약어 사용'
      ],
      badExample: '{\n  name: "John",\n  \'age\': 30\n}',
      solution: '{\n  "name": "John",\n  "age": 30\n}',
      tips: [
        '모든 속성명은 큰따옴표로 감싸야 합니다',
        '작은따옴표는 사용할 수 없습니다',
        '속성명에는 영문자, 숫자, 언더스코어만 사용하는 것이 좋습니다'
      ],
      relatedErrors: ['unexpected-token']
    },
    {
      id: 'invalid-number',
      title: '잘못된 숫자 형식',
      description: '숫자가 JSON 표준에 맞지 않는 형식으로 작성된 경우입니다.',
      category: 'data-type',
      severity: 'medium',
      commonCauses: [
        '앞에 0이 붙은 숫자 (예: 01, 02)',
        '16진수나 8진수 표기법 사용',
        '잘못된 소수점 표기',
        'NaN이나 Infinity 값 사용'
      ],
      badExample: '{\n  "count": 01,\n  "price": 19.99.0\n}',
      solution: '{\n  "count": 1,\n  "price": 19.99\n}',
      tips: [
        '숫자 앞에 불필요한 0을 붙이지 마세요',
        '소수점은 한 번만 사용하세요',
        'NaN이나 Infinity는 문자열로 표현하거나 null을 사용하세요',
        '16진수는 10진수로 변환해서 사용하세요'
      ],
      relatedErrors: ['unexpected-token']
    },
    {
      id: 'invalid-boolean',
      title: '잘못된 불린 값',
      description: '불린 값이 올바르지 않은 형식으로 작성된 경우입니다.',
      category: 'data-type',
      severity: 'low',
      commonCauses: [
        '대문자 사용 (True, False)',
        '숫자로 표현 (1, 0)',
        '문자열로 감싸기 ("true", "false")',
        '다른 언어의 불린 표현 사용'
      ],
      badExample: '{\n  "active": True,\n  "visible": "false"\n}',
      solution: '{\n  "active": true,\n  "visible": false\n}',
      tips: [
        '불린 값은 반드시 소문자 true, false를 사용하세요',
        '따옴표로 감싸지 마세요',
        '1, 0 대신 true, false를 사용하세요'
      ],
      relatedErrors: ['unexpected-token']
    },
    {
      id: 'invalid-null',
      title: '잘못된 null 값',
      description: 'null 값이 올바르지 않은 형식으로 작성된 경우입니다.',
      category: 'data-type',
      severity: 'low',
      commonCauses: [
        '대문자 사용 (NULL, Null)',
        'undefined 사용',
        '문자열로 감싸기 ("null")',
        '빈 문자열과 혼동'
      ],
      badExample: '{\n  "value": NULL,\n  "data": undefined\n}',
      solution: '{\n  "value": null,\n  "data": null\n}',
      tips: [
        'null은 반드시 소문자로 작성하세요',
        'undefined는 JSON에서 지원하지 않으므로 null을 사용하세요',
        '따옴표로 감싸지 마세요'
      ],
      relatedErrors: ['unexpected-token']
    },
    {
      id: 'unmatched-brackets',
      title: '괄호 불일치',
      description: '중괄호나 대괄호가 올바르게 열리고 닫히지 않은 경우입니다.',
      category: 'structure',
      severity: 'high',
      commonCauses: [
        '여는 괄호와 닫는 괄호 개수 불일치',
        '잘못된 괄호 순서',
        '중첩된 구조에서 괄호 누락',
        '복사-붙여넣기 시 괄호 손실'
      ],
      badExample: '{\n  "users": [\n    {"name": "John"},\n    {"name": "Jane"\n  ]\n}',
      solution: '{\n  "users": [\n    {"name": "John"},\n    {"name": "Jane"}\n  ]\n}',
      tips: [
        '코드 편집기의 괄호 매칭 기능을 활용하세요',
        '들여쓰기를 일관되게 사용해 구조를 명확히 하세요',
        'JSON 포맷터를 사용해 구조를 확인하세요',
        '복잡한 중첩 구조는 단계별로 작성하세요'
      ],
      relatedErrors: ['unexpected-end']
    }
  ]

  /**
   * 오류 메시지를 분석하여 가능한 원인과 해결책을 찾습니다
   */
  analyzeError(errorMessage: string, jsonContent?: string): ErrorMatchResult[] {
    const results: ErrorMatchResult[] = []
    
    // 패턴 매칭을 통한 오류 분석
    for (const pattern of this.patterns) {
      if (pattern.regex.test(errorMessage)) {
        const errorGuide = this.errorDatabase.find(e => e.id === pattern.errorType)
        if (errorGuide) {
          results.push({
            errorGuide,
            confidence: pattern.confidence,
            matchedPattern: pattern.id,
            suggestedFix: this.generateSuggestedFix(pattern, jsonContent)
          })
        }
      }
    }

    // 키워드 기반 추가 분석
    const keywordMatches = this.analyzeByKeywords(errorMessage)
    results.push(...keywordMatches)

    // 신뢰도 순으로 정렬
    return results.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * 키워드 기반으로 오류를 분석합니다
   */
  private analyzeByKeywords(errorMessage: string): ErrorMatchResult[] {
    const results: ErrorMatchResult[] = []
    const lowerMessage = errorMessage.toLowerCase()

    for (const error of this.errorDatabase) {
      let confidence = 0
      let matchedKeywords: string[] = []

      // 제목과 설명에서 키워드 매칭
      const titleWords = error.title.toLowerCase().split(' ')
      const descWords = error.description.toLowerCase().split(' ')
      
      for (const word of [...titleWords, ...descWords]) {
        if (word.length > 2 && lowerMessage.includes(word)) {
          confidence += 0.1
          matchedKeywords.push(word)
        }
      }

      // 일반적인 원인에서 키워드 매칭
      for (const cause of error.commonCauses || []) {
        const causeWords = cause.toLowerCase().split(' ')
        for (const word of causeWords) {
          if (word.length > 2 && lowerMessage.includes(word)) {
            confidence += 0.15
            matchedKeywords.push(word)
          }
        }
      }

      if (confidence > 0.2) {
        results.push({
          errorGuide: error,
          confidence: Math.min(confidence, 0.8), // 최대 0.8로 제한
          matchedPattern: 'keyword-analysis',
          matchedKeywords
        })
      }
    }

    return results
  }

  /**
   * 패턴에 따른 수정 제안을 생성합니다
   */
  private generateSuggestedFix(pattern: ErrorPattern, jsonContent?: string): string | undefined {
    if (!jsonContent) return undefined

    switch (pattern.errorType) {
      case 'trailing-comma':
        return jsonContent.replace(/,(\s*[}\]])/g, '$1')
      
      case 'invalid-string':
        return jsonContent.replace(/([^\\])"/g, '$1\\"')
      
      case 'invalid-property':
        return jsonContent.replace(/(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
      
      default:
        return undefined
    }
  }

  /**
   * 모든 오류 가이드를 반환합니다
   */
  getAllErrorGuides(): ErrorGuideItem[] {
    return [...this.errorDatabase]
  }

  /**
   * 특정 카테고리의 오류 가이드를 반환합니다
   */
  getErrorGuidesByCategory(category: string): ErrorGuideItem[] {
    return this.errorDatabase.filter(error => error.category === category)
  }

  /**
   * ID로 특정 오류 가이드를 찾습니다
   */
  getErrorGuideById(id: string): ErrorGuideItem | undefined {
    return this.errorDatabase.find(error => error.id === id)
  }

  /**
   * 관련 오류들을 찾습니다
   */
  getRelatedErrors(errorId: string): ErrorGuideItem[] {
    const error = this.getErrorGuideById(errorId)
    if (!error || !error.relatedErrors) return []

    return error.relatedErrors
      .map(id => this.getErrorGuideById(id))
      .filter((e): e is ErrorGuideItem => e !== undefined)
  }
}

export const errorPatternService = new ErrorPatternService()