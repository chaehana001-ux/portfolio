# HANA Portfolio

UI/UX 디자인·프론트엔드·영상 작업을 소개하는 정적 포트폴리오입니다.

## 실행과 검사

Node.js 22 이상에서 이 폴더 기준으로 실행합니다.

```sh
npm start
npm run build
```

로컬 주소는 http://localhost:4173 입니다. 별도 패키지 설치는 필요하지 않습니다.
저장소 루트에서는 `npm --prefix 포폴 start` 또는 `npm --prefix 포폴 run build`를 사용합니다.

## 주요 파일

- `index.html`: 페이지 본문·프로젝트·갤러리·Q&A·컨택트
- `styles.css`: 컴포넌트 스타일
- `page-flow.css`: 섹션 간격과 최종 스타일 조정
- `script.js`: 히어로·헤더·스크롤 내비게이션·갤러리 등 상호작용
- `all-projects.js`, `all-projects.css`: 프로젝트 탐색과 개인 프로젝트 제목
- `diptyque-story.js`, `diptyque-story.css`: 딥티크 프로젝트 상세
- `team-preview.html`: 딥티크 목업의 실시간 미리보기에서 사용
- `assets/`: 현재 정적 리소스와 공통 스타일·애니메이션 런타임
- `scripts/serve.mjs`, `scripts/check.mjs`: 로컬 서버와 정적 경로 검사
- `scripts/`: 로컬 실행·정적 검사·브라우저 검증 도구. 이전 일회성 제작 스크립트는 정리했습니다.
- `.preview/`: 브라우저 검사를 실행할 때만 생성되는 임시 캡처 폴더입니다. 사이트 실행·배포에는 필요하지 않아 삭제해도 됩니다.

CULITA 목업은 로컬 히어로 캡처 이미지를 사용합니다.
링크 공유 이미지는 `assets/img/og/hana-hero-share-v1.png`입니다.

## 배포

저장소 루트의 `vercel.json`은 `포폴` 폴더를 배포합니다.
`포폴`을 프로젝트 루트로 선택할 경우 이 폴더의 `vercel.json`을 사용합니다.
로컬 수정은 재배포 후 공개 사이트에 반영됩니다.

## 공통 코드와 출처

`assets/css/style.css`와 `assets/js/bundle.js`에는 초기 MEJINAVI 참고 작업에서 가져온 공통 코드와 외부 라이브러리가 포함돼 있습니다.
현재 레이아웃과 애니메이션에 연결돼 있으므로 사용 여부를 확인하지 않고 삭제하지 마세요.
기존 코드·리소스의 권리는 각 권리자에게 있습니다.
