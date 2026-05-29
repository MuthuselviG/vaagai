"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase, fetchMyCreatorProfile, fetchMyPacks, fetchMyArchivedPacks, createPack, archivePack, unarchivePack, publishPack, deleteQuestion, updateQuestion } from "@/lib/supabase";
import type { Creator, Pack, Question } from "@/lib/supabase";
import { T, shadow } from "@/lib/tokens";

const UPLOAD_ENABLED = process.env.NEXT_PUBLIC_ENABLE_CREATOR_UPLOAD === "true";

const SUBJECTS = ["History", "Polity", "Geography", "Economy", "Science", "Tamil"];
const EXAMS = ["group4", "group2", "tet", "tnusrb"];
const EXAM_LABELS: Record<string, string> = { group4: "Group 4", group2: "Group 2", tet: "TET", tnusrb: "TNUSRB" };

const MAX_PASTE_CHARS = 5000;
const PASTE_WARN_CHARS = 4500;

type Screen = "home" | "create_details" | "create_upload" | "processing" | "review" | "edit_question";
type UploadMode = "text" | "image" | "pdf";
type PasteLang = "ta" | "en";
type PasteFormat = "with_options" | "qa_only";
type ImageMode = "auto" | "extract" | "generate";

const UPLOAD_TAB_ORDER: UploadMode[] = ["text", "image", "pdf"];
type HomeTab = "active" | "archived";

// ── LANG LABELS ──
function L(lang: "en" | "ta", en: string, ta: string) { return lang === "ta" ? ta : en; }

