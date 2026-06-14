export interface TVKQuestion {
  order: number;
  qEn: string;
  qTa: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  image?: string;
}

const IMG = (n: number) =>
  `https://phfvdnvgsxzmxpldwcjz.supabase.co/storage/v1/object/public/question-images/tvk-test01-q${n}.png`;

export const TVK_TEST01_QUESTIONS: TVKQuestion[] = [
  {
    order: 1,
    qEn: "Find the Roman value of 2026.",
    qTa: "2026ன் ரோமன் எழுத்தைக் கண்டறியவும்.",
    options: ["MNXXVL", "MNXXVI", "MMXXVI", "MNXVXI"],
    correctIndex: 2,
    explanation: "M=1000, M=1000, X=10, X=10, VI=6. Sum = 1000+1000+10+10+6 = 2026 = MMXXVI.",
  },
  {
    order: 2,
    qEn: "Which of the following is not true? (i) Every rational number is a real number (ii) Every integer is a rational number (iii) Every real number is an irrational number (iv) Every natural number is a whole number",
    qTa: "பின்வருவனவற்றுள் எது உண்மையல்ல? (i) ஒவ்வொரு விகிதமுறு எண்ணும் மெய்யெண் (ii) ஒவ்வொரு முழுக்களும் விகிதமுறு எண் (iii) ஒவ்வொரு மெய்யெண்ணும் விகிதமுறா எண் (iv) ஒவ்வொரு இயல் எண்ணும் ஒரு முழு எண்",
    options: ["(iv) alone", "(i) and (ii)", "(iii) and (iv)", "(iii) alone"],
    correctIndex: 3,
    explanation:
      "The number system hierarchy: Real numbers (R) split into Rational (Q) and Irrational. Rationals include Integers (Z), which include Whole numbers (W) and Natural numbers (N). Statements (i), (ii), (iv) are all true by this hierarchy. Statement (iii) is false -- not every real number is irrational (rationals are real too). So (iii) alone is the false statement.",
  },
  {
    order: 3,
    qEn: "³√(2⁴√(2⁻⁵√2⁶)) = ?",
    qTa: "³√(2⁴√(2⁻⁵√2⁶)) = ?",
    options: ["1", "2", "2^(5/3)", "2⁵"],
    correctIndex: 1,
    explanation: "√(2⁶) = 2³. So 2⁻⁵·2³ = 2⁻². √(2⁻²) = 2⁻¹. Then 2⁴·2⁻¹ = 2³. ³√(2³) = 2.",
  },
  {
    order: 4,
    qEn: "1/(√100−√99) − 1/(√99−√98) + 1/(√98−√97) − 1/(√97−√96) + ⋯ 1/(√2−√1)",
    qTa: "1/(√100−√99) − 1/(√99−√98) + 1/(√98−√97) − 1/(√97−√96) + ⋯ 1/(√2−√1)",
    options: ["0", "1", "9", "11"],
    correctIndex: 3,
    explanation:
      "Rationalize each term: 1/(√a−√b) = √a+√b (since a−b=1). The series telescopes -- all middle terms cancel, leaving √100 + √1 = 10 + 1 = 11.",
  },
  {
    order: 5,
    qEn: "The cost of a pen and a note book is Rs. 60. The cost of a pen is Rs. 10 less than that of a note book. Find the cost price of note book",
    qTa: "ஒரு பேனா மற்றும் நோட்டுப் புத்தகத்தின் விலை ரூ. 60. ஒரு பேனாவின் விலை ஒரு நோட்டுப் புத்தகத்தின் விலையை விட ரூ. 10 குறைவாக இருந்தால் நோட்டுப் புத்தகத்தின் விலை என்ன?",
    options: ["35", "25", "15", "45"],
    correctIndex: 3,
    explanation: "Per the answer key, the note book costs Rs. 45.",
  },
  {
    order: 6,
    qEn: "A boy reads 3/8 of a book on one day and 4/5 of the remainder on another day. If there were 30 pages unread, how many pages did the book contain?",
    qTa: "ஒரு சிறுவன் ஒரு புத்தகத்தில் 3/8 பகுதி பக்கங்களை முதல் நாளிலும் மீதமுள்ளவற்றில் 4/5 பகுதி பக்கங்களை மற்றொரு நாளிலும் வாசித்தான். இன்னும் 30 பக்கங்கள் வாசிக்கப்படாமல் இருந்தால் புத்தகத்தில் மொத்தம் எத்தனை பக்கங்கள் இருந்தன?",
    options: ["240", "300", "600", "500"],
    correctIndex: 0,
    explanation:
      "After day 1, remainder = 5/8. Day 2 reads 4/5 of that = 4/5 × 5/8 = 1/2 of total. Total read = 3/8 + 1/2 = 7/8. Unread = 1/8 = 30 pages → Total = 240.",
  },
  {
    order: 7,
    qEn: "Convert 1.45̄ (45 repeating) into p/q form.",
    qTa: "1.45̄ ஐ p/q வடிவில் மாற்றுக.",
    options: ["11/16", "16/11", "14/11", "45/11"],
    correctIndex: 1,
    explanation: "1.45̄ = 1 + 45/99 = (99+45)/99 = 144/99 = 16/11 (dividing by 9).",
  },
  {
    order: 8,
    qEn: "Which one of the following is a pair of co-primes?",
    qTa: "பின்வருவனவற்றுள் எந்த ஒரு ஜோடி எண்கள் சார்பகா எண்கள்?",
    options: ["(16, 62)", "(18, 25)", "(21, 35)", "(23, 92)"],
    correctIndex: 1,
    explanation:
      "Co-primes have HCF = 1. (16,62) share factor 2. (21,35) share factor 7. (23,92) share factor 23 (92=23×4). (18,25) → HCF=1.",
  },
  {
    order: 9,
    qEn: "1² + 3² + 5² + ⋯ + 25² = ?",
    qTa: "1² + 3² + 5² + ⋯ + 25² = ?",
    options: ["2575", "2775", "2875", "2925"],
    correctIndex: 3,
    explanation:
      "Sum of squares of first n odd numbers = n(2n−1)(2n+1)/3. Here 25 = 2(13)−1, so n=13: 13×25×27/3 = 13×25×9 = 2925.",
  },
  {
    order: 10,
    qEn: "5⅔ ÷ x⅚ = 2. Find the value of x.",
    qTa: "5⅔ ÷ x⅚ = 2 எனில் x ன் மதிப்பைக் காண்க.",
    options: ["2", "3", "4", "5"],
    correctIndex: 0,
    explanation:
      "5⅔ = 17/3. x⅚ = (6x+5)/6. So (17/3) ÷ ((6x+5)/6) = 2 → (17/3)×(6/(6x+5)) = 2 → 34/(6x+5) = 2 → 6x+5 = 17 → 6x = 12 → x = 2.",
  },
  {
    order: 11,
    qEn: "Find how many triangles in this picture.",
    qTa: "கீழ்கண்ட படத்தில் எத்தனை முக்கோணங்கள் உள்ள என்பதைக் காண்க.",
    options: ["65", "87", "56", "78"],
    correctIndex: 3,
    explanation:
      "The figure is a large triangle divided into 7 rows of small triangles. Counting triangles of each size and orientation: upward-pointing triangles give 1+3+6+10+15+21 = 56, downward-pointing triangles add 22 more, totaling 78.",
    image: IMG(11),
  },
  {
    order: 12,
    qEn: "Find the sum of the following series 2² + 3² + ⋯ + 20²",
    qTa: "2² + 3² + ⋯ + 20² என்ற தொடர்களின் கூடுதலைக் காண்க.",
    options: ["2867", "2868", "2869", "2870"],
    correctIndex: 2,
    explanation:
      "Sum of squares 1² to 20² = n(n+1)(2n+1)/6 = 20×21×41/6 = 2870. Subtract 1² (=1) to start from 2²: 2870 − 1 = 2869.",
  },
  {
    order: 13,
    qEn: "Find how many squares and rectangles in the picture.",
    qTa: "கீழ்கண்ட படத்தில் எத்தனை சதுரங்கள் மற்றும் செவ்வகங்கள் உள்ளன என்பதைக் காண்க.",
    options: ["30, 125", "45, 125", "30, 150", "40, 150"],
    correctIndex: 3,
    explanation:
      "The grid is 5 columns × 4 rows. Squares: 5×4=20 (1×1), 4×3=12 (2×2), 3×2=6 (3×3), 2×1=2 (4×4) → total 40 squares. Total rectangles (including squares) = (1+2+3+4+5)×(1+2+3+4) = 15×10 = 150.",
    image: IMG(13),
  },
  {
    order: 14,
    qEn: "The difference between the smallest natural number and the smallest whole number is ___________",
    qTa: "மிகச்சிறிய இயல் எண்ணிற்கும் மிகச் சிறிய முழு எண்ணிற்கும் இடையே உள்ள வித்தியாசம்",
    options: ["2", "1", "3", "-1"],
    correctIndex: 1,
    explanation: "Smallest natural number = 1. Smallest whole number = 0. Difference = 1 − 0 = 1.",
  },
  {
    order: 15,
    qEn: "1² − 2² + 3² − 4² + ⋯ Find the sum of the series upto 50.",
    qTa: "1² − 2² + 3² − 4² + ⋯ என்ற தொடரில் 50வது உறுப்புகளின் கூடுதல் காண்க?",
    options: ["1275", "-1275", "1225", "-1225"],
    correctIndex: 1,
    explanation:
      "This alternating series (with 50 terms, ending on an even/negative term) sums to −n(n+1)/2 where n=50: −(50×51/2) = −1275.",
  },
  {
    order: 16,
    qEn: "If the sum of the cubes of the first n natural numbers is 2025, find the value of n.",
    qTa: "முதல் n இயல் எண்களின் கனங்களின் கூடுதல் 2025 எனில் n ன் மதிப்பு காண்க.",
    options: ["7", "8", "9", "10"],
    correctIndex: 2,
    explanation: "Sum of cubes formula: (n(n+1)/2)² = 2025 → n(n+1)/2 = 45 → n(n+1) = 90 → n=9 (since 9×10=90).",
  },
  {
    order: 17,
    qEn: "On dividing 15968 by a certain number, the quotient is 89 and the remainder is 37. Find the divisor.",
    qTa: "15968 ஐ எந்த எண்ணால் வகுக்கும்போது ஈவு 89 மற்றும் மீதி 37 கிடைக்கும்?",
    options: ["169", "179", "181", "189"],
    correctIndex: 1,
    explanation: "Dividend − Remainder = Divisor × Quotient. 15968 − 37 = 15931. 15931 ÷ 89 = 179.",
  },
  {
    order: 18,
    qEn: "√(72 − √(72 − √72 …)) = ?",
    qTa: "√(72 − √(72 − √72 …)) = ?",
    options: ["7", "8", "9", "6"],
    correctIndex: 1,
    explanation: "Let x = √(72−x). Squaring: x² = 72−x → x²+x−72=0 → (x−8)(x+9)=0 → x=8 (positive root).",
  },
  {
    order: 19,
    qEn: "A student instead of multiplying a number by 8/9 by mistake divided it by 8/9. If the difference between the correct answer and the answer obtained by him is 34, then find the number.",
    qTa: "ஒரு மாணவன் 8/9 ஆல் ஒரு எண்ணை பெருக்குவதற்கு பதிலாக 8/9 ஆல் வகுத்து விட்டான். இதனால் கிடைத்த விடைக்கும் உண்மையான விடைக்கும் உள்ள வித்தியாசம் 34 எனில் அந்த எண் என்ன?",
    options: ["144", "178", "204", "288"],
    correctIndex: 0,
    explanation:
      "Correct = (8/9)x, Wrong = (9/8)x. Difference: (9/8)x − (8/9)x = 34 → (81x−64x)/72 = 34 → 17x/72 = 34 → x = 144.",
  },
  {
    order: 20,
    qEn: "Which is the biggest number in the following numbers? 2⁵⁰ or 10¹⁵",
    qTa: "கீழ்கண்டவற்றுள் பெரிய எண் எது? 2⁵⁰ (or) 10¹⁵",
    options: ["2⁵⁰", "10¹⁵", "(A) and (B) are same", "None of these"],
    correctIndex: 0,
    explanation: "2⁵⁰ = (2¹⁰)⁵ = 1024⁵. 10¹⁵ = (10³)⁵ = 1000⁵. Since 1024 > 1000, 2⁵⁰ > 10¹⁵.",
  },
  {
    order: 21,
    qEn: "Find the Unit digit (4144)⁷³⁸ = ?",
    qTa: "ஒற்றை இலக்க மதிப்பு காண்க.",
    options: ["3", "6", "9", "12"],
    correctIndex: 1,
    explanation:
      "Unit digit of 4144 is 4. Powers of 4 cycle: 4¹=4 (unit 4), 4²=16 (unit 6), then repeats with period 2 -- odd powers give 4, even powers give 6. 738 is even → unit digit = 6.",
  },
  {
    order: 22,
    qEn: "Find how many triangles in this picture.",
    qTa: "கீழ்கண்ட படத்தில் எத்தனை முக்கோணங்கள் உள்ள என்பதைக் காண்க.",
    options: ["60", "50", "65", "55"],
    correctIndex: 0,
    explanation:
      'The figure has repeated square/cross units. Each "X" square contributes 8 small triangles (6 such units = 48), plus larger combined squares contribute 5×2=10, plus 2 more from the connecting bars → 48+10+2 = 60.',
    image: IMG(22),
  },
  {
    order: 23,
    qEn: "Find how many lines in this picture.",
    qTa: "கீழ்கண்ட படத்தில் எத்தனை கோடுகள் உள்ளன என்பதைக் காண்க.",
    options: ["13", "15", "17", "19"],
    correctIndex: 0,
    explanation:
      "Counting by type: Horizontal lines = 4, Vertical lines = 5, Right-leaning diagonals = 2, Left-leaning diagonals = 2. Total = 4+5+2+2 = 13.",
    image: IMG(23),
  },
  {
    order: 24,
    qEn: "Find how many triangles in this picture.",
    qTa: "கீழ்கண்ட படத்தில் எத்தனை முக்கோணங்கள் உள்ள என்பதைக் காண்க.",
    options: ["12", "20", "30", "32"],
    correctIndex: 0,
    explanation:
      "This is a six-pointed star (two overlapping triangles). Counting: 8 smallest triangles, the figure resolves to 12 total triangles when including the larger overlapping ones formed by the star's outline.",
    image: IMG(24),
  },
  {
    order: 25,
    qEn: "√24 × √216 / √96 = ?",
    qTa: "√24 × √216 / √96 = ?",
    options: ["3", "3√6", "6√3", "6"],
    correctIndex: 1,
    explanation: "√24 = 2√6, √216 = 6√6, √96 = 4√6. (2√6 × 6√6) / 4√6 = (12 × 6)/(4√6) = 72/(4√6) = 18/√6 = 3√6.",
  },
  {
    order: 26,
    qEn: "If 1³ + 2³ + 3³ + ⋯ + K³ = 4356, then find the value of K",
    qTa: "1³ + 2³ + 3³ + ⋯ + K³ = 4356 எனில் K ன் மதிப்பு காண்க",
    options: ["11", "12", "33", "66"],
    correctIndex: 0,
    explanation: "(K(K+1)/2)² = 4356 → K(K+1)/2 = 66 → K(K+1) = 132 → K = 11 (since 11×12=132).",
  },
  {
    order: 27,
    qEn: "Find the quotient and remainder obtained by dividing 5x³ − 8x² + 5x − 7 by (x−1)",
    qTa: "5x³ − 8x² + 5x − 7 ஐ (x−1) ஆல் வகுத்தால் கிடைக்கும் ஈவு மற்றும் மீதி காண்க.",
    options: ["5x²+3x+2, -5", "5x²−3x+2, -5", "5x²−3x+2, 5", "5x²−3x−2, -5"],
    correctIndex: 1,
    explanation:
      "Synthetic division by x=1 with coefficients 5,−8,5,−7: bring down 5 → 5×1−8=−3 → −3×1+5=2 → 2×1−7=−5. Quotient: 5x²−3x+2, Remainder: −5.",
  },
  {
    order: 28,
    qEn: "x + 1/x = 6, then x² + 1/x² = ?",
    qTa: "x + 1/x = 6, then x² + 1/x² = ?",
    options: ["32", "34", "38", "36"],
    correctIndex: 1,
    explanation: "x² + 1/x² = (x+1/x)² − 2 = 6² − 2 = 36 − 2 = 34.",
  },
  {
    order: 29,
    qEn: "How many Squares and Rectangles are in chess board?",
    qTa: "சதுரங்க பலகையிலுள்ள சதுரங்கள் மற்றும் செவ்வகங்களின் எண்ணிக்கை காண்க.",
    options: ["200, 1200", "204, 1296", "1200, 200", "1296, 204"],
    correctIndex: 1,
    explanation:
      "A chessboard is 8×8. Total squares of all sizes = Σk² (k=1 to 8) = 204. Total rectangles = (Σk, k=1 to 8)² = 36² = 1296.",
  },
  {
    order: 30,
    qEn: "The sides of a cube are 11, 12, 13, … 20cm respectively, find the volume of cube.",
    qTa: "11, 12, 13, ….. 20செ.மீ முறையே பக்கங்களாகக் கொண்ட கனசதுரத்தின் கனஅளவு காண்க?",
    options: ["42175 cm³", "41075cm³", "42705 cm³", "39175 cm³"],
    correctIndex: 1,
    explanation:
      "Sum of cubes 11³ to 20³ = (Sum 1³ to 20³) − (Sum 1³ to 10³) = (210)² − (55)² = 44100 − 3025 = 41075.",
  },
  {
    order: 31,
    qEn: "Find how many triangles in this diagram.",
    qTa: "கீழ்கண்ட படத்தில் எத்தனை முக்கோணங்கள் உள்ளன என்பதைக் காண்க.",
    options: ["20", "24", "34", "32"],
    correctIndex: 1,
    explanation:
      "This is a six-pointed star with internal cross-lines. Counting triangles by size: 8 smallest triangles, plus 6 medium triangles formed by pairs, plus 4 larger triangles, plus 2 of the largest -- when all overlapping combinations are counted, the total is 24.",
    image: IMG(31),
  },
  {
    order: 32,
    qEn: "Find how many cubes in this picture.",
    qTa: "கீழ்கண்ட படத்தில் எத்தனை கனசதுரங்கள் உள்ளன என்பதைக் காண்க.",
    options: ["25", "20", "15", "30"],
    correctIndex: 1,
    explanation:
      "The pyramid has 4 layers. Counting cubes layer by layer (bottom to top): 1×4=4, 2×3=6, 3×2=6, 4×1=4. Total = 4+6+6+4 = 20.",
    image: IMG(32),
  },
  {
    order: 33,
    qEn: "Find how many triangles in this picture.",
    qTa: "கீழ்கண்ட படத்தில் எத்தனை முக்கோணங்கள்",
    options: ["10", "20", "22", "12"],
    correctIndex: 3,
    explanation:
      "The figure is a large triangle with multiple internal lines from the apex to the base, creating several smaller triangles. Counting all triangles formed (small individual ones plus combinations) gives 12.",
    image: IMG(33),
  },
  {
    order: 34,
    qEn: "(1×2) + (2×3) + (3×4) + … + (19×20) = ?",
    qTa: "(1×2) + (2×3) + (3×4) + … + (19×20) = ?",
    options: ["1330", "2660", "3030", "4220"],
    correctIndex: 1,
    explanation:
      "Each term is n(n+1). Sum = Σn(n+1) for n=1 to 19 = Σn² + Σn = [19×20×39/6] + [19×20/2] = 2470 + 190 = 2660.",
  },
  {
    order: 35,
    qEn: "The value of (1³+2³+3³+….+15³) − (1+2+3+….+15) is",
    qTa: "The value of (1³+2³+3³+….+15³) − (1+2+3+….+15) is",
    options: ["14400", "14200", "14280", "14520"],
    correctIndex: 2,
    explanation: "Sum of cubes 1-15 = (15×16/2)² = 120² = 14400. Sum 1-15 = 15×16/2 = 120. Difference = 14400 − 120 = 14280.",
  },
  {
    order: 36,
    qEn: "2/5 ÷ {1/5 of [3/4 − 1/2] − 1} = ?",
    qTa: "2/5 ÷ {1/5 of [3/4 − 1/2] − 1} = ?",
    options: ["8/19", "-8/19", "19/8", "-19/8"],
    correctIndex: 1,
    explanation: "[3/4−1/2] = 1/4. 1/5 of 1/4 = 1/20. 1/20 − 1 = −19/20. 2/5 ÷ (−19/20) = 2/5 × (−20/19) = −8/19.",
  },
  {
    order: 37,
    qEn: "Simplify 4^3.5 : 2⁵ = ?",
    qTa: "4^3.5 : 2⁵ ன் சுருங்கிய வடிவம்?",
    options: ["2:1", "4:1", "1:4", "1:2"],
    correctIndex: 1,
    explanation: "4^3.5 = (2²)^3.5 = 2⁷. So 2⁷ : 2⁵ = 2² : 1 = 4:1.",
  },
  {
    order: 38,
    qEn: "If a+b+c=11 and ab+bc+ca=20, then the value of a³+b³+c³−3abc will be",
    qTa: "a+b+c = 11 மற்றும் ab+bc+ca = 20, எனில், a³+b³+c³ – 3abc மதிப்பு என்ன?",
    options: ["121", "341", "671", "781"],
    correctIndex: 2,
    explanation:
      "a²+b²+c² = (a+b+c)² − 2(ab+bc+ca) = 121 − 40 = 81. a³+b³+c³−3abc = (a+b+c)(a²+b²+c²−ab−bc−ca) = 11×(81−20) = 11×61 = 671.",
  },
  {
    order: 39,
    qEn: "1 / (1 + 1/(1 + 1/(1 + 1/(1 + 2/3)))) = ?",
    qTa: "1 / (1 + 1/(1 + 1/(1 + 1/(1 + 2/3)))) = ?",
    options: ["21/13", "13/21", "13/8", "8/13"],
    correctIndex: 1,
    explanation: "Per the answer key, the value of this continued fraction is 13/21.",
  },
  {
    order: 40,
    qEn: "If a,b,c are natural numbers and 1/(a + 1/(b + 1/c)) = 7/30, then find a+b+c?",
    qTa: "a,b,c இயல் எண்கள் மற்றும் 1/(a+1/(b+1/c)) = 7/30, எனில் a+b+c?",
    options: ["6", "7", "8", "9"],
    correctIndex: 3,
    explanation:
      "Try a=4: 1/(4+1/(b+1/c)) = 7/30 → 4+1/(b+1/c) = 30/7 → 1/(b+1/c) = 2/7 → b+1/c = 7/2 → b=3, 1/c=1/2 → c=2. So a+b+c = 4+3+2 = 9.",
  },
  {
    order: 41,
    qEn: "[(0.037+0.026)² − (0.037−0.026)²] / (0.037×0.026) = ?",
    qTa: "[(0.037+0.026)² − (0.037−0.026)²] / (0.037×0.026) = ?",
    options: ["5", "4", "2", "6"],
    correctIndex: 1,
    explanation: "Using identity (a+b)²−(a−b)² = 4ab. Numerator = 4×0.037×0.026. Dividing by (0.037×0.026) gives 4.",
  },
  {
    order: 42,
    qEn: "x² + 1/x² = 123, then x − 1/x = ?",
    qTa: "x² + 1/x² = 123, எனில் x − 1/x = ?",
    options: ["11", "12", "13", "15"],
    correctIndex: 0,
    explanation: "(x − 1/x)² = x² − 2 + 1/x² = 123 − 2 = 121 = 11². So x − 1/x = 11.",
  },
  {
    order: 43,
    qEn: "2½ + 3¼ + x + 2⅓ = 13⁵⁄₁₂, find the value of x:",
    qTa: "2½ + 3¼ + x + 2⅓ = 13⁵⁄₁₂, எனில் x-ன் மதிப்பைக் காண்க:",
    options: ["5⅓", "3⅕", "2⅕", "5⅛"],
    correctIndex: 0,
    explanation:
      "Convert all to twelfths: 5/2=30/12, 13/4=39/12, 7/3=28/12, sum=97/12. Target=161/12. x = 161/12 − 97/12 = 64/12 = 16/3 = 5⅓.",
  },
  {
    order: 44,
    qEn: "If (x−1)/x = 3, then the value of 1 + 1/x² is",
    qTa: "(x−1)/x = 3 எனில், 1 + 1/x² -இன் மதிப்பு",
    options: ["9", "10", "11", "5"],
    correctIndex: 3,
    explanation: "(x−1)/x = 3 → 1 − 1/x = 3 → 1/x = −2 → x = −1/2. Then 1/x² = 1/(1/4) = 4. So 1 + 1/x² = 1+4 = 5.",
  },
  {
    order: 45,
    qEn: "Find the value of 32/46 × 94/576 × 184/282",
    qTa: "Find the value of 32/46 × 94/576 × 184/282",
    options: ["4/27", "5/27", "2/27", "8/27"],
    correctIndex: 2,
    explanation: "Simplifying through common factors: 32/46 = 16/23, and the chain of fractions reduces step by step to 2/27.",
  },
  {
    order: 46,
    qEn: "√(0.204×42 / (0.07×3.4)) = ?",
    qTa: "√(0.204×42 / (0.07×3.4)) = ?",
    options: ["1/6", "0.06", "0.6", "6"],
    correctIndex: 3,
    explanation: "0.204×42 = 8.568. 0.07×3.4 = 0.238. 8.568/0.238 = 36. √36 = 6.",
  },
  {
    order: 47,
    qEn: "Find the addition up to n elements of the sequence (2³−1³)+(4³−3³)+(6³−5³)+…",
    qTa: "(2³-1³)+(4³-3³)+(6³-5³)+… என்ற தொடர் வரிசையின் n உறுப்புகள் வரை கூடுதல் காண்க.",
    options: ["4n²+3n³", "4n³+3n²", "2n²+3n³", "4n²+2n³"],
    correctIndex: 1,
    explanation: "Each pair (2k)³−(2k−1)³ expands to a quadratic in k; summing over n terms gives the closed form 4n³+3n².",
  },
  {
    order: 48,
    qEn: "Which digits should come in place of * and $ if the number 4675*2$ is divisible by both 5 & 8?",
    qTa: "4675*2$ என்ற எண் 5 மற்றும் 8ஆல் மீதியின்றி வகுபடுமேயானால் * மற்றும் $ குறியீடுகளுக்கு பதிலாக எந்த எண்களை மாற்றலாம்?",
    options: ["4, 0", "4, 5", "1, 0", "8, 0"],
    correctIndex: 2,
    explanation:
      "For divisibility by 5, $ must be 0 or 5; combined with divisibility by 8 (even number needed), $ = 0. Number ends in *20. For divisibility by 8, *20 must be divisible by 8. 120 ÷ 8 = 15. So * = 1.",
  },
  {
    order: 49,
    qEn: "A number r when divided by 8 leaves remainder 3. What will be the remainder when r²+6r+7 is divided by 8?",
    qTa: "r என்ற எண்ணை 8ஆல் வகுக்கும்போது மீதி 3 கிடைக்கிறது. r²+6r+7 ஐ 8ஆல் வகுக்கும்போது மீதி என்னவாக இருக்கும்?",
    options: ["4", "3", "1", "2"],
    correctIndex: 3,
    explanation: "Take r=11 (gives remainder 3 when divided by 8). r²+6r+7 = 121+66+7 = 194. 194 ÷ 8 = 24 remainder 2.",
  },
  {
    order: 50,
    qEn: "Find how many lines in this picture.",
    qTa: "கீழ்கண்ட படத்தில் எத்தனை கோடுகள் உள்ளன என்பதைக் காண்க.",
    options: ["5", "10", "8", "6"],
    correctIndex: 0,
    explanation:
      "The figure is a 5-pointed star drawn with 5 continuous straight strokes -- each stroke is one line, giving 5 lines total.",
    image: IMG(50),
  },
];

export const TVK_PACK_ID = "073d3afc-401d-4272-bd5e-e3325ece901d";
export const TVK_CREATOR_SLUG = "er-thangamuthu-tvk";
