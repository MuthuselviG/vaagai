export type LocalResponse = {
  question_id: string;
  selected_option: string;
  is_correct: boolean;
  time_spent_seconds: number;
};

export type LocalSession = {
  id: string;
  subject: string;
  chapter: string;
  level: number;
  offset: number;
  limit: number;
  started_at: string;
  completed_at: string | null;
  total_questions: number;
  correct_count: number;
  responses: LocalResponse[];
};

const STORAGE_KEY = "mcqpalagu_sessions";

function getSessions(): LocalSession[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch { return []; }
}

function saveSessions(sessions: LocalSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(-100)));
}

export function startSession(subject: string, chapter: string, level: number, offset: number, limit: number): string {
  const id = crypto.randomUUID();
  const sessions = getSessions();
  sessions.push({ id, subject, chapter, level, offset, limit, started_at: new Date().toISOString(), completed_at: null, total_questions: 0, correct_count: 0, responses: [] });
  saveSessions(sessions);
  return id;
}

export function recordResponse(sessionId: string, question_id: string, selected_option: string, is_correct: boolean, time_spent_seconds: number) {
  const sessions = getSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return;
  session.responses.push({ question_id, selected_option, is_correct, time_spent_seconds });
  session.total_questions = session.responses.length;
  session.correct_count = session.responses.filter(r => r.is_correct).length;
  saveSessions(sessions);
}

export function completeSession(sessionId: string) {
  const sessions = getSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return;
  session.completed_at = new Date().toISOString();
  saveSessions(sessions);
}

export function getSession(sessionId: string): LocalSession | null {
  return getSessions().find(s => s.id === sessionId) ?? null;
}

// All levels always unlocked
export function getUnlockedLevel(_subject: string, _chapter: string): number {
  return Infinity;
}
