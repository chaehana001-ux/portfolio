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
