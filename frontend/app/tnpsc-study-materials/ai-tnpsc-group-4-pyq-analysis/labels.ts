export type Labels = {
  syllabusStripPrefix: string;
  viewSyllabus: string;
  eyebrow: string;
  h1Line1: string;
  h1Line2: string;
  heroDesc: string;
  statQuestions: string;
  statPapers: string;
  statYears: string;
  markMapCaption: string;
  scopeBannerLine1: string;
  scopeBannerLine2: string;
  scopeBannerOnly: string;
  scopeBannerQuestion: string;
  scopeBannerLink: string;
  donutHeading: string;
  donutSub: string;
  marksTotal: string;
  marksUnit: string;
  risingEyebrow: string;
  risingHeading: string;
  risingSub: string;
  unitsHeading: string;
  unitsSub: string;
  risingBadge: string;
  topicCount: (n: number) => string;
  papersCaption: (papers: number, total: number) => string;
  ctaHeading: string;
  ctaDesc: string;
  ctaButton: string;
  tocHeading: string;
  breakdownHeading: string;
  breakdownSub: string;
  marksSuffix: (marks: number) => string;
  tocMarks: (marks: number) => string;
  breakdownStat: (n: number, papers: number, total: number) => string;
  faqHeading: string;
  footerCaText: string;
  footerCaLink: string;
};

export const EN_LABELS: Labels = {
  syllabusStripPrefix: "📋 Based on the latest TNPSC syllabus (revised 2024, for 2026 exam) · ",
  viewSyllabus: "View full syllabus →",
  eyebrow: "AI PYQ Analysis",
  h1Line1: "TNPSC Group 4:",
  h1Line2: "which topics actually repeat?",
  heroDesc:
    "We read every General Studies & Aptitude question paper from 2012 to 2025 and counted what TNPSC asks again and again, mapped against the latest 2026 syllabus. Study the repeating topics first.",
  statQuestions: "questions",
  statPapers: "papers",
  statYears: "years",
  markMapCaption: "Each square = 1 mark · tap a colour to jump to that subject",
  scopeBannerLine1: "This page covers ",
  scopeBannerLine2: "General Studies + Aptitude",
  scopeBannerOnly: " only.",
  scopeBannerQuestion: "Looking for the Tamil paper (தமிழ்)? ",
  scopeBannerLink: "See Tamil paper practice →",
  donutHeading: "How the 100 marks are split",
  donutSub: "Tap a slice to explore that subject",
  marksTotal: "marks total",
  marksUnit: "marks",
  risingEyebrow: "🔥 New & rising",
  risingHeading: "Topics TNPSC started asking more",
  risingSub: "The new syllabus added these. They barely appeared before — now they're regulars. Don't skip them.",
  unitsHeading: "Every subject, topic by topic",
  unitsSub: "Longer bar = asked more often. Start from the top of each list.",
  risingBadge: "RISING",
  topicCount: (n) => `${n}Q`,
  papersCaption: (papers, total) => `asked in ${papers} of ${total} papers`,
  ctaHeading: "Now practice these topics",
  ctaDesc: "Solve real past questions, topic by topic, in Tamil & English.",
  ctaButton: "Start practising →",
  tocHeading: "On this page",
  breakdownHeading: "Topic-wise breakdown, unit by unit",
  breakdownSub: "The same data behind the charts above, written out in full — useful for screen readers and quick scanning.",
  marksSuffix: (marks) => `— ${marks} marks`,
  tocMarks: (marks) => `(${marks} marks)`,
  breakdownStat: (n, papers, total) => `${n} questions · ${papers} of ${total} papers`,
  faqHeading: "Frequently asked questions",
  footerCaText: "Looking for current affairs instead? ",
  footerCaLink: "Browse monthly current affairs →",
};

