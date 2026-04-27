const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export type PracticeQuestion = {
  id: string;
  question: string;
  options: Record<string, string>;
  correct_option: string;
  chapter: string;
  subject: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
};

export type CreateSessionInput = {
  user_id: string;
  exam_type: "group4" | "group2" | "tnusrb" | "tet" | "school";
  class: number | null;
  subject: string;
  chapter: string;
  session_type: "practice" | "mock_full" | "mock_pyq";
  total_questions: number;
  lang: "en" | "ta";
};

export async function createPracticeSession(payload: CreateSessionInput) {
  const response = await fetch(`${API_BASE_URL}/api/practice/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to create practice session");
  }

  return response.json();
}

export async function submitAnswer(
  sessionId: string,
  body: {
    question_id: string;
    selected_option: string;
    time_spent_seconds: number;
    lang: "en" | "ta";
  }
) {
  const response = await fetch(
    `${API_BASE_URL}/api/practice/sessions/${sessionId}/answers`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }
  );

  if (!response.ok) {
    throw new Error("Failed to submit answer");
  }

  return response.json();
}

export async function getSessionSummary(sessionId: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/practice/sessions/${sessionId}/summary`
  );

  if (!response.ok) {
    throw new Error("Failed to load summary");
  }

  return response.json();
}

export async function resumeSession(sessionId: string, lang: "en" | "ta") {
  const response = await fetch(
    `${API_BASE_URL}/api/practice/sessions/${sessionId}/resume?lang=${lang}`
  );

  if (!response.ok) {
    throw new Error("Failed to resume session");
  }

  return response.json();
}
