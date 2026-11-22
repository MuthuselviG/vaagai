# MCQ Palagu — Architecture Diagrams

> Platform: **mcqpalagu.in** — Bilingual (Tamil + English) MCQ practice for TNPSC Group 2/4, TET, TNUSRB aspirants.

---

## 1. Overall System Architecture

High-level view of every major component and how they connect.

```mermaid
graph TB
    subgraph Users["👥 Users"]
        Student(["🎓 Student\n(Mobile Browser)"])
        Creator(["✍️ Creator / Expert"])
        Admin(["🔑 Admin"])
    end

    subgraph ExternalNews["📰 News Source"]
        PIB["PIB.gov.in\nPress Releases"]
    end

    subgraph QuestionSources["📚 Question Sources (Offline)"]
        TNPSCJob["TNPSC Job\nSamacheer Books\n(Scanned PDFs)"]
        WisdomAcademy["Wisdom Academy\nMaterial\n(Scanned PDFs)"]
    end

    subgraph ScriptsRepo["🔧 OCR Scripts Repo (Separate)"]
        OCRPipeline["Gemini Files API\nOCR + Extraction Pipeline"]
    end

    subgraph GHActions["⚙️ GitHub Actions"]
        Cron["Nightly Cron\n2 AM IST (UTC 20:30)"]
        CAScript["current-affairs.ts\nscrape → generate → upsert"]
    end

    subgraph Vercel["☁️ Vercel — mcqpalagu.in"]
        NextJS["Next.js 15 App Router\nReact 19 + TypeScript\n25+ Routes"]
        subgraph API["API Routes"]
            CreatorAPI["/api/creator/extract\nMCQ extraction"]
            CronAPI["/api/cron/current-affairs\nCA generation trigger"]
            MockAPI["/api/mock/questions\nPYQ question fetch"]
            AdminAPI["/api/admin/login\nhttpOnly cookie auth"]
        end
    end

    subgraph SupabaseCloud["🗄️ Supabase Cloud"]
        GoogleOAuth["Google OAuth"]
        PG[("PostgreSQL\nquestions · users · creators\npacks · test_sessions\ncurrent_affairs · chapter_usage")]
    end

    Gemini["⚡ Google Gemini 2.5 Flash\nOCR · Extraction · Generation · Translation"]

    Analytics["📊 Vercel Analytics\n+ Google Analytics"]

    %% User flows
    Student -->|practice, mock, CA| NextJS
    Creator -->|upload packs| NextJS
    Admin -->|dashboard| NextJS

    %% Auth
    NextJS <-->|OAuth flow| GoogleOAuth
    NextJS <-->|queries / RLS| PG

    %% Cron pipeline
    Cron -->|triggers| CAScript
    PIB -->|scraped by| CAScript
    CAScript -->|30 Q/day via Gemini| Gemini
    CAScript -->|upsert 60 rows EN+TA| PG

    %% Creator upload
    CreatorAPI -->|extract / generate| Gemini
    CreatorAPI -->|insert questions| PG

    %% OCR pipeline (separate repo)
    TNPSCJob -->|PDFs| OCRPipeline
    WisdomAcademy -->|PDFs| OCRPipeline
    OCRPipeline -->|Files API OCR| Gemini
    Gemini -->|JSON questions| PG

    %% Analytics
    NextJS --> Analytics
```

---

## 2. Question Ingestion — OCR Pipeline (Separate Repo)

How the **6,400+ Samacheer Kalvi questions** (Class 6–10) and **1,800+ PYQ questions** got into the database.

