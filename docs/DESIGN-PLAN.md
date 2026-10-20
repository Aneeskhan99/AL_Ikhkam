# Design plan

## Brief

- **Subject:** Al-Ihkam, Shariah advisory and an Islamic finance academy in Islamabad and Rawalpindi.
- **Audience:** compliance heads at banks and asset managers, finance professionals and SME owners.
- **Main job of the site:** earn trust quickly, then get a consultation booked or a programme enquiry sent.

## Concept: precision

*Ihkam* (إحكام) means to make a thing firm, exact and free of flaw. The word comes from Surah Hud 11:1, *"kitābun uḥkimat āyātuh"*, "a Book whose verses have been made firm and precise". The whole site is built around that idea. It should read like a scholarly journal or a serious law firm, not a bank advert. That means restrained layouts, exact typography, hairline rules and real substance.

## Palette

| Name | Hex | Use |
|---|---|---|
| Ink | `#13261f` | Text, dark sections, footer |
| Malachite | `#1f4d3e` | Primary buttons, links (continuity with the original green brand) |
| Limestone | `#e9ebe5` | Page background, cool rather than cream |
| Vellum | `#f6f7f3` | Panels and form fields |
| Brass | `#a07d35` | Rules, step numerals, seals, the verse |
| Seal | `#7b2d26` | Error messages only |

Brass replaces the bright gold of the original. The cool limestone background avoids the warm-cream look that most generated sites share.

## Type

- **Libre Caslon Display and Text** for headlines, titles and quotations. Caslon is the type of legal and scholarly printing.
- **Hanken Grotesk** for body text and interface.
- **Amiri** for Arabic: the verse, the wordmark and Quranic quotations.
- **Noto Nastaliq Urdu** for every Urdu page, with generous line height.

All fonts are bundled with the site, so they load without depending on Google Fonts.

## Layout

- The page content is left-aligned on a 1240px grid. Headlines run large, and paragraphs are capped at about 62 characters per line.
- Content is shown as editorial index lists separated by hairline rules, rather than rows of identical rounded cards.
- Numbers appear only where the content really is a sequence: the four review stages and the programme modules.
- The memorable moment is the dark "name" band, with the verse set large in brass Arabic beside its meaning.
- There is one orchestrated motion moment: the hero headline rises and the image unveils on load. Motion is disabled when the visitor prefers reduced motion.
- All direction-sensitive spacing uses CSS logical properties, so Urdu mirrors correctly.

## Imagery

Imagery comes from ElevenLabs (Seedream 5 Pro): light through a carved jali screen, a scholar's desk with a sealed document, a seminar room behind a geometric lattice, a brass balance, modernist arches, and zellige tiles. It contains no people, no fake faculty portraits and no generated Arabic lettering. All real Arabic is set in type.
