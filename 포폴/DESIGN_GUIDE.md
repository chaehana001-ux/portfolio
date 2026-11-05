# Portfolio Design Guide

## Color system

The interface uses a custom palette curated for the portfolio's hand-drawn, tactile, and playful visual language.

| Role | Token | Value | Usage |
| --- | --- | --- | --- |
| Background | `--color-background` | `#FFF8F4` | Page backgrounds and open space |
| Surface | `--color-surface` | `#F6D7B0` | Cards, pills, and warm secondary sections |
| Soft accent | `--color-accent-soft` | `#C9B9E8` | Decorative fills and supporting sections |
| Strong accent | `--color-accent` | `#EFA9B8` | Active states, primary highlights, and focus cues |
| Ink | `--color-ink` | `#403752` | Body text, headings, borders, and icons |

`#403752` provides reliable contrast while feeling softer than black. Peach, lavender, and rose should support the project imagery rather than compete with it.

## Legacy token mapping

Existing components still use the original token names. They map to the semantic system as follows:

- `--palette-navy` → `--color-ink`
- `--palette-ivory` → `--color-background`
- `--palette-gold` → `--color-surface`
- `--palette-lavender` → `--color-accent-soft`
- `--palette-ivory-shade` → `--color-accent`

New components should use the semantic `--color-*` tokens. Legacy names should only be used when maintaining existing components.

## Usage rules

- Keep page backgrounds primarily `Background`; use `Surface` for contained cards.
- Use `Surface` for large decorative areas, `Soft accent` for secondary emphasis, and `Strong accent` for interactive highlights.
- Use `Ink` for readable text and structural borders. Do not use either cream as body text.
- Preserve visible focus outlines with `Strong accent` and sufficient contrast against the surrounding surface.
- Photographic project imagery keeps its original colors; the palette applies to interface chrome and illustrations.


## 본문·카드 폰트 크기와 굵기 확정 기준 · 2026-11-05

이 기준은 이전 타이포그래피 권장값보다 우선합니다. 적용 파일은 `포폴/typography.css`입니다.

**변경 범위는 font-size와 font-weight만입니다.** 기존 글꼴, 카드 width/height/min-height, 배치, 여백, 패딩, 줄 간격, 자간, 목업 크기는 변경하지 않습니다. 사이트 헤더·푸터와 iframe 속 프로젝트 사이트는 적용 대상에서 제외합니다. 텍스트 크기에 따른 줄바꿈은 달라질 수 있습니다.

| 역할 | PC (768px 이상) | 모바일 | 굵기 |
|---|---:|---:|---:|
| 섹션 제목 | 72px | 40px | 700 |
| 카드 제목 | 36px | 28px | 700 |
| 부제목 | 22px | 18px | 500 |
| 강조 문장 | 18px | 16px | 500 |
| 본문 | 16px | 15px | 400 |
| 항목 제목 | 16px | 15px | 700 |
| 라벨·버튼 | 12px | 12px | 500 |
| 보조 정보·캡션 | 13px | 12px | 400 |

- 팀 프로젝트, 개인 프로젝트, 영상, 클론 카드에 동일한 역할별 크기를 사용합니다.
- 카드별 임의 px, vw, clamp 크기를 추가하지 않습니다. 공통 `--type-*` 토큰을 사용합니다.
- 굵기는 400·500·700만 사용합니다. 강조는 공통 강조 문장 크기 안에서 처리합니다.
- 제목 안의 em/strong과 글자 애니메이션 span은 제목 크기·굵기를 상속합니다.
- 기존 폰트 패밀리는 유지합니다. 글꼴 교체는 이번 변경에 포함하지 않습니다.
- 이후 카드 크기를 변경해 글자를 맞추지 않습니다. 긴 문구는 기존 카드 안에서 자연스럽게 줄바꿈합니다.

- 기여 작업 카드 내부의 세 소제목(`.planet-work-copy > h3`)은 독립 카드 제목이 아닌 내부 부제목입니다. PC 22px / 모바일 18px, 굵기 700을 공통 적용합니다. 카드 크기·배치는 유지합니다.
