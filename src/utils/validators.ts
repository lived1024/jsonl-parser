/**
 * 유효성 검사 함수들
 */

export const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

/**
 * 입력이 JSONL 형식인지 감지하는 함수
 * JSON 파싱이 실패했을 때 JSONL일 가능성을 체크
 */
export const detectJSONL = (str: string): boolean => {
  const trimmed = str.trim()
  if (!trimmed) return false
  
  // 여러 줄로 구성되어 있는지 확인
  const lines = trimmed.split('\n').filter(line => line.trim())
  if (lines.length < 2) return false
  
  // 각 줄이 유효한 JSON인지 확인 (최소 2줄 이상)
  let validJsonLines = 0
  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine) continue
    
    try {
      JSON.parse(trimmedLine)
      validJsonLines++
    } catch {
      // 하나라도 유효하지 않으면 JSONL이 아님
      return false
    }
  }
  
  // 최소 2줄 이상의 유효한 JSON이 있어야 JSONL로 판단
  return validJsonLines >= 2
}

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}