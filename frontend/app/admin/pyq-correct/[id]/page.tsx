"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import QuestionForm, { QuestionFormValue } from "../QuestionForm";
import { T } from "@/lib/tokens";

const PAGE_SIZE = 20;

function EditPyqQuestionPageInner() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const year = searchParams.get("year") ?? "";
  const paper = searchParams.get("paper") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1") || 1;

  const [value, setValue] = useState<QuestionFormValue | null>(null);
  const [hasOriginalVersion, setHasOriginalVersion] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [nextHref, setNextHref] = useState<string | null>(null);
  const [queuePosition, setQueuePosition] = useState<{ position: number; total: number } | null>(null);

  const filterParams = new URLSearchParams();
  if (year) filterParams.set("year", year);
  if (paper) filterParams.set("paper", paper);
  filterParams.set("page", String(page));
  const listHref = `/admin/pyq-correct?${filterParams}`;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/pyq-correct/questions/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          if (!cancelled) setNotFound(true);
          return;
        }
        const data = await res.json();
        if (cancelled) return;
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
        setHasOriginalVersion(q.original_version != null);
      })
      .catch(() => { if (!cancelled) setNotFound(true); });
    return () => { cancelled = true; };
  }, [id]);

  // Work out the next question in this filtered queue, for "Save & Next".
  useEffect(() => {
    let cancelled = false;

    async function loadQueue() {
      const p = new URLSearchParams();
      if (year) p.set("year", year);
      if (paper) p.set("paper", paper);
      p.set("page", String(page));

      const res = await fetch(`/api/admin/pyq-correct/questions?${p}`);
      if (!res.ok || cancelled) return;
      const data = await res.json();
      const ids: string[] = (data.questions ?? []).map((q: { id: string }) => q.id);
      const total: number = data.total ?? 0;
      const idx = ids.indexOf(id);
      if (idx === -1) return;

      const position = (page - 1) * PAGE_SIZE + idx + 1;
      if (!cancelled) setQueuePosition({ position, total });

      function hrefFor(nextId: string, nextPage: number) {
        const np = new URLSearchParams();
        if (year) np.set("year", year);
        if (paper) np.set("paper", paper);
        np.set("page", String(nextPage));
        return `/admin/pyq-correct/${nextId}?${np}`;
      }

      if (idx + 1 < ids.length) {
        if (!cancelled) setNextHref(hrefFor(ids[idx + 1], page));
        return;
      }

      if (position < total) {
        const p2 = new URLSearchParams();
        if (year) p2.set("year", year);
        if (paper) p2.set("paper", paper);
        p2.set("page", String(page + 1));
        const res2 = await fetch(`/api/admin/pyq-correct/questions?${p2}`);
        if (!res2.ok || cancelled) return;
        const data2 = await res2.json();
        const nextId = data2.questions?.[0]?.id;
        if (nextId && !cancelled) setNextHref(hrefFor(nextId, page + 1));
      }
    }

    loadQueue();
    return () => { cancelled = true; };
  }, [id, year, paper, page]);

  if (notFound) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, fontFamily: "var(--font-noto-sans-tamil), var(--font-inter), sans-serif" }}>
        <span style={{ fontSize: 14, color: T.textSec }}>வினா கிடைக்கவில்லை.</span>
        <a onClick={() => router.push(listHref)} style={{ fontSize: 13, color: T.indigo, cursor: "pointer", fontWeight: 700 }}>← பட்டியலுக்குத் திரும்பு</a>
      </div>
    );
  }

  if (!value) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-noto-sans-tamil), var(--font-inter), sans-serif" }}>
        <span style={{ fontSize: 14, color: T.textSec }}>ஏற்றுகிறது…</span>
      </div>
    );
  }

  return (
    <QuestionForm
      questionId={id}
      initialValue={value}
      hasOriginalVersion={hasOriginalVersion}
      nextHref={nextHref}
      listHref={listHref}
      queuePosition={queuePosition}
    />
  );
}

export default function EditPyqQuestionPage() {
  return (
    <Suspense fallback={null}>
      <EditPyqQuestionPageInner />
    </Suspense>
  );
}
