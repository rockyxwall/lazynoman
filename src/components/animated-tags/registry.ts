/**
 * ── ANIMATION REGISTRY ─────────────────────────────────────────────────────
 * Single source of truth mapping each reading-preference tag label to its
 * animation. This is plain data — adding/removing a tag never requires touching
 * the render logic in AnimatedTags.tsx.
 *
 * HOW TO EDIT (see ./AUTHORING.md for the full guide):
 *   ADD a tag:
 *     1. add the label to `readingTags` in src/pages/about/index.astro
 *     2. add one entry below: `'label': { id: 'someId', description: '...' }`
 *     3. if `id` is NEW, add a matching `@keyframes at-<id>` + `.at-anim-<id>`
 *        rule in AnimatedTags.tsx (copy an existing pair as a template)
 *   REPLACE an animation:
 *     - change the entry's `id` to another registered id (no CSS change), OR
 *     - edit the keyframe body of that id in AnimatedTags.tsx to restyle it
 *   REMOVE a tag:
 *     - delete its entry below (it would then fall back to `defaultAnimation`)
 *       and remove the label from `readingTags` in the page
 *
 * RULES:
 *   - Animation colors MUST use Theme_Tokens (var(--primary), currentColor,
 *     color-mix(... var(--*) ...)) — never hardcoded hex/rgb/hsl.
 *   - Every animation MUST honor prefers-reduced-motion (handled centrally in
 *     AnimatedTags.tsx — your keyframe just needs to be motion/opacity based).
 *   - The tag's label text must stay visible at all times (animate overlays,
 *     transforms, filters and shadows — never hide the text itself).
 * ───────────────────────────────────────────────────────────────────────────
 */

/** A single animation definition. `id` doubles as the CSS class suffix → `at-anim-<id>`. */
export interface TagAnimation {
  /** Stable id; also the CSS class/keyframe suffix used by AnimatedTags.tsx. */
  id: string;
  /** Human note describing the theme/intent (for editors, not shown in the UI). */
  description: string;
}

/** Map of tag label → animation. The ONLY place these mappings live. */
export const animationRegistry: Record<string, TagAnimation> = {
  // tech / sci-fi — digital glitch + flicker
  system: { id: "glitch", description: "tech / sci-fi digital glitch & flicker" },
  // magical — sparkle shimmer sweep
  fantasy: { id: "shimmer", description: "magical sparkle shimmer" },
  // power / aura — glow surge pulse
  "overpowered mc": { id: "aura", description: "power / aura glow surge" },
  // rising / floating / ascending (shared by the three cultivation-family tags)
  cultivation: { id: "ascend", description: "rising / floating ascension" },
  xianxia: { id: "ascend", description: "rising / floating ascension" },
  xuanhuan: { id: "ascend", description: "rising / floating ascension" },
  // cheat-code blink
  cheat: { id: "blink", description: "cheat-code indicator blink" },
  // portal / phase shift
  transmigration: { id: "warp", description: "portal / phase-shift warp" },
  // rotating cycle of rebirth
  reincarnation: { id: "cycle", description: "rotating cycle of rebirth" },
  // steady presence pulse
  "male mc": { id: "pulse", description: "steady presence pulse" },
  // subtle low-key breathing fade
  "low-key mc": { id: "fade", description: "subtle low-key breathing fade" },
  // cold icy sheen
  "cold mc": { id: "frost", description: "cold icy sheen sweep" },
};

/** Fallback used when a label has no entry in `animationRegistry`. */
export const defaultAnimation: TagAnimation = {
  id: "pulse",
  description: "default subtle pulse",
};

/**
 * Resolve a label to its animation, falling back to `defaultAnimation`.
 * Total function: never returns undefined and never throws for any string.
 */
export function resolveAnimation(label: string): TagAnimation {
  return animationRegistry[label] ?? defaultAnimation;
}
