import React from 'react';

const hlPresets: Record<string, React.CSSProperties> = {
  red:   { background: "rgba(226,75,74,0.14)",   color: "#e08080" },
  amber: { background: "rgba(186,117,23,0.18)",  color: "#cfa050" },
  blue:  { background: "rgba(55,138,221,0.14)",  color: "#6aaedd" },
  green: { background: "rgba(99,153,34,0.14)",   color: "#85bb44" },
  gray:  { background: "rgba(255,255,255,0.06)", color: "oklch(0.85 0 0)" },
};

const verdictPresets: Record<string, string> = {
  agree:    "#85bb44",
  disagree: "#e08080",
  nuance:   "#cfa050",
  neutral:  "oklch(0.6 0 0)",
  info:     "#6aaedd",
  positive: "#85bb44",
  negative: "#e08080",
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
  verdict = [],
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
          <div key={i} style={{ borderBottom: i < sections.length - 1 ? "0.5px solid oklch(0.28 0 0)" : "none" }}>
            <div style={s.sectionHeading}>
              <span>{sec.heading}</span>
              <span style={s.headingRule} />
            </div>
            <p style={s.sectionText}>{renderText(sec.text)}</p>
            {sec.myReaction && (
              <div style={s.reaction}>
                <span style={s.lnTag}>ln //</span>
                <span style={s.reactionText}>{renderText(sec.myReaction)}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {verdict.length > 0 && (
        <div style={s.verdictStrip}>
          {verdict.map((v: any, i: number) => (
            <div key={i} style={{
              ...s.verdictPill,
              color: verdictPresets[v.color] || verdictPresets.neutral,
              borderRight: i < verdict.length - 1 ? "0.5px solid oklch(0.28 0 0)" : "none",
            }}>
              {v.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  card: {
    background: "oklch(0.23 0 0)",
    border: "0.5px solid oklch(0.28 0 0)",
    borderRadius: "0.625rem",
    overflow: "hidden",
    marginBottom: "1.5rem",
    fontFamily: "'Lora', Georgia, serif",
  },
  header: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "1rem 1.25rem",
    borderBottom: "0.5px solid oklch(0.28 0 0)",
    background: "oklch(0.28 0 0)",
  },
  avatar: {
    width: "40px", height: "40px", borderRadius: "50%",
    background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.35)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: 500,
    color: "#e07070", flexShrink: 0,
  },
  nameLine: { display: "flex", alignItems: "center", gap: "8px" },
  name: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: "13px",
    fontWeight: 500, color: "oklch(0.92 0 0)",
  },
  badge: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: "10px",
    padding: "2px 7px", borderRadius: "3px",
    background: "oklch(0.23 0 0)", color: "oklch(0.65 0 0)",
    border: "0.5px solid oklch(0.38 0 0)", letterSpacing: "0.04em",
  },
  scoreLine: { display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" },
  stars: { fontSize: "12px", letterSpacing: "1px" },
  starsEmpty: { fontSize: "12px", letterSpacing: "1px", color: "oklch(0.38 0 0)" },
  scoreNum: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: "10px",
    fontWeight: 500, marginLeft: "1px",
  },
  scoreNote: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "oklch(0.52 0 0)",
  },
  sectionHeading: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", fontWeight: 500,
    letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.58 0 0)",
    padding: "0.85rem 1.25rem 0", display: "flex", alignItems: "center", gap: "8px",
  },
  headingRule: { flex: 1, height: "0.5px", background: "oklch(0.28 0 0)", display: "block" },
  sectionText: {
    fontSize: "14px", lineHeight: 1.75, color: "oklch(0.82 0 0)",
    padding: "0.55rem 1.25rem 0.75rem",
  },
  reaction: {
    margin: "0 1.25rem 0.9rem 2rem",
    padding: "0.45rem 0.75rem",
    background: "oklch(0.255 0 0)",
    borderLeft: "1.5px solid oklch(0.38 0 0)",
    borderRadius: 0,
    display: "flex", gap: "9px", alignItems: "flex-start",
  },
  lnTag: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", fontWeight: 500,
    color: "oklch(0.52 0 0)", whiteSpace: "nowrap", paddingTop: "2px",
    letterSpacing: "0.05em", flexShrink: 0,
  },
  reactionText: {
    fontSize: "12.5px", fontStyle: "italic", lineHeight: 1.6, color: "oklch(0.65 0 0)",
  },
  verdictStrip: { display: "flex", borderTop: "0.5px solid oklch(0.28 0 0)" },
  verdictPill: {
    flex: 1, textAlign: "center",
    fontFamily: "'JetBrains Mono', monospace", fontSize: "10px",
    letterSpacing: "0.07em", textTransform: "uppercase", padding: "0.5rem 0.25rem",
  },
};
