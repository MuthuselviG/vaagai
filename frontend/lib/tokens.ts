export const T = {
  bg: "#F7F8FC",
  surface: "#FFFFFF",
  indigo: "#3D52A0",
  indigoDark: "#2D3E7A",
  indigoLight: "#EEF1FA",
  indigoMid: "#C5CEF0",
  text: "#1A1A2E",
  textSec: "#6B7280",
  textTer: "#9CA3AF",
  border: "#E4E7F0",
  green: "#057A55",
  greenBg: "#E8F8F0",
  greenBorder: "#A8DBBE",
  red: "#C0392B",
  redBg: "#FDECEC",
  redBorder: "#F5BFBB",
  whatsapp: "#25D366"
} as const;

export const shadow = {
  sm: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  md: "0 2px 8px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)",
  lg: "0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05)",
  indigo: "0 4px 14px rgba(61,82,160,0.35), 0 1px 4px rgba(61,82,160,0.2)",
  green: "0 4px 14px rgba(5,122,85,0.3)"
} as const;

// Shared font-size scale (px). Use these instead of one-off numbers so
// text stays consistent — and readable — across pages and languages.
export const fontSize = {
  caption: 13,  // badges, stat lines, fine print
  body: 15,     // standard paragraph/list text
  bodyLg: 16,   // emphasized body, card titles
  label: 17,    // sub-headings
  heading: 19,  // section headings
  display: 22,  // large headings
} as const;
