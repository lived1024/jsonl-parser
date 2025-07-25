// Data type enumeration for JSON values
export enum DataType {
  OBJECT = 'object',
  ARRAY = 'array',
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  NULL = 'null'
}

// Input type enumeration for parser mode
export enum InputType {
  JSON = 'json',
  JSONL = 'jsonl'
}

// Interface for parsed tree nodes
export interface ParsedNode {
  id: string
  key?: string
  value: any
  type: DataType
  children?: ParsedNode[]
  isExpanded: boolean
  depth: number
}

// Interface for parsing errors
export interface ParseError {
  message: string
  line?: number
  column?: number
  position?: number
}

// Interface for local storage data structure
export interface LocalStorageData {
  inputText: string
  inputType: InputType
  timestamp: number
}

// Pinia store state interface
export interface JsonTreeState {
  inputText: string
  inputType: InputType
  parsedData: ParsedNode[]
  parseError: ParseError | null
  isLoading: boolean
}

// Pinia store actions interface
export interface JsonTreeActions {
  setInputText(text: string): void
  setInputType(type: InputType): void
  parseInput(): void
  toggleNode(nodeId: string): void
  saveToLocalStorage(): void
  loadFromLocalStorage(): void
}

// Complete Pinia store interface
export interface JsonTreeStore extends JsonTreeState {
  // Actions will be available directly on the store instance
  setInputText: JsonTreeActions['setInputText']
  setInputType: JsonTreeActions['setInputType']
  parseInput: JsonTreeActions['parseInput']
  toggleNode: JsonTreeActions['toggleNode']
  saveToLocalStorage: JsonTreeActions['saveToLocalStorage']
  loadFromLocalStorage: JsonTreeActions['loadFromLocalStorage']
}