```mermaid
flowchart LR
    subgraph Sources["📚 Source Material"]
        A1["TNPSC Job\nSamacheer Books\nClass 6–10"]
        A2["Wisdom Academy\nPYQ Papers\n2012–2025"]
    end

    subgraph ScriptsRepo["🔧 Scripts Repo (Separate Repo)"]
        B1["Upload PDF/Image\nto Gemini Files API"]
        B2["Send file_uri + OCR prompt\nwith strict JSON schema"]
        B3["Parse & validate\nJSON response\n(Q + 4 options + answer)"]
        B4["Assign metadata\n• class · subject · chapter\n• is_group4/2/tet/tnusrb\n• difficulty · lang"]
        B5["Bilingual check\nGenerate TA if EN-only"]
    end

    GeminiFiles["⚡ Gemini 2.5 Flash\nFiles API — multimodal OCR"]

    subgraph DB["🗄️ Supabase"]
        QTable[("questions table\nstatus: approved\nsource: pyq / samacheer\n8,200+ rows total")]
    end

    A1 -->|scanned PDFs| B1
    A2 -->|scanned PDFs| B1
    B1 -->|file_uri| GeminiFiles
    GeminiFiles -->|structured JSON| B2
    B2 --> B3 --> B4 --> B5
    B5 -->|bulk upsert| QTable
```

---

## 3. Daily Current Affairs Automation

How **~30 bilingual MCQs/day** are auto-generated and stored without any manual work.

```mermaid
flowchart TD
    A(["⏰ GitHub Actions Cron\n30 20 * * *\n= 2:00 AM IST"])

    B["1. Fetch recent topics\nfrom current_affairs table\n(last 5 days — for dedup)"]

    C["2. Scrape PIB.gov.in\n10 latest press releases\ntitle + text up to 1500 chars"]

    D["3a. PIB-grounded Questions\n4 batches × 5 = 20 MCQs\nvia Gemini 2.5 Flash"]

    E["3b. Knowledge-based Questions\n2 batches × 5 = 10 MCQs\nfrom Gemini's knowledge"]

    F{{"4. Validate each batch\n✓ Subject must be one of 6 valid\n✓ ≥ 3 of 5 questions TN-focused\n✓ No duplicates vs. recent topics\n✓ Distractor names must be real"}}

    G["5. Generate bilingual pairs\nEN question → TA translation\n1 Gemini call = 2 DB rows"]

    H["6. Generate unique slugs\nEN: 8 words, TA: 6 words\nRemove stop words, lowercase"]

    I[("7. Upsert to Supabase\ncurrent_affairs table\n~60 rows per day\n30 EN + 30 TA\nconflict on (question, lang) → ignore")]

    A --> B
    B --> C
    C --> D
    B --> E
    D --> F
    E --> F
    F -->|valid| G
    F -->|invalid batch| D
    G --> H
    H --> I

    style I fill:#22c55e,color:#fff
    style A fill:#6366f1,color:#fff
```

**Valid subjects (hardcoded):** General Science · Geography · History · Indian Polity · Economy · General Tamil

---

## 4. User Auth & Onboarding Flow

```mermaid
flowchart TD
    A(["User visits mcqpalagu.in"])

    B{"Supabase\nsession exists?"}

    C["/login\nGoogle OAuth button"]

    D["Supabase redirects\nto Google Sign-In"]

    E["Google authenticates"]

    F["/auth/callback\nchecks auth.users"]

    G{"First time?\ncheck users table"}

    H["/onboarding\n• Display name\n• Exam type: Group2/4/TET/TNUSRB\n• Taluk (128 TN taluks)\n• Language: Tamil / English"]

    I["INSERT into users table\nphone, name, exam_type,\nlanguage, taluk"]

    J["/subjects\nPractice hub — browse\nsubjects, chapters, levels"]

    K["Public pages work\nwithout login\n(CA, experts, study materials)"]

    A --> B
    B -->|No, wants to practice| C
    B -->|Yes| J
    B -->|Just browsing| K
    C --> D --> E --> F
    F --> G
    G -->|New user| H
    G -->|Existing user| J
    H --> I --> J

    style J fill:#22c55e,color:#fff
    style I fill:#3b82f6,color:#fff
```

---

## 5. Practice Session Flow

How a student goes from subject selection to a scored result — entirely client-side state via `localStorage`.

