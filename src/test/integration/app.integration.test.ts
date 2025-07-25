import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import App from '../../App.vue'
import { useJsonTreeStore } from '../../stores/jsonTreeStore'
import { InputType } from '../../types'

describe('App Integration Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('전체 워크플로우', () => {
    it('JSON 입력부터 트리 표시까지 전체 플로우가 작동해야 한다', async () => {
      const wrapper = mount(App)
      const store = useJsonTreeStore()
      
      // 초기 상태 확인
      expect(store.inputText).toBe('')
      expect(store.hasData).toBe(false)
      
      // JSON 데이터 입력
      const testJson = JSON.stringify({
        name: '홍길동',
        age: 30,
        hobbies: ['독서', '영화감상'],
        address: {
          city: '서울',
          district: '강남구'
        }
      }, null, 2)
      
      store.setInputText(testJson)
      store.parseInput()
      
      // 파싱 결과 확인
      expect(store.hasData).toBe(true)
      expect(store.hasError).toBe(false)
      expect(store.parsedData).toHaveLength(1)
      
      const rootNode = store.parsedData[0]
      expect(rootNode.children).toHaveLength(4) // name, age, hobbies, address
      
      // 중첩 객체 확인
      const addressNode = rootNode.children!.find(child => child.key === 'address')
      expect(addressNode).toBeDefined()
      expect(addressNode!.children).toHaveLength(2) // city, district
    })

    it('JSONL 입력을 올바르게 처리해야 한다', async () => {
      const wrapper = mount(App)
      const store = useJsonTreeStore()
      
      // JSONL 타입으로 변경
      store.setInputType(InputType.JSONL)
      
      // JSONL 데이터 입력
      const testJsonl = `{"name": "홍길동", "age": 30}
{"name": "김철수", "age": 25}
{"name": "이영희", "age": 28}`
      
      store.setInputText(testJsonl)
      store.parseInput()
      
      // 파싱 결과 확인
      expect(store.hasData).toBe(true)
      expect(store.hasError).toBe(false)
      expect(store.parsedData).toHaveLength(3)
      
      // 각 줄이 올바르게 파싱되었는지 확인
      expect(store.parsedData[0].key).toBe('Line 1')
      expect(store.parsedData[1].key).toBe('Line 2')
      expect(store.parsedData[2].key).toBe('Line 3')
    })

    it('잘못된 JSON 입력에 대해 오류를 표시해야 한다', async () => {
      const wrapper = mount(App)
      const store = useJsonTreeStore()
      
      // 잘못된 JSON 입력
      const invalidJson = '{"name": "test"'
      
      store.setInputText(invalidJson)
      store.parseInput()
      
      // 오류 상태 확인
      expect(store.hasData).toBe(false)
      expect(store.hasError).toBe(true)
      expect(store.parseError).not.toBeNull()
      expect(store.parseError!.message).toContain('JSON Parse Error')
    })

    it('부분적으로 잘못된 JSONL을 처리해야 한다', async () => {
      const wrapper = mount(App)
      const store = useJsonTreeStore()
      
      store.setInputType(InputType.JSONL)
      
      // 부분적으로 잘못된 JSONL
      const partiallyInvalidJsonl = `{"name": "홍길동", "age": 30}
{"name": "김철수", "age": 25
{"name": "이영희", "age": 28}`
      
      store.setInputText(partiallyInvalidJsonl)
      store.parseInput()
      
      // 부분적 성공 상태 확인
      expect(store.hasData).toBe(true)
      expect(store.hasError).toBe(true)
      expect(store.parsedData).toHaveLength(2) // 유효한 2줄만 파싱됨
      expect(store.parseError!.message).toContain('오류가 발생했습니다')
    })

    it('노드 토글 기능이 작동해야 한다', async () => {
      const wrapper = mount(App)
      const store = useJsonTreeStore()
      
      // 중첩 구조를 가진 JSON 입력
      const nestedJson = JSON.stringify({
        user: {
          profile: {
            name: '홍길동',
            age: 30
          },
          settings: {
            theme: 'dark',
            notifications: true
          }
        }
      })
      
      store.setInputText(nestedJson)
      store.parseInput()
      
      const rootNode = store.parsedData[0]
      const userNode = rootNode.children![0]
      const profileNode = userNode.children![0]
      
      // 초기 확장 상태 확인 (첫 2레벨은 자동 확장)
      expect(rootNode.isExpanded).toBe(true)
      expect(userNode.isExpanded).toBe(true)
      expect(profileNode.isExpanded).toBe(false) // 3레벨은 축소
      
      // 노드 토글
      store.toggleNode(profileNode.id)
      expect(profileNode.isExpanded).toBe(true)
      
      store.toggleNode(profileNode.id)
      expect(profileNode.isExpanded).toBe(false)
    })

    it('로컬 스토리지 저장 및 로드가 작동해야 한다', async () => {
      const wrapper = mount(App)
      const store = useJsonTreeStore()
      
      // 데이터 입력 및 저장
      const testData = '{"name": "test", "value": 123}'
      store.setInputText(testData)
      store.setInputType(InputType.JSONL)
      
      // 새 스토어 인스턴스로 로드 테스트
      const newStore = useJsonTreeStore()
      newStore.loadFromLocalStorage()
      
      expect(newStore.inputText).toBe(testData)
      expect(newStore.inputType).toBe(InputType.JSONL)
    })
  })

  describe('다양한 데이터 타입 처리', () => {
    it('모든 JSON 데이터 타입을 올바르게 처리해야 한다', async () => {
      const wrapper = mount(App)
      const store = useJsonTreeStore()
      
      const complexJson = JSON.stringify({
        string: 'Hello World',
        number: 42,
        float: 3.14,
        boolean_true: true,
        boolean_false: false,
        null_value: null,
        array: [1, 'two', true, null],
        object: {
          nested: 'value'
        },
        empty_array: [],
        empty_object: {}
      })
      
      store.setInputText(complexJson)
      store.parseInput()
      
      expect(store.hasData).toBe(true)
      expect(store.hasError).toBe(false)
      
      const rootNode = store.parsedData[0]
      expect(rootNode.children).toHaveLength(10)
      
      // 각 타입별 노드 확인
      const stringNode = rootNode.children!.find(child => child.key === 'string')
      expect(stringNode!.type).toBe('string')
      
      const numberNode = rootNode.children!.find(child => child.key === 'number')
      expect(numberNode!.type).toBe('number')
      
      const booleanNode = rootNode.children!.find(child => child.key === 'boolean_true')
      expect(booleanNode!.type).toBe('boolean')
      
      const nullNode = rootNode.children!.find(child => child.key === 'null_value')
      expect(nullNode!.type).toBe('null')
      
      const arrayNode = rootNode.children!.find(child => child.key === 'array')
      expect(arrayNode!.type).toBe('array')
      expect(arrayNode!.children).toHaveLength(4)
      
      const objectNode = rootNode.children!.find(child => child.key === 'object')
      expect(objectNode!.type).toBe('object')
      expect(objectNode!.children).toHaveLength(1)
    })
  })

  describe('성능 테스트', () => {
    it('대용량 데이터를 처리할 수 있어야 한다', async () => {
      const wrapper = mount(App)
      const store = useJsonTreeStore()
      
      // 큰 배열 생성
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: Math.random()
      }))
      
      const largeJson = JSON.stringify(largeArray)
      
      const startTime = performance.now()
      store.setInputText(largeJson)
      store.parseInput()
      const endTime = performance.now()
      
      expect(store.hasData).toBe(true)
      expect(store.hasError).toBe(false)
      
      // 파싱 시간이 합리적인 범위 내에 있는지 확인 (5초 이내)
      expect(endTime - startTime).toBeLessThan(5000)
      
      const rootNode = store.parsedData[0]
      expect(rootNode.children).toHaveLength(1000)
    })

    it('깊이가 깊은 중첩 구조를 처리할 수 있어야 한다', async () => {
      const wrapper = mount(App)
      const store = useJsonTreeStore()
      
      // 깊은 중첩 구조 생성
      let deepObject: any = { value: 'deep' }
      for (let i = 0; i < 20; i++) {
        deepObject = { level: i, nested: deepObject }
      }
      
      const deepJson = JSON.stringify(deepObject)
      
      store.setInputText(deepJson)
      store.parseInput()
      
      expect(store.hasData).toBe(true)
      expect(store.hasError).toBe(false)
      
      // 루트에서 시작해서 깊이 확인
      let currentNode = store.parsedData[0]
      let depth = 0
      
      while (currentNode.children && currentNode.children.length > 0) {
        const nestedChild = currentNode.children.find(child => child.key === 'nested')
        if (nestedChild) {
          currentNode = nestedChild
          depth++
        } else {
          break
        }
      }
      
      expect(depth).toBeGreaterThan(15) // 최소 15레벨 깊이
    })
  })

  describe('오류 시나리오', () => {
    it('빈 입력을 올바르게 처리해야 한다', async () => {
      const wrapper = mount(App)
      const store = useJsonTreeStore()
      
      store.setInputText('')
      store.parseInput()
      
      expect(store.hasData).toBe(false)
      expect(store.hasError).toBe(false)
      expect(store.parsedData).toEqual([])
    })

    it('공백만 있는 입력을 올바르게 처리해야 한다', async () => {
      const wrapper = mount(App)
      const store = useJsonTreeStore()
      
      store.setInputText('   \n\t  ')
      store.parseInput()
      
      expect(store.hasData).toBe(false)
      expect(store.hasError).toBe(false)
      expect(store.parsedData).toEqual([])
    })

    it('매우 큰 입력에 대해 검증 오류를 반환해야 한다', async () => {
      const wrapper = mount(App)
      const store = useJsonTreeStore()
      
      // 11MB 크기의 입력 생성
      const largeInput = 'x'.repeat(11 * 1024 * 1024)
      
      store.setInputText(largeInput)
      store.parseInput()
      
      expect(store.hasData).toBe(false)
      expect(store.hasError).toBe(true)
      expect(store.parseError!.message).toContain('입력 크기가 너무 큽니다')
    })
  })
})