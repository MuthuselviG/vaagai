#!/usr/bin/env python3
"""
MCQ Palagu — Daily CA Instagram carousel generator
Fetches today's approved Tamil CA questions from Supabase,
renders 8 branded slides, sends them + caption to Telegram DM.

Env vars required:
  SUPABASE_URL            e.g. https://phfvdnvgsxzmxpldwcjz.supabase.co
  SUPABASE_SERVICE_KEY    service role key (read-only usage here)
  TELEGRAM_BOT_TOKEN      from @BotFather
  TELEGRAM_CHAT_ID        your personal chat id
"""
import os, sys, json, random
from datetime import datetime, timedelta, timezone

import requests
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# ---------------- config ----------------
W, H = 1080, 1350
ORANGE = "#F47B20"
WHITE = "#FFFFFF"
GOLD = "#F5C26B"
COVER_GRAD = ((20, 26, 70), (61, 82, 160))
OUT_DIR = "/tmp/carousel"
FONT_DIR = os.environ.get("FONT_DIR", "./fonts")
TAMIL = os.path.join(FONT_DIR, "NotoSansTamil.ttf")
INTER = os.path.join(FONT_DIR, "Inter.ttf")
MAX_Q = 5
MAX_Q_LEN = 320  # skip very long statement-type questions

SUBJ = {
    "General Science": {"label": "பொது அறிவியல்", "grad": ((10, 40, 60), (13, 148, 136)), "accent": "#2DD4BF", "chip": "#0E9594"},
    "Indian Polity":   {"label": "இந்திய ஆட்சியியல்", "grad": ((45, 30, 12), (194, 80, 19)), "accent": "#FFB066", "chip": "#F47B20"},
    "Economy":         {"label": "பொருளாதாரம்", "grad": ((8, 40, 30), (5, 122, 85)), "accent": "#5EEAB4", "chip": "#057A55"},
    "History":         {"label": "வரலாறு", "grad": ((40, 12, 40), (168, 50, 143)), "accent": "#F8A8E0", "chip": "#A8328F"},
    "Geography":       {"label": "புவியியல்", "grad": ((12, 30, 50), (30, 100, 170)), "accent": "#7CC4FA", "chip": "#1E64AA"},
    "General Tamil":   {"label": "பொதுத் தமிழ்", "grad": ((50, 18, 18), (160, 48, 48)), "accent": "#F8B4B4", "chip": "#A03030"},
}
DEFAULT_META = SUBJ["Indian Polity"]

TA_MONTHS = ["ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்",
             "ஜூலை", "ஆகஸ்ட்", "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்"]

# ---------------- helpers ----------------
def ist_today():
    return (datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)).date()

def f_ta(s, w=400):
    ft = ImageFont.truetype(TAMIL, s)
    ft.set_variation_by_axes([w, 100])  # Noto Tamil axes: [wght, wdth]
    return ft

def f_en(s, w=400):
    ft = ImageFont.truetype(INTER, s)
    ft.set_variation_by_axes([min(s, 32), w])  # Inter axes: [opsz, wght]
    return ft

def base(grad):
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    top, bot = grad
    for y in range(H):
        t = y / H
        d.line([(0, y), (W, y)], fill=tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3)))
    noise = np.random.randint(-9, 10, (H, W, 1), dtype=np.int16)
    arr = np.asarray(img, dtype=np.int16) + noise
    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    return img, ImageDraw.Draw(img)

def deco(d, accent):
    d.ellipse([W - 300, -180, W + 160, 280], outline=accent, width=4)
    d.ellipse([W - 240, -120, W + 100, 220], outline=accent, width=2)
    d.ellipse([-200, H - 300, 260, H + 160], outline=accent, width=4)

def wrap(d, txt, font, maxw):
    words, lines, cur = txt.split(), [], ""
    for w_ in words:
        t = (cur + " " + w_).strip()
        if d.textlength(t, font=font) <= maxw:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w_
    if cur:
        lines.append(cur)
    return lines

def header(d, chipcol, chip_label, counter):
    y = 56
    mcq = f_en(48, 800)
    pal = f_ta(40, 700)
    d.text((64, y), "MCQ", font=mcq, fill=WHITE)
    d.text((64 + d.textlength("MCQ", font=mcq) + 12, y + 10), "பழகு", font=pal, fill=ORANGE)
    cf = f_ta(26, 700)
    cw = d.textlength(chip_label, font=cf)
    d.rounded_rectangle([W - 64 - cw - 48, y + 2, W - 64, y + 56], radius=27, fill=chipcol)
    d.text((W - 64 - cw - 24, y + 11), chip_label, font=cf, fill=WHITE)
    d.text((64, y + 78), counter, font=f_en(26, 800), fill=(235, 235, 245))

