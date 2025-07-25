import { DataType, ParsedNode } from './index'

// Utility type for node creation parameters
export interface NodeCreationParams {
  data: any
  key?: string
  depth: number
  parentId?: string
}

// Utility type for parsing options
export interface ParseOptions {
  maxDepth?: number
  autoExpand?: boolean
  expandDepth?: number
}

// Utility type for tree statistics
export interface TreeStatistics {
  totalNodes: number
  maxDepth: number
  nodeTypeCount: Record<DataType, number>
}

// Utility type for node position in tree
export interface NodePosition {
  nodeId: string
  path: string[]
  depth: number
  index: number
}

// Type guard functions
export const isObjectType = (node: ParsedNode): boolean => 
  node.type === DataType.OBJECT

export const isArrayType = (node: ParsedNode): boolean => 
  node.type === DataType.ARRAY

export const isExpandableType = (node: ParsedNode): boolean => 
  node.type === DataType.OBJECT || node.type === DataType.ARRAY

export const isPrimitiveType = (node: ParsedNode): boolean => 
  !isExpandableType(node)

// Helper function to determine data type
export const getDataType = (value: any): DataType => {
  if (value === null) return DataType.NULL
  if (Array.isArray(value)) return DataType.ARRAY
  if (typeof value === 'object') return DataType.OBJECT
  if (typeof value === 'string') return DataType.STRING
  if (typeof value === 'number') return DataType.NUMBER
  if (typeof value === 'boolean') return DataType.BOOLEAN
  return DataType.NULL
}