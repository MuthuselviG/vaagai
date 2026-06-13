// Curated from frontend/data/pyq-topic-map.json (828 EN questions, 9 papers: 2012,13,14,16,18,19,22,24,25).
// misc-current-affairs / general-knowledge-misc / misc-modern-tn buckets are extraction
// mislabels (not real syllabus topics) and are deliberately excluded from display.

export type Topic = {
  label: string;
  n: number;
  papers: number;
  rising?: boolean;
};

export type Unit = {
  key: string;
  marks: number;
  short: string;
  name: string;
  tamil: string;
  color: string;
  soft: string;
  ease: string;
  intro: string;
  topics: Topic[];
};

export const PAPER_COUNT = 9;
export const MAX_TOPIC_COUNT = 38; // biology-zoology — used as the bar-scale reference across all units
export const TOTAL_MARKS = 100;

export const UNITS: Unit[] = [
  {
    key: "tnhistory",
    marks: 20,
    short: "TN History",
    name: "Tamil Nadu History & Culture",
    tamil: "தமிழ்நாடு வரலாறு",
    color: "#E8552B",
    soft: "#FDEAE3",
    ease: "Story-based. Easy to remember. Start here.",
    intro:
      "Tamil Nadu History & Culture (Unit VI) carries 20 of the 100 marks — the single highest-weighted unit in the Group 4 GS paper. Across the 9 papers from 2012 to 2025, Tamil literature and authors were the most repeated topic (13 questions across 5 papers), followed by social reformers such as Periyar and Muthulakshmi Ammaiyar (10 questions, 5 papers). Thirukkural is this unit's standout riser — zero questions before 2022, then 10 in the three papers since, making it a near-certain topic every year now. TN freedom fighters such as Veerapandiya Kattabomman, Velu Nachiyar, V.O. Chidambaram Pillai and the Marudhu Brothers also feature heavily in 2022–2025 papers.",
    topics: [
      { label: "Tamil literature & authors", n: 13, papers: 5 },
      { label: "Social reformers (Periyar, Muthulakshmi…)", n: 10, papers: 5 },
      { label: "Thirukkural", n: 10, papers: 3, rising: true },
      { label: "Tamil society & excavations (Keezhadi)", n: 9, papers: 6 },
      { label: "TN freedom fighters (Kattabomman, VOC…)", n: 8, papers: 4, rising: true },
      { label: "TN politics & Dravidian movement", n: 6, papers: 5 },
    ],
  },
  {
    key: "economy",
    marks: 20,
    short: "Economy",
    name: "Indian Economy & TN Development",
    tamil: "பொருளாதாரம்",
    color: "#1F9D8F",
    soft: "#E2F4F1",
    ease: "Learn TN govt schemes + Five Year Plans first.",
    intro:
      "Indian Economy & TN Development (Unit V) also carries 20 marks. Five Year Plans and NITI Aayog questions appear in 8 of the 9 papers (15 questions total) — the most consistently-asked topic in this unit. But TN government schemes and development is the fastest-growing topic: just 1 question in 2012, rising to 7 in the 2024 paper alone, for 16 questions total across 5 papers — the biggest jump of any topic on this page. Tax/GST/RBI/banking and poverty-population-education each contribute 11 questions across 7 papers, with industry, economy basics (10 each) and agriculture/land reforms (9) rounding out the unit.",
    topics: [
      { label: "TN schemes & development", n: 16, papers: 5, rising: true },
      { label: "Five Year Plans, NITI Aayog", n: 15, papers: 8 },
      { label: "Tax, GST, RBI, banking", n: 11, papers: 7 },
      { label: "Poverty, population, education", n: 11, papers: 7 },
      { label: "Industry & policy", n: 10, papers: 6 },
      { label: "Economy basics", n: 10, papers: 6 },
      { label: "Agriculture & land reforms", n: 9, papers: 4 },
    ],
  },
  {
    key: "polity",
    marks: 15,
    short: "Polity",
    name: "Indian Polity",
    tamil: "அரசியலமைப்பு",
    color: "#3D52A0",
    soft: "#EEF1FA",
    ease: "Constitution basics repeat every year. Master them.",
    intro:
      "Indian Polity (Unit IV) carries 15 marks. Constitution basics — the Preamble, salient features and amendments — is the clear leader with 15 questions across 6 papers. Union executive topics (President, PM, Attorney General) and Centre-State relations are tied at 10 questions each, with Centre-State relations spread across 7 of the 9 papers — the widest spread in the unit. Judiciary questions appear in 8 of 9 papers (9 questions), Fundamental Rights in 5 papers (9 questions), and local government / Panchayat Raj rounds out the top six with 8 questions across 4 papers.",
    topics: [
      { label: "Constitution, Preamble, amendments", n: 15, papers: 6 },
      { label: "President, PM, Union executive", n: 10, papers: 5 },
      { label: "Centre–State, Finance Commission", n: 10, papers: 7 },
      { label: "Judiciary & courts", n: 9, papers: 8 },
      { label: "Fundamental Rights", n: 9, papers: 5 },
      { label: "Local govt & Panchayat Raj", n: 8, papers: 4 },
    ],
  },
  {
    key: "history",
    marks: 10,
    short: "History",
    name: "History & Freedom Movement",
    tamil: "இந்திய வரலாறு",
    color: "#C2410C",
    soft: "#FBEADF",
    ease: "Focus Mughals, Cholas, and the freedom struggle.",
    intro:
      "History, Culture of India & the Indian National Movement (Unit III) carries 10 marks but has the densest topic spread on this page. Medieval India — Mughals, Marathas, the Delhi Sultanate and Vijayanagar — leads with 20 questions across 7 papers, just ahead of the freedom movement / Congress (17 questions, 7 papers) and ancient India (Mauryas, Guptas — also 17 questions, 7 papers). Indian culture appears in all 9 papers (16 questions) — the most consistent topic of any unit — and national leaders contribute 15 questions across 6 papers. Indus Valley Civilization is the rising topic here: 7 questions across 6 papers, with several appearing only since the syllabus revision.",
    topics: [
      { label: "Medieval India (Mughals, Marathas)", n: 20, papers: 7 },
      { label: "Freedom movement & Congress", n: 17, papers: 7 },
      { label: "Ancient India (Mauryas, Guptas)", n: 17, papers: 7 },
      { label: "Indian culture", n: 16, papers: 9 },
      { label: "National leaders", n: 15, papers: 6 },
      { label: "Indus Valley", n: 7, papers: 6, rising: true },
    ],
  },
  {
    key: "science",
    marks: 5,
    short: "Science",
    name: "General Science",
    tamil: "பொது அறிவியல்",
    color: "#7C3AED",
    soft: "#F0E9FC",
    ease: "Biology is half of Science. Study it first.",
    intro:
      "General Science (Unit I) carries only 5 marks but is the single largest topic pool — 183 questions across the 9 papers. Biology of the human body (blood, hormones, organs, genetics) is the single most-repeated topic on this entire page: 38 questions, asked in every one of the 9 papers. Chemistry (31 questions) and Physics (26 questions) are also asked in all 9 papers. Plant biology — photosynthesis, classification, reproduction — adds 24 questions across 8 papers, and space/ISRO questions appear 19 times across 8 papers, reflecting TNPSC's steady interest in India's space programme.",
    topics: [
      { label: "Biology — human body", n: 38, papers: 9 },
      { label: "Chemistry", n: 31, papers: 9 },
      { label: "Physics", n: 26, papers: 9 },
      { label: "Biology — plants", n: 24, papers: 8 },
      { label: "Space & ISRO", n: 19, papers: 8 },
    ],
  },
  {
    key: "geography",
    marks: 5,
    short: "Geography",
    name: "Geography",
    tamil: "புவியியல்",
    color: "#0D9488",
    soft: "#DEF3F0",
    ease: "Maps, rivers, ports. TN geography matters most.",
    intro:
      "Geography (Unit II) carries 5 marks. Transport and communication — ports, railways, highways, metro — is the leading topic with 10 questions across 5 papers. World geography and earth location (latitudes, longitudes, continents) follow with 8 questions across 4 papers, and Tamil Nadu-specific geography (windfarms, hills, sanctuaries, forest cover) accounts for 6 questions across 4 papers. Forests & wildlife sanctuaries (6 questions, 5 papers) and rivers & water resources (5 questions, 4 papers) complete the top five.",
    topics: [
      { label: "Transport — ports, railways", n: 10, papers: 5 },
      { label: "World & earth location", n: 8, papers: 4 },
      { label: "Tamil Nadu geography", n: 6, papers: 4 },
      { label: "Forests & wildlife", n: 6, papers: 5 },
      { label: "Rivers & water", n: 5, papers: 4 },
    ],
  },
  {
    key: "aptitude",
    marks: 25,
    short: "Aptitude",
    name: "Aptitude & Reasoning",
    tamil: "கணிதம் & திறனறிவு",
    color: "#D97706",
    soft: "#FCEFD9",
    ease: "Practice HCF/LCM & area daily. Easy, sure marks.",
    intro:
      "Aptitude & Reasoning (Part B) carries 25 marks — a quarter of the whole paper, and the single largest mark allocation of any unit. HCF & LCM (22 questions, 8 of 9 papers) and area/volume/mensuration (22 questions, 7 papers) are the most reliable topics. Interest — simple and compound combined — adds another 22 questions across 8 papers. Ratio & proportion (19 questions, 8 papers), simplification (16 questions, 6 papers) and number series (15 questions, 6 papers) round out the most-repeated topics. Because the question types repeat closely year to year, this unit rewards daily practice more than any other.",
    topics: [
      { label: "Area & volume (mensuration)", n: 22, papers: 7 },
      { label: "HCF & LCM", n: 22, papers: 8 },
      { label: "Interest (Simple + Compound)", n: 22, papers: 8 },
      { label: "Ratio & proportion", n: 19, papers: 8 },
      { label: "Simplification", n: 16, papers: 6 },
      { label: "Number series", n: 15, papers: 6 },
    ],
  },
];

