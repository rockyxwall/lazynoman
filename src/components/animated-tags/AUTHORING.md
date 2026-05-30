# Animated Tags — Authoring Guide

How to add, replace, or remove a reading-preference tag and its animation.
You (or any AI agent) can do all of this by editing the files below — no need to
ask anyone. Copy-paste the templates and change the marked values.

## Where things live

| File | Role |
|---|---|
| `src/pages/about/index.astro` | the `readingTags` array — decides **which** tags show, and in what order |
| `src/components/animated-tags/registry.ts` | the **Animation_Registry** — maps each tag label → an animation `id` (single source of truth) |
| `src/components/AnimatedTags.tsx` | the render logic + the CSS `@keyframes` / `.at-anim-*` rules that the `id`s point to |

An animation is **two pieces**:
1. a **registry entry** (`'label': { id, description }`) in `registry.ts`
2. a **CSS pair** (`@keyframes at-<id>` + `.at-anim-<id>`) in `AnimatedTags.tsx`

If you reuse an existing `id`, you only need piece 1.

## Rules (must follow)

- **Theme tokens only.** Every color must come from a theme token — `var(--primary)`,
  `currentColor`, or `color-mix(in oklch, var(--primary) X%, transparent)`. Never use a
  literal hex / `rgb()` / `hsl()` value, or the tag will break in light or dark mode.
- **Never hide the label text.** Animate `transform`, `filter`, `box-shadow`, `opacity`
  of pseudo-elements (`::before` / `::after`), or the chip background — never the text.
  The label lives in `.at-label` (z-index 2); keep overlays below it.
- **Reduced motion is automatic.** A central `@media (prefers-reduced-motion: reduce)`
  guard in `AnimatedTags.tsx` disables every animation/transition. You don't write
  per-animation reduced-motion code — just make sure your effect is purely decorative
  motion so removing it leaves a clean, readable chip.

---

## Add a new tag

**Step 1 — show the tag.** Add the label to `readingTags` in `src/pages/about/index.astro`:

```ts
const readingTags = [
  // ...existing labels...
  'regression', // ← new label
];
```

**Step 2 — map it to an animation.** Add one entry to `animationRegistry` in
`registry.ts`. If you point it at an `id` that already exists (e.g. `'pulse'`,
`'shimmer'`, `'ascend'`), you're done — skip step 3.

```ts
'regression': { id: 'rewind', description: 'time rewind / reset' },
```

**Step 3 — (only if the `id` is brand new) add the CSS pair.** In `AnimatedTags.tsx`,
inside the `keyframes` string, copy this template and change the three marked spots:

```css
/* ── regression → rewind: time reset ─────────────────────────────── */
@keyframes at-rewind {                 /* ← name: at-<yourId> */
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-4px) skewX(6deg); }   /* ← your motion */
}
.at-anim-rewind {                      /* ← class: .at-anim-<yourId> */
  animation: at-rewind 2.2s ease-in-out infinite;    /* ← your timing */
}
```

That's it — the render loop picks it up automatically.

---

## Replace an existing animation

Two ways:

- **Swap which animation a tag uses** (no CSS change): change the entry's `id` in
  `registry.ts` to any other registered id.
  ```ts
  'system': { id: 'shimmer', description: 'now uses the shimmer effect' },
  ```
- **Restyle the animation itself** (affects every tag using that id): edit the body of
  that id's `@keyframes at-<id>` / `.at-anim-<id>` in `AnimatedTags.tsx`.

---

## Remove a tag

1. Delete the label from `readingTags` in `src/pages/about/index.astro`.
2. Delete its entry from `animationRegistry` in `registry.ts`.
   (If you leave the label in the page but remove the registry entry, the tag still
   renders — it just falls back to `defaultAnimation`.)
3. Optional: if no other tag uses that animation `id`, you can delete its
   `@keyframes` / `.at-anim-*` pair from `AnimatedTags.tsx`.

---

## Copy-paste example (full new animation)

Paste this entry into `registry.ts`:

```ts
// change 'kingdom-building' and the id to whatever you need
'kingdom-building': { id: 'rise', description: 'banner raise / growth' },
```

Paste this pair into the `keyframes` string in `AnimatedTags.tsx`:

```css
/* ── kingdom-building → rise ──────────────────────────────────────── */
@keyframes at-rise {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-6px) scale(1.04); }
}
.at-anim-rise { animation: at-rise 2.8s ease-in-out infinite; }
```

Only the label, the `id` (used in three spots: registry, `@keyframes at-<id>`,
`.at-anim-<id>`), and the motion/timing values need to change to reuse this.
