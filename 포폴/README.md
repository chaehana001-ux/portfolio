# MEJINAVI 2026 · Clone Study

참고: https://www.mejiro.ac.jp/univ/mejinavi2026/

HTML / CSS / JavaScript 기반의 **원본 리소스를 활용한 로컬 복제본**입니다. 처음부터 직접 작성한 클론 구현이 아니라, 원본 페이지의 HTML·CSS·JavaScript·이미지를 내려받아 로컬 경로로 수정한 버전입니다. 원본의 시각 디자인과 복잡한 애니메이션을 보존하는 첫 단계이며, 이후 개인 포트폴리오 콘텐츠로 변경할 수 있습니다.

## 실행

Node.js 22 이상에서 `start.cmd`를 실행하거나 이 폴더에서 다음을 실행합니다.

```sh
npm start
```

브라우저에서 http://localhost:4173 을 엽니다. 별도 패키지 설치나 빌드가 필요 없습니다. ES module을 사용하므로 HTML 파일을 더블클릭하는 대신 로컬 서버로 실행하세요.

## Vercel 배포

GitHub의 `portfolio` 저장소를 가져와 Framework Preset을 `Other`로 선택합니다.
Root Directory가 저장소 루트(`.`)이면 루트의 `vercel.json`이 `mejinavi-clone/dist`를 배포합니다.
Root Directory를 `mejinavi-clone`으로 지정하면 해당 폴더의 `vercel.json`이 `dist`를 배포합니다.
Build Command와 Output Directory는 설정 파일을 사용하고 대시보드의 별도 Override는 끕니다.

`npm run build`는 JavaScript 구문, 정적 파일 경로와 파일명 대소문자를 검사합니다.
별도 환경변수와 의존성 설치는 필요하지 않습니다. `npm start`는 로컬 확인용 서버이며 Vercel에서는 실행하지 않습니다.

브라우저 검증: 로컬 서버와 포트 9223의 Chromium 디버깅 세션을 실행한 뒤 `node scripts/check-deployment-browser.mjs`를 사용합니다.
데스크톱·모바일에서 분석 카드 전환, 자료별 이미지 3장, 확대창 크기, Q&A, 실행 오류와 HTTP 오류를 검사합니다.

## 파일 구성

- `dist/index.html`: 전체 페이지 마크업 및 SVG 일러스트
- `dist/assets/css/style.css`: 원본 반응형 스타일
- `dist/assets/js/bundle.js`: 원본 애니메이션 런타임(외부 라이브러리 포함)
- `dist/assets/img/`: 로컬 이미지와 모바일/고해상도 버전
- `dist/styles.css`: 수정·확장용 CSS
- `dist/script.js`: 직접 작성한 키보드 및 링크 접근성 보완
- `scripts/serve.mjs`: 의존성 없는 로컬 서버
- `scripts/check.mjs`: 로컬 파일 및 섹션 검사 (`npm run check`)

## 범위와 출처

메인 페이지의 일러스트 히어로, 메뉴, MESSAGES, MEJIRO DATA, LOOKBOOK, ADMISSIONS, MOVIE 및 관련 팝업을 포함합니다. 외부 대학 안내 페이지·SNS·영상은 원래 사이트 링크로 연결됩니다. Google Fonts와 YouTube 영상은 인터넷 연결이 필요합니다.

원본 Google Tag Manager는 제거했으며, 비공식 학습용 복제본임을 화면에 표시했습니다. 원본 디자인·텍스트·사진·일러스트·기존 코드의 권리는 각 권리자에게 있습니다. 본인이 작성한 디자인이나 코드로 표기하지 마세요. 개인 포트폴리오로 전환할 때 소개·프로젝트·이미지와 브랜딩을 교체하세요.