export type RisingTopic = {
  topic: string;
  unit: string;
  note: string;
  color: string;
};

export const RISING: RisingTopic[] = [
  {
    topic: "Thirukkural",
    unit: "TN History",
    note: "0 questions before 2022 → 10 since. Now asked every year.",
    color: "#E8552B",
  },
  {
    topic: "TN Govt Schemes",
    unit: "Economy",
    note: "1 question in 2012 → 7 in 2024. Biggest jump in the exam.",
    color: "#1F9D8F",
  },
  {
    topic: "TN Freedom Fighters",
    unit: "TN History",
    note: "Kattabomman, Velu Nachiyar, VOC, Marudhu Brothers — heavy in 2022–2025.",
    color: "#C2410C",
  },
  {
    topic: "TN Economic Survey & schemes",
    unit: "Economy",
    note: "Latest TN survey data, GI tags, new schemes (Vidiyal Payanam, Thiranari) — dominant in 2024–2025.",
    color: "#7C3AED",
  },
];

export const FAQS = [
  {
    q: "Which topic has the most questions in TNPSC Group 4?",
    a: "Biology of the human body (blood, hormones, organs, genetics, nutrition) is the single most-repeated topic — 38 questions across all 9 papers analyzed (2012–2025), all within the General Science unit.",
  },
  {
    q: "Is Thirukkural asked in the TNPSC Group 4 GS paper?",
    a: "Yes. Thirukkural sits in Unit VI (Tamil Nadu History & Culture) and is a rising topic — 0 questions before 2022, then 10 questions across the 2022, 2024 and 2025 papers. It's now asked almost every year.",
  },
  {
    q: "How many marks is Aptitude in TNPSC Group 4?",
    a: "Aptitude & Reasoning (Part B) carries 25 of the 100 marks — the single largest mark allocation in the exam, ahead of TN History & Culture and Economy (20 marks each).",
  },
  {
    q: "What are the new and rising topics in the 2026 TNPSC Group 4 syllabus?",
    a: "Based on the 2012–2025 papers, the fastest-growing topics are Thirukkural, Tamil Nadu freedom fighters (Kattabomman, Velu Nachiyar, VOC), Tamil Nadu government schemes, and the latest TN Economic Survey data and schemes — all barely asked before 2022 but regular since.",
  },
];
