---
name: LazyNoman
description: Independent review hub, tier lists, and recommendations for webnovels and progression fantasy
colors:
  primary: "#e63946"
  primary-strong: "#ff5260"
  neutral-bg: "#121316"
  neutral-surface: "#1b1b1f"
  neutral-surface-elevated: "#24252a"
  neutral-text: "#e3e2e6"
  neutral-muted: "#919094"
  neutral-border: "#26282e"
  accent-asuka: "oklch(0.650 0.240 30)"
  accent-ayanami: "oklch(0.626 0.098 247.46)"
  accent-miku: "oklch(0.711 0.123 185.28)"
  accent-inanis: "oklch(0.663 0.102 301.22)"
  accent-amelia: "oklch(0.710 0.090 72.47)"
  accent-fubuki: "oklch(0.78 0 0)"
  status-ongoing: "#10b981"
  status-completed: "#3b82f6"
  status-hiatus: "#f59e0b"
  status-danger: "#ef4444"
typography:
  display:
    fontFamily: "PT Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.2rem, 5vw, 4rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "PT Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.6rem, 3vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "PT Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "PT Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.08rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "PT Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 700
    letterSpacing: "0.05em"
rounded:
  sm: "8px"
  md: "12px"
  full: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.85rem"
  lg: "1.5rem"
  xl: "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "0.55rem 1.15rem"
  button-primary-hover:
    backgroundColor: "{colors.primary-strong}"
  button-secondary:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.sm}"
    padding: "0.42rem 0.65rem"
  card:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.md}"
    padding: "1.15rem"
  chip:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.full}"
    padding: "0.22rem 0.65rem"
  notice:
    backgroundColor: "{colors.neutral-surface-elevated}"
    rounded: "{rounded.md}"
    padding: "1rem 1.25rem"
---

# Design System

LazyNoman visual identity built with Wotaku-inspired dark charcoal bedrock, 12px rounded cards, multi-palette OKLCH accent system, rich guide callouts, and structured ranking directories.
