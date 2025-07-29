import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import TreeNode from '../../components/ui/TreeNode.vue'
import { useJsonTreeStore } from '../../stores/jsonTreeStore'
import { DataType, ParsedNode } from '../../types'

// Mock store
vi.mock('../../stores/jsonTreeStore', () => ({
  useJsonTreeStore: vi.fn()
}))

describe('TreeNode', () => {
  let mockStore: any
  
  beforeEach(() => {
    setActivePinia(createPinia())
    
    mockStore = {
      toggleNode: vi.fn()
    }
    
    vi.mocked(useJsonTreeStore).mockReturnValue(mockStore)
  })

  const createMockNode = (overrides: Partial<ParsedNode> = {}): ParsedNode => ({
    id: 'test-node-1',
    key: 'testKey',
    value: 'testValue',
    type: DataType.STRING,
    isExpanded: false,
    depth: 0,
    ...overrides
  })

  describe('렌더링', () => {
    it('기본 노드를 렌더링해야 한다', () => {
      const node = createMockNode()
      const wrapper = mount(TreeNode, {
        props: { node }
      })

      expect(wrapper.find('.node-content').exists()).toBe(true)
      expect(wrapper.find('.node-key').text()).toBe('testKey')
      expect(wrapper.find('.node-value').text()).toBe('"testValue"')
    })

    it('키가 없는 노드를 렌더링해야 한다', () => {
      const node = createMockNode({ key: undefined })
      const wrapper = mount(TreeNode, {
        props: { node }
      })

      expect(wrapper.find('.node-key').exists()).toBe(false)
      expect(wrapper.find('.key-separator').exists()).toBe(false)
    })

    it('객체 타입 노드를 올바르게 렌더링해야 한다', () => {
      const node = createMockNode({
        type: DataType.OBJECT,
        value: { name: 'test' },
        children: [
          createMockNode({ id: 'child-1', key: 'name', value: 'test' })
        ]
      })
      
      const wrapper = mount(TreeNode, {
        props: { node }
      })

      expect(wrapper.find('.type-object').exists()).toBe(true)
      expect(wrapper.find('.expand-button').exists()).toBe(true)
      expect(wrapper.find('.collection-size').text()).toBe('{1}')
    })

    it('배열 타입 노드를 올바르게 렌더링해야 한다', () => {
      const node = createMockNode({
        type: DataType.ARRAY,
        value: [1, 2, 3],
        children: [
          createMockNode({ id: 'child-1', key: '[0]', value: 1, type: DataType.NUMBER }),
          createMockNode({ id: 'child-2', key: '[1]', value: 2, type: DataType.NUMBER }),
          createMockNode({ id: 'child-3', key: '[2]', value: 3, type: DataType.NUMBER })
        ]
      })
      
      const wrapper = mount(TreeNode, {
        props: { node }
      })

      expect(wrapper.find('.type-array').exists()).toBe(true)
      expect(wrapper.find('.collection-size').text()).toBe('[3]')
    })

    it('다양한 원시 타입을 올바르게 렌더링해야 한다', () => {
      const testCases = [
        { type: DataType.NUMBER, value: 123, expected: '123' },
        { type: DataType.BOOLEAN, value: true, expected: 'true' },
        { type: DataType.NULL, value: null, expected: 'null' }
      ]

      testCases.forEach(({ type, value, expected }) => {
        const node = createMockNode({ type, value })
        const wrapper = mount(TreeNode, {
          props: { node }
        })

        expect(wrapper.find('.node-value').text()).toBe(expected)
      })
    })
  })

  describe('상호작용', () => {
    it('노드 클릭 시 토글되어야 한다', async () => {
      const node = createMockNode({
        type: DataType.OBJECT,
        children: [createMockNode({ id: 'child-1' })]
      })
      
      const wrapper = mount(TreeNode, {
        props: { node }
      })

      await wrapper.find('.node-content').trigger('click')
      
      expect(mockStore.toggleNode).toHaveBeenCalledWith('test-node-1')
    })

    it('확장 버튼 클릭 시 토글되어야 한다', async () => {
      const node = createMockNode({
        type: DataType.OBJECT,
        children: [createMockNode({ id: 'child-1' })]
      })
      
      const wrapper = mount(TreeNode, {
        props: { node }
      })

      await wrapper.find('.expand-button').trigger('click')
      
      expect(mockStore.toggleNode).toHaveBeenCalledWith('test-node-1')
    })

    it('Enter 키 입력 시 토글되어야 한다', async () => {
      const node = createMockNode({
        type: DataType.OBJECT,
        children: [createMockNode({ id: 'child-1' })]
      })
      
      const wrapper = mount(TreeNode, {
        props: { node }
      })

      await wrapper.find('.node-content').trigger('keydown', { key: 'Enter' })
      
      expect(mockStore.toggleNode).toHaveBeenCalledWith('test-node-1')
    })

    it('Space 키 입력 시 토글되어야 한다', async () => {
      const node = createMockNode({
        type: DataType.OBJECT,
        children: [createMockNode({ id: 'child-1' })]
      })
      
      const wrapper = mount(TreeNode, {
        props: { node }
      })

      await wrapper.find('.node-content').trigger('keydown', { key: ' ' })
      
      expect(mockStore.toggleNode).toHaveBeenCalledWith('test-node-1')
    })

    it('자식이 없는 노드는 토글되지 않아야 한다', async () => {
      const node = createMockNode({ type: DataType.STRING })
      
      const wrapper = mount(TreeNode, {
        props: { node }
      })

      await wrapper.find('.node-content').trigger('click')
      
      expect(mockStore.toggleNode).not.toHaveBeenCalled()
    })
  })

  describe('자식 노드 렌더링', () => {
    it('확장된 노드의 자식들을 렌더링해야 한다', () => {
      const node = createMockNode({
        type: DataType.OBJECT,
        isExpanded: true,
        children: [
          createMockNode({ id: 'child-1', key: 'name', value: 'test1' }),
          createMockNode({ id: 'child-2', key: 'age', value: 30, type: DataType.NUMBER })
        ]
      })
      
      const wrapper = mount(TreeNode, {
        props: { node }
      })

      expect(wrapper.find('.node-children').exists()).toBe(true)
      expect(wrapper.findAllComponents(TreeNode)).toHaveLength(3) // 부모 + 자식 2개
    })

    it('축소된 노드의 자식들을 렌더링하지 않아야 한다', () => {
      const node = createMockNode({
        type: DataType.OBJECT,
        isExpanded: false,
        children: [
          createMockNode({ id: 'child-1', key: 'name', value: 'test1' })
        ]
      })
      
      const wrapper = mount(TreeNode, {
        props: { node }
      })

      expect(wrapper.find('.node-children').exists()).toBe(false)
      expect(wrapper.findAllComponents(TreeNode)).toHaveLength(1) // 부모만
    })
  })

  describe('지연 로딩', () => {
    it('자식이 많은 경우 지연 로딩을 사용해야 한다', () => {
      const children = Array.from({ length: 100 }, (_, i) => 
        createMockNode({ id: `child-${i}`, key: `key${i}`, value: `value${i}` })
      )
      
      const node = createMockNode({
        type: DataType.OBJECT,
        isExpanded: true,
        children
      })
      
      const wrapper = mount(TreeNode, {
        props: { node }
      })

      // 처음에는 50개만 렌더링되어야 함
      expect(wrapper.findAllComponents(TreeNode)).toHaveLength(51) // 부모 + 자식 50개
      expect(wrapper.find('.load-more-button').exists()).toBe(true)
    })

    it('더 보기 버튼이 올바른 텍스트를 표시해야 한다', () => {
      const children = Array.from({ length: 75 }, (_, i) => 
        createMockNode({ id: `child-${i}`, key: `key${i}`, value: `value${i}` })
      )
      
      const node = createMockNode({
        type: DataType.OBJECT,
        isExpanded: true,
        children
      })
      
      const wrapper = mount(TreeNode, {
        props: { node }
      })

      expect(wrapper.find('.load-more-button').text()).toBe('25개 더 보기')
    })
  })

  describe('접근성', () => {
    it('올바른 ARIA 속성을 가져야 한다', () => {
      const node = createMockNode({
        type: DataType.OBJECT,
        depth: 2,
        children: [createMockNode({ id: 'child-1' })]
      })
      
      const wrapper = mount(TreeNode, {
        props: { node }
      })

      const nodeContent = wrapper.find('.node-content')
      expect(nodeContent.attributes('role')).toBe('treeitem')
      expect(nodeContent.attributes('tabindex')).toBe('0')
      expect(nodeContent.attributes('aria-level')).toBe('3') // depth + 1
      expect(nodeContent.attributes('aria-expanded')).toBe('false')
    })

    it('자식이 없는 노드는 aria-expanded를 가지지 않아야 한다', () => {
      const node = createMockNode({ type: DataType.STRING })
      
      const wrapper = mount(TreeNode, {
        props: { node }
      })

      const nodeContent = wrapper.find('.node-content')
      expect(nodeContent.attributes('aria-expanded')).toBeUndefined()
    })
  })
})