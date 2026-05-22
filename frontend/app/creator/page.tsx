"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase, fetchMyCreatorProfile, fetchMyPacks, createPack, unpublishPack, publishPack, deleteQuestion, updateQuestion } from "@/lib/supabase";
import type { Creator, Pack, Question } from "@/lib/supabase";
import { T, shadow } from "@/lib/tokens";

const UPLOAD_ENABLED = process.env.NEXT_PUBLIC_ENABLE_CREATOR_UPLOAD === "true";

const SUBJECTS = ["History", "Polity", "Geography", "Economy", "Science", "Tamil"];
const EXAMS = ["group4", "group2", "tet", "tnusrb"];
const EXAM_LABELS: Record<string, string> = { group4: "Group 4", group2: "Group 2", tet: "TET", tnusrb: "TNUSRB" };

type Screen = "home" | "create_details" | "create_upload" | "processing" | "review" | "edit_question";

export default function CreatorPage() {
  const router = useRouter();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>("home");

  // Create pack form
  const [packName, setPackName] = useState("");
  const [packDesc, setPackDesc] = useState("");
  const [packSubject, setPackSubject] = useState("");
  const [packExams, setPackExams] = useState<string[]>([]);
  const [currentPack, setCurrentPack] = useState<Pack | null>(null);

  // Upload
  const [tamilFile, setTamilFile] = useState<File | null>(null);
  const [englishFile, setEnglishFile] = useState<File | null>(null);
  const tamilInputRef = useRef<HTMLInputElement | null>(null);
  const englishInputRef = useRef<HTMLInputElement | null>(null);

  // Review
  const [extractedQuestions, setExtractedQuestions] = useState<Question[]>([]);
  const [editingQ, setEditingQ] = useState<Question | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const c = await fetchMyCreatorProfile();
      if (!c) { router.push("/subjects"); return; } // not a creator
      setCreator(c);

      if (c.verified) {
        const p = await fetchMyPacks(c.id);
        setPacks(p);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) return <LoadingScreen />;
  if (!creator) return null;

  // ── NOT VERIFIED ──
  if (!creator.verified) {
    return (
      <div style={{ background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 8, textAlign: "center" }}>
          உங்கள் கணக்கு சரிபார்க்கப்படுகிறது
        </div>
        <div style={{ fontSize: 14, color: T.textSec, textAlign: "center", lineHeight: 1.6, maxWidth: 280 }}>
          Your account is under review. We&apos;ll notify you once verified. Usually within 24 hours.
        </div>
        <button
          onClick={() => router.push("/subjects")}
          style={{ marginTop: 24, padding: "12px 24px", background: T.indigo, color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
        >
          Back to Practice
        </button>
      </div>
    );
  }

  const totalQuestions = packs.reduce((s, p) => s + p.question_count, 0);
  const remainingQuestions = 500 - totalQuestions;

  // ── SCREENS ──
  if (screen === "home") return (
    <HomeScreen
      creator={creator}
      packs={packs}
      setPacks={setPacks}
      totalQuestions={totalQuestions}
      remainingQuestions={remainingQuestions}
      onCreateNew={() => { setPackName(""); setPackDesc(""); setPackSubject(""); setPackExams([]); setScreen("create_details"); }}
      router={router}
    />
  );

  if (screen === "create_details") return (
    <CreateDetailsScreen
      packName={packName} setPackName={setPackName}
      packDesc={packDesc} setPackDesc={setPackDesc}
      packSubject={packSubject} setPackSubject={setPackSubject}
      packExams={packExams} setPackExams={setPackExams}
      onBack={() => setScreen("home")}
      onNext={async () => {
        if (!packName || !packSubject || packExams.length === 0) return;
        const pack = await createPack({
          creator_id: creator.id,
          name: packName,
          description: packDesc,
          subject: packSubject,
          exams: packExams,
          lang: "both",
        });
        setCurrentPack(pack);
        setTamilFile(null);
        setEnglishFile(null);
        setScreen("create_upload");
      }}
    />
  );

  if (screen === "create_upload") return (
    <UploadScreen
      tamilFile={tamilFile} setTamilFile={setTamilFile}
      englishFile={englishFile} setEnglishFile={setEnglishFile}
      tamilInputRef={tamilInputRef} englishInputRef={englishInputRef}
      onBack={() => setScreen("create_details")}
      onExtract={async () => {
        if (!tamilFile && !englishFile) return;
        setScreen("processing");
        try {
          const formData = new FormData();
          if (tamilFile) formData.append("tamil", tamilFile);
          if (englishFile) formData.append("english", englishFile);
          formData.append("pack_id", currentPack!.id);
          formData.append("creator_id", creator.id);
          formData.append("subject", packSubject);
          formData.append("exams", JSON.stringify(packExams));

          const res = await fetch("/api/creator/extract", { method: "POST", body: formData });
          const data = await res.json();
          console.log("Extract API response:", data);
          if (!res.ok) throw new Error(data.error ?? "Extraction failed");
          setExtractedQuestions(data.questions ?? []);
          setScreen("review");
        } catch {
          setScreen("create_upload");
          alert("Extraction failed. Please try again.");
        }
      }}
    />
  );

  if (screen === "processing") return <ProcessingScreen />;

  if (screen === "review") return (
    <ReviewScreen
      questions={extractedQuestions}
      setQuestions={setExtractedQuestions}
      onEdit={(q) => { setEditingQ(q); setScreen("edit_question"); }}
      onDelete={(id) => setExtractedQuestions(prev => prev.filter(q => q.id !== id))}
      publishing={publishing}
      onPublish={async () => {
        setPublishing(true);
        await publishPack(currentPack!.id);
        const updated = await fetchMyPacks(creator.id);
        setPacks(updated);
        setPublishing(false);
        setScreen("home");
      }}
    />
  );

  if (screen === "edit_question" && editingQ) return (
    <EditQuestionScreen
      question={editingQ}
      onSave={async (updated) => {
        await updateQuestion(updated.id, {
          question: updated.question,
          options: updated.options,
          correct_option: updated.correct_option,
          explanation: updated.explanation,
        });
        setExtractedQuestions(prev => prev.map(q => q.id === updated.id ? updated : q));
        setScreen("review");
      }}
      onBack={() => setScreen("review")}
    />
  );

  return null;
}

// ─────────────────────────────────────────────
// HOME SCREEN
// ─────────────────────────────────────────────
function HomeScreen({ creator, packs, setPacks, totalQuestions, remainingQuestions, onCreateNew, router }: {
  creator: Creator; packs: Pack[]; setPacks: (p: Pack[]) => void;
  totalQuestions: number; remainingQuestions: number;
  onCreateNew: () => void; router: ReturnType<typeof useRouter>;
}) {
  async function handleUnpublish(packId: string) {
    await unpublishPack(packId);
    setPacks(packs.map(p => p.id === packId ? { ...p, is_published: false } : p));
  }
  async function handlePublish(packId: string) {
    await publishPack(packId);
    setPacks(packs.map(p => p.id === packId ? { ...p, is_published: true } : p));
  }

  return (
    <div style={{ background: T.bg, fontFamily: "system-ui, sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, boxShadow: shadow.sm }}>
        <button onClick={() => router.back()} style={iconBtnStyle}>‹</button>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>என் வினாத் தொகுப்பு</div>
          <div style={{ fontSize: 11, color: T.textSec }}>{creator.name}</div>
        </div>
      </div>

      <div style={{ padding: 16, paddingBottom: 100, display: "flex", flexDirection: "column", gap: 12, maxWidth: 600, margin: "0 auto" }}>
        {/* Stats */}
        <div style={{ display: "flex", gap: 8 }}>
          <StatChip n={packs.length} label="Packs" />
          <StatChip n={totalQuestions} label="Questions" />
          <StatChip n={remainingQuestions} label="Remaining" warn={remainingQuestions < 50} />
        </div>

        {/* Template download */}
        <div style={{ background: T.indigoLight, border: `1px solid ${T.indigoMid}`, borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>📄</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.indigo }}>Question Template</div>
            <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>PDF format only · Use our format for best results</div>
          </div>
          <a href="/templates/questions-template.pdf" download style={dlBtnStyle}>Download</a>
        </div>

        {/* Create button — gated by feature flag */}
        {UPLOAD_ENABLED && (
          <button onClick={onCreateNew} style={primaryBtnStyle}>
            ＋ புதிய தொகுப்பு உருவாக்கு
          </button>
        )}
        {!UPLOAD_ENABLED && (
          <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, padding: "12px 14px", fontSize: 12, color: "#92400E", textAlign: "center" }}>
            Upload feature coming soon. Contact us on Telegram to add your questions.
          </div>
        )}

        {packs.length > 0 && (
          <>
            <div style={secLabelStyle}>உங்கள் தொகுப்புகள்</div>
            {packs.map(pack => (
              <PackCard
                key={pack.id}
                pack={pack}
                onUnpublish={() => handleUnpublish(pack.id)}
                onPublish={() => handlePublish(pack.id)}
              />
            ))}
          </>
        )}

        {packs.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 16px", color: T.textTer, fontSize: 13 }}>
            இன்னும் தொகுப்பு இல்லை — மேலே உள்ள பட்டனை அழுத்துங்கள்!
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PACK CARD
// ─────────────────────────────────────────────
function PackCard({ pack, onUnpublish, onPublish }: { pack: Pack; onUnpublish: () => void; onPublish: () => void }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, boxShadow: shadow.sm, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{pack.name}</div>
        <span style={pack.is_published ? publishedBadge : draftBadge}>
          {pack.is_published ? "Published" : "Draft"}
        </span>
      </div>
      {pack.description && <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.4 }}>{pack.description}</div>}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
        {pack.subject && <span style={pillStyle}>{pack.subject}</span>}
        {pack.exams?.map(e => <span key={e} style={pillStyle}>{EXAM_LABELS[e] ?? e}</span>)}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 11, color: T.textSec, display: "flex", gap: 8 }}>
          <span>{pack.question_count} questions</span>
          {pack.rating_count >= 5 && <span>· ⭐ {pack.avg_rating.toFixed(1)}</span>}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {pack.is_published ? (
            <button onClick={onUnpublish} style={{ ...iconBtnStyle, fontSize: 11, width: "auto", padding: "4px 10px", color: T.red }}>
              Unpublish
            </button>
          ) : (
            <button onClick={onPublish} style={{ ...iconBtnStyle, fontSize: 11, width: "auto", padding: "4px 10px", color: T.green }}>
              Publish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CREATE DETAILS SCREEN
// ─────────────────────────────────────────────
function CreateDetailsScreen({ packName, setPackName, packDesc, setPackDesc, packSubject, setPackSubject, packExams, setPackExams, onBack, onNext }: {
  packName: string; setPackName: (v: string) => void;
  packDesc: string; setPackDesc: (v: string) => void;
  packSubject: string; setPackSubject: (v: string) => void;
  packExams: string[]; setPackExams: (v: string[]) => void;
  onBack: () => void; onNext: () => void;
}) {
  const valid = packName.trim() !== "" && packSubject !== "" && packExams.length > 0;
  return (
    <PageShell title="புதிய தொகுப்பு" onBack={onBack} step={1}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="தொகுப்பின் பெயர் *">
          <input value={packName} onChange={e => setPackName(e.target.value)} placeholder="e.g. Ancient India — Group 4" style={inputStyle} />
        </Field>
        <Field label="விளக்கம்">
          <textarea value={packDesc} onChange={e => setPackDesc(e.target.value.slice(0, 200))} placeholder="What's in this pack? Who is it for?" rows={2} style={{ ...inputStyle, resize: "none" }} />
          <div style={{ fontSize: 10, color: T.textTer, textAlign: "right" }}>{packDesc.length} / 200</div>
        </Field>
        <Field label="பாடம் *">
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
            {SUBJECTS.map(s => (
              <button key={s} onClick={() => setPackSubject(s)} style={pillSelectStyle(packSubject === s)}>{s}</button>
            ))}
          </div>
        </Field>
        <Field label="தேர்வு *">
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
            {EXAMS.map(e => (
              <button key={e} onClick={() => setPackExams(packExams.includes(e) ? packExams.filter(x => x !== e) : [...packExams, e])} style={pillSelectStyle(packExams.includes(e))}>{EXAM_LABELS[e]}</button>
            ))}
          </div>
        </Field>
        <button onClick={onNext} disabled={!valid} style={{ ...primaryBtnStyle, opacity: valid ? 1 : 0.5 }}>
          அடுத்து — கோப்பு பதிவேற்று →
        </button>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────
// UPLOAD SCREEN
// ─────────────────────────────────────────────
function UploadScreen({ tamilFile, setTamilFile, englishFile, setEnglishFile, tamilInputRef, englishInputRef, onBack, onExtract }: {
  tamilFile: File | null; setTamilFile: (f: File | null) => void;
  englishFile: File | null; setEnglishFile: (f: File | null) => void;
  tamilInputRef: React.RefObject<HTMLInputElement | null>;
  englishInputRef: React.RefObject<HTMLInputElement | null>;
  onBack: () => void; onExtract: () => void;
}) {
  const valid = tamilFile !== null || englishFile !== null;
  return (
    <PageShell title="புதிய தொகுப்பு" onBack={onBack} step={2}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="தமிழ் வினாக்கள் (PDF)">
          <input ref={tamilInputRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => setTamilFile(e.target.files?.[0] ?? null)} />
          <div onClick={() => tamilInputRef.current?.click()} style={uploadZoneStyle(!!tamilFile)}>
            <div style={{ fontSize: 26 }}>{tamilFile ? "✅" : "📎"}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: tamilFile ? T.green : T.indigo }}>
              {tamilFile ? tamilFile.name : "கோப்பை இங்கே போடுங்கள்"}
            </div>
            <div style={{ fontSize: 11, color: T.textSec }}>
              {tamilFile ? `${(tamilFile.size / 1024 / 1024).toFixed(1)} MB` : "PDF only · Max 20MB"}
            </div>
          </div>
        </Field>

        <Field label={<>English Questions (PDF) <span style={{ color: T.textTer, fontWeight: 400 }}>optional</span></>}>
          <input ref={englishInputRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => setEnglishFile(e.target.files?.[0] ?? null)} />
          <div onClick={() => englishInputRef.current?.click()} style={uploadZoneStyle(!!englishFile)}>
            <div style={{ fontSize: 26 }}>{englishFile ? "✅" : "📎"}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: englishFile ? T.green : T.indigo }}>
              {englishFile ? englishFile.name : "Drop file here"}
            </div>
            <div style={{ fontSize: 11, color: T.textSec }}>
              {englishFile ? `${(englishFile.size / 1024 / 1024).toFixed(1)} MB` : "PDF only · Max 20MB"}
            </div>
          </div>
        </Field>

        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, padding: "10px 12px", fontSize: 11, color: "#92400E", lineHeight: 1.5 }}>
          💡 <strong>சிறந்த முடிவுகளுக்கு</strong> — நமது template பயன்படுத்துங்கள். எந்த format-லும் upload செய்யலாம்.
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onBack} style={{ flex: 1, padding: 12, background: T.surface, color: T.indigo, border: `1.5px solid ${T.indigoMid}`, borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← Back</button>
          <button onClick={onExtract} disabled={!valid} style={{ ...primaryBtnStyle, flex: 2, opacity: valid ? 1 : 0.5 }}>வினாக்களை சேர் →</button>
        </div>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────
// PROCESSING SCREEN
// ─────────────────────────────────────────────
function ProcessingScreen() {
  return (
    <div style={{ background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: T.indigoLight, border: `1px solid ${T.indigoMid}`, borderRadius: 16, padding: "32px 24px", textAlign: "center", maxWidth: 320, width: "100%" }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${T.indigoMid}`, borderTopColor: T.indigo, borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
        <div style={{ fontSize: 15, fontWeight: 700, color: T.indigo, marginBottom: 6 }}>வினாக்களை சரிபார்க்கப்படுகிறது...</div>
        <div style={{ fontSize: 12, color: T.textSec, marginBottom: 12 }}>உங்கள் கோப்பிலிருந்து வினாக்கள் எடுக்கப்படுகின்றன</div>
        <div style={{ fontSize: 11, color: T.textSec }}>இது சில நிமிடங்கள் ஆகலாம்</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────
// REVIEW SCREEN
// ─────────────────────────────────────────────
function ReviewScreen({ questions, setQuestions, onEdit, onDelete, publishing, onPublish }: {
  questions: Question[]; setQuestions: (q: Question[]) => void;
  onEdit: (q: Question) => void; onDelete: (id: string) => void;
  publishing: boolean; onPublish: () => void;
}) {
  return (
    <div style={{ background: T.bg, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, boxShadow: shadow.sm }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>வினாக்களை சரிபார்</div>
          <div style={{ fontSize: 11, color: T.textSec }}>{questions.length} questions extracted</div>
        </div>
        <button onClick={onPublish} disabled={publishing || questions.length === 0} style={{ padding: "8px 16px", background: T.green, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: publishing ? 0.6 : 1 }}>
          {publishing ? "..." : "வெளியிடு ✓"}
        </button>
      </div>

      <div style={{ background: T.greenBg, borderBottom: `1px solid ${T.greenBorder}`, padding: "10px 16px", fontSize: 11, color: T.green, fontWeight: 600 }}>
        ✅ {questions.length} வினாக்கள் கண்டறியப்பட்டன — சரிபார்த்து வெளியிடுங்கள்
      </div>

      <div style={{ padding: 16, paddingBottom: 100, display: "flex", flexDirection: "column", gap: 12, maxWidth: 600, margin: "0 auto" }}>
        {questions.map((q, i) => (
          <div key={q.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 12, boxShadow: shadow.sm }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: T.textTer, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Question {i + 1} · {q.lang === "ta" ? "தமிழ்" : "English"}
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => onEdit(q)} style={iconBtnStyle}>✏️</button>
                <button onClick={() => onDelete(q.id)} style={iconBtnStyle}>🗑️</button>
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text, lineHeight: 1.4, marginBottom: 8 }}>{q.question}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {q.options.map((opt, oi) => (
                <div key={oi} style={{
                  fontSize: 12, color: opt === q.correct_option ? T.green : T.textSec,
                  padding: "6px 10px", borderRadius: 8,
                  background: opt === q.correct_option ? T.greenBg : T.bg,
                  border: `1px solid ${opt === q.correct_option ? T.greenBorder : T.border}`,
                  fontWeight: opt === q.correct_option ? 600 : 400,
                }}>
                  {opt === q.correct_option ? "✓ " : ""}{opt}
                </div>
              ))}
            </div>
            {q.explanation && (
              <div style={{ marginTop: 8, fontSize: 11, color: T.textSec, background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 8, padding: "8px 10px", lineHeight: 1.4 }}>
                💡 {q.explanation}
              </div>
            )}
          </div>
        ))}
        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// EDIT QUESTION SCREEN
// ─────────────────────────────────────────────
function EditQuestionScreen({ question, onSave, onBack }: { question: Question; onSave: (q: Question) => void; onBack: () => void }) {
  const [q, setQ] = useState(question.question);
  const [opts, setOpts] = useState([...question.options]);
  const [correct, setCorrect] = useState(question.correct_option);
  const [expl, setExpl] = useState(question.explanation ?? "");
  const [saving, setSaving] = useState(false);

  const optLabels = ["A", "B", "C", "D"];

  async function handleSave() {
    setSaving(true);
    await onSave({ ...question, question: q, options: opts, correct_option: correct, explanation: expl || null });
    setSaving(false);
  }

  return (
    <PageShell title="வினா திருத்து" subtitle={`Question`} onBack={onBack} rightAction={
      <button onClick={handleSave} disabled={saving} style={{ padding: "8px 14px", background: T.surface, color: T.indigo, border: `1.5px solid ${T.indigoMid}`, borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
        {saving ? "..." : "சேமி"}
      </button>
    }>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="வினா *">
          <textarea value={q} onChange={e => setQ(e.target.value)} rows={3} style={{ ...inputStyle, resize: "none" }} />
        </Field>
        {opts.map((opt, i) => (
          <Field key={i} label={`விடை ${optLabels[i]} *`}>
            <input value={opt} onChange={e => { const n = [...opts]; n[i] = e.target.value; setOpts(n); if (correct === question.options[i]) setCorrect(e.target.value); }} style={{ ...inputStyle, borderColor: opt === correct ? T.green : T.border }} />
          </Field>
        ))}
        <Field label="சரியான விடை *">
          <div style={{ display: "flex", gap: 6 }}>
            {opts.map((opt, i) => (
              <button key={i} onClick={() => setCorrect(opt)} style={pillSelectStyle(correct === opt)}>
                {optLabels[i]}
              </button>
            ))}
          </div>
        </Field>
        <Field label={<>விளக்கம் <span style={{ color: T.textTer, fontWeight: 400 }}>optional</span></>}>
          <textarea value={expl} onChange={e => setExpl(e.target.value)} rows={2} style={{ ...inputStyle, resize: "none" }} placeholder="Explain why this answer is correct..." />
        </Field>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────
function PageShell({ title, subtitle, onBack, step, rightAction, children }: {
  title: string; subtitle?: string; onBack: () => void;
  step?: 1 | 2 | 3; rightAction?: React.ReactNode; children: React.ReactNode;
}) {
  const stepLabels = ["விவரங்கள்", "பதிவேற்று", "சரிபார்"];
  return (
    <div style={{ background: T.bg, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, boxShadow: shadow.sm }}>
        <button onClick={onBack} style={iconBtnStyle}>‹</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: T.textSec }}>{subtitle}</div>}
        </div>
        {rightAction}
      </div>

      {step && (
        <div style={{ padding: "14px 16px 0", background: T.surface, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {[1, 2, 3].map((s, i) => (
              <>
                <div key={s} style={{
                  width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700,
                  background: s < step ? T.green : s === step ? T.indigo : T.border,
                  color: s <= step ? "#fff" : T.textTer,
                }}>
                  {s < step ? "✓" : s}
                </div>
                {i < 2 && <div key={`line-${i}`} style={{ flex: 1, height: 2, background: s < step ? T.green : T.border }} />}
              </>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, paddingBottom: 12 }}>
            {stepLabels.map((l, i) => (
              <span key={l} style={{ fontSize: 10, fontWeight: i + 1 === step ? 600 : 400, color: i + 1 < step ? T.green : i + 1 === step ? T.indigo : T.textTer }}>
                {l}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: 16, maxWidth: 600, margin: "0 auto" }}>
        {children}
      </div>
    </div>
  );
}

function StatChip({ n, label, warn }: { n: number; label: string; warn?: boolean }) {
  return (
    <div style={{ flex: 1, background: warn ? T.redBg : T.indigoLight, borderRadius: 12, padding: 10, textAlign: "center" }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: warn ? T.red : T.indigo, lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 10, color: T.textSec, marginTop: 3 }}>{label}</div>
    </div>
  );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{label}</label>
      {children}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 14, color: T.textSec }}>Loading...</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const primaryBtnStyle: React.CSSProperties = {
  width: "100%", padding: 14, background: T.indigo, color: "#fff",
  border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700,
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  boxShadow: shadow.indigo,
};

const iconBtnStyle: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 10, border: `1px solid ${T.border}`,
  background: T.surface, display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", fontSize: 14, color: T.text, flexShrink: 0,
};

const inputStyle: React.CSSProperties = {
  padding: "11px 13px", border: `1.5px solid ${T.border}`, borderRadius: 10,
  fontSize: 13, color: T.text, background: T.surface, outline: "none",
  fontFamily: "system-ui, sans-serif", width: "100%", boxSizing: "border-box",
};

const secLabelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
  color: T.textTer, textTransform: "uppercase",
};

const dlBtnStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, padding: "6px 10px", borderRadius: 8,
  border: `1.5px solid ${T.indigoMid}`, background: T.surface, color: T.indigo,
  cursor: "pointer", textDecoration: "none",
};

const pillStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
  background: T.indigoLight, color: T.indigo,
};

const publishedBadge: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
  background: T.greenBg, color: T.green, border: `1px solid ${T.greenBorder}`,
  whiteSpace: "nowrap", flexShrink: 0,
};

const draftBadge: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
  background: "#FFF8E1", color: "#B45309", border: "1px solid #FDE68A",
  whiteSpace: "nowrap", flexShrink: 0,
};

const pillSelectStyle = (selected: boolean): React.CSSProperties => ({
  fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 20,
  border: `1.5px solid ${selected ? T.indigo : T.border}`,
  background: selected ? T.indigoLight : T.surface,
  color: selected ? T.indigo : T.textSec,
  cursor: "pointer",
});

const uploadZoneStyle = (done: boolean): React.CSSProperties => ({
  border: `2px dashed ${done ? T.greenBorder : T.indigoMid}`,
  borderRadius: 14, padding: "20px 16px", textAlign: "center",
  background: done ? T.greenBg : T.indigoLight,
  cursor: "pointer", display: "flex", flexDirection: "column",
  alignItems: "center", gap: 6,
});