```mermaid
flowchart TD
    A(["Student on /subjects"])

    B["Select Subject → Chapter"]

    C{"Session type?"}

    D["Subject Practice\nfetchQuestionsForLevel()\noffset + limit pagination"]
    E["PYQ Paper\nfetchQuestionsForPYQ()\nby year + group + lang"]
    F["Expert Pack\nfetchQuestionsForPack()\nordered by pack_order"]
    G["Current Affairs\nfetchQuestionsForCADaily()\nor fetchQuestionsForCAMonthly()"]
    H["Mock Exam\n200 questions · 3 hours\nfetchQuestionsForMock()"]

    I["Load questions\nfrom Supabase\n(RLS-filtered, lang-aware)"]

    J["startSession()\n• Generate UUID\n• Store in localStorage\n• Record subject/chapter/level"]

    K["Render MCQ\nQuestionText component\n• Regular · Assertion-Reason\n• Match-the-List · Multi-statement"]

    L["Student selects option\n+ timer starts counting"]

    M["recordResponse()\n• question_id\n• selected_option\n• is_correct\n• time_spent_seconds\n→ saved to localStorage"]

    N{"More questions?"}

    O["completeSession()\nset completed_at timestamp"]

    P["Show Results\n• Score %\n• Correct / Wrong / Skipped\n• Explanation reveal\n• Time per question"]

    Q[("localStorage\nmax 100 sessions\nscore history on /score")]

    A --> B --> C
    C --> D & E & F & G & H
    D & E & F & G & H --> I
    I --> J --> K --> L --> M
    M --> Q
    M --> N
    N -->|Yes| K
    N -->|No| O --> P

    style P fill:#22c55e,color:#fff
    style Q fill:#f59e0b,color:#fff
```

---

## 6. Creator Upload Flow

How a verified creator builds and publishes an expert question pack.

```mermaid
flowchart TD
    A(["Verified creator on /creator"])

    B["Create new Pack\n• Name, subject, exam targets\n• is_free / paid"]

    C{"Upload mode?"}

    D["📝 Text paste\nQ + Options + Answer format\nor Q + Answer only"]
    E["🖼️ Image upload\nJPEG / PNG / WebP\ntextbook pages, handwritten notes"]
    F["📄 PDF upload\nTamil + English PDFs\nup to 20MB each"]

    G["POST /api/creator/extract\n+ subject + exam flags\n+ pack_id + creator_id"]

    H["Gemini 2.5 Flash\nMultimodal processing\n• PDF: strict extraction mode\n• Image: auto-detect extract/generate\n• Text: parse or generate distractors"]

    I{{"Safety & quality checks\n✓ Anti-prompt injection\n✓ No profanity / hate content\n✓ Validate 4 options per Q\n✓ No hallucinated questions"}}

    J["INSERT into questions\n• source_type: expert\n• status: approved\n• pack_id, pack_order\n• creator_id\n• is_group4/2/tet/tnusrb flags\nLimits: 50 text · 30 image · 50 PDF"]

    K["UPDATE packs\nquestion_count += N"]

    L["Creator reviews\ninserted questions in UI\n(can delete bad ones)"]

    M["Publish Pack\nmark is_published = true"]

    N(["Pack visible on\n/experts/[slug]/[packId]"])

    A --> B --> C
    C --> D & E & F
    D & E & F --> G --> H --> I
    I -->|pass| J
    I -->|fail| G
    J --> K --> L --> M --> N

    style N fill:#22c55e,color:#fff
    style M fill:#3b82f6,color:#fff
```

---

## 7. Database Schema

Tables, columns, and relationships at a glance.

