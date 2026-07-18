# Google AdSense 적용 가이드

광고 배너 수익화를 위한 준비 작업 기록과 남은 절차. (작성일: 2026-07-18)

## 현재 상태

**코드 준비 완료.** 도메인 확보 → 애드센스 가입 → 승인 → 환경변수 설정만 남음.

## 완료된 작업

### 1. 심사 대비 콘텐츠 페이지

애드센스는 "도구 한 페이지짜리 사이트"를 **가치가 낮은 콘텐츠**로 탈락시키는 경우가 많아, 크롤링 가능한 콘텐츠 페이지를 추가함.

| 경로 | 내용 | 구현 |
|------|------|------|
| `/guide` | JSON/JSONL 사용 가이드 | 기존 도움말 모달 컴포넌트(DataTypeGuide, PerformanceTips, TroubleshootingGuide) 재사용 |
| `/faq` | 자주 묻는 질문 | 기존 FAQSection 재사용 |
| `/about` | 서비스 소개 + 문의처 | 신규 작성 (한/영) |
| `/privacy` | 개인정보처리방침 | 신규 작성 (한/영). GA 쿠키·애드센스 광고 쿠키 고지 포함 — **심사 필수 요건** |

관련 변경:

- `DefaultLayout.vue`에 푸터 추가 — 크롤러가 페이지를 발견하는 경로
- `public/_redirects` 추가 — Netlify SPA fallback. 없으면 `/guide` 직접 접속 시 404 (심사 탈락 사유)
- `public/sitemap.xml` — 존재하지 않던 24개 URL을 실제 페이지 5개로 정리
- `index.html`에 meta description 추가
- 라우터: 페이지별 `document.title`, 없는 경로는 홈으로 리다이렉트
- 스모크 테스트: `src/__tests__/pages/contentPages.test.ts`

### 2. 광고 배너 컴포넌트

`src/components/common/AdBanner.vue` — `DefaultLayout` 본문과 푸터 사이에 배치(모든 페이지 하단).

- 환경변수 미설정 시 DOM에 렌더링되지 않음 (현재 화면 영향 없음)
- 설정 시 adsbygoogle 스크립트를 1회 로드하고 반응형 광고 영역 렌더링
- 광고 차단기로 push 실패해도 앱 동작에 영향 없음
- 테스트: `src/__tests__/components/AdBanner.test.ts`

## 남은 절차 (순서대로)

### 1. 도메인 확보

- 애드센스는 `*.netlify.app` 같은 호스팅 서브도메인을 등록할 수 없음 → **본인 소유 도메인 필수**
- sitemap.xml은 `https://jsonl-parser.com` 기준으로 작성되어 있음. 다른 도메인 구매 시 sitemap 수정 필요
- Netlify: Site settings → Domain management에서 커스텀 도메인 연결

### 2. 애드센스 가입 및 심사 신청

1. [adsense.google.com](https://adsense.google.com) 가입 — 사이트 URL, 국가(한국), 수취인 정보 입력
2. 발급되는 `ca-pub-XXXXXXXXXXXXXXXX` 게시자 ID의 심사 스크립트를 `index.html` `<head>`에 추가 (GA 태그 아래):
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
   ```
3. 배포 후 애드센스 콘솔에서 심사 요청 → 보통 며칠~2주 소요
4. 탈락 시 사유 확인 후 보완하여 재신청 가능

### 3. 승인 후 광고 활성화 (코드 수정 불필요)

1. 애드센스 콘솔에서 광고 단위(디스플레이 광고) 생성 → 슬롯 ID 발급
2. Netlify → Site settings → Environment variables에 설정 후 재배포:
   ```
   VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
   VITE_ADSENSE_SLOT=XXXXXXXXXX
   ```
   (로컬 확인은 `.env` 파일 — `.env.example` 참고)
3. `ads.txt` 권장: `public/ads.txt`에 아래 한 줄 추가 (pub- 뒤 16자리는 본인 ID)
   ```
   google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
   ```

## 참고

- 수익 지급: 누적 $100 도달 시 등록된 은행 계좌로 지급 (최초 지급 전 핀 우편 인증 필요)
- 문의처 이메일은 `/about`, `/privacy` 페이지에 `lived1024@taxai.co.kr`로 기재됨 — 변경 시 두 페이지 수정
