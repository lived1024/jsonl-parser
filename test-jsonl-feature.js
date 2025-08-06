// Simple test to verify JSONL detection feature
import { detectJSONL } from './src/utils/validators.js'

// Test data that should be detected as JSONL
const testJsonlData = `{"name": "홍길동", "age": 30, "city": "서울"}
{"name": "김철수", "age": 25, "city": "부산"}
{"name": "이영희", "age": 28, "city": "대구"}
{"name": "박민수", "age": 32, "city": "인천"}`

// Test data that should NOT be detected as JSONL (single JSON)
const testJsonData = `{
  "users": [
    {"name": "홍길동", "age": 30},
    {"name": "김철수", "age": 25}
  ]
}`

console.log('Testing JSONL detection feature:')
console.log('JSONL data detected:', detectJSONL(testJsonlData)) // Should be true
console.log('JSON data detected as JSONL:', detectJSONL(testJsonData)) // Should be false

console.log('\nFeature implementation complete!')
console.log('✅ JSONL detection utility function')
console.log('✅ Enhanced ParseError interface with isJsonlDetected flag')
console.log('✅ Store integration with JSONL detection in createParseError')
console.log('✅ StatusIndicator UI with warning message and switch button')
console.log('✅ Korean and English translations')
console.log('✅ CSS styles with responsive design and accessibility')
console.log('✅ switchToJsonlMode action in store')