export default function CreatorPage() {
  const router = useRouter();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [archivedPacks, setArchivedPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>("home");
  const [lang, setLang] = useState<"en" | "ta">("ta");

  const [packName, setPackName] = useState("");
  const [packDesc, setPackDesc] = useState("");
  const [packSubject, setPackSubject] = useState("");
  const [packExams, setPackExams] = useState<string[]>([]);
  const [currentPack, setCurrentPack] = useState<Pack | null>(null);

  const [tamilFile, setTamilFile] = useState<File | null>(null);
  const [englishFile, setEnglishFile] = useState<File | null>(null);
  const tamilInputRef = useRef<HTMLInputElement | null>(null);
  const englishInputRef = useRef<HTMLInputElement | null>(null);

  const [uploadMode, setUploadMode] = useState<UploadMode>("text");
  const [pasteText, setPasteText] = useState("");
  const [pasteLang, setPasteLang] = useState<PasteLang>("ta");
  const [pasteFormat, setPasteFormat] = useState<PasteFormat>("with_options");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [imageLang, setImageLang] = useState<PasteLang>("ta");
  const [imageMode, setImageMode] = useState<ImageMode>("generate");
  const [processingMode, setProcessingMode] = useState<UploadMode>("text");

  const [extractedQuestions, setExtractedQuestions] = useState<Question[]>([]);
  const [editingQ, setEditingQ] = useState<Question | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const c = await fetchMyCreatorProfile();
      if (!c) { router.push("/subjects"); return; }
      setCreator(c);

      if (c.verified) {
        const [p, a] = await Promise.all([fetchMyPacks(c.id), fetchMyArchivedPacks(c.id)]);
        setPacks(p);
        setArchivedPacks(a);

        // Load lang from DB
        const { data: userData } = await supabase.from("users").select("lang").eq("id", user.id).single();
        if (userData?.lang === "en" || userData?.lang === "ta") setLang(userData.lang as "en" | "ta");
      }
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) return <LoadingScreen />;
  if (!creator) return null;

  if (!creator.verified) {
    return (
      <div style={{ background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, paddingTop: "30vh" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 8, textAlign: "center" }}>
          {L(lang, "Your account is under review", "உங்கள் கணக்கு சரிபார்க்கப்படுகிறது")}
        </div>
        <div style={{ fontSize: 14, color: T.textSec, textAlign: "center", lineHeight: 1.6, maxWidth: 280 }}>
          {L(lang, "We'll notify you once verified. Usually within 24 hours.", "சரிபார்க்கப்பட்டவுடன் நாங்கள் தெரிவிப்போம். பொதுவாக 24 மணி நேரத்திற்குள்.")}
        </div>
        <button onClick={() => router.push("/subjects")} style={{ marginTop: 24, padding: "12px 24px", background: T.indigo, color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          {L(lang, "Back to Practice", "பயிற்சிக்கு திரும்பு")}
        </button>
      </div>
    );
  }

  const totalQuestions = packs.reduce((s, p) => s + p.question_count, 0);
  const remainingQuestions = 2000 - totalQuestions;

  if (screen === "home") return (
    <HomeScreen
      creator={creator} packs={packs} archivedPacks={archivedPacks}
      setPacks={setPacks} setArchivedPacks={setArchivedPacks}
      totalQuestions={totalQuestions} remainingQuestions={remainingQuestions}
      lang={lang}
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
      lang={lang}
      onBack={() => setScreen("home")}
      onNext={async () => {
        if (!packName || !packSubject || packExams.length === 0) return;
        const pack = await createPack({ creator_id: creator.id, name: packName, description: packDesc, subject: packSubject, exams: packExams, lang: "both" });
        setCurrentPack(pack);
        setTamilFile(null); setEnglishFile(null); setPasteText("");
        setImageFile(null); setImageLang("ta"); setImageMode("generate");
        setUploadMode("text");
        setScreen("create_upload");
      }}
    />
  );

  if (screen === "create_upload") return (
    <UploadScreen
      tamilFile={tamilFile} setTamilFile={setTamilFile}
      englishFile={englishFile} setEnglishFile={setEnglishFile}
      tamilInputRef={tamilInputRef} englishInputRef={englishInputRef}
      uploadMode={uploadMode} setUploadMode={setUploadMode}
      pasteText={pasteText} setPasteText={setPasteText}
      pasteLang={pasteLang} setPasteLang={setPasteLang}
      pasteFormat={pasteFormat} setPasteFormat={setPasteFormat}
      imageFile={imageFile} setImageFile={setImageFile}
      imageInputRef={imageInputRef}
      imageLang={imageLang} setImageLang={setImageLang}
      imageMode={imageMode} setImageMode={setImageMode}
      lang={lang}
      onBack={() => setScreen("create_details")}
      onExtract={async () => {
        const hasPdf = tamilFile || englishFile;
        const hasText = pasteText.trim().length >= 50;
        const hasImage = imageFile !== null;
        if (uploadMode === "pdf" && !hasPdf) return;
        if (uploadMode === "text" && !hasText) return;
        if (uploadMode === "image" && !hasImage) return;
        setProcessingMode(uploadMode);
        setScreen("processing");
        try {
          const formData = new FormData();
          formData.append("pack_id", currentPack!.id);
          formData.append("creator_id", creator.id);
          formData.append("subject", packSubject);
          formData.append("exams", JSON.stringify(packExams));
          if (uploadMode === "pdf") {
            if (tamilFile) formData.append("tamil", tamilFile);
            if (englishFile) formData.append("english", englishFile);
          } else if (uploadMode === "image") {
            formData.append("image", imageFile!);
            formData.append("image_lang", imageLang);
            formData.append("image_mode", imageMode);
          } else {
            formData.append("text", pasteText);
            formData.append("text_lang", pasteLang);
            formData.append("text_format", pasteFormat);
          }
          const res = await fetch("/api/creator/extract", { method: "POST", body: formData });
          const data = await res.json();
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

  if (screen === "processing") return <ProcessingScreen lang={lang} uploadMode={processingMode} />;

  if (screen === "review") return (
    <ReviewScreen
      questions={extractedQuestions} setQuestions={setExtractedQuestions}
      lang={lang}
      onEdit={(q) => { setEditingQ(q); setScreen("edit_question"); }}
      onDelete={(id) => setExtractedQuestions(prev => prev.filter(q => q.id !== id))}
      publishing={publishing}
      onPublish={async () => {
        setPublishing(true);
        await publishPack(currentPack!.id);
        const [updated, archived] = await Promise.all([fetchMyPacks(creator.id), fetchMyArchivedPacks(creator.id)]);
        setPacks(updated); setArchivedPacks(archived);
        setPublishing(false);
        setScreen("home");
      }}
    />
  );

  if (screen === "edit_question" && editingQ) return (
    <EditQuestionScreen
      question={editingQ} lang={lang}
      onSave={async (updated) => {
        await updateQuestion(updated.id, { question: updated.question, options: updated.options, correct_option: updated.correct_option, explanation: updated.explanation });
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
function HomeScreen({ creator, packs, archivedPacks, setPacks, setArchivedPacks, totalQuestions, remainingQuestions, lang, onCreateNew, router }: {
  creator: Creator; packs: Pack[]; archivedPacks: Pack[];
  setPacks: (p: Pack[]) => void; setArchivedPacks: (p: Pack[]) => void;
  totalQuestions: number; remainingQuestions: number;
  lang: "en" | "ta"; onCreateNew: () => void; router: ReturnType<typeof useRouter>;
}) {
  const [tab, setTab] = useState<HomeTab>("active");

  async function handleArchive(pack: Pack) {
    await archivePack(pack.id, pack.was_published);
    setPacks(packs.filter(p => p.id !== pack.id));
    setArchivedPacks([{ ...pack, is_archived: true, is_published: false }, ...archivedPacks]);
  }

  async function handleUnarchive(pack: Pack) {
    await unarchivePack(pack.id);
    setArchivedPacks(archivedPacks.filter(p => p.id !== pack.id));
    setPacks([{ ...pack, is_archived: false }, ...packs]);
  }

  async function handlePublish(packId: string) {
    await publishPack(packId);
    setPacks(packs.map(p => p.id === packId ? { ...p, is_published: true } : p));
  }

  return (
    <div style={{ background: T.bg, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, boxShadow: shadow.sm }}>
        <button onClick={() => router.back()} style={iconBtnStyle}>‹</button>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{L(lang, "My Question Bank", "என் வினாத் தொகுப்பு")}</div>
          <div style={{ fontSize: 11, color: T.textSec }}>{creator.name}</div>
        </div>
      </div>

      <div style={{ padding: 16, paddingBottom: 100, display: "flex", flexDirection: "column", gap: 12, maxWidth: 600, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <StatChip n={packs.length} label={L(lang, "Packs", "தொகுப்புகள்")} />
          <StatChip n={totalQuestions} label={L(lang, "Questions", "வினாக்கள்")} />
          <StatChip n={remainingQuestions} label={L(lang, "Remaining", "மீதமுள்ளவை")} warn={remainingQuestions < 50} />
        </div>

        <div style={{ background: T.indigoLight, border: `1px solid ${T.indigoMid}`, borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>📄</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.indigo }}>{L(lang, "Question Template", "வினா வார்ப்புரு")}</div>
            <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>{L(lang, "PDF format only · Use our format for best results", "PDF வடிவம் மட்டும் · சிறந்த முடிவுகளுக்கு நமது வார்ப்புரு பயன்படுத்துங்கள்")}</div>
          </div>
          <a href="/templates/questions-template.pdf" download style={dlBtnStyle}>{L(lang, "Download", "பதிவிறக்கம்")}</a>
        </div>

        {UPLOAD_ENABLED && (
          <button onClick={onCreateNew} style={primaryBtnStyle}>
            ＋ {L(lang, "Create New Pack", "புதிய தொகுப்பு உருவாக்கு")}
          </button>
        )}
        {!UPLOAD_ENABLED && (
          <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, padding: "12px 14px", fontSize: 12, color: "#92400E", textAlign: "center" }}>
            {L(lang, "Upload feature coming soon. Contact us on Telegram to add your questions.", "பதிவேற்று வசதி விரைவில் வருகிறது. உங்கள் வினாக்களை சேர்க்க Telegram-ல் தொடர்பு கொள்ளுங்கள்.")}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: 3, gap: 3 }}>
          {(["active", "archived"] as HomeTab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: tab === t ? T.indigo : "transparent", color: tab === t ? "#fff" : T.textSec, transition: "all 0.15s" }}>
              {t === "active" ? L(lang, "My Packs", "என் தொகுப்புகள்") : L(lang, "Archived", "காப்பகம்")}
              {t === "active" && packs.length > 0 && <span style={{ marginLeft: 6, background: tab === t ? "rgba(255,255,255,0.2)" : T.indigoLight, color: tab === t ? "#fff" : T.indigo, borderRadius: 10, padding: "1px 7px", fontSize: 11 }}>{packs.length}</span>}
              {t === "archived" && archivedPacks.length > 0 && <span style={{ marginLeft: 6, background: tab === t ? "rgba(255,255,255,0.2)" : T.redBg, color: tab === t ? "#fff" : T.red, borderRadius: 10, padding: "1px 7px", fontSize: 11 }}>{archivedPacks.length}</span>}
            </button>
          ))}
        </div>

        {tab === "active" && (
          <>
            {packs.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 16px", color: T.textTer, fontSize: 13 }}>
                {L(lang, "No packs yet — create one above!", "இன்னும் தொகுப்பு இல்லை — மேலே உருவாக்குங்கள்!")}
              </div>
            )}
            {packs.map(pack => (
              <PackCard key={pack.id} pack={pack} lang={lang}
                onArchive={() => handleArchive(pack)}
                onPublish={() => handlePublish(pack.id)}
              />
            ))}
          </>
        )}

        {tab === "archived" && (
          <>
            {archivedPacks.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 16px", color: T.textTer, fontSize: 13 }}>
                {L(lang, "No archived packs.", "காப்பகப்படுத்தப்பட்ட தொகுப்புகள் இல்லை.")}
              </div>
            )}
            {archivedPacks.map(pack => (
              <PackCard key={pack.id} pack={pack} lang={lang} archived
                onUnarchive={() => handleUnarchive(pack)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PACK CARD
// ─────────────────────────────────────────────
function PackCard({ pack, lang, archived, onArchive, onPublish, onUnarchive }: {
  pack: Pack; lang: "en" | "ta"; archived?: boolean;
  onArchive?: () => void; onPublish?: () => void; onUnarchive?: () => void;
}) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, boxShadow: shadow.sm, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{pack.name}</div>
        <span style={archived ? archivedBadge : pack.is_published ? publishedBadge : draftBadge}>
          {archived ? L(lang, "Archived", "காப்பகம்") : pack.is_published ? L(lang, "Published", "வெளியிடப்பட்டது") : L(lang, "Draft", "வரைவு")}
        </span>
      </div>
      {pack.description && <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.4 }}>{pack.description}</div>}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
        {pack.subject && <span style={pillStyle}>{pack.subject}</span>}
        {pack.exams?.map(e => <span key={e} style={pillStyle}>{EXAM_LABELS[e] ?? e}</span>)}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 11, color: T.textSec, display: "flex", gap: 8 }}>
          <span>{pack.question_count} {L(lang, "questions", "வினாக்கள்")}</span>
          {pack.rating_count >= 5 && <span>· ⭐ {pack.avg_rating.toFixed(1)}</span>}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {archived && onUnarchive && (
            <button onClick={onUnarchive} style={{ ...iconBtnStyle, fontSize: 11, width: "auto", padding: "4px 10px", color: T.indigo }}>
              {L(lang, "Restore", "மீட்டெடு")}
            </button>
          )}
          {!archived && !pack.is_published && onPublish && (
            <button onClick={onPublish} style={{ ...iconBtnStyle, fontSize: 11, width: "auto", padding: "4px 10px", color: T.green }}>
              {L(lang, "Publish", "வெளியிடு")}
            </button>
          )}
          {!archived && onArchive && (
            <button onClick={onArchive} style={{ ...iconBtnStyle, fontSize: 11, width: "auto", padding: "4px 10px", color: T.red }}>
              {L(lang, "Archive", "காப்பகப்படுத்து")}
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
function CreateDetailsScreen({ packName, setPackName, packDesc, setPackDesc, packSubject, setPackSubject, packExams, setPackExams, lang, onBack, onNext }: {
  packName: string; setPackName: (v: string) => void;
  packDesc: string; setPackDesc: (v: string) => void;
  packSubject: string; setPackSubject: (v: string) => void;
  packExams: string[]; setPackExams: (v: string[]) => void;
  lang: "en" | "ta"; onBack: () => void; onNext: () => void;
}) {
  const valid = packName.trim() !== "" && packSubject !== "" && packExams.length > 0;
  return (
    <PageShell title={L(lang, "New Pack", "புதிய தொகுப்பு")} onBack={onBack} step={1} lang={lang}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label={L(lang, "Pack Name *", "தொகுப்பின் பெயர் *")}>
          <input value={packName} onChange={e => setPackName(e.target.value)} placeholder={L(lang, "e.g. Ancient India — Group 4", "எ.கா. பழங்கால இந்தியா — குழு 4")} style={inputStyle} />
        </Field>
        <Field label={L(lang, "Description", "விளக்கம்")}>
          <textarea value={packDesc} onChange={e => setPackDesc(e.target.value.slice(0, 200))} placeholder={L(lang, "What's in this pack? Who is it for?", "இந்த தொகுப்பில் என்ன உள்ளது? யாருக்காக?")} rows={2} style={{ ...inputStyle, resize: "none" }} />
          <div style={{ fontSize: 10, color: T.textTer, textAlign: "right" }}>{packDesc.length} / 200</div>
        </Field>
        <Field label={L(lang, "Subject *", "பாடம் *")}>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
            {SUBJECTS.map(s => <button key={s} onClick={() => setPackSubject(s)} style={pillSelectStyle(packSubject === s)}>{s}</button>)}
          </div>
        </Field>
        <Field label={L(lang, "Exam *", "தேர்வு *")}>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
            {EXAMS.map(e => <button key={e} onClick={() => setPackExams(packExams.includes(e) ? packExams.filter(x => x !== e) : [...packExams, e])} style={pillSelectStyle(packExams.includes(e))}>{EXAM_LABELS[e]}</button>)}
          </div>
        </Field>
        <button onClick={onNext} disabled={!valid} style={{ ...primaryBtnStyle, opacity: valid ? 1 : 0.5 }}>
          {L(lang, "Next — Upload File →", "அடுத்து — கோப்பு பதிவேற்று →")}
        </button>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────
// UPLOAD SCREEN
// ─────────────────────────────────────────────
function uploadTabLabel(mode: UploadMode, lang: "en" | "ta"): string {
  if (mode === "text") return `📋 ${L(lang, "Paste Text", "உரை ஒட்டு")}`;
  if (mode === "image") return `🖼 ${L(lang, "Image", "படம்")}`;
  return "📎 PDF";
}

function UploadScreen({ tamilFile, setTamilFile, englishFile, setEnglishFile, tamilInputRef, englishInputRef, uploadMode, setUploadMode, pasteText, setPasteText, pasteLang, setPasteLang, pasteFormat, setPasteFormat, imageFile, setImageFile, imageInputRef, imageLang, setImageLang, imageMode, setImageMode, lang, onBack, onExtract }: {
  tamilFile: File | null; setTamilFile: (f: File | null) => void;
  englishFile: File | null; setEnglishFile: (f: File | null) => void;
  tamilInputRef: React.RefObject<HTMLInputElement | null>;
  englishInputRef: React.RefObject<HTMLInputElement | null>;
  uploadMode: UploadMode; setUploadMode: (m: UploadMode) => void;
  pasteText: string; setPasteText: (t: string) => void;
  pasteLang: PasteLang; setPasteLang: (l: PasteLang) => void;
  pasteFormat: PasteFormat; setPasteFormat: (f: PasteFormat) => void;
  imageFile: File | null; setImageFile: (f: File | null) => void;
  imageInputRef: React.RefObject<HTMLInputElement | null>;
  imageLang: PasteLang; setImageLang: (l: PasteLang) => void;
  imageMode: ImageMode; setImageMode: (m: ImageMode) => void;
  lang: "en" | "ta"; onBack: () => void; onExtract: () => void;
}) {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const charCount = pasteText.length;
  const charOver = charCount > PASTE_WARN_CHARS;
  const pdfValid = tamilFile !== null || englishFile !== null;
  const textValid = pasteText.trim().length >= 50;
  const imageValid = imageFile !== null;
  const valid =
    uploadMode === "pdf" ? pdfValid :
    uploadMode === "image" ? imageValid :
    textValid;

  const withOptionsPlaceholder = pasteLang === "ta"
    ? `1. எந்த போர் பிரிட்டிஷ் ஆட்சியை நிலைநிறுத்தியது?\nA) பிளாசி போர், 1757\nB) பக்சார் போர், 1764\nC) வந்திவாஷ் போர், 1760\nD) மூன்றாம் பானிபட் போர், 1761\nAnswer: A`
    : `1. Which battle established British supremacy in India?\nA) Battle of Plassey, 1757\nB) Battle of Buxar, 1764\nC) Battle of Wandiwash, 1760\nD) Third Battle of Panipat, 1761\nAnswer: A`;

  const qaOnlyPlaceholder = pasteLang === "ta"
    ? `1. எந்த போர் பிரிட்டிஷ் ஆட்சியை நிலைநிறுத்தியது?\nAnswer: பிளாசி போர், 1757\n\n2. திருக்குறளை எழுதியவர் யார்?\nAnswer: திருவள்ளுவர்`
    : `1. Which battle established British supremacy in India?\nAnswer: Battle of Plassey, 1757\n\n2. Who wrote Thirukkural?\nAnswer: Thiruvalluvar`;

  return (
    <PageShell title={L(lang, "New Pack", "புதிய தொகுப்பு")} onBack={onBack} step={2} lang={lang}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: 3, gap: 3 }}>
          {UPLOAD_TAB_ORDER.map(mode => (
            <button key={mode} onClick={() => setUploadMode(mode)} style={{ flex: 1, padding: "9px 4px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: uploadMode === mode ? T.indigo : "transparent", color: uploadMode === mode ? "#fff" : T.textSec, transition: "all 0.15s" }}>
              {uploadTabLabel(mode, lang)}
            </button>
          ))}
        </div>

        {uploadMode === "text" && (
          <>
            <Field label={L(lang, "Language *", "மொழி *")}>
              <div style={{ display: "flex", gap: 6 }}>
                {(["ta", "en"] as PasteLang[]).map(l => <button key={l} onClick={() => setPasteLang(l)} style={pillSelectStyle(pasteLang === l)}>{l === "ta" ? "தமிழ்" : "English"}</button>)}
              </div>
            </Field>
            <Field label={L(lang, "Format *", "வடிவம் *")}>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setPasteFormat("with_options")} style={{ ...pillSelectStyle(pasteFormat === "with_options"), flex: 1 }}>Q + A + Options</button>
                <button onClick={() => setPasteFormat("qa_only")} style={{ ...pillSelectStyle(pasteFormat === "qa_only"), flex: 1 }}>Q + A only</button>
              </div>
              {pasteFormat === "qa_only" && <div style={{ fontSize: 11, color: T.textSec, marginTop: 4 }}>{L(lang, "AI will generate 3 wrong options based on the subject.", "AI பாடத்தை வைத்து 3 தவறான விடைகள் உருவாக்கும்.")}</div>}
            </Field>
            <Field label={L(lang, "Paste Questions *", "வினாக்களை ஒட்டுங்கள் *")}>
              <textarea value={pasteText} onChange={e => { if (e.target.value.length <= MAX_PASTE_CHARS) setPasteText(e.target.value); }} placeholder={pasteFormat === "with_options" ? withOptionsPlaceholder : qaOnlyPlaceholder} rows={10} style={{ ...inputStyle, resize: "none", fontFamily: "monospace", fontSize: 12, lineHeight: 1.6 }} />
              <div style={{ fontSize: 11, textAlign: "right", color: charOver ? T.red : T.textTer, fontWeight: charOver ? 600 : 400 }}>{charCount.toLocaleString()} / {MAX_PASTE_CHARS.toLocaleString()}</div>
            </Field>
          </>
        )}

        {uploadMode === "image" && (
          <>
            <Field label={L(lang, "Image *", "படம் *")}>
              <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
              <div onClick={() => imageInputRef.current?.click()} style={uploadZoneStyle(!!imageFile)}>
                <div style={{ fontSize: 26 }}>{imageFile ? "✅" : "🖼"}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: imageFile ? T.green : T.indigo }}>{imageFile ? imageFile.name : L(lang, "Drop image here", "படத்தை இங்கே போடுங்கள்")}</div>
                <div style={{ fontSize: 11, color: T.textSec }}>{imageFile ? `${(imageFile.size / 1024 / 1024).toFixed(1)} MB` : L(lang, "One image · JPEG/PNG/WebP · Max 20MB · Up to 30 questions", "ஒரு படம் · JPEG/PNG/WebP · அதிகபட்சம் 20MB · 30 வினாக்கள் வரை")}</div>
              </div>
              {imagePreviewUrl && (
                <img src={imagePreviewUrl} alt="" style={{ marginTop: 10, width: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 10, border: `1px solid ${T.border}` }} />
              )}
            </Field>
            <Field label={L(lang, "Language *", "மொழி *")}>
              <div style={{ display: "flex", gap: 6 }}>
                {(["ta", "en"] as PasteLang[]).map(l => <button key={l} onClick={() => setImageLang(l)} style={pillSelectStyle(imageLang === l)}>{l === "ta" ? "தமிழ்" : "English"}</button>)}
              </div>
            </Field>
            <Field label={L(lang, "What should we do? *", "என்ன செய்ய வேண்டும்? *")}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button onClick={() => setImageMode("extract")} style={{ ...pillSelectStyle(imageMode === "extract"), textAlign: "left" }}>
                  {L(lang, "Extract MCQs from image", "படத்திலிருந்து MCQ எடு")}
                </button>
                <button onClick={() => setImageMode("generate")} style={{ ...pillSelectStyle(imageMode === "generate"), textAlign: "left" }}>
                  {L(lang, "Generate from notes/tables", "குறிப்புகள்/அட்டவணையிலிருந்து உருவாக்கு")}
                </button>
                <button onClick={() => setImageMode("auto")} style={{ ...pillSelectStyle(imageMode === "auto"), textAlign: "left" }}>
                  {L(lang, "Auto", "தானியங்கி")}
                </button>
              </div>
              {imageMode === "generate" && (
                <div style={{ fontSize: 11, color: T.textSec, marginTop: 4 }}>
                  {L(lang, "Creates MCQs from notes, tables, or study material in the image.", "படத்தில் உள்ள குறிப்புகள், அட்டவணை அல்லது படிப்பொருளிலிருந்து MCQ உருவாக்கும்.")}
                </div>
              )}
              {imageMode === "auto" && (
                <div style={{ fontSize: 11, color: T.textSec, marginTop: 4 }}>
                  {L(lang, "Extracts visible MCQs, or generates from study content.", "தெரியும் MCQ எடுக்கும், அல்லது படிப்பொருளிலிருந்து உருவாக்கும்.")}
                </div>
              )}
            </Field>
          </>
        )}

        {uploadMode === "pdf" && (
          <>
            <Field label={L(lang, "Tamil Questions (PDF)", "தமிழ் வினாக்கள் (PDF)")}>
              <input ref={tamilInputRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => setTamilFile(e.target.files?.[0] ?? null)} />
              <div onClick={() => tamilInputRef.current?.click()} style={uploadZoneStyle(!!tamilFile)}>
                <div style={{ fontSize: 26 }}>{tamilFile ? "✅" : "📎"}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: tamilFile ? T.green : T.indigo }}>{tamilFile ? tamilFile.name : L(lang, "Drop file here", "கோப்பை இங்கே போடுங்கள்")}</div>
                <div style={{ fontSize: 11, color: T.textSec }}>{tamilFile ? `${(tamilFile.size / 1024 / 1024).toFixed(1)} MB` : "PDF only · Max 20MB"}</div>
              </div>
            </Field>
            <Field label={<>{L(lang, "English Questions (PDF)", "ஆங்கில வினாக்கள் (PDF)")} <span style={{ color: T.textTer, fontWeight: 400 }}>{L(lang, "optional", "விருப்பமானது")}</span></>}>
              <input ref={englishInputRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => setEnglishFile(e.target.files?.[0] ?? null)} />
              <div onClick={() => englishInputRef.current?.click()} style={uploadZoneStyle(!!englishFile)}>
                <div style={{ fontSize: 26 }}>{englishFile ? "✅" : "📎"}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: englishFile ? T.green : T.indigo }}>{englishFile ? englishFile.name : L(lang, "Drop file here", "கோப்பை இங்கே போடுங்கள்")}</div>
                <div style={{ fontSize: 11, color: T.textSec }}>{englishFile ? `${(englishFile.size / 1024 / 1024).toFixed(1)} MB` : "PDF only · Max 20MB"}</div>
              </div>
            </Field>
          </>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onBack} style={{ flex: 1, padding: 12, background: T.surface, color: T.indigo, border: `1.5px solid ${T.indigoMid}`, borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← {L(lang, "Back", "பின்னோக்கு")}</button>
          <button onClick={onExtract} disabled={!valid} style={{ ...primaryBtnStyle, flex: 2, opacity: valid ? 1 : 0.5 }}>{L(lang, "Add Questions →", "வினாக்களை சேர் →")}</button>
        </div>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────
// PROCESSING SCREEN
// ─────────────────────────────────────────────
function ProcessingScreen({ lang, uploadMode }: { lang: "en" | "ta"; uploadMode: UploadMode }) {
  const subtitle =
    uploadMode === "image"
      ? L(lang, "Reading your image and building questions", "உங்கள் படத்தை படித்து வினாக்கள் உருவாக்கப்படுகின்றன")
      : uploadMode === "text"
        ? L(lang, "Processing your pasted questions", "ஒட்டிய வினாக்கள் செயலாக்கப்படுகின்றன")
        : L(lang, "Extracting questions from your PDF", "PDF-லிருந்து வினாக்கள் எடுக்கப்படுகின்றன");

  return (
    <div style={{ background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, paddingTop: "30vh" }}>
      <div style={{ background: T.indigoLight, border: `1px solid ${T.indigoMid}`, borderRadius: 16, padding: "32px 24px", textAlign: "center", maxWidth: 320, width: "100%" }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${T.indigoMid}`, borderTopColor: T.indigo, borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
        <div style={{ fontSize: 15, fontWeight: 700, color: T.indigo, marginBottom: 6 }}>{L(lang, "Processing questions...", "வினாக்களை சரிபார்க்கப்படுகிறது...")}</div>
        <div style={{ fontSize: 12, color: T.textSec, marginBottom: 12 }}>{subtitle}</div>
        <div style={{ fontSize: 11, color: T.textSec }}>{L(lang, "This may take a few minutes", "இது சில நிமிடங்கள் ஆகலாம்")}</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────
// REVIEW SCREEN
// ─────────────────────────────────────────────
function ReviewScreen({ questions, setQuestions, lang, onEdit, onDelete, publishing, onPublish }: {
  questions: Question[]; setQuestions: (q: Question[]) => void;
  lang: "en" | "ta"; onEdit: (q: Question) => void; onDelete: (id: string) => void;
  publishing: boolean; onPublish: () => void;
}) {
  return (
    <div style={{ background: T.bg, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, boxShadow: shadow.sm }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{L(lang, "Review Questions", "வினாக்களை சரிபார்")}</div>
          <div style={{ fontSize: 11, color: T.textSec }}>{questions.length} {L(lang, "questions extracted", "வினாக்கள் கண்டறியப்பட்டன")}</div>
        </div>
        <button onClick={onPublish} disabled={publishing || questions.length === 0} style={{ padding: "8px 16px", background: T.green, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: publishing ? 0.6 : 1 }}>
          {publishing ? "..." : L(lang, "Publish ✓", "வெளியிடு ✓")}
        </button>
      </div>
      <div style={{ background: T.greenBg, borderBottom: `1px solid ${T.greenBorder}`, padding: "10px 16px", fontSize: 11, color: T.green, fontWeight: 600 }}>
        ✅ {questions.length} {L(lang, "questions found — review and publish", "வினாக்கள் கண்டறியப்பட்டன — சரிபார்த்து வெளியிடுங்கள்")}
      </div>
      <div style={{ padding: 16, paddingBottom: 100, display: "flex", flexDirection: "column", gap: 12, maxWidth: 600, margin: "0 auto" }}>
        {questions.map((q, i) => (
          <div key={q.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 12, boxShadow: shadow.sm }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: T.textTer, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {L(lang, "Question", "வினா")} {i + 1} · {q.lang === "ta" ? "தமிழ்" : "English"}
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => onEdit(q)} style={iconBtnStyle}>✏️</button>
                <button onClick={() => onDelete(q.id)} style={iconBtnStyle}>🗑️</button>
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text, lineHeight: 1.4, marginBottom: 8 }}>{q.question}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {q.options.map((opt, oi) => (
                <div key={oi} style={{ fontSize: 12, color: opt === q.correct_option ? T.green : T.textSec, padding: "6px 10px", borderRadius: 8, background: opt === q.correct_option ? T.greenBg : T.bg, border: `1px solid ${opt === q.correct_option ? T.greenBorder : T.border}`, fontWeight: opt === q.correct_option ? 600 : 400 }}>
                  {opt === q.correct_option ? "✓ " : ""}{opt}
                </div>
              ))}
            </div>
            {q.explanation && <div style={{ marginTop: 8, fontSize: 11, color: T.textSec, background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 8, padding: "8px 10px", lineHeight: 1.4 }}>💡 {q.explanation}</div>}
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
function EditQuestionScreen({ question, lang, onSave, onBack }: { question: Question; lang: "en" | "ta"; onSave: (q: Question) => void; onBack: () => void }) {
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
    <PageShell title={L(lang, "Edit Question", "வினா திருத்து")} subtitle={L(lang, "Question", "வினா")} onBack={onBack} lang={lang}
      rightAction={<button onClick={handleSave} disabled={saving} style={{ padding: "8px 14px", background: T.surface, color: T.indigo, border: `1.5px solid ${T.indigoMid}`, borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{saving ? "..." : L(lang, "Save", "சேமி")}</button>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label={L(lang, "Question *", "வினா *")}><textarea value={q} onChange={e => setQ(e.target.value)} rows={3} style={{ ...inputStyle, resize: "none" }} /></Field>
        {opts.map((opt, i) => (
          <Field key={i} label={`${L(lang, "Option", "விடை")} ${optLabels[i]} *`}>
            <input value={opt} onChange={e => { const n = [...opts]; n[i] = e.target.value; setOpts(n); if (correct === question.options[i]) setCorrect(e.target.value); }} style={{ ...inputStyle, borderColor: opt === correct ? T.green : T.border }} />
          </Field>
        ))}
        <Field label={L(lang, "Correct Answer *", "சரியான விடை *")}>
          <div style={{ display: "flex", gap: 6 }}>
            {opts.map((opt, i) => <button key={i} onClick={() => setCorrect(opt)} style={pillSelectStyle(correct === opt)}>{optLabels[i]}</button>)}
          </div>
        </Field>
        <Field label={<>{L(lang, "Explanation", "விளக்கம்")} <span style={{ color: T.textTer, fontWeight: 400 }}>{L(lang, "optional", "விருப்பமானது")}</span></>}>
          <textarea value={expl} onChange={e => setExpl(e.target.value)} rows={2} style={{ ...inputStyle, resize: "none" }} placeholder={L(lang, "Explain why this answer is correct...", "இந்த விடை சரியான காரணத்தை விளக்குங்கள்...")} />
        </Field>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────
// PAGE SHELL
// ─────────────────────────────────────────────
function PageShell({ title, subtitle, onBack, step, lang, rightAction, children }: {
  title: string; subtitle?: string; onBack: () => void;
  step?: 1 | 2 | 3; lang: "en" | "ta"; rightAction?: React.ReactNode; children: React.ReactNode;
}) {
  const stepLabels = [L(lang, "Details", "விவரங்கள்"), L(lang, "Upload", "பதிவேற்று"), L(lang, "Review", "சரிபார்")];
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
              <React.Fragment key={s}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, background: s < step ? T.green : s === step ? T.indigo : T.border, color: s <= step ? "#fff" : T.textTer }}>
                  {s < step ? "✓" : s}
                </div>
                {i < 2 && <div style={{ flex: 1, height: 2, background: s < step ? T.green : T.border }} />}
              </React.Fragment>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, paddingBottom: 12 }}>
            {stepLabels.map((l, i) => <span key={l} style={{ fontSize: 10, fontWeight: i + 1 === step ? 600 : 400, color: i + 1 < step ? T.green : i + 1 === step ? T.indigo : T.textTer }}>{l}</span>)}
          </div>
        </div>
      )}
      <div style={{ padding: 16, paddingBottom: 100, maxWidth: 600, margin: "0 auto" }}>{children}</div>
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
  return <div style={{ background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "40vh" }}><div style={{ fontSize: 14, color: T.textSec }}>Loading...</div></div>;
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
import React from "react";

const primaryBtnStyle: React.CSSProperties = { width: "100%", padding: 14, background: T.indigo, color: "#fff", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: shadow.indigo };
const iconBtnStyle: React.CSSProperties = { width: 32, height: 32, borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: T.text, flexShrink: 0 };
const inputStyle: React.CSSProperties = { padding: "11px 13px", border: `1.5px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.text, background: T.surface, outline: "none", fontFamily: "system-ui, sans-serif", width: "100%", boxSizing: "border-box" };
const secLabelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: T.textTer, textTransform: "uppercase" };
const dlBtnStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, padding: "6px 10px", borderRadius: 8, border: `1.5px solid ${T.indigoMid}`, background: T.surface, color: T.indigo, cursor: "pointer", textDecoration: "none" };
const pillStyle: React.CSSProperties = { fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: T.indigoLight, color: T.indigo };
const publishedBadge: React.CSSProperties = { fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: T.greenBg, color: T.green, border: `1px solid ${T.greenBorder}`, whiteSpace: "nowrap", flexShrink: 0 };
const draftBadge: React.CSSProperties = { fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: "#FFF8E1", color: "#B45309", border: "1px solid #FDE68A", whiteSpace: "nowrap", flexShrink: 0 };
const archivedBadge: React.CSSProperties = { fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: T.redBg, color: T.red, border: `1px solid ${T.redBorder}`, whiteSpace: "nowrap", flexShrink: 0 };
const pillSelectStyle = (selected: boolean): React.CSSProperties => ({ fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 20, border: `1.5px solid ${selected ? T.indigo : T.border}`, background: selected ? T.indigoLight : T.surface, color: selected ? T.indigo : T.textSec, cursor: "pointer" });
const uploadZoneStyle = (done: boolean): React.CSSProperties => ({ border: `2px dashed ${done ? T.greenBorder : T.indigoMid}`, borderRadius: 14, padding: "20px 16px", textAlign: "center", background: done ? T.greenBg : T.indigoLight, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 });