def footer(d, accent):
    d.rectangle([0, H - 100, W, H], fill=(12, 16, 38))
    fy = H - 50
    d.text((64, fy), "இன்றே practice பண்ணுங்க", font=f_ta(28, 600), fill=WHITE, anchor="lm")
    sf = f_en(30, 800)
    d.text((W - 64 - d.textlength("mcqpalagu.in", font=sf), fy), "mcqpalagu.in", font=sf, fill=accent, anchor="lm")

# ---------------- slides ----------------
def cover_slide(path, n, date_label_ta, date_label_en):
    img, d = base(COVER_GRAD)
    deco(d, "#8FA1E0")
    header(d, ORANGE, date_label_ta, "DAILY CURRENT AFFAIRS")
    d.text((64, 300), "இன்றைய", font=f_ta(84, 800), fill=WHITE)
    d.text((64, 440), "நடப்பு", font=f_ta(96, 800), fill=GOLD)
    d.text((64, 595), "நிகழ்வுகள்", font=f_ta(96, 800), fill=GOLD)
    d.rounded_rectangle([64, 790, 214, 800], radius=5, fill=ORANGE)
    d.text((64, 840), f"{n} கேள்விகள் — TNPSC தரத்தில்", font=f_ta(42, 600), fill=WHITE)
    d.text((64, 920), "Answer-ஐ comment-ல சொல்லுங்க", font=f_ta(34, 500), fill=(220, 226, 245))
    d.rounded_rectangle([64, 1030, 420, 1120], radius=45, fill=ORANGE)
    d.text((242, 1075), "SWIPE  ▶", font=f_en(38, 800), fill=WHITE, anchor="mm")
    footer(d, ORANGE)
    img.save(path)
    print(f"[slide] cover saved -> {path}")

