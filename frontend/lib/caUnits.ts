import { T } from "./tokens";
import { CA_UNIT_SUBJECTS } from "./supabase";

export const UNIT_COLORS: Record<string, { bg: string; border: string; text: string; btn: string }> = {
  "general-science":     { bg: T.indigoLight, border: T.indigoMid,   text: T.indigo,  btn: T.indigo },
  "geography":           { bg: T.greenBg,     border: T.greenBorder, text: T.green,   btn: T.green },
  "indian-history":      { bg: "#FEF3C7",     border: "#FCD34D",     text: "#B45309", btn: "#B45309" },
  "indian-polity":       { bg: "#F5F3FF",     border: "#DDD6FE",     text: "#7C3AED", btn: "#7C3AED" },
  "welfare-schemes":     { bg: T.redBg,       border: T.redBorder,   text: T.red,     btn: T.red },
  "archaeology-updates": { bg: "#E0F7FA",     border: "#A5D8E3",     text: "#0E7490", btn: "#0E7490" },
};

export const UNIT_NUMERALS = ["I", "II", "III", "IV", "V", "VI"];

export function getCountForUnit(unitSlug: string, counts: { subject: string; count: number }[]): number {
  const subjects = CA_UNIT_SUBJECTS[unitSlug] ?? [];
  return counts.filter((c) => subjects.includes(c.subject)).reduce((sum, c) => sum + c.count, 0);
}
