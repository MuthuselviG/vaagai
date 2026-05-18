export const ROLE_CHIPS = [
  {
    id: "aspirant",
    title: "Aspirant",
    subtitle: "Preparing for exams",
  },
  {
    id: "buddy",
    title: "Study Buddy",
    subtitle: "சேர்ந்து படிப்போம்",
  },
  {
    id: "expert",
    title: "Expert",
    subtitle: "Teacher / Academy",
  },
] as const;

export type RoleChip = (typeof ROLE_CHIPS)[number];
export type RoleChipId = RoleChip["id"];