export const TA_LABELS: Labels = {
  syllabusStripPrefix: "📋 சமீபத்திய TNPSC பாடத்திட்டத்தின் அடிப்படையில் (2024 திருத்தம், 2026 தேர்வுக்கானது) · ",
  viewSyllabus: "முழு பாடத்திட்டம் →",
  eyebrow: "AI வினாத்தாள் பகுப்பாய்வு",
  h1Line1: "TNPSC குரூப் 4:",
  h1Line2: "எந்த தலைப்புகள் மீண்டும் மீண்டும் வரும்?",
  heroDesc:
    "2012 முதல் 2025 வரையிலான ஒவ்வொரு பொது அறிவு & திறனறிவு வினாத்தாளையும் படித்து, TNPSC மீண்டும் மீண்டும் கேட்பதை எண்ணி, சமீபத்திய 2026 பாடத்திட்டத்துடன் ஒப்பிட்டோம். மீண்டும் வரும் தலைப்புகளை முதலில் படியுங்கள்.",
  statQuestions: "வினாக்கள்",
  statPapers: "தாள்கள்",
  statYears: "ஆண்டுகள்",
  markMapCaption: "ஒவ்வொரு கட்டமும் = 1 மதிப்பெண் · நிறத்தைத் தொடவும்",
  scopeBannerLine1: "இந்தப் பக்கம் ",
  scopeBannerLine2: "பொது அறிவு & திறனறிவு",
  scopeBannerOnly: " மட்டும் இங்கு உள்ளது.",
  scopeBannerQuestion: "தமிழ்த் தாள் (Tamil paper) தேடுகிறீர்களா? ",
  scopeBannerLink: "தமிழ்த் தாள் பயிற்சி →",
  donutHeading: "100 மதிப்பெண்கள் எப்படிப் பிரிக்கப்படுகின்றன",
  donutSub: "ஒரு பகுதியைத் தொட்டுப் பாருங்கள்",
  marksTotal: "மொத்த மதிப்பெண்",
  marksUnit: "மதிப்பெண்",
  risingEyebrow: "🔥 புதிது & உயரும்",
  risingHeading: "TNPSC அதிகம் கேட்கத் தொடங்கிய தலைப்புகள்",
  risingSub: "புதிய பாடத்திட்டத்தில் இவை சேர்க்கப்பட்டன. முன்பு அரிதாகவே வந்தன — இப்போது ஒவ்வொரு ஆண்டும் வருகின்றன. இவற்றைத் தவிர்க்காதீர்கள்.",
  unitsHeading: "ஒவ்வொரு பாடமும், தலைப்பு வாரியாக",
  unitsSub: "நீளமான பட்டை = அதிகமாகக் கேட்கப்பட்டது. ஒவ்வொரு பட்டியலின் மேலிருந்து தொடங்குங்கள்.",
  risingBadge: "உயரும்",
  topicCount: (n) => `${n} வினா`,
  papersCaption: (papers, total) => `${total} தாள்களில் ${papers}-ல் கேட்கப்பட்டது`,
  ctaHeading: "இப்போது இந்தத் தலைப்புகளைப் பயிற்சி செய்யுங்க",
  ctaDesc: "தமிழ் & ஆங்கிலத்தில், தலைப்பு வாரியாக, பழைய வினாக்களைப் பயிற்சி செய்யுங்கள்.",
  ctaButton: "பயிற்சியைத் தொடங்கு →",
  tocHeading: "இந்தப் பக்கத்தில்",
  breakdownHeading: "தலைப்பு வாரியான பகுப்பாய்வு, அலகு வாரியாக",
  breakdownSub: "மேலே உள்ள விளக்கப்படங்களுக்குப் பின்னால் உள்ள தரவுகள், முழுமையாக எழுதப்பட்டுள்ளன.",
  marksSuffix: (marks) => `— ${marks} மதிப்பெண்கள்`,
  tocMarks: (marks) => `(${marks} மதிப்பெண்கள்)`,
  breakdownStat: (n, papers, total) => `${n} வினாக்கள் · ${total} தாள்களில் ${papers}`,
  faqHeading: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
  footerCaText: "நடப்பு நிகழ்வுகளைத் தேடுகிறீர்களா? ",
  footerCaLink: "மாதாந்திர நடப்பு நிகழ்வுகளைப் பார்க்கவும் →",
};
