// Fields snapshotted into questions.original_version on a question's
// first edit. Shared between the PATCH and restore routes.
export const SNAPSHOT_FIELDS = [
  "question",
  "options",
  "correct_option",
  "explanation",
  "subject",
  "topic",
  "lang",
  "pyq_years",
  "pyq_groups",
  "status",
] as const;
