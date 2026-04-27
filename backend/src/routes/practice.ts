import { Router } from "express";
import { z } from "zod";
import { supabase } from "../lib/supabase.js";

export const practiceRouter = Router();

const createSessionSchema = z.object({
  user_id: z.string().uuid(),
  exam_type: z.enum(["group4", "group2", "tnusrb", "tet", "school"]),
  class: z.number().int().nullable(),
  subject: z.string().min(1),
  chapter: z.string().min(1),
  session_type: z.enum(["practice", "mock_full", "mock_pyq"]),
  total_questions: z.number().int().positive(),
  lang: z.enum(["en", "ta"])
});

type SessionType = "practice" | "mock_full" | "mock_pyq";
type QuestionLang = "en" | "ta";
type PickedQuestion = {
  id: string;
  question: string;
  options: Record<string, string>;
  correct_option: string;
  chapter: string;
  subject: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  source: string;
};

async function getPreviouslySeenQuestionIds(
  userId: string,
  excludeSessionId?: string
) {
  const { data, error } = await supabase
    .from("test_responses")
    .select("question_id, session_id, test_sessions!inner(user_id)")
    .eq("test_sessions.user_id", userId);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as Array<{ question_id: string; session_id: string }>;
  const filtered = excludeSessionId
    ? rows.filter((row) => row.session_id !== excludeSessionId)
    : rows;

  return new Set(filtered.map((row) => row.question_id));
}

async function getSessionAnsweredQuestionIds(sessionId: string) {
  const { data, error } = await supabase
    .from("test_responses")
    .select("question_id")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return new Set((data ?? []).map((row) => row.question_id));
}

async function getAnsweredCount(sessionId: string) {
  const { count, error } = await supabase
    .from("test_responses")
    .select("id", { count: "exact", head: true })
    .eq("session_id", sessionId);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

async function fetchCandidateQuestions(params: {
  classValue: number | null;
  subject: string;
  chapter: string;
  lang: QuestionLang;
  sessionType: SessionType;
  limit: number;
}) {
  let query = supabase
    .from("questions")
    .select(
      "id, question, options, correct_option, chapter, subject, topic, difficulty, source"
    )
    .eq("status", "approved")
    .eq("subject", params.subject)
    .eq("chapter", params.chapter)
    .eq("lang", params.lang)
    .order("id", { ascending: true })
    .limit(params.limit);

  if (params.classValue !== null) {
    query = query.eq("class", params.classValue);
  }

  if (params.sessionType === "mock_pyq") {
    query = query.like("source", "pyq_%");
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }
  return (data ?? []) as PickedQuestion[];
}

async function pickQuestions(params: {
  userId: string;
  classValue: number | null;
  subject: string;
  chapter: string;
  lang: QuestionLang;
  total: number;
  sessionType: SessionType;
}) {
  const seenIds = await getPreviouslySeenQuestionIds(params.userId);
  const candidates = await fetchCandidateQuestions({
    classValue: params.classValue,
    subject: params.subject,
    chapter: params.chapter,
    lang: params.lang,
    sessionType: params.sessionType,
    limit: Math.max(params.total * 5, 100)
  });

  const unseen = candidates.filter((question) => !seenIds.has(question.id));
  if (unseen.length > 0) {
    return unseen.slice(0, params.total);
  }

  // Reset strategy: once bank is exhausted for the user, allow repeats.
  return candidates.slice(0, params.total);
}

async function storeSessionQuestionOrder(
  sessionId: string,
  questions: PickedQuestion[]
) {
  const { error } = await supabase.from("test_session_questions").insert(
    questions.map((question, index) => ({
      session_id: sessionId,
      sequence_index: index,
      question_id: question.id
    }))
  );

  if (error) {
    throw error;
  }
}

async function getQuestionBySequenceIndex(sessionId: string, sequenceIndex: number) {
  const { data, error } = await supabase
    .from("test_session_questions")
    .select(
      "sequence_index, questions!inner(id, question, options, correct_option, chapter, subject, topic, difficulty, source)"
    )
    .eq("session_id", sessionId)
    .eq("sequence_index", sequenceIndex)
    .single();

  if (error) {
    throw error;
  }

  return data?.questions as PickedQuestion | null;
}

async function upsertChapterUsage(params: {
  userId: string;
  classValue: number | null;
  subject: string;
  chapter: string;
}) {
  const { data: existing, error: existingError } = await supabase
    .from("chapter_usage")
    .select("id, tests_taken")
    .eq("user_id", params.userId)
    .eq("subject", params.subject)
    .eq("chapter", params.chapter)
    .eq("class", params.classValue)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing) {
    const { error: updateError } = await supabase
      .from("chapter_usage")
      .update({
        tests_taken: existing.tests_taken + 1,
        updated_at: new Date().toISOString()
      })
      .eq("id", existing.id);
    if (updateError) {
      throw updateError;
    }
    return;
  }

  const { error: insertError } = await supabase.from("chapter_usage").insert({
    user_id: params.userId,
    class: params.classValue,
    subject: params.subject,
    chapter: params.chapter,
    tests_taken: 1,
    updated_at: new Date().toISOString()
  });

  if (insertError) {
    throw insertError;
  }
}