```mermaid
erDiagram
    users {
        uuid id PK
        text phone UK
        text name
        text language "ta | en"
        text exam_type "group4 | group2 | tnusrb | tet | school"
        boolean is_paid
        timestamp paid_until
        timestamp created_at
    }

    questions {
        uuid id PK
        text question
        text lang "en | ta"
        jsonb options "array of 4"
        text correct_option
        text subject
        text chapter
        text topic
        text difficulty "easy | medium | hard"
        text class "6-10"
        text source "pyq | expert | current_affairs"
        text source_type
        text status "draft | approved | rejected"
        uuid pack_id FK
        uuid creator_id FK
        boolean is_group4
        boolean is_group2
        boolean is_tet
        boolean is_tnusrb
    }

    test_sessions {
        uuid id PK
        uuid user_id FK
        text session_type "practice | mock_full | mock_pyq"
        text subject
        text chapter
        timestamp started_at
        timestamp completed_at
        int total_questions
        int correct_count
    }

    test_responses {
        uuid id PK
        uuid session_id FK
        uuid question_id FK
        text selected_option
        boolean is_correct
        int time_spent_seconds
    }

    test_session_questions {
        uuid id PK
        uuid session_id FK
        uuid question_id FK
        int sequence_index
    }

    current_affairs {
        uuid id PK
        text question
        jsonb options
        text correct_option
        text explanation
        text lang "en | ta"
        text subject
        text topic
        date published_date
        text source_ministry
        text source_url
        text source_date
    }

    creators {
        uuid id PK
        uuid user_id FK
        text name
        text slug UK
        boolean verified
        text section "vazhikatti | buddies"
        text accent_color
        text bio
        text social_youtube
        text social_instagram
        text social_telegram
    }

    packs {
        uuid id PK
        uuid creator_id FK
        text name
        text subject
        jsonb exams
        boolean is_published
        boolean is_free
        int question_count
    }

    chapter_usage {
        uuid user_id FK
        text class
        text subject
        text chapter
        int tests_taken
    }

    users ||--o{ test_sessions : "takes"
    test_sessions ||--o{ test_responses : "records"
    test_sessions ||--o{ test_session_questions : "orders"
    questions ||--o{ test_responses : "answered in"
    questions ||--o{ test_session_questions : "included in"
    creators ||--o{ packs : "owns"
    packs ||--o{ questions : "contains"
    users ||--o{ chapter_usage : "tracks"
    creators }|--|| users : "profile of"
```

---

## 8. Feature: Current Affairs Study Pages (SEO)

How CA questions become SEO-indexed study material at `/tnpsc-study-materials/`.

```mermaid
flowchart LR
    A[("current_affairs table\nquestions + explanations\nper published_date")]

    B["Server-side page\n/tnpsc-study-materials/\ncurrent-affairs/[month]"]

    C["Unit landing page\n/tnpsc-study-materials/\ncurrent-affairs/[month]/[unit]"]

    D["CA_UNIT_SUBJECTS map\ngeneral-science\ngeography\nindian-history\nindian-polity\nwelfare-schemes\narchaeology-updates"]

    E["Static generation\nnext.js generateStaticParams\nfor all months × units"]

    F["Indexed by Google\nTNPSC current affairs\n[month] [year] queries"]

    A --> B
    B --> C
    D -->|filters questions by subject| C
    C --> E --> F

    style F fill:#22c55e,color:#fff
```

---

## Route Map

| Route | Auth | Description |
|-------|------|-------------|
| `/` | No | Landing — featured packs, CA promo, creator CTA |
| `/subjects` | Yes | Browse subjects → chapters → levels |
| `/practice/[subject]/[chapter]` | Yes | Timed MCQ session with flag + explanation |
| `/mock` | Yes | Mock test landing — year selection |
| `/mock/[year]` | Yes | 200-question mock (3 hours) |
| `/mock/[year]/result` | Yes | Results and answer review |
| `/pyq/[group]/[year]` | Yes | PYQ paper — Tamil + General Studies |
| `/current-affairs` | No | Daily CA browser — calendar view |
| `/tnpsc-study-materials/current-affairs/[month]/[unit]` | No | SEO CA unit detail |
| `/experts` | No | Browse verified creators + packs |
| `/experts/[slug]/[packId]` | No | Expert pack detail + practice |
| `/creator` | Yes + verified | Creator dashboard — manage packs |
| `/admin-fun-panrom` | Admin cookie | Admin dashboard |
| `/onboarding` | Yes | Name, exam type, taluk setup |
| `/score` | Yes | User score history |
| `/login` | No | Google OAuth |
| `/auth/callback` | — | OAuth redirect handler |
