/**
 * Error message service for internationalized error handling
 */

import { useI18nStore } from '../stores/i18nStore'
import { ParseError } from '../types'
import { DEFAULT_CONFIG } from '../types/constants'

export class ErrorMessageService {
  private static instance: ErrorMessageService

  static getInstance(): ErrorMessageService {
    if (!ErrorMessageService.instance) {
      ErrorMessageService.instance = new ErrorMessageService()
    }
    return ErrorMessageService.instance
  }

  private getI18nStore() {
    return useI18nStore()
  }

  /**
   * Create a localized parse error from a JavaScript error
   */
  createParseError(error: unknown, inputText: string, inputType: string): ParseError {
    if (error instanceof SyntaxError) {
      // Try to extract position information from JSON.parse error
      const message = error.message
      const positionMatch = message.match(/position (\d+)/)
      const position = positionMatch ? parseInt(positionMatch[1]) : undefined

      // Calculate line and column from position
      let line: number | undefined
      let column: number | undefined

      if (position !== undefined) {
        const textBeforeError = inputText.substring(0, position)
        const lines = textBeforeError.split('\n')
        line = lines.length
        column = lines[lines.length - 1].length + 1
      }

      // Check if JSONL format is detected when parsing as JSON fails
      const isJsonlDetected = inputType === 'json' && this.detectJSONL(inputText)

      return {
        message: this.getI18nStore().getTranslation('errors.parsing.jsonSyntax', { message }),
        line,
        column,
        position,
        isJsonlDetected
      }
    }

    return {
      message: error instanceof Error 
        ? this.getI18nStore().getTranslation('errors.parsing.jsonSyntax', { message: error.message })
        : this.getI18nStore().getTranslation('errors.parsing.unknownError')
    }
  }

  /**
   * Create validation error messages
   */
  createValidationError(type: string, params?: Record<string, any>): ParseError {
    const messageKey = `errors.validation.${type}`
    return {
      message: this.getI18nStore().getTranslation(messageKey, params)
    }
  }

  /**
   * Create JSONL line error message
   */
  createJsonlLineError(lineNumber: number, error: unknown, position: number): ParseError {
    const errorMessage = error instanceof Error ? error.message : this.getI18nStore().getTranslation('errors.parsing.invalidJson')
    
    return {
      message: this.getI18nStore().getTranslation('errors.parsing.jsonlLine', { 
        line: lineNumber, 
        message: errorMessage 
      }),
      line: lineNumber,
      column: 0,
      position
    }
  }

  /**
   * Create partial success message for JSONL parsing
   */
  createPartialSuccessError(errorCount: number, successCount: number, firstError: ParseError): ParseError {
    return {
      message: this.getI18nStore().getTranslation('errors.validation.partialSuccess', {
        errorCount,
        successCount
      }),
      line: firstError.line,
      column: firstError.column,
      position: firstError.position
    }
  }

  /**
   * Create too many errors message
   */
  createTooManyErrorsMessage(maxErrors: number = 10): ParseError {
    return {
      message: this.getI18nStore().getTranslation('errors.validation.tooManyErrors', { maxErrors })
    }
  }

  /**
   * Get localized line label for JSONL parsing
   */
  getLineLabel(lineNumber: number): string {
    return this.getI18nStore().getTranslation('errors.jsonl.linePrefix', { line: lineNumber })
  }

  /**
   * Simple JSONL detection (copied from validators.ts to avoid circular dependency)
   */
  private detectJSONL(str: string): boolean {
    const trimmed = str.trim()
    if (!trimmed) return false
    
    // Check if it has multiple lines
    const lines = trimmed.split('\n').filter(line => line.trim())
    if (lines.length < 2) return false
    
    // Check if each line is valid JSON (minimum 2 lines)
    let validJsonLines = 0
    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine) continue
      
      try {
        JSON.parse(trimmedLine)
        validJsonLines++
      } catch {
        // If any line is invalid, it's not JSONL
        return false
      }
    }
    
    // Must have at least 2 valid JSON lines to be considered JSONL
    return validJsonLines >= 2
  }
}

// Export singleton instance
export const errorMessageService = ErrorMessageService.getInstance()