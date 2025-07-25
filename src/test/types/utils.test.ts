import { describe, it, expect } from 'vitest'
import { 
  getDataType, 
  isObjectType, 
  isArrayType, 
  isExpandableType, 
  isPrimitiveType 
} from '../../types/utils'
import { DataType } from '../../types'

describe('Type Utils', () => {
  describe('getDataType', () => {
    it('null 값을 올바르게 감지해야 한다', () => {
      expect(getDataType(null)).toBe(DataType.NULL)
    })

    it('배열을 올바르게 감지해야 한다', () => {
      expect(getDataType([])).toBe(DataType.ARRAY)
      expect(getDataType([1, 2, 3])).toBe(DataType.ARRAY)
    })

    it('객체를 올바르게 감지해야 한다', () => {
      expect(getDataType({})).toBe(DataType.OBJECT)
      expect(getDataType({ name: 'test' })).toBe(DataType.OBJECT)
    })

    it('문자열을 올바르게 감지해야 한다', () => {
      expect(getDataType('')).toBe(DataType.STRING)
      expect(getDataType('hello')).toBe(DataType.STRING)
    })

    it('숫자를 올바르게 감지해야 한다', () => {
      expect(getDataType(0)).toBe(DataType.NUMBER)
      expect(getDataType(123)).toBe(DataType.NUMBER)
      expect(getDataType(-456)).toBe(DataType.NUMBER)
      expect(getDataType(3.14)).toBe(DataType.NUMBER)
    })

    it('불린을 올바르게 감지해야 한다', () => {
      expect(getDataType(true)).toBe(DataType.BOOLEAN)
      expect(getDataType(false)).toBe(DataType.BOOLEAN)
    })

    it('undefined를 null로 처리해야 한다', () => {
      expect(getDataType(undefined)).toBe(DataType.NULL)
    })
  })

  describe('Type Guards', () => {
    const createMockNode = (type: DataType) => ({
      id: 'test',
      value: null,
      type,
      isExpanded: false,
      depth: 0
    })

    describe('isObjectType', () => {
      it('객체 타입 노드에 대해 true를 반환해야 한다', () => {
        const node = createMockNode(DataType.OBJECT)
        expect(isObjectType(node)).toBe(true)
      })

      it('객체가 아닌 타입에 대해 false를 반환해야 한다', () => {
        expect(isObjectType(createMockNode(DataType.ARRAY))).toBe(false)
        expect(isObjectType(createMockNode(DataType.STRING))).toBe(false)
        expect(isObjectType(createMockNode(DataType.NUMBER))).toBe(false)
        expect(isObjectType(createMockNode(DataType.BOOLEAN))).toBe(false)
        expect(isObjectType(createMockNode(DataType.NULL))).toBe(false)
      })
    })

    describe('isArrayType', () => {
      it('배열 타입 노드에 대해 true를 반환해야 한다', () => {
        const node = createMockNode(DataType.ARRAY)
        expect(isArrayType(node)).toBe(true)
      })

      it('배열이 아닌 타입에 대해 false를 반환해야 한다', () => {
        expect(isArrayType(createMockNode(DataType.OBJECT))).toBe(false)
        expect(isArrayType(createMockNode(DataType.STRING))).toBe(false)
        expect(isArrayType(createMockNode(DataType.NUMBER))).toBe(false)
        expect(isArrayType(createMockNode(DataType.BOOLEAN))).toBe(false)
        expect(isArrayType(createMockNode(DataType.NULL))).toBe(false)
      })
    })

    describe('isExpandableType', () => {
      it('확장 가능한 타입(객체, 배열)에 대해 true를 반환해야 한다', () => {
        expect(isExpandableType(createMockNode(DataType.OBJECT))).toBe(true)
        expect(isExpandableType(createMockNode(DataType.ARRAY))).toBe(true)
      })

      it('확장 불가능한 타입에 대해 false를 반환해야 한다', () => {
        expect(isExpandableType(createMockNode(DataType.STRING))).toBe(false)
        expect(isExpandableType(createMockNode(DataType.NUMBER))).toBe(false)
        expect(isExpandableType(createMockNode(DataType.BOOLEAN))).toBe(false)
        expect(isExpandableType(createMockNode(DataType.NULL))).toBe(false)
      })
    })

    describe('isPrimitiveType', () => {
      it('원시 타입에 대해 true를 반환해야 한다', () => {
        expect(isPrimitiveType(createMockNode(DataType.STRING))).toBe(true)
        expect(isPrimitiveType(createMockNode(DataType.NUMBER))).toBe(true)
        expect(isPrimitiveType(createMockNode(DataType.BOOLEAN))).toBe(true)
        expect(isPrimitiveType(createMockNode(DataType.NULL))).toBe(true)
      })

      it('복합 타입에 대해 false를 반환해야 한다', () => {
        expect(isPrimitiveType(createMockNode(DataType.OBJECT))).toBe(false)
        expect(isPrimitiveType(createMockNode(DataType.ARRAY))).toBe(false)
      })
    })
  })
})