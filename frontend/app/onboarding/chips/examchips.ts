export const EXAM_CHIPS = [
  {
    id: "group4",
    en: "Group 4",
    ta: "குரூப் 4",
  },
  {
    id: "group2",
    en: "Group 2",
    ta: "குரூப் 2",
  },
  {
    id: "tet",
    en: "TET",
    ta: "ஆசிரியர் தகுதி தேர்வு",
  },
  {
    id: "tnsurb",
    en: "TNSURB",
    ta: "காவல் துறை",
  },
]as const;

export type ExamChip = (typeof EXAM_CHIPS)[number];
export type ExamChipId = ExamChip["id"];