practiceRouter.post("/sessions", async (req, res) => {
  const parsed = createSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid session payload" });
  }

  try {
    const payload = parsed.data;
    const questions = await pickQuestions({
      userId: payload.user_id,
      classValue: payload.class,
      subject: payload.subject,
      chapter: payload.chapter,
      lang: payload.lang,
      total: payload.total_questions,
      sessionType: payload.session_type
    });

    if (questions.length === 0) {
      return res.status(404).json({ error: "No questions available" });
    }

    const { data: session, error: sessionError } = await supabase
      .from("test_sessions")
      .insert({
        user_id: payload.user_id,
        exam_type: payload.exam_type,
        class: payload.class,
        subject: payload.subject,
        chapter: payload.chapter,
        session_type: payload.session_type,
        started_at: new Date().toISOString(),
        total_questions: questions.length,
        correct_count: 0,
        last_question_index: 0
      })
      .select("id")
      .single();

    if (sessionError || !session) {
      return res.status(500).json({ error: "Failed to create session" });
    }

    await storeSessionQuestionOrder(session.id, questions);

    return res.json({
      session_id: session.id,
      progress: { index: 0, total: questions.length },
      question: questions[0]
    });
  } catch (error) {
    return res.status(500).json({ error: "Session creation failed" });
  }
});

const answerSchema = z.object({
  question_id: z.string().uuid(),
  selected_option: z.string().min(1),
  time_spent_seconds: z.number().int().nonnegative(),
  lang: z.enum(["en", "ta"])
});

practiceRouter.post("/sessions/:sessionId/answers", async (req, res) => {
  const parsed = answerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid answer payload" });
  }

  const { sessionId } = req.params;
  const answer = parsed.data;

  try {
    const { data: session, error: sessionError } = await supabase
      .from("test_sessions")
      .select("id, user_id, class, subject, chapter, session_type, total_questions, correct_count")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const answeredCount = await getAnsweredCount(sessionId);

    if (answeredCount >= session.total_questions) {
      return res.status(409).json({ error: "Session already completed" });
    }

    const expectedQuestion = await getQuestionBySequenceIndex(sessionId, answeredCount);
    if (!expectedQuestion) {
      return res.status(500).json({ error: "Question sequence is missing" });
    }

    if (expectedQuestion.id !== answer.question_id) {
      return res.status(409).json({
        error: "Answer out of sequence",
        expected_question_id: expectedQuestion.id
      });
    }

    const isCorrect = expectedQuestion.correct_option === answer.selected_option;

    const { error: responseError } = await supabase.from("test_responses").insert({
      session_id: sessionId,
      question_id: answer.question_id,
      selected_option: answer.selected_option,
      is_correct: isCorrect,
      time_spent_seconds: answer.time_spent_seconds
    });
    if (responseError) {
      return res.status(500).json({ error: "Failed to store response" });
    }

    const nextIndex = answeredCount + 1;
    const nextCorrectCount = (session.correct_count ?? 0) + (isCorrect ? 1 : 0);

    const isComplete = nextIndex >= session.total_questions;

    const updatePayload: Record<string, unknown> = {
      last_question_index: Math.min(nextIndex, session.total_questions - 1),
      correct_count: nextCorrectCount,
      updated_at: new Date().toISOString()
    };
    if (isComplete) {
      updatePayload.completed_at = new Date().toISOString();
    }

    const { error: sessionUpdateError } = await supabase
      .from("test_sessions")
      .update(updatePayload)
      .eq("id", sessionId);
    if (sessionUpdateError) {
      return res.status(500).json({ error: "Failed to update session state" });
    }

    if (isComplete) {
      await upsertChapterUsage({
        userId: session.user_id,
        classValue: session.class,
        subject: session.subject,
        chapter: session.chapter
      });

      return res.json({
        is_correct: isCorrect,
        completed: true
      });
    }

    const nextQuestion = await getQuestionBySequenceIndex(sessionId, nextIndex);

    return res.json({
      is_correct: isCorrect,
      completed: false,
      progress: { index: nextIndex, total: session.total_questions },
      next_question: nextQuestion ?? null
    });
  } catch (_error) {
    return res.status(500).json({ error: "Answer submission failed" });
  }
});

const resumeQuerySchema = z.object({
  lang: z.enum(["en", "ta"])
});

practiceRouter.get("/sessions/:sessionId/resume", async (req, res) => {
  const parsed = resumeQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "lang query param is required (en|ta)" });
  }

  const { sessionId } = req.params;
  parsed.data;

  try {
    const { data: session, error: sessionError } = await supabase
      .from("test_sessions")
      .select(
        "id, user_id, class, subject, chapter, session_type, total_questions, correct_count, completed_at"
      )
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const answeredCount = await getAnsweredCount(sessionId);

    if (session.completed_at || answeredCount >= session.total_questions) {
      return res.json({
        completed: true,
        progress: {
          index: session.total_questions,
          total: session.total_questions
        }
      });
    }

    const nextQuestion = await getQuestionBySequenceIndex(sessionId, answeredCount);

    if (!nextQuestion) {
      return res.json({
        completed: true,
        progress: {
          index: answeredCount,
          total: session.total_questions
        }
      });
    }

    return res.json({
      completed: false,
      progress: {
        index: answeredCount,
        total: session.total_questions
      },
      question: nextQuestion
    });
  } catch (_error) {
    return res.status(500).json({ error: "Failed to resume session" });
  }
});

practiceRouter.get("/sessions/:sessionId/summary", async (req, res) => {
  const { sessionId } = req.params;
  const { data, error } = await supabase
    .from("test_sessions")
    .select("id, total_questions, correct_count, completed_at")
    .eq("id", sessionId)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: "Session not found" });
  }

  return res.json(data);
});
