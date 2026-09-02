"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import QuestionForm, { QuestionFormValue } from "../QuestionForm";
import { APC } from "@/lib/adminPyqTokens";

export default function EditPyqQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [value, setValue] = useState<QuestionFormValue | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/pyq-correct/questions/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        const q = data.question;
        setValue({
          question: q.question ?? "",
          options: Array.isArray(q.options) ? q.options : ["", "", "", ""],
          correct_option: q.correct_option ?? "",
          explanation: q.explanation ?? "",
          subject: q.subject ?? "",
          topic: q.topic ?? "",
          lang: q.lang === "ta" ? "ta" : "en",
          pyq_years: q.pyq_years ?? [],
          pyq_groups: q.pyq_groups ?? [],
          status: q.status ?? "approved",
        });
      })
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div style={{ minHeight: "100vh", background: APC.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, fontFamily: "system-ui, sans-serif" }}>
        <span style={{ fontSize: 14, color: APC.textSec }}>Question not found.</span>
        <a onClick={() => router.push("/admin/pyq-correct")} style={{ fontSize: 13, color: APC.accent, cursor: "pointer" }}>← Back to list</a>
      </div>
    );
  }

  if (!value) {
    return (
      <div style={{ minHeight: "100vh", background: APC.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
        <span style={{ fontSize: 14, color: APC.textSec }}>Loading…</span>
      </div>
    );
  }

  return <QuestionForm questionId={id} initialValue={value} />;
}