def question_slide(idx, total, q, opts, subj, date_label_en, path):
    meta = SUBJ.get(subj, DEFAULT_META)
    img, d = base(meta["grad"])
    deco(d, meta["chip"])
    header(d, meta["chip"], meta["label"], f"Q {idx} / {total}  •  {date_label_en}")
    accent = meta["accent"]

    qsize = 46
    while qsize >= 28:
        qf = f_ta(qsize, 700)
        lines = wrap(d, q, qf, W - 128)
        lh = int(qsize * 1.55)
        if len(lines) * lh <= 400:
            break
        qsize -= 2
    y = 210
    for ln in lines:
        d.text((64, y), ln, font=qf, fill=WHITE)
        y += lh
    d.rounded_rectangle([64, y + 14, 174, y + 22], radius=4, fill=accent)
    y += 64

    osize = 34
    while osize >= 22:
        of = f_ta(osize, 500)
        olh = int(osize * 1.5)
        blocks = [wrap(d, o, of, W - 128 - 150) for o in opts]
        total_h = sum(max(96, len(b) * olh + 44) for b in blocks) + (len(blocks) - 1) * 18
        if y + total_h <= H - 120:
            break
        osize -= 2
    letters = "ABCD"
    for i, b in enumerate(blocks):
        bh = max(96, len(b) * olh + 44)
        fill_c = tuple(min(255, c + 18) for c in img.getpixel((W // 2, min(H - 1, y + bh // 2))))
        img.paste(Image.new("RGB", (W - 128, bh), fill_c), (64, y))
        d.rounded_rectangle([64, y, W - 64, y + bh], radius=22, outline=accent, width=2)
        d.rounded_rectangle([84, y + bh // 2 - 28, 140, y + bh // 2 + 28], radius=14, fill=accent)
        d.text((112, y + bh // 2), letters[i], font=f_en(34, 800), fill="#10173A", anchor="mm")
        ty = y + (bh - len(b) * olh) // 2 + 4
        for ln in b:
            d.text((164, ty), ln, font=of, fill=WHITE)
            ty += olh
        y += bh + 18
    footer(d, accent)
    img.save(path)
    print(f"[slide] q{idx} ({subj}) saved -> {path}")

def answers_slide(path, answers):
    img, d = base(COVER_GRAD)
    deco(d, "#8FA1E0")
    header(d, "#057A55", "விடைகள்", "ANSWERS")
    d.text((64, 220), "சரியான விடைகள்", font=f_ta(62, 800), fill=WHITE)
    y = 360
    for i, (letter, short) in enumerate(answers, 1):
        d.rounded_rectangle([64, y, W - 64, y + 118], radius=22, outline="#5EEAB4", width=2)
        d.rounded_rectangle([84, y + 29, 144, y + 89], radius=14, fill="#057A55")
        d.text((114, y + 59), letter, font=f_en(34, 800), fill=WHITE, anchor="mm")
        d.text((170, y + 34), f"Q{i}", font=f_en(26, 800), fill=(190, 200, 235))
        sf = f_ta(30, 600)
        ls = wrap(d, short, sf, W - 128 - 180)
        d.text((170, y + 62), ls[0], font=sf, fill=WHITE)
        y += 134
    d.text((64, y + 24), "விளக்கங்கள் முழுமையாக website-ல்", font=f_ta(32, 500), fill=(220, 226, 245))
    footer(d, "#5EEAB4")
    img.save(path)
    print(f"[slide] answers saved -> {path}")

def cta_slide(path):
    img, d = base(COVER_GRAD)
    deco(d, "#8FA1E0")
    header(d, ORANGE, "MCQ பழகு", "JOIN US")
    d.text((64, 280), "தினமும்", font=f_ta(72, 800), fill=WHITE)
    d.text((64, 400), "30 கேள்விகள்", font=f_ta(88, 800), fill=GOLD)
    d.text((64, 545), "முற்றிலும் இலவசம்", font=f_ta(56, 700), fill=WHITE)
    feats = ["PYQ 2012–2020 — Group 4 & Group 2", "தினசரி நடப்பு நிகழ்வுகள்", "தமிழ் & English இரு மொழிகளில்"]
    y = 700
    for ft_ in feats:
        d.ellipse([64, y + 14, 92, y + 42], fill=ORANGE)
        d.text((78, y + 28), "✓", font=f_en(24, 800), fill=WHITE, anchor="mm")
        d.text((112, y), ft_, font=f_ta(36, 500), fill=WHITE)
        y += 78
    d.rounded_rectangle([64, 1010, 640, 1110], radius=50, fill=ORANGE)
    d.text((352, 1060), "mcqpalagu.in", font=f_en(44, 800), fill=WHITE, anchor="mm")
    d.text((64, 1150), "Follow @mcqpalagu  •  t.me/MCQPalagu", font=f_en(30, 600), fill=(220, 226, 245))
    footer(d, ORANGE)
    img.save(path)
    print(f"[slide] cta saved -> {path}")

# ---------------- data ----------------
def fetch_questions(today_iso):
    url = os.environ["SUPABASE_URL"].rstrip("/") + "/rest/v1/current_affairs"
    params = {
        "select": "id,question,options,correct_option,subject,topic",
        "status": "eq.approved",
        "lang": "eq.ta",
        "published_date": f"eq.{today_iso}",
        "order": "created_at.asc",
        "limit": "30",
    }
    headers = {
        "apikey": os.environ["SUPABASE_SERVICE_KEY"],
        "Authorization": "Bearer " + os.environ["SUPABASE_SERVICE_KEY"],
    }
    print(f"[fetch] GET current_affairs published_date={today_iso}")
    r = requests.get(url, params=params, headers=headers, timeout=30)
    print(f"[fetch] status={r.status_code} bytes={len(r.content)}")
    r.raise_for_status()
    rows = r.json()
    print(f"[fetch] rows={len(rows)}")
    return rows

def pick_questions(rows):
    # within-day diversity: prefer unique subject, then unique topic, prefer shorter questions
    rows = [r for r in rows if r.get("question") and isinstance(r.get("options"), list) and len(r["options"]) == 4]
    short_first = sorted(rows, key=lambda r: len(r["question"]))
    picked, used_subj, used_topic = [], set(), set()
    for r in short_first:
        if len(r["question"]) > MAX_Q_LEN:
            continue
        if r.get("subject") in used_subj:
            continue
        if r.get("topic") and r["topic"] in used_topic:
            continue
        picked.append(r)
        used_subj.add(r.get("subject"))
        if r.get("topic"):
            used_topic.add(r["topic"])
        if len(picked) == MAX_Q:
            break
    # fallback: relax subject uniqueness if not enough
    if len(picked) < MAX_Q:
        print(f"[pick] only {len(picked)} after strict pass, relaxing subject uniqueness")
        for r in short_first:
            if r in picked or len(r["question"]) > MAX_Q_LEN:
                continue
            if r.get("topic") and r["topic"] in used_topic:
                continue
            picked.append(r)
            if r.get("topic"):
                used_topic.add(r["topic"])
            if len(picked) == MAX_Q:
                break
    print(f"[pick] selected {len(picked)} questions: {[p.get('subject') for p in picked]}")
    return picked

def answer_letter(item):
    try:
        return "ABCD"[item["options"].index(item["correct_option"])]
    except ValueError:
        print(f"[warn] correct_option not found in options for id={item.get('id')}")
        return "?"

def short_answer(item):
    # first 40 chars of the correct option text for the answers slide
    txt = item["correct_option"]
    return txt if len(txt) <= 42 else txt[:40] + "…"

# ---------------- telegram ----------------
def send_to_telegram(files, caption):
    token = os.environ["TELEGRAM_BOT_TOKEN"]
    chat_id = os.environ["TELEGRAM_CHAT_ID"]
    media = []
    opened = []
    for i, p in enumerate(files):
        fh = open(p, "rb")
        opened.append(fh)
        media.append({"type": "photo", "media": f"attach://photo{i}"})
    files_payload = {f"photo{i}": fh for i, fh in enumerate(opened)}
    print(f"[telegram] sending album of {len(files)} photos")
    r = requests.post(
        f"https://api.telegram.org/bot{token}/sendMediaGroup",
        data={"chat_id": chat_id, "media": json.dumps(media)},
        files=files_payload, timeout=120,
    )
    print(f"[telegram] album status={r.status_code}")
    for fh in opened:
        fh.close()
    r.raise_for_status()
    r2 = requests.post(
        f"https://api.telegram.org/bot{token}/sendMessage",
        data={"chat_id": chat_id, "text": caption}, timeout=30,
    )
    print(f"[telegram] caption status={r2.status_code}")
    r2.raise_for_status()

# ---------------- main ----------------
def main():
    random.seed()
    os.makedirs(OUT_DIR, exist_ok=True)
    today = ist_today()
    today_iso = today.isoformat()
    date_ta = f"{today.day} {TA_MONTHS[today.month - 1]} {today.year}"
    date_en = today.strftime("%d %B %Y").upper()
    print(f"[main] IST date = {today_iso}")

    rows = fetch_questions(today_iso)
    if not rows:
        print("[main] no approved CA rows for today — exiting without sending")
        sys.exit(0)
    picked = pick_questions(rows)
    if len(picked) < 3:
        print(f"[main] only {len(picked)} usable questions — exiting without sending")
        sys.exit(0)

    files = []
    p = f"{OUT_DIR}/01_cover.png"
    cover_slide(p, len(picked), date_ta, date_en)
    files.append(p)
    for i, item in enumerate(picked, 1):
        p = f"{OUT_DIR}/{i+1:02d}_q{i}.png"
        question_slide(i, len(picked), item["question"], item["options"], item.get("subject", ""), date_en, p)
        files.append(p)
    p = f"{OUT_DIR}/{len(picked)+2:02d}_answers.png"
    answers_slide(p, [(answer_letter(it), short_answer(it)) for it in picked])
    files.append(p)
    p = f"{OUT_DIR}/{len(picked)+3:02d}_cta.png"
    cta_slide(p)
    files.append(p)

    caption = (
        f"இன்றைய TNPSC நடப்பு நிகழ்வுகள் ({date_ta}) 🔥\n"
        f"{len(picked)} கேள்விகள் — எத்தனை சரியா போட்டீங்க?\n"
        "Answer-ஐ comment-ல சொல்லுங்க 👇\n\n"
        "Daily 30 கேள்விகள் free — mcqpalagu.in (link in bio)\n\n"
        "#tnpsc #tnpscgroup4 #tnpscgroup2 #tnpsccurrentaffairs "
        "#tnpscexam #tamilnadu #group4 #currentaffairs #mcqpalagu"
    )
    send_to_telegram(files, caption)
    print("[main] done — carousel delivered")

if __name__ == "__main__":
    main()
