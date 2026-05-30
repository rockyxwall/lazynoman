import * as React from "react";
import { cn } from "@/lib/utils";
import { resolveAnimation } from "@/components/animated-tags/registry";

/**
 * AnimatedTags — renders reading-preference tags, each with its own themed
 * animation pulled from the Animation_Registry (see ./animated-tags/registry.ts).
 *
 * ── HOW TO EXTEND THE ANIMATION SET ────────────────────────────────────────
 * Each animation is two things:
 *   1. an entry in registry.ts  ({ id: 'myId', description: '...' })
 *   2. a CSS pair below in `keyframes`:
 *        @keyframes at-myId { ... }
 *        .at-anim-myId { animation: at-myId <dur> <timing> infinite; }
 * To ADD: copy an existing @keyframes/.at-anim-* pair, rename `myId`, tweak it.
 * To REPLACE: point the registry entry at another id, or edit that id's
 *             keyframe body here.
 * RULES: colors must use Theme_Tokens (var(--primary), currentColor,
 *        color-mix(... var(--*) ...)); never hide the label text; the central
 *        reduced-motion guard at the bottom disables all motion automatically.
 * ───────────────────────────────────────────────────────────────────────────
 */

export interface AnimatedTagsProps {
  /** Tag labels to render, in order. 1–50 supported. Empty/undefined → renders nothing. */
  labels?: string[];
  /** Optional className passthrough for the container. */
  className?: string;
}

