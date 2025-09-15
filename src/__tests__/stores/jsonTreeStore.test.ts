import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useJsonTreeStore } from '../../stores/jsonTreeStore'
import { useI18nStore } from '../../stores/i18nStore'
import { InputType, DataType } from '../../types'

describe('JsonTreeStore', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    
    // Initialize i18n store with Korean language for tests
    const i18nStore = useI18nStore()
    await i18nStore.initialize()
    await i18nStore.changeLanguage('ko')
    
    vi.clearAllMocks()
  })

  describe('초기 상태', () => {
    it('기본 상태가 올바르게 설정되어야 한다', () => {
      const store = useJsonTreeStore()
      
      expect(store.inputText).toBe('')
      expect(store.inputType).toBe(InputType.JSON)
      expect(store.parsedData).toEqual([])
      expect(store.parseError).toBeNull()
      expect(store.isLoading).toBe(false)
    })
  })

  describe('입력 텍스트 설정', () => {
    it('입력 텍스트를 설정할 수 있어야 한다', () => {
      const store = useJsonTreeStore()
      const testText = '{"name": "test"}'
      
      store.setInputText(testText)
      
      expect(store.inputText).toBe(testText)
      expect(store.parseError).toBeNull()
    })

    it('빈 텍스트 설정 시 데이터를 초기화해야 한다', () => {
      const store = useJsonTreeStore()
      
      // 먼저 데이터 설정
      store.setInputText('{"test": true}')
      store.parseInput()
      
      // 빈 텍스트로 설정
      store.setInputText('')
      
      expect(store.parsedData).toEqual([])
    })
  })

  describe('입력 타입 설정', () => {
    it('입력 타입을 변경할 수 있어야 한다', () => {
      const store = useJsonTreeStore()
      
      store.setInputType(InputType.JSONL)
      
      expect(store.inputType).toBe(InputType.JSONL)
      expect(store.parseError).toBeNull()
    })
  })

  describe('JSON 파싱', () => {
    it('유효한 JSON 객체를 파싱할 수 있어야 한다', () => {
      const store = useJsonTreeStore()
      const jsonData = '{"name": "홍길동", "age": 30, "active": true}'
      
      store.setInputText(jsonData)
      store.parseInput()
      
      expect(store.hasData).toBe(true)
      expect(store.hasError).toBe(false)
      expect(store.parsedData).toHaveLength(1)
      
      const rootNode = store.parsedData[0]
      expect(rootNode.type).toBe(DataType.OBJECT)
      expect(rootNode.children).toHaveLength(3)
    })

    it('유효한 JSON 배열을 파싱할 수 있어야 한다', () => {
      const store = useJsonTreeStore()
      const jsonData = '[1, 2, "test", true, null]'
      
      store.setInputText(jsonData)
      store.parseInput()
      
      expect(store.hasData).toBe(true)
      expect(store.parsedData).toHaveLength(1)
      
      const rootNode = store.parsedData[0]
      expect(rootNode.type).toBe(DataType.ARRAY)
      expect(rootNode.children).toHaveLength(5)
    })

    it('잘못된 JSON에 대해 오류를 반환해야 한다', () => {
      const store = useJsonTreeStore()
      const invalidJson = '{"name": "test"'
      
      store.setInputText(invalidJson)
      store.parseInput()
      
      expect(store.hasData).toBe(false)
      expect(store.hasError).toBe(true)
      expect(store.parseError).not.toBeNull()
      expect(store.parseError?.message).toContain('JSON 구문 오류')
    })

    it('빈 입력에 대해 데이터를 초기화해야 한다', () => {
      const store = useJsonTreeStore()
      
      store.setInputText('')
      store.parseInput()
      
      expect(store.hasData).toBe(false)
      expect(store.hasError).toBe(false)
      expect(store.parsedData).toEqual([])
      expect(store.parseError).toBeNull()
    })
  })

  describe('JSONL 파싱', () => {
    it('유효한 JSONL을 파싱할 수 있어야 한다', () => {
      const store = useJsonTreeStore()
      const jsonlData = `{"name": "홍길동", "age": 30}
{"name": "김철수", "age": 25}
{"name": "이영희", "age": 28}`
      
      store.setInputType(InputType.JSONL)
      store.setInputText(jsonlData)
      store.parseInput()
      
      expect(store.hasData).toBe(true)
      expect(store.parsedData).toHaveLength(3)
      
      store.parsedData.forEach((node, index) => {
        expect(node.key).toBe(`${index + 1}번째 줄`)
        expect(node.type).toBe(DataType.OBJECT)
      })
    })

    it('부분적으로 잘못된 JSONL을 처리할 수 있어야 한다', () => {
      const store = useJsonTreeStore()
      const jsonlData = `{"name": "홍길동", "age": 30}
{"name": "김철수", "age": 25
{"name": "이영희", "age": 28}`
      
      store.setInputType(InputType.JSONL)
      store.setInputText(jsonlData)
      store.parseInput()
      
      expect(store.hasData).toBe(true)
      expect(store.hasError).toBe(true)
      expect(store.parsedData).toHaveLength(2) // 유효한 2줄만 파싱됨
      expect(store.parseError?.message).toContain('오류가 발생했습니다')
    })

    it('빈 줄을 무시해야 한다', () => {
      const store = useJsonTreeStore()
      const jsonlData = `{"name": "홍길동"}

{"name": "김철수"}

`
      
      store.setInputType(InputType.JSONL)
      store.setInputText(jsonlData)
      store.parseInput()
      
      expect(store.hasData).toBe(true)
      expect(store.parsedData).toHaveLength(2)
    })
  })

  describe('노드 토글', () => {
    it('노드를 확장/축소할 수 있어야 한다', () => {
      const store = useJsonTreeStore()
      const jsonData = '{"user": {"name": "홍길동", "age": 30}}'
      
      store.setInputText(jsonData)
      store.parseInput()
      
      const rootNode = store.parsedData[0]
      const userNode = rootNode.children![0]
      const initialExpanded = userNode.isExpanded
      
      store.toggleNode(userNode.id)
      
      expect(userNode.isExpanded).toBe(!initialExpanded)
    })
  })

  describe('입력 검증', () => {
    it('대용량 입력에 대해 오류를 반환해야 한다', () => {
      const store = useJsonTreeStore()
      const largeInput = 'x'.repeat(11 * 1024 * 1024) // 11MB
      
      store.setInputText(largeInput)
      store.parseInput()
      
      expect(store.hasError).toBe(true)
      expect(store.parseError?.message).toContain('입력 크기가 너무 큽니다')
    })

    it('JSONL에서 빈 입력에 대해 오류를 반환해야 한다', () => {
      const store = useJsonTreeStore()
      
      store.setInputType(InputType.JSONL)
      store.setInputText('   ')
      store.parseInput()
      
      expect(store.hasError).toBe(true)
      expect(store.parseError?.message).toContain('최소 한 줄의 JSON 데이터가 필요합니다')
    })
  })

  describe('데이터 타입 감지', () => {
    it('다양한 데이터 타입을 올바르게 감지해야 한다', () => {
      const store = useJsonTreeStore()
      
      expect(store.getDataType(null)).toBe(DataType.NULL)
      expect(store.getDataType([])).toBe(DataType.ARRAY)
      expect(store.getDataType({})).toBe(DataType.OBJECT)
      expect(store.getDataType('string')).toBe(DataType.STRING)
      expect(store.getDataType(123)).toBe(DataType.NUMBER)
      expect(store.getDataType(true)).toBe(DataType.BOOLEAN)
    })
  })

  describe('캐싱', () => {
    it('동일한 입력에 대해 캐시를 사용해야 한다', () => {
      const store = useJsonTreeStore()
      const jsonData = '{"name": "test"}'
      
      // 첫 번째 파싱
      store.setInputText(jsonData)
      store.parseInput()
      const firstResult = [...store.parsedData]
      
      // 두 번째 파싱 (캐시 사용)
      store.setInputText('')
      store.setInputText(jsonData)
      store.parseInput()
      
      expect(store.parsedData).toEqual(firstResult)
    })

    it('캐시를 초기화할 수 있어야 한다', () => {
      const store = useJsonTreeStore()
      
      store.setInputText('{"test": true}')
      store.parseInput()
      
      store.clearCache()
      
      // 캐시가 초기화되었는지 확인하기 위해 내부 상태 확인
      expect(store._parseCache.size).toBe(0)
    })
  })

  describe('로컬 스토리지', () => {
    it('데이터를 로컬 스토리지에 저장할 수 있어야 한다', () => {
      const store = useJsonTreeStore()
      const testData = '{"name": "test"}'
      
      store.setInputText(testData)
      store.setInputType(InputType.JSONL)
      
      expect(localStorage.setItem).toHaveBeenCalled()
    })

    it('로컬 스토리지에서 데이터를 로드할 수 있어야 한다', () => {
      const mockData = {
        inputText: '{"name": "test"}',
        inputType: InputType.JSON,
        timestamp: Date.now()
      }
      
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockData))
      
      const store = useJsonTreeStore()
      store.loadFromLocalStorage()
      
      expect(store.inputText).toBe(mockData.inputText)
      expect(store.inputType).toBe(mockData.inputType)
    })

    it('잘못된 로컬 스토리지 데이터를 처리할 수 있어야 한다', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('invalid json')
      
      const store = useJsonTreeStore()
      
      expect(() => store.loadFromLocalStorage()).not.toThrow()
      expect(localStorage.removeItem).toHaveBeenCalled()
    })
  })

  describe('getters', () => {
    it('hasData getter가 올바르게 작동해야 한다', () => {
      const store = useJsonTreeStore()
      
      expect(store.hasData).toBe(false)
      
      store.setInputText('{"test": true}')
      store.parseInput()
      
      expect(store.hasData).toBe(true)
    })

    it('hasError getter가 올바르게 작동해야 한다', () => {
      const store = useJsonTreeStore()
      
      expect(store.hasError).toBe(false)
      
      store.setInputText('invalid json')
      store.parseInput()
      
      expect(store.hasError).toBe(true)
    })

    it('isValidInput getter가 올바르게 작동해야 한다', () => {
      const store = useJsonTreeStore()
      
      expect(store.isValidInput).toBe(false)
      
      store.setInputText('{"test": true}')
      store.parseInput()
      
      expect(store.isValidInput).toBe(true)
    })
  })
})