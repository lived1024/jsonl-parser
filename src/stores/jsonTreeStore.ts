import { defineStore } from 'pinia'
import {
  JsonTreeState,
  InputType,
  ParsedNode,
  ParseError,
  LocalStorageData,
  DataType
} from '../types'
import { LOCAL_STORAGE_KEYS, DEFAULT_CONFIG } from '../types/constants'

// 파싱 결과 캐시 인터페이스
interface ParseCache {
  key: string
  data: ParsedNode[]
  error: ParseError | null
  timestamp: number
}

export const useJsonTreeStore = defineStore('jsonTree', {
  state: (): JsonTreeState & { _parseCache: Map<string, ParseCache> } => ({
    inputText: '',
    inputType: InputType.JSON,
    parsedData: [],
    parseError: null,
    isLoading: false,
    preserveLineBreaks: true,
    _parseCache: new Map()
  }),

  actions: {
    setInputText(text: string) {
      this.inputText = text
      this.parseError = null

      // Auto-save to localStorage
      this.saveToLocalStorage()

      // Clear localStorage if input is empty
      if (!text.trim()) {
        this.clearLocalStorage()
        this.parsedData = []
      }
    },

    setInputType(type: InputType) {
      this.inputType = type
      this.parseError = null

      // Auto-save to localStorage
      this.saveToLocalStorage()

      // Re-parse with new type if there's input
      if (this.inputText.trim()) {
        this.parseInput()
      }
    },

    parseInput() {
      // 입력 검증 (빈 입력도 검증에 포함)
      const validationError = this.validateInput()
      if (validationError) {
        this.parseError = validationError
        this.parsedData = []
        return
      }

      if (!this.inputText.trim()) {
        this.parsedData = []
        this.parseError = null
        return
      }

      // 캐시 키 생성
      const cacheKey = this.generateCacheKey()

      // 캐시에서 결과 확인
      const cachedResult = this.getCachedResult(cacheKey)
      if (cachedResult) {
        this.parsedData = cachedResult.data
        this.parseError = cachedResult.error
        return
      }

      this.isLoading = true
      this.parseError = null

      try {
        if (this.inputType === InputType.JSON) {
          // Parse single JSON
          const parsed = JSON.parse(this.inputText)
          this.parsedData = [this.convertToNode(parsed, '', 0)]
        } else {
          // Parse JSONL (JSON Lines)
          const result = this.parseJsonLines()
          this.parsedData = result.data

          // 부분적 성공의 경우 경고 표시
          if (result.warnings.length > 0) {
            this.parseError = {
              message: `${result.warnings.length}개 줄에서 오류가 발생했습니다. ${result.data.length}개 줄이 성공적으로 파싱되었습니다.`,
              line: result.warnings[0].line,
              column: result.warnings[0].column,
              position: result.warnings[0].position
            }
          }
        }

        // 결과를 캐시에 저장
        this.setCachedResult(cacheKey, this.parsedData, this.parseError)

      } catch (error) {
        this.parseError = this.createParseError(error)
        this.parsedData = []

        // 오류도 캐시에 저장
        this.setCachedResult(cacheKey, [], this.parseError)
      } finally {
        this.isLoading = false
      }
    },

    toggleNode(nodeId: string) {
      const toggleNodeRecursive = (nodes: ParsedNode[]): ParsedNode[] => {
        return nodes.map(node => {
          if (node.id === nodeId) {
            return {
              ...node,
              isExpanded: !node.isExpanded
            }
          }
          if (node.children) {
            return {
              ...node,
              children: toggleNodeRecursive(node.children)
            }
          }
          return node
        })
      }

      this.parsedData = toggleNodeRecursive(this.parsedData)
    },

    setPreserveLineBreaks(preserve: boolean) {
      this.preserveLineBreaks = preserve
      this.saveToLocalStorage()
    },

    expandAllNodes() {
      const expandRecursive = (nodes: ParsedNode[]): ParsedNode[] => {
        return nodes.map(node => ({
          ...node,
          isExpanded: node.children && node.children.length > 0 ? true : node.isExpanded,
          children: node.children ? expandRecursive(node.children) : node.children
        }))
      }

      this.parsedData = expandRecursive(this.parsedData)
    },

    collapseAllNodes() {
      const collapseRecursive = (nodes: ParsedNode[]): ParsedNode[] => {
        return nodes.map(node => ({
          ...node,
          isExpanded: node.children && node.children.length > 0 ? false : node.isExpanded,
          children: node.children ? collapseRecursive(node.children) : node.children
        }))
      }

      this.parsedData = collapseRecursive(this.parsedData)
    },

    expandToLevel(level: number) {
      const expandToLevelRecursive = (nodes: ParsedNode[], currentLevel: number = 0): ParsedNode[] => {
        return nodes.map(node => ({
          ...node,
          isExpanded: node.children && node.children.length > 0 ? currentLevel < level : node.isExpanded,
          children: node.children ? expandToLevelRecursive(node.children, currentLevel + 1) : node.children
        }))
      }

      this.parsedData = expandToLevelRecursive(this.parsedData)
    },

    saveToLocalStorage() {
      try {
        const dataToSave: LocalStorageData = {
          inputText: this.inputText,
          inputType: this.inputType,
          preserveLineBreaks: this.preserveLineBreaks,
          timestamp: Date.now()
        }

        localStorage.setItem(LOCAL_STORAGE_KEYS.JSON_TREE_DATA, JSON.stringify(dataToSave))
      } catch (error) {
        console.warn('Failed to save to localStorage:', error)
      }
    },

    loadFromLocalStorage() {
      try {
        const savedData = localStorage.getItem(LOCAL_STORAGE_KEYS.JSON_TREE_DATA)

        if (savedData) {
          const parsedData: LocalStorageData = JSON.parse(savedData)

          // Validate the loaded data structure
          if (parsedData.inputText !== undefined && parsedData.inputType !== undefined) {
            this.inputText = parsedData.inputText
            this.inputType = parsedData.inputType
            this.preserveLineBreaks = parsedData.preserveLineBreaks ?? false

            // Auto-parse if there's input text
            if (this.inputText.trim()) {
              this.parseInput()
            }
          }
        }
      } catch (error) {
        console.warn('Failed to load from localStorage:', error)
        // Clear corrupted data
        this.clearLocalStorage()
      }
    },

    clearLocalStorage() {
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.JSON_TREE_DATA)
      } catch (error) {
        console.warn('Failed to clear localStorage:', error)
      }
    },

    // Helper method to create parse error objects
    createParseError(error: unknown): ParseError {
      if (error instanceof SyntaxError) {
        // Try to extract position information from JSON.parse error
        const message = error.message
        const positionMatch = message.match(/position (\d+)/)
        const position = positionMatch ? parseInt(positionMatch[1]) : undefined

        // Calculate line and column from position
        let line: number | undefined
        let column: number | undefined

        if (position !== undefined) {
          const textBeforeError = this.inputText.substring(0, position)
          const lines = textBeforeError.split('\n')
          line = lines.length
          column = lines[lines.length - 1].length + 1
        }

        return {
          message: `JSON Parse Error: ${message}`,
          line,
          column,
          position
        }
      }

      return {
        message: error instanceof Error ? error.message : 'Unknown parsing error'
      }
    },

    // Helper method to convert data to ParsedNode with recursive tree structure
    convertToNode(data: any, key: string, depth: number): ParsedNode {
      const nodeId = this.generateNodeId()
      const type = this.getDataType(data)

      const node: ParsedNode = {
        id: nodeId,
        key,
        value: data,
        type,
        isExpanded: depth < 2, // Auto-expand first 2 levels
        depth
      }

      // Add children for objects and arrays
      if (type === DataType.OBJECT || type === DataType.ARRAY) {
        node.children = []

        if (type === DataType.OBJECT) {
          // Handle object properties
          for (const [objKey, objValue] of Object.entries(data)) {
            node.children.push(this.convertToNode(objValue, objKey, depth + 1))
          }
        } else if (type === DataType.ARRAY) {
          // Handle array elements
          for (let i = 0; i < data.length; i++) {
            node.children.push(this.convertToNode(data[i], `[${i}]`, depth + 1))
          }
        }
      }

      return node
    },

    // Helper method to determine data type
    getDataType(value: any): DataType {
      if (value === null) return DataType.NULL
      if (Array.isArray(value)) return DataType.ARRAY
      if (typeof value === 'object') return DataType.OBJECT
      if (typeof value === 'string') return DataType.STRING
      if (typeof value === 'number') return DataType.NUMBER
      if (typeof value === 'boolean') return DataType.BOOLEAN
      return DataType.NULL
    },

    // Helper method to generate unique node IDs
    generateNodeId(): string {
      return `node-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    },

    // 입력 검증 메서드
    validateInput(): ParseError | null {
      const text = this.inputText.trim()

      // JSONL에서 빈 입력은 오류
      if (!text && this.inputType === InputType.JSONL) {
        return {
          message: 'JSONL 형식에는 최소 한 줄의 JSON 데이터가 필요합니다.'
        }
      }

      // 일반적인 빈 입력은 오류가 아님
      if (!text) {
        return null
      }

      // 대용량 데이터 체크
      if (text.length > DEFAULT_CONFIG.MAX_INPUT_SIZE) {
        return {
          message: `입력 크기가 너무 큽니다. 최대 ${Math.floor(DEFAULT_CONFIG.MAX_INPUT_SIZE / 1024 / 1024)}MB까지 지원됩니다.`
        }
      }

      // 메모리 사용량 추정 체크
      const estimatedMemoryUsage = text.length * 4 // 대략적인 메모리 사용량 추정
      const maxMemoryUsage = 100 * 1024 * 1024 // 100MB

      if (estimatedMemoryUsage > maxMemoryUsage) {
        return {
          message: '입력 데이터가 너무 커서 메모리 부족이 예상됩니다. 더 작은 데이터를 사용해주세요.'
        }
      }

      // JSONL 특화 검증
      if (this.inputType === InputType.JSONL) {
        const lines = text.split('\n').filter(line => line.trim())

        if (lines.length === 0) {
          return {
            message: 'JSONL 형식에는 최소 한 줄의 JSON 데이터가 필요합니다.'
          }
        }

        if (lines.length > 10000) {
          return {
            message: 'JSONL 형식에서는 최대 10,000줄까지 지원됩니다.'
          }
        }
      }

      return null
    },

    // 메모리 사용량 체크
    checkMemoryUsage(): boolean {
      try {
        // performance.memory가 있는 경우 실제 메모리 사용량 체크
        if ('memory' in performance) {
          const memory = (performance as any).memory
          const usedMemory = memory.usedJSHeapSize
          const memoryLimit = memory.jsHeapSizeLimit

          // 메모리 사용률이 80%를 넘으면 경고
          if (usedMemory / memoryLimit > 0.8) {
            console.warn('메모리 사용률이 높습니다:', Math.round(usedMemory / memoryLimit * 100) + '%')
            return false
          }
        }
        return true
      } catch (error) {
        console.warn('메모리 사용량을 확인할 수 없습니다:', error)
        return true
      }
    },

    // JSONL 파싱 메서드 (부분적 성공 지원)
    parseJsonLines(): { data: ParsedNode[], warnings: ParseError[] } {
      const lines = this.inputText.split('\n')
      const data: ParsedNode[] = []
      const warnings: ParseError[] = []
      let successCount = 0

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        // 빈 줄은 건너뛰기
        if (!line) continue

        try {
          const parsed = JSON.parse(line)
          successCount++
          data.push(this.convertToNode(parsed, `Line ${successCount}`, 0))
        } catch (lineError) {
          const lineStart = this.inputText.split('\n').slice(0, i).join('\n').length + (i > 0 ? 1 : 0)

          warnings.push({
            message: `Line ${i + 1}: ${lineError instanceof Error ? lineError.message : 'Invalid JSON'}`,
            line: i + 1,
            column: 0,
            position: lineStart
          })

          // 너무 많은 오류가 발생하면 중단
          if (warnings.length >= 10) {
            warnings.push({
              message: `너무 많은 오류가 발생했습니다. 처음 10개 오류만 표시됩니다.`
            })
            break
          }
        }
      }

      return { data, warnings }
    },

    // 오류 라인 하이라이팅을 위한 정보 제공
    getErrorLineInfo(): { lineNumber: number, columnNumber: number } | null {
      if (!this.parseError || !this.parseError.line) {
        return null
      }

      return {
        lineNumber: this.parseError.line,
        columnNumber: this.parseError.column || 0
      }
    },

    // 캐시 키 생성
    generateCacheKey(): string {
      const content = this.inputText.trim()
      const type = this.inputType

      // 간단한 해시 함수 (실제 프로덕션에서는 더 강력한 해시 함수 사용 권장)
      let hash = 0
      const str = `${type}:${content}`

      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // 32비트 정수로 변환
      }

      return `parse_${Math.abs(hash)}`
    },

    // 캐시에서 결과 가져오기
    getCachedResult(key: string): ParseCache | null {
      const cached = this._parseCache.get(key)

      if (!cached) return null

      // 캐시 만료 시간 체크 (5분)
      const maxAge = 5 * 60 * 1000
      if (Date.now() - cached.timestamp > maxAge) {
        this._parseCache.delete(key)
        return null
      }

      return cached
    },

    // 캐시에 결과 저장
    setCachedResult(key: string, data: ParsedNode[], error: ParseError | null) {
      // 캐시 크기 제한 (최대 10개)
      if (this._parseCache.size >= 10) {
        // 가장 오래된 항목 제거
        const oldestKey = Array.from(this._parseCache.keys())[0]
        this._parseCache.delete(oldestKey)
      }

      this._parseCache.set(key, {
        key,
        data: JSON.parse(JSON.stringify(data)), // 깊은 복사
        error: error ? { ...error } : null,
        timestamp: Date.now()
      })
    },

    // 캐시 초기화
    clearCache() {
      this._parseCache.clear()
    }
  },

  getters: {
    hasData: (state) => state.parsedData.length > 0,
    hasError: (state) => state.parseError !== null,
    isValidInput: (state) => state.inputText.trim().length > 0 && !state.parseError
  }
})