/** Scoped keyframes + per-animation classes. Colors are all Theme_Token based. */
const keyframes = `
.at-root { --at-accent: var(--primary); }

/* base chip — token-based, text always fully opaque */
.at-tag {
  position: relative;
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  border-radius: 9999px;
  border: 1px solid color-mix(in oklch, var(--primary) 22%, transparent);
  background: color-mix(in oklch, var(--primary) 10%, transparent);
  color: var(--primary);
  padding: 0.375rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  isolation: isolate;
  will-change: transform, opacity;
}
.at-tag > .at-label { position: relative; z-index: 2; }

/* entrance: from slightly down + transparent → settled. Enabled only after mount. */
.at-tag {
  opacity: 1;
  transform: none;
  transition: opacity 0.45s ease, transform 0.45s ease;
}
.at-root[data-animate="true"] .at-tag.at-enter {
  opacity: 0;
  transform: translateY(10px);
}

/* ── system → glitch: tech/sci-fi digital flicker + jitter ─────────────── */
@keyframes at-glitch {
  0%, 100% { transform: translate(0, 0); filter: none; }
  20% { transform: translate(-1px, 1px); }
  40% { transform: translate(1px, -1px); filter: hue-rotate(8deg); }
  60% { transform: translate(-1px, 0); }
  80% { transform: translate(1px, 1px); filter: brightness(1.15); }
}
.at-anim-glitch { animation: at-glitch 1.6s steps(2, end) infinite; }
.at-anim-glitch::after {
  content: "";
  position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(transparent 50%, color-mix(in oklch, var(--primary) 16%, transparent) 50%);
  background-size: 100% 4px;
  animation: at-scan 1.2s linear infinite;
  pointer-events: none;
}
@keyframes at-scan { from { background-position: 0 0; } to { background-position: 0 8px; } }

/* ── fantasy → shimmer: magical sweep of light ────────────────────────── */
@keyframes at-shimmer {
  0% { transform: translateX(-130%); }
  100% { transform: translateX(130%); }
}
.at-anim-shimmer::before {
  content: "";
  position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(110deg, transparent 30%, color-mix(in oklch, var(--primary) 38%, transparent) 50%, transparent 70%);
  animation: at-shimmer 2.4s ease-in-out infinite;
  pointer-events: none;
}

/* ── overpowered mc → aura: power glow surge ──────────────────────────── */
@keyframes at-aura {
  0%, 100% { box-shadow: 0 0 0 0 color-mix(in oklch, var(--primary) 0%, transparent); }
  50% { box-shadow: 0 0 14px 2px color-mix(in oklch, var(--primary) 45%, transparent); }
}
.at-anim-aura { animation: at-aura 2s ease-in-out infinite; }

/* ── cultivation / xianxia / xuanhuan → ascend: rising / floating ─────── */
@keyframes at-ascend {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
.at-anim-ascend { animation: at-ascend 2.6s ease-in-out infinite; }

/* ── cheat → blink: cheat-code indicator ──────────────────────────────── */
@keyframes at-blink {
  0%, 100% { box-shadow: inset 0 0 0 9999px color-mix(in oklch, var(--primary) 0%, transparent); }
  50% { box-shadow: inset 0 0 0 9999px color-mix(in oklch, var(--primary) 14%, transparent); }
}
.at-anim-blink { animation: at-blink 1s steps(1, end) infinite; }

/* ── transmigration → warp: portal / phase shift ──────────────────────── */
@keyframes at-warp {
  0%, 100% { transform: perspective(300px) rotateY(0deg); }
  50% { transform: perspective(300px) rotateY(14deg); }
}
.at-anim-warp { animation: at-warp 3s ease-in-out infinite; }

/* ── reincarnation → cycle: rotating glow that circles the chip ───────── */
@keyframes at-cycle {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.at-anim-cycle::before {
  content: "";
  position: absolute; z-index: 1;
  inset: -50%;
  background: conic-gradient(from 0deg, transparent 0deg, color-mix(in oklch, var(--primary) 30%, transparent) 60deg, transparent 120deg);
  animation: at-cycle 3s linear infinite;
  pointer-events: none;
}

/* ── male mc → pulse: steady presence (also the default) ──────────────── */
@keyframes at-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
.at-anim-pulse { animation: at-pulse 2.2s ease-in-out infinite; }

/* ── low-key mc → fade: subtle breathing of the background tint ───────── */
@keyframes at-fade {
  0%, 100% { background: color-mix(in oklch, var(--primary) 6%, transparent); }
  50% { background: color-mix(in oklch, var(--primary) 16%, transparent); }
}
.at-anim-fade { animation: at-fade 3.2s ease-in-out infinite; }

/* ── cold mc → frost: cold icy sheen drifting across ──────────────────── */
@keyframes at-frost {
  0% { transform: translateX(-130%) skewX(-12deg); }
  100% { transform: translateX(130%) skewX(-12deg); }
}
.at-anim-frost::before {
  content: "";
  position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(100deg, transparent 35%, color-mix(in oklch, var(--primary) 28%, transparent) 50%, transparent 65%);
  animation: at-frost 3s ease-in-out infinite;
  pointer-events: none;
}

/* ── CENTRAL REDUCED-MOTION GUARD — disables ALL of the above ─────────── */
@media (prefers-reduced-motion: reduce) {
  .at-tag, .at-tag::before, .at-tag::after {
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
  .at-root .at-tag.at-enter { opacity: 1 !important; transform: none !important; }
}
.at-root[data-reduced="true"] .at-tag,
.at-root[data-reduced="true"] .at-tag::before,
.at-root[data-reduced="true"] .at-tag::after {
  animation: none !important;
  transition: none !important;
  transform: none !important;
}
.at-root[data-reduced="true"] .at-tag.at-enter { opacity: 1 !important; transform: none !important; }
`;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export default function AnimatedTags({ labels, className }: AnimatedTagsProps) {
  // Empty/undefined input → render nothing meaningful, never throw.
  const items = Array.isArray(labels) ? labels : [];

  // `mounted` gates motion so SSR and first client render are the static
  // baseline (no entrance, no reduced flag mismatch) → no hydration mismatch.
  const [mounted, setMounted] = React.useState(false);
  const [reduced, setReduced] = React.useState(false);
  const [inView, setInView] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  // After mount: detect reduced-motion preference and subscribe to live changes.
  React.useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    setReduced(mql.matches);

    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Trigger the entrance animation when the section scrolls into view.
  React.useEffect(() => {
    if (!mounted) return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [mounted]);

  // Motion is on only when mounted AND the user has not requested reduced motion.
  const animate = mounted && !reduced;

  return (
    <div
      ref={rootRef}
      className={cn("at-root flex flex-wrap gap-3", className)}
      data-animate={animate ? "true" : "false"}
      data-reduced={reduced ? "true" : "false"}
    >
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />
      {items.map((label, i) => {
        const anim = resolveAnimation(label);
        // `at-enter` starts the chip in its pre-entrance state; removing it
        // (once inView) lets the CSS transition settle it into place.
        const entering = animate && !inView;
        return (
          <span
            key={`${label}-${i}`}
            className={cn(
              "at-tag",
              animate && `at-anim-${anim.id}`,
              entering && "at-enter",
            )}
            style={{ transitionDelay: animate ? `${i * 55}ms` : undefined }}
          >
            <span className="at-label">{label}</span>
          </span>
        );
      })}
    </div>
  );
}
