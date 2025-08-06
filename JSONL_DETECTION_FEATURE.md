# JSONL Detection Feature Implementation

## Overview
Added a feature that detects when users input valid JSONL data while in JSON parsing mode, displays a warning message, and provides a button to automatically switch to JSONL mode.

## Implementation Details

### 1. JSONL Detection Logic (`src/utils/validators.ts`)
- Added `detectJSONL()` function that:
  - Checks if input has multiple lines
  - Validates that each line is valid JSON
  - Requires at least 2 valid JSON lines to be considered JSONL
  - Handles empty lines gracefully

### 2. Enhanced Error Interface (`src/types/index.ts`)
- Extended `ParseError` interface with `isJsonlDetected?: boolean` flag
- This flag indicates when JSONL format is detected during JSON parsing failure

### 3. Store Integration (`src/stores/jsonTreeStore.ts`)
- Modified `createParseError()` method to detect JSONL when JSON parsing fails
- Added `switchToJsonlMode()` action to change input type and re-parse
- Integrated JSONL detection with existing error handling flow

### 4. UI Components (`src/components/ui/StatusIndicator.vue`)
- Added JSONL detection warning section in error display
- Includes warning icon, descriptive text, and action button
- Button calls `handleSwitchToJsonl()` to switch modes automatically

### 5. Component Logic (`src/components/ui/StatusIndicator.ts`)
- Added `handleSwitchToJsonl()` function that calls store's `switchToJsonlMode()`
- Integrated with existing StatusIndicator composable

### 6. Styling (`src/components/ui/StatusIndicator.css`)
- Added `.jsonl-detection-warning` styles with:
  - Gradient background with warning colors
  - Responsive design for mobile devices
  - Accessibility support (high contrast, reduced motion)
  - Hover effects and transitions

### 7. Internationalization
- **Korean** (`src/locales/ko.ts`):
  - `output.error.jsonlDetected.title`: "JSONL 형식이 감지되었습니다"
  - `output.error.jsonlDetected.description`: "입력된 데이터가 JSONL(JSON Lines) 형식인 것 같습니다. JSON 타입을 JSONL로 변경하시겠습니까?"
  - `output.error.jsonlDetected.switchButton`: "JSONL로 변경"

- **English** (`src/locales/en.ts`):
  - `output.error.jsonlDetected.title`: "JSONL Format Detected"
  - `output.error.jsonlDetected.description`: "The input data appears to be in JSONL (JSON Lines) format. Would you like to switch to JSONL mode?"
  - `output.error.jsonlDetected.switchButton`: "Switch to JSONL"

### 8. Testing (`src/__tests__/validators.test.ts`)
- Comprehensive test suite for `detectJSONL()` function
- Tests various scenarios:
  - Valid JSONL with multiple objects
  - JSONL with empty lines
  - Single JSON (should not detect as JSONL)
  - Invalid JSONL with malformed lines
  - Edge cases (empty input, single line)
  - Mixed data types in JSONL format

## User Experience Flow

1. **User inputs JSONL data in JSON mode**
   ```
   {"name": "홍길동", "age": 30}
   {"name": "김철수", "age": 25}
   {"name": "이영희", "age": 28}
   ```

2. **JSON parsing fails** - Standard JSON.parse() error occurs

3. **JSONL detection triggers** - System detects the input is valid JSONL

4. **Warning displayed** - User sees:
   - Error message with JSON parsing failure
   - Warning box: "JSONL 형식이 감지되었습니다"
   - Description explaining the situation
   - "JSONL로 변경" button

5. **One-click solution** - User clicks button and:
   - Input type automatically switches to JSONL
   - Data is re-parsed successfully
   - Tree view displays the parsed JSONL data

## Technical Benefits

- **Automatic Detection**: No manual format identification needed
- **Seamless UX**: One-click solution to common user mistake
- **Robust Logic**: Handles edge cases and validates thoroughly
- **Accessible**: Full keyboard navigation and screen reader support
- **Responsive**: Works on all device sizes
- **Internationalized**: Supports multiple languages
- **Well-tested**: Comprehensive test coverage

## Files Modified

1. `src/utils/validators.ts` - Added JSONL detection function
2. `src/types/index.ts` - Extended ParseError interface
3. `src/stores/jsonTreeStore.ts` - Integrated detection and switch logic
4. `src/components/ui/StatusIndicator.vue` - Added warning UI
5. `src/components/ui/StatusIndicator.ts` - Added switch handler
6. `src/components/ui/StatusIndicator.css` - Added warning styles
7. `src/locales/ko.ts` - Added Korean translations
8. `src/locales/en.ts` - Added English translations
9. `src/__tests__/validators.test.ts` - Added comprehensive tests

## Testing

All JSONL detection tests pass (11/11):
- ✅ Valid JSONL format detection
- ✅ JSONL with empty lines handling
- ✅ Single JSON rejection
- ✅ Invalid JSONL rejection
- ✅ Edge case handling
- ✅ Mixed data type support

The feature is ready for production use and provides a significant improvement to user experience when working with JSONL data.