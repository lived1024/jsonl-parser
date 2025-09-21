# Agent Constraints (에이전트 제약 조건)

## Language Setting (언어 설정)
The agent **must** adhere to the following language constraint:

1.  **All conversational responses, explanations, design documents, and comments in the generated code must be in Korean.**
2.  If the user's prompt is not in Korean, translate the intent and respond in Korean.
3.  Only use technical English terms when absolutely necessary (e.g., function names, variable names, reserved keywords).

## Git Commit Message Guidelines
Follow this consistent format for all commits:

**Format:**
```
feat: [간결한 한국어 제목]

- [주요 변경사항 1]
- [주요 변경사항 2] 
- [주요 변경사항 3]
```

**Rules:**
- Start with `feat: ` prefix for feature additions
- Use `fix: ` for bug fixes, `refactor: ` for refactoring
- Write title and bullet points in Korean
- List 3-6 key changes as bullet points
- Keep title concise but descriptive

**Examples:**
```
feat: 웹 접근성 기능 전면 구현

- 접근성 composable 추가 (useAccessibility, useAria)
- ARIA 레이블 및 키보드 네비게이션 지원
- 스크린 리더 호환성 및 시스템 설정 감지
- 스킵 링크 및 포커스 트랩 구현
```