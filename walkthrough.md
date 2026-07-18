# 애드코드(ADCODE) 사이트 — 작업 가이드

다음에 작업할 때 이 문서부터 읽고 구조를 파악할 것.
자세한 변경 히스토리/의도는 `git log` 참고.

## 무엇인가
- **빌드 없는 순수 정적 사이트.** React/Vite/npm 아님. `package.json` 없음.
- HTML 파일을 **직접 수정**하고, 정적 호스팅(Vercel)으로 배포.
- 미리보기: 루트에서 `python -m http.server` → `http://localhost:8000`.
  (경로가 절대경로 `/style.css`, `/public/...` 라서 반드시 루트를 서버 루트로 띄워야 함. 파일 더블클릭으로는 깨짐.)

## 활성 페이지 (현재 운영 = 리뉴얼된 것)
- `index.html` — 메인 (히어로/마퀴/문의폼/푸터)
- `about.html` — 회사소개 (히어로/슬로건/조직도/오시는길)
- `design.html` — DESIGN 리스트 (/design) → SNS · 상세페이지
- `design-sns.html` / `design-detail.html` — 2depth (가이드 대기)
- `portfolio.html` / `portfolio-detail.html` — CONTENT

활성 페이지 공통:
- 공유 스타일시트 `/style.css` 한 장을 링크.
- GNB: `nav.js`, 마퀴: `marquee.js`

### 구버전 / 미사용
- `performance.html`, `viral.html`, `offline.html` — 리뉴얼 이전 옛 페이지. 건드리지 말 것(요청 없으면).
- `components/header.html`, `components/footer-contact.html` — **어느 HTML에서도 참조 안 됨**(과거 조각). 무시.
- `clean_links.js` — 보조 스크립트, 평소 안 씀.
- 루트의 `*.jpg`(marketing.jpg 등) — 옛 자산. 현재 페이지는 `public/` 자산을 씀.

## 자산 위치 규칙
이미지/자산은 `public/` 아래, HTML/CSS에서 **절대경로**로 참조.
- `public/logo/adcode_logo_white_500w.png` — 로고
- `public/design/main_img.png` — 메인 히어로 배경 이미지
- `public/hero/hl-flow.svg`, `hl-work.svg` — 메인 헤드라인 인라인 아이콘
- `public/about/about_1.png` ~ `about_5.png` — 회사소개용 이미지
  - `about_2.png` = 회사소개 슬로건 섹션(`.about-slogan`) 배경

## 스타일 시스템 (style.css, ~2090줄)
- 상단 `:root` 에 디자인 토큰. **색/폰트/간격은 기존 변수 우선 사용.**
  - 색: `--bg`, `--bg-2`, `--fg`, `--fg-2`, `--red`(#c8181f) 등
  - 타이포 토큰: `--t-section`(clamp 36~72px), `--t-section-w/ls/lh`
- **모든 페이지/섹션 메인 제목은 공유 클래스 `.section-title` 사용** (토큰 기반).
  새 페이지 제목도 이 클래스로 통일. 섹션마다 폰트 변형을 새로 만들지 말 것.
  - 예외가 꼭 필요하면 해당 셀렉터에서만 `font-size` override 하고 주석으로 이유 명시.
    (현재 예외: `.about-hero-title` — "브랜드를 이해하고…" 만 1.5배 작게 override)
- CSS는 섹션별 주석 배너(`==== HERO ====` 등)로 구획. 한글 주석에 "키우면/줄이면" 식 조정 가이드가 곳곳에 있음.

## 인터랙션 메모
- 대부분 스크롤 진입 시 `.reveal` → IntersectionObserver 로 `.in-view`/`.played` 클래스 토글하는 패턴.
- 메인 히어로 라벨(`.hero-media-label`, "ADCODE / MARKETING")
  = index.html 인라인 JS 의 타이핑 효과. 두 `<span>`(ADCODE, MARKETING)을
  한 글자씩 출력, 입력 중 줄에 `.caret-on`(깜빡이는 캐럿) → **완료되면 캐럿 제거**.
  span 에 `min-height`로 두 줄 높이를 미리 확보해 레이아웃이 위로 밀리지 않게 함.

## 수정 원칙 (CLAUDE.md 요약)
- 변경은 **최소 범위**로. 요청과 무관한 인접 코드/포맷 건드리지 말 것.
- 불확실하면 가정만 하지 말고 먼저 물어볼 것.
- 기존 스타일/토큰을 따를 것. 새 추상화·과한 일반화 금지.

## 주의
- `.gitignore` 가 `*.md` 를 제외함 → 이 문서 포함 `.md` 는 **커밋 안 됨**(로컬 메모용).
- 배포는 정적 호스팅(`vercel.json` 존재). 별도 빌드 단계 없음.
