// Local storage keys
export const LOCAL_STORAGE_KEYS = {
  JSON_TREE_DATA: 'jsonl-parser-data'
} as const

// Default configuration values
export const DEFAULT_CONFIG = {
  MAX_DEPTH: 50,
  AUTO_EXPAND_DEPTH: 2,
  MAX_INPUT_SIZE: 10 * 1024 * 1024, // 10MB
  DEBOUNCE_DELAY: 300 // milliseconds
} as const

// UI constants
export const UI_CONSTANTS = {
  INDENT_SIZE: 20, // pixels per depth level
  NODE_HEIGHT: 24, // pixels
  PANEL_MIN_WIDTH: 300 // pixels
} as const

// Import DataType for the color constants
import { DataType } from './index'

// Color scheme for different data types
export const TYPE_COLORS = {
  [DataType.OBJECT]: '#6f42c1',
  [DataType.ARRAY]: '#fd7e14', 
  [DataType.STRING]: '#28a745',
  [DataType.NUMBER]: '#007bff',
  [DataType.BOOLEAN]: '#ffc107',
  [DataType.NULL]: '#6c757d'
} as const