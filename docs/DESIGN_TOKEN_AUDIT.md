# River Design Token Audit

> **Goal:** Simplify the design system by merging tokens with negligible contrast differences.
> **Method:** Compare RGB distance and perceptual brightness. If two tokens are indistinguishable at normal viewing distance, merge them.

---

## COLORS — Merge Candidates

### Backgrounds (9 → 6)

| Keep | Absorb | Delta | Verdict |Arjun's Comments
|------|--------|-------|---------|---------|
| `#FAF8F0` bg/surface | `#FAF7ED` bg/page | R=0 G=1 B=3 | **Merge.** Literally indistinguishable. Use `#FAF8F0` everywhere. | Agreed. Keep bg/surface
| `#F0EBDA` bg/surface-warm | `#EFE8CF` bg/hover | R=1 G=3 B=11 | **Merge.** Very close warm beiges. Use `#F0EBDA`. | Agreed. keep bg/surface-warm
| `#F3F1EA` bg/nav-rest | `#F5F0DE` bg/toggle | R=2 G=1 B=12 | **Merge.** Both are "slightly warm off-white." Use `#F3F1EA`. | Switch. Keep bg/togle. Replace nav-rest with toggle. 
| `#E3D49E` bg/nav-hover | — | — | Keep (distinct gold) |
| `#D4C48E` bg/nav-pressed | — | — | Keep (darker gold) | Replace this with bg/nav-hover
| `#CFDBBC` bg/success | — | — | Keep (sage green, unique role) |

**Result: 9 → 6 tokens**

---

### Primary Blue (5 → 3)

| Keep | Absorb | Delta | Verdict |
|------|--------|-------|---------|
| `#4688F7` blue/default | `#3C82F6` blue/auth | R=10 G=6 B=1 | **Merge.** Nearly identical blues. Use `#4688F7` as the single primary blue. | Agreed. keep blue/default.
| `#2563EB` blue/hover | `#1F59BB` blue/dark | R=6 G=10 B=48 | **Merge.** Both serve "darker blue hover." The B channel differs but perceptually close at button scale. Use `#2563EB`. | Remove both. Let's use blue/deep 
| `#163D7A` blue/deep | — | — | Keep (auth deep hover, clearly darker) | 

**Result: 5 → 3 tokens** (`blue/default`, `blue/hover`, `blue/deep`)

---

### Teal (4 → 3)

| Keep | Absorb | Delta | Verdict |
|------|--------|-------|---------|
| `#117E8A` teal/default | — | — | Keep |
| `#148A97` teal/hover | `#0F6B75` teal/pressed | R=5 G=31 B=34 | **Keep both.** Hover/pressed states need to feel distinct in interaction. | replace hover with pressed for hover state. Use default for pressed state. 
| `#ADDADE` teal/calm | — | — | Keep (light teal, different role entirely) |

**Result: stays at 4** — but consider dropping `teal/pressed` and using `teal/default` as pressed (pressed = resting color, hover = lighter). That gives **3 tokens**.

---

### Error / Warning (5 → 3)

| Keep | Absorb | Delta | Verdict |
|------|--------|-------|---------|
| `#B91C1C` error/text | `#8A112D` error/default | Both are "dark red text on light bg" | **Merge.** Use `#B91C1C` for all error text/backgrounds. The maroon added no value. | Agreed.
| `#EF4444` error/input | `#C2410C` error/form | One is red, one is orange | **Merge.** Both mean "something is wrong with this field." Use `#EF4444` — it's the standard Tailwind red-500, universally understood. | Agreed. 
| `#15803D` success/text | — | — | Keep (only green in the system) | Agreed.

**Result: 5 → 3 tokens** (`error/red`, `error/input`, `success/text`)

---

### Text (6 → 4)

| Keep | Absorb | Delta | Verdict |
|------|--------|-------|---------|
| `#2F2F2F` text/primary | — | — | Keep (workhorse) |
| `#7A7A7A` text/secondary | — | — | Keep (workhorse) |
| `#4F4F4F` text/tertiary | — | Sits between primary and secondary | **Question it.** Used in only 2 places (AuthComponents, DashboardRedirectCTA). Replace with `text/primary` or `text/secondary` case-by-case. **Drop.** | Agreed. Use text/primary instead of this. 
| `#2D2E0F` text/olive | `#5D6226` text/olive-accent | Both are olive-toned | **Merge.** Use `#2D2E0F` (the darker one works in both contexts). | Agreed. Stick to darker.
| `#4A240D` text/warm-brown | — | Used only in auth title | **Drop.** Replace with `text/primary`. The warm brown "personality" can come from the surrounding design, not a unique text color. | Drop this but use blue/default for the auth title 'Join River'

**Result: 6 → 3 tokens** (`text/primary`, `text/secondary`, `text/olive`)

---

### Text on Dark (5 → 2)

| Keep | Absorb | Delta | Verdict |
|------|--------|-------|---------|
| `#FAF8F0` text/on-blue | `#EFE9DA` text/on-teal | R=11 G=15 B=22 | **Merge.** Both are "cream text on dark bg." The difference is imperceptible on colored buttons. Use `#FAF8F0`. | Agreed. 
| `#FFFFFF` text/on-dark | — | — | Keep (true white, used on dark grays) | Use text/on-blue instead. 
| `#DEF49C` text/on-pressed | — | — | **Question it.** A unique lime color for a 200ms press state. Does it add enough to justify a token? Feels like a vibes pick. If you love it, keep it as an accent. If simplifying, drop it and use `#FAF8F0` for pressed too. | Agreed. 
| `#9CA3AF` text/lock | — | — | **Drop.** Used only for resultsLock state on CTA. Use `text/secondary` (#7A7A7A) instead — same "muted/disabled" meaning. | Agreed. 

**Result: 5 → 2 tokens** (or 3 if keeping the lime press)

---

### Dark Buttons (4 → 3)

| Keep | Absorb | Delta | Verdict |
|------|--------|-------|---------|
| `#2F2F2F` dark/default | `#3A3A3A` dark/alt | R=11 G=11 B=11 | **Merge.** This is the same color as `text/primary`. Use `#2F2F2F` for dark button base. One token, two roles. | Agreed.
| `#252525` dark/hover | — | — | Keep | Change hover to '#4B4B4B'
| `#1F1F1F` dark/pressed | — | — | Keep | Use dark/default.

**Result: 4 → 3 tokens**, and `dark/default` === `text/primary` (shared token)

---

### Borders (3 → 2)

| Keep | Absorb | Delta | Verdict |
|------|--------|-------|---------|
| `#E0CD9D` border/card | `#E2D0A2` border/card-alt | R=2 G=3 B=5 | **Merge.** Completely indistinguishable. Use `#E0CD9D`. | Agreed.
| `#C7C7C7` border/input | — | — | Keep (neutral gray, distinct role) |

**Result: 3 → 2 tokens**

---

### Accent Olive (5 → 3)

| Keep | Absorb | Delta | Verdict |
|------|--------|-------|---------|
| `rgba(124,138,17,0.12)` olive/bg | `rgba(124,138,17,0.08)` olive/toggle-hover | Opacity diff: 0.04 | **Merge to 0.10.** Splitting hairs on transparency. | Agreed.
| `rgba(124,138,17,0.18)` olive/bg-hover | `rgba(124,138,17,0.14)` olive/menu-bg | Opacity diff: 0.04 | **Merge to 0.16.** Same thing. | Agreed.
| `rgba(124,138,17,0.25)` olive/dot-inactive | — | — | Keep | Agreed.

**Result: 5 → 3 tokens**

---

## TYPOGRAPHY — Merge Candidates

### Font Sizes (13 → 9)

| Keep | Absorb | Verdict |
|------|--------|---------|
| 11px | — | **Drop.** Merge into 12px. Two sub-body sizes is unnecessary. | Agreed.
| 12px | 11px | Keep (small labels) | Agreed.
| 13px | — | **Drop.** Merge into 14px. The 1px difference between 13 and 14 is invisible. | Agreed.
| 14px | 13px | Keep (buttons, body small) | Agreed.
| 16px | — | Keep (standard body) |
| 18px | — | **Drop.** Merge into 20px. Used in only 3 places. | Agreed. 
| 20px | 18px | Keep (subheading) | Agreed.
| 22px | — | Keep (carousel headlines) | Agreed.
| 24px | — | Keep (section heading) | Agreed.
| 26px | — | **Drop.** Merge into 24px. Used only in AuthPrompt. 2px doesn't matter at this size. | Agreed. 
| 28px | — | **Drop.** Merge into 24px. Used only in DashboardRedirectCTA. | Agreed. 
| 32px | — | Keep (large title) |
| 36px | — | Keep (auth modal title) |

**Proposed scale: 12 / 14 / 16 / 20 / 22 / 24 / 32 / 36** (8 sizes, maybe 9 if 22 feels too close to 20/24)

---

### Font Weights — Keep all 3

400 (Regular), 500 (Medium), 600 (Semi Bold) — clean, standard, no changes needed.

---

### Line Heights (4 → 2)

| Keep | Absorb | Verdict |
|------|--------|---------|
| 1.1 | — | Keep (tight, for CTAs) |
| 1.4 | 1.3, 1.5 | **Merge.** The difference between 1.3, 1.4, 1.5 is negligible for body text. Use `1.4` as the single body line-height. | Agreed.

**Result: 4 → 2** (`1.1` tight, `1.4` body)

---

## SPACING (16 → 11)

Current: `0, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 60`

The odd values (6, 10, 14, 18, 28) create noise. Tighten to a base-4 scale:

**Proposed: `0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 60`** 

| Drop | Replace with | Verdict |
|------|-------------|---------|
| 6 | 8 | 2px difference, invisible | Agreed. 
| 10 | 8 or 12 | Split the difference contextually | Agreed. 
| 14 | 12 or 16 | Split the difference contextually | Agreed. 
| 18 | 16 or 20 | Split the difference contextually | Agreed. 
| 28 | 24 or 32 | Split the difference contextually | Agreed. 

---

## BORDER RADIUS (4 → 3)

| Keep | Drop | Verdict |
|------|------|---------|
| 12px | — | Keep (secondary buttons) |
| 24px | 29px | **Merge.** 29px is used once (PostGenerationActions pill). 24px looks identical. | Agreed. 
| full (999px) | — | Keep (circles, dots) | Agreed. 

**Result: 12, 24, full**

---

## SHADOWS — Keep all 7

Shadows are functionally distinct (elevation levels, inset vs drop, blue glow vs warm). No merges recommended — they each serve a clear purpose.

---

## SUMMARY

| Category | Before | After | Saved |
|----------|--------|-------|-------|
| Background colors | 9 | 6 | 3 |
| Primary blue | 5 | 3 | 2 |
| Teal | 4 | 3 | 1 |
| Error / Warning | 5 | 3 | 2 |
| Text | 6 | 3 | 3 |
| Text on dark | 5 | 2 | 3 |
| Dark buttons | 4 | 3 | 1 |
| Borders | 3 | 2 | 1 |
| Accent olive | 5 | 3 | 2 |
| Font sizes | 13 | 8 | 5 |
| Line heights | 4 | 2 | 2 |
| Spacing | 16 | 11 | 5 |
| Border radius | 4 | 3 | 1 |
| Shadows | 7 | 7 | 0 |
| **Total** | **90** | **59** | **31** |

**~34% reduction** in token count while maintaining the same visual identity.

---

## NEXT STEPS

1. Review this audit — flag any merges you disagree with
2. Build the simplified token set
3. Update Figma Design System page with the final tokens
4. Refactor frontend components to use the reduced set
