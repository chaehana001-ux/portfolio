# HANA Portfolio

UI/UX 디자인과 웹 퍼블리싱, 영상 작업을 소개하는 개인 포트폴리오입니다. 프로젝트의 기획 과정부터 화면 구성, 구현 결과와 작업하며 배운 점까지 담았습니다.

**사이트:** [HANA Portfolio](https://portfolio-lac-eight-c3v8s16wj4.vercel.app/)

## 포트폴리오 구성

- **About Me** — 디자인을 시작하게 된 이야기와 작업을 바라보는 기준을 소개합니다.
- **Team Project · Diptyque Renewal** — 딥티크 웹사이트를 팀으로 리뉴얼한 프로젝트입니다. `For The Planet` 페이지 구성과 스크롤 인터랙션, 반응형 작업을 소개하고, 프로젝트 진행 과정과 직접 작업한 화면을 함께 보여줍니다. 컬렉션 소개, 공통 푸터, 장바구니, 상품문의와 1:1 문의 디자인을 확인할 수 있습니다.
- **Personal Project · CULITA** — 마우스워시 브랜드 메시지와 제품 탐색 흐름을 담은 웹사이트입니다. 제품 비주얼과 스크롤 인터랙션, 반응형 화면을 구성했습니다. [사이트 보기](https://website1-tau-six.vercel.app/)
- **Personal Project · KARST** — 스톤 페이퍼 노트와 창작 도구를 소개하는 브랜드 웹사이트입니다. 제품 컬렉션과 소재 이야기를 이미지, 영상과 스크롤 흐름으로 연결했습니다. [사이트 보기](https://website2-seven-iota.vercel.app/)
- **Movie** — `MONSTER` 세로형 숏폼과 `MacBook Pro` 콘셉트 광고 영상을 소개합니다.
- **Clone Coding** — [Whittaker’s Chocolate](https://clone-coding5.vercel.app/) 브랜드 웹사이트와 [TVING](https://clone-coding2-one.vercel.app/) 콘텐츠 탐색 화면을 구현했습니다.
- **Skills · Gallery · Q&A · Contact** — 사용하는 도구와 일상의 기록, 자주 묻는 질문, 연락처와 이력서를 담았습니다.

## 주요 기능

- 프로젝트 분류별 섹션 이동과 반응형 내비게이션
- 스크롤에 따라 전개되는 프로젝트 카드, 제목과 갤러리 인터랙션
- 팀 프로젝트 기획 자료 선택, 이미지 미리보기와 확대 보기
- 작업 화면 미리보기, 영상 재생 및 모바일 레이아웃
- 움직임 줄이기 설정을 고려한 인터랙션과 키보드 조작 지원
- 푸터의 이메일·GitHub 링크 및 PDF 이력서 열기

## 기술 구성

HTML, CSS, JavaScript로 제작한 정적 사이트입니다. 스크롤·캐러셀 등 일부 인터랙션에는 기존 번들에 포함된 GSAP, ScrollTrigger, Swiper 등의 라이브러리를 사용합니다. 배포에는 Vercel을 사용합니다.

딥티크 프로젝트 목업 중 일부는 `team-preview.html`을 통해 외부에 배포된 팀 프로젝트를 불러옵니다. 따라서 해당 미리보기와 CDN 글꼴은 네트워크 연결 및 외부 서비스 상태에 영향을 받을 수 있습니다.

## 로컬 실행과 검사

Node.js 22 이상에서 실행합니다. 별도 패키지 설치는 필요하지 않습니다.

```sh
# 저장소 루트에서 실행
npm --prefix 포폴 start
```

```sh
# JavaScript 문법과 정적 리소스 경로 검사
npm --prefix 포폴 run build

# 정적 리소스 경로와 필수 섹션 검사
npm --prefix 포폴 run check
```

`포폴` 폴더 안에서는 각각 `npm start`, `npm run build`, `npm run check`로 실행할 수 있습니다. `scripts/`에는 별도로 실행하는 브라우저 확인 스크립트도 있습니다.

## 주요 파일

| 경로 | 역할 |
| --- | --- |
| `index.html` | 사이트 구조, 프로젝트 설명, 갤러리와 연락처 |
| `styles.css`, `page-flow.css` | 컴포넌트 디자인, 반응형 배치와 스타일 조정 |
| `typography.css` | 공통 텍스트 크기와 굵기 기준 |
| `script.js` | 히어로, 헤더, 프로젝트 프로세스와 갤러리 인터랙션 |
| `all-projects.js`, `all-projects.css` | 프로젝트 분류, 작업 화면 미리보기와 관련 스타일 |
| `diptyque-story.js`, `diptyque-story.css` | 딥티크 팀 프로젝트 상세 카드와 스타일 |
| `team-preview.html` | 딥티크 프로젝트의 기기 목업 미리보기 |
| `assets/` | 이미지, 영상, 글꼴 및 이력서 PDF 등 정적 리소스 |
| `scripts/serve.mjs`, `scripts/check.mjs` | 로컬 서버와 정적 검사 |
| `DESIGN_GUIDE.md` | 색상 및 타이포그래피 기준 |

## 배포와 참고 코드

저장소 루트의 `vercel.json`은 `포폴` 폴더를 정적 사이트로 빌드·배포합니다. `포폴` 폴더를 Vercel 프로젝트 루트로 사용하는 경우에는 해당 폴더의 `vercel.json`을 사용합니다. 로컬 변경 사항은 커밋·푸시 및 재배포 후 공개 사이트에 반영됩니다.

`assets/css/style.css`와 `assets/js/bundle.js`에는 초기 MEJINAVI 참고 작업의 공통 코드와 외부 라이브러리가 포함되어 있으며, 현재 레이아웃과 인터랙션에서도 사용합니다. 기존 코드와 리소스의 권리는 각 권리자에게 있습니다.
