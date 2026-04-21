import React from 'react';

const hlPresets: Record<string, React.CSSProperties> = {
  red:   { background: "color-mix(in srgb, #ef4444 15%, transparent)", color: "color-mix(in srgb, #ef4444 65%, var(--foreground))" },
  amber: { background: "color-mix(in srgb, #f59e0b 18%, transparent)", color: "color-mix(in srgb, #f59e0b 65%, var(--foreground))" },
  blue:  { background: "color-mix(in srgb, #3b82f6 15%, transparent)", color: "color-mix(in srgb, #3b82f6 65%, var(--foreground))" },
  green: { background: "color-mix(in srgb, #22c55e 15%, transparent)", color: "color-mix(in srgb, #22c55e 65%, var(--foreground))" },
  gray:  { background: "color-mix(in oklch, var(--foreground) 8%, transparent)", color: "var(--foreground)" },
};

const scoreColors: Record<number, string> = {
  1: "#e24b4a",
  2: "#d85a30",
  3: "#ba7517",
  4: "#378add",
  5: "#639922",
};

function renderText(text: any) {
  if (!text) return null;
  if (typeof text === "string") return text;
  return text.map((part: any, i: number) => {
    if (typeof part === "string") return <span key={i}>{part}</span>;
    const hl = hlPresets[part.c] || hlPresets.gray;
    return (
      <mark key={i} style={{ ...hl, borderRadius: "2px", padding: "0 2px", fontStyle: "inherit", margin: "0 2px" }}>
        {part.t}
      </mark>
    );
  });
}

export default function ReviewCard({
  name,
  source = "NovelUpdates",
  score = 3,
  scoreNote,
  sections = [],
}: any) {
  const initials = name.split(/[_\s]/).map((w: any) => w[0]?.toUpperCase()).slice(0, 2).join("");
  const clamped = Math.max(1, Math.min(5, Math.round(score)));
  const starColor = scoreColors[clamped] || "#ba7517";

  return (
    <div style={s.card}>

      <div style={s.header}>
        <div style={s.avatar}>{initials}</div>
        <div style={{ flex: 1 }}>
          <div style={s.nameLine}>
            <span style={s.name}>{name}</span>
            <span style={s.badge}>{source}</span>
          </div>
          <div style={s.scoreLine}>
            <span style={{ ...s.stars, color: starColor }}>{"★".repeat(clamped)}</span>
            <span style={s.starsEmpty}>{"★".repeat(5 - clamped)}</span>
            <span style={{ ...s.scoreNum, color: starColor }}>{clamped}/5</span>
            {scoreNote && <span style={s.scoreNote}>· {scoreNote}</span>}
          </div>
        </div>
      </div>

      <div>
        {sections.map((sec: any, i: number) => (
          <div key={i} style={{ borderBottom: i < sections.length - 1 ? "0.5px solid var(--border)" : "none" }}>
            <div style={s.sectionHeading}>
              <span>{sec.heading}</span>
              <span style={s.headingRule} />
            </div>
            <div style={s.sectionText}>{renderText(sec.text)}</div>
            {sec.myReaction && (
              <div style={s.reaction}>
                <span style={s.lnTag}>ln //</span>
                <span style={s.reactionText}>{renderText(sec.myReaction)}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  card: {
    background: "var(--card)",
    border: "0.5px solid var(--border)",
    borderRadius: "0.625rem",
    overflow: "hidden",
    marginBottom: "1.5rem",
    fontFamily: "'Atkinson', 'Geist Variable', sans-serif",
  },
  header: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "1rem clamp(1rem, 3vw, 1.25rem)",
    borderBottom: "0.5px solid var(--border)",
    background: "color-mix(in oklch, var(--secondary) 80%, var(--card))",
  },
  avatar: {
    width: "40px", height: "40px", borderRadius: "50%",
    background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.35)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Geist Mono', monospace", fontSize: "13px", fontWeight: 500,
    color: "#e07070", flexShrink: 0,
  },
  nameLine: { display: "flex", alignItems: "center", gap: "8px" },
  name: {
    fontFamily: "'Atkinson', sans-serif", fontSize: "15px",
    fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.01em",
  },
  badge: {
    fontFamily: "'Geist Mono', monospace", fontSize: "10px",
    padding: "2px 7px", borderRadius: "3px",
    background: "color-mix(in oklch, var(--background) 70%, transparent)", color: "var(--muted-foreground)",
    border: "0.5px solid var(--border)", letterSpacing: "0.04em",
  },
  scoreLine: { display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" },
  stars: { fontSize: "12px", letterSpacing: "1px" },
  starsEmpty: { fontSize: "12px", letterSpacing: "1px", color: "color-mix(in oklch, var(--muted-foreground) 40%, transparent)" },
  scoreNum: {
    fontFamily: "'Geist Mono', monospace", fontSize: "10px",
    fontWeight: 500, marginLeft: "1px",
  },
  scoreNote: {
    fontFamily: "'Geist Mono', monospace", fontSize: "10px", color: "var(--muted-foreground)",
  },
  sectionHeading: {
    fontFamily: "'Atkinson', sans-serif", fontSize: "13px", fontWeight: 700,
    letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-foreground)",
    padding: "0.85rem clamp(1rem, 3vw, 1.25rem) 0", display: "flex", alignItems: "center", gap: "8px",
  },
  headingRule: { flex: 1, height: "0.5px", background: "var(--border)", display: "block" },
  sectionText: {
    fontSize: "clamp(1rem, 1.2vw + 0.6rem, 1.125rem)", lineHeight: 1.75, color: "var(--foreground)",
    padding: "0.55rem clamp(1rem, 3vw, 1.25rem) 0.75rem",
  },
  reaction: {
    margin: "0 clamp(1rem, 3vw, 1.25rem) 0.9rem clamp(1rem, 5vw, 2rem)",
    padding: "0.45rem 0.75rem",
    background: "color-mix(in oklch, var(--card) 40%, var(--secondary))",
    borderLeft: "2px solid color-mix(in oklch, var(--muted-foreground) 50%, transparent)",
    borderRadius: 0,
    display: "flex", gap: "9px", alignItems: "flex-start",
  },
  lnTag: {
    fontFamily: "'Geist Mono', monospace", fontSize: "10px", fontWeight: 500,
    color: "var(--muted-foreground)", whiteSpace: "nowrap", paddingTop: "2px",
    letterSpacing: "0.05em", flexShrink: 0,
  },
  reactionText: {
    fontSize: "clamp(0.9rem, 1vw + 0.5rem, 1rem)", fontStyle: "italic", lineHeight: 1.6, color: "var(--muted-foreground)",
  },
};
