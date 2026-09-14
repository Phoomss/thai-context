# THAI CONTEXT — DESIGN V3

> **Version:** Frontend UX/UI & Interaction Specification V3  
> **Design Direction:** Contemporary Thai Dictionary × Airy White Editorial × Soft Blue Glass × Living Book 3D  
> **Primary Language:** ภาษาไทย  
> **Core Concept:** จาก “ค้นคำ” สู่ “เข้าใจภาษา”  
> **Tagline:** “ไม่ต้องรู้คำ ก็รู้ว่าควรใช้คำไหน”  
> **Primary Goal:** ทำให้ THAI CONTEXT เป็นพื้นที่ค้นหาและทำความเข้าใจภาษาไทยที่ทันสมัย สงบ เชื่อถือได้ และใช้งานง่าย โดยให้ 3D / Motion / Glass เป็นเพียงชั้นเสริมประสบการณ์ ไม่ใช่ตัวเอกแทนเนื้อหา

---

# 0. V3 Product Direction

V3 พัฒนาต่อจาก V2 โดยยึด Core Product เดิมทั้งหมด แต่ปรับ Visual Language ให้ใกล้กับ UI Reference ที่แนบมาอย่างชัดเจนขึ้น:

- White-first / Airy interface
- Soft Ice Blue เป็น accent หลัก
- Search เป็นพระเอกของหน้า Hero
- Living Book 3D อยู่เป็นฉาก / storytelling object มากกว่าจะเป็นโชว์เทคนิค
- Result area อ่านง่ายเหมือน editorial knowledge workspace
- Soft rounded cards แต่ไม่ bubble ทุกอย่าง
- Liquid Glass ใช้เฉพาะชั้นลอยและ control ที่ต้องการ depth
- ลด icon decorative ที่ไม่มีความหมาย
- ลด gradient ที่ดูเหมือน generic AI product
- เน้น typography, whitespace, borders, shadows และ hierarchy มากกว่า visual effects
- เพิ่มการอ่านออกเสียงคำ (pronunciation / text-to-speech)
- เพิ่ม Share Result เพื่อแชร์ “คำนี้หมายถึงอะไร ใช้ยังไง และอ้างอิงจากไหน”

> **North Star V3:** ผู้ใช้ต้องรู้สึกว่าเข้ามาใน “พื้นที่ความรู้ภาษาไทยร่วมสมัย” ไม่ใช่ AI chatbot, ไม่ใช่ dashboard, และไม่ใช่ landing page ที่โชว์ effect มากกว่าข้อมูล

---

# 1. What Changes from V2 → V3

## 1.1 สิ่งที่คงไว้

- Meaning-first Hero Search
- Search → Results core flow
- 3D Living Book Hero
- Cinematic Hero transition เฉพาะการค้นจาก Hero
- Floating / Morphing Navbar หลังออกจาก Hero
- Persistent Search Composer สำหรับค้นซ้ำ
- Dynamic results 0 / 1 / 2 / 3+
- Context Comparator
- Word Evolution
- Dialect Explorer
- Grounded Evidence
- Mock / Real API fail-safe
- Responsive / accessibility / reduced-motion requirements

## 1.2 สิ่งที่ปรับใหม่

1. เปลี่ยน mood จาก Warm Neutral + Burgundy เป็น White / Ice Blue / Deep Navy
2. ลด “AI visual vocabulary” ได้แก่ sparkles, glow, rainbow refraction, purple-blue gradient, floating blobs
3. เปลี่ยน layout Results ให้เป็น “Knowledge Workspace” มากขึ้น
4. Result ที่ถูกเลือกมี Detail Card กลาง/หลักที่อ่านง่าย
5. เพิ่ม Audio Pronunciation Control
6. เพิ่ม Share Result / Copy Link / Copy Meaning
7. แยก “AI-assisted context” ออกจาก definition หลักอย่างชัดเจน
8. แหล่งข้อมูลต้องเห็นง่ายขึ้น ไม่ซ่อนลึก
9. Icon system เป็น functional line icons เท่านั้น
10. 3D / illustration ใช้เฉพาะ Hero และ ambient edge decoration บางจุด

---

# 2. V3 Visual DNA

## 2.1 Style Formula

```text
40% Contemporary Thai Editorial
20% Airy White Product UI
12% Soft Rounded Interface
10% Living Book / Knowledge Object
8% Soft Ice Blue Glass
5% Calm Motion
5% Organic Human Detail
```

## 2.2 Keywords

```text
Thai-first
Airy
Editorial
Clean white
Soft ice blue
Deep navy typography
Quiet premium
Living book
Knowledge product
Human-designed
Soft depth
Calm technology
Functional icons
Editorial spacing
Subtle glass
Grounded information
```

## 2.3 ห้ามตีความ V3 เป็น

```text
AI SaaS landing page
Chatbot clone
Glassmorphism showcase
Futuristic dashboard
Purple gradient product
Gaming UI
Cyber UI
3D object gallery
```

---

# 3. Design Principles

## 3.1 Content First

ลำดับความสำคัญ:

```text
1. คำศัพท์ / ความหมาย
2. บริบทการใช้
3. ตัวอย่าง
4. ความต่างกับคำใกล้เคียง
5. แหล่งอ้างอิง
6. Interaction
7. Decoration
```

ถ้า decoration แย่งการอ่าน ให้ตัด decoration ก่อนเสมอ

## 3.2 White Space Is a Feature

- ใช้พื้นที่ว่างช่วยแยกเนื้อหา
- ไม่อัด card หลายชั้นโดยไม่จำเป็น
- Section ไม่ต้องมี background คนละสีทุก section
- การแบ่ง hierarchy ใช้ spacing + border + typography ก่อนใช้สี

## 3.3 Soft Rounded, Not Bubble Everything

```text
Small control       10–14px
Button              14–18px
Input               22–30px
Search Composer     28–34px
Content Card        20–28px
Feature Surface     24–32px
Floating Navbar     22–28px
Drawer / Modal      24–32px
Pill / Tag          999px เฉพาะ tag/status/filter
```

## 3.4 Glass Is a Layer, Not a Theme

ใช้ glass กับ:

- Floating Navbar
- Hero Search shell บางส่วน
- Persistent Search Composer
- Small floating quick actions
- Mobile bottom sheet header

ไม่ใช้ glass กับ:

- Result definition card หลัก
- Evidence body
- Long-form content
- Comparator content rows

## 3.5 Visual Trust Over Visual Spectacle

ทุก component ที่เกี่ยวกับ definition / evidence ต้องดูนิ่ง อ่านง่าย และมี provenance ชัดเจน

---

# 4. Color System V3

## 4.1 Core Palette

```css
:root {
  --bg: #F7FAFD;
  --bg-subtle: #F2F7FB;
  --bg-ice: #EEF6FD;

  --surface: #FFFFFF;
  --surface-soft: #FBFDFF;
  --surface-blue: #F2F8FE;
  --surface-glass: rgba(255,255,255,.70);

  --text-primary: #13233B;
  --text-secondary: #42566F;
  --text-muted: #71839A;
  --text-faint: #9AA9BA;

  --accent-blue: #4D91E6;
  --accent-blue-strong: #2F78CF;
  --accent-blue-soft: #DDEEFF;
  --accent-blue-faint: #EEF7FF;

  --accent-green: #5A8A78;
  --accent-green-soft: #EAF4EF;

  --accent-gold: #B88A43;
  --accent-gold-soft: #F7F0E4;

  --danger: #B75D65;

  --border-soft: #E2EBF3;
  --border-strong: #CCDCEB;
  --border-glass: rgba(255,255,255,.72);

  --shadow-xs: 0 2px 10px rgba(30, 67, 103, .04);
  --shadow-soft: 0 12px 34px rgba(30, 67, 103, .07);
  --shadow-lift: 0 18px 46px rgba(30, 67, 103, .10);
}
```

## 4.2 Color Usage Rule

- `Deep Navy` = primary text / strong hierarchy
- `Accent Blue` = active navigation / CTA / selected state / links
- `Ice Blue` = subtle information surfaces
- `Muted Green` = verified / trusted / official
- `Muted Gold` = historical / changed / comparison emphasis
- ห้ามใช้สี accent เกิน 3 กลุ่มใน viewport เดียวโดยไม่จำเป็น

## 4.3 Gradient Rule

V3 **ไม่ใช้ gradient เป็น visual identity หลัก**

อนุญาตเฉพาะ:

- natural light bloom จาก 3D scene
- background atmospheric fade ที่แทบมองไม่เห็น
- subtle alpha falloff สำหรับ glass

ห้าม:

- purple-blue AI gradient
- multi-color aurora
- neon edge gradient
- gradient button แบบ AI SaaS
- card background ไล่สีเพื่อความสวยอย่างเดียว

---

# 5. Typography V3

## 5.1 Primary Thai

แนะนำ:

```text
LINE Seed Sans TH
```

Fallback:

```text
IBM Plex Sans Thai
Noto Sans Thai
Sarabun
```

## 5.2 Serif / Editorial Accent

ใช้ได้เล็กน้อยกับ:

- quote
- book page
- book cover
- decorative English phrase

ไม่ใช้ Serif กับ functional UI หลัก

## 5.3 Desktop Hierarchy

```text
Hero Display       clamp(48px, 5vw, 78px)
Hero Support       17–21px
Section Title      30–42px
Word Title         34–48px
Card Title         20–26px
Body               16–18px
Meta               13–14px
Label              12–13px
```

## 5.4 Thai Reading Rule

- line-height body 1.65–1.8
- ห้ามใช้ตัวอักษรบางเกินไป
- อย่าบีบ letter-spacing ภาษาไทย
- พื้นที่เนื้อหายาวไม่ควรกว้างเกิน ~72–84 ตัวอักษรต่อบรรทัดโดยประมาณ

---

# 6. Icon System V3

## 6.1 Functional Icon Only

Icon ทุกอันต้องตอบได้ว่า “ช่วยให้ผู้ใช้ทำอะไร?”

อนุญาต:

- Search
- Volume / Speaker
- Share
- Bookmark
- Copy
- Compare
- Source / Document
- Chevron
- Filter
- Close
- Menu
- External link

ลด / หลีกเลี่ยง:

- Sparkles
- Magic wand
- AI robot head
- constellation dots
- random starburst
- abstract AI network icon
- decorative badge icons ที่ไม่มี action

## 6.2 Style

```text
stroke 1.6–2px
rounded line-cap
optical size 18 / 20 / 24
สีตาม text-secondary หรือ accent-blue
ไม่มี glow
ไม่มี duotone ฉูดฉาด
```

---

# 7. Master Page Flow V3

```text
[ HERO / MEANING-FIRST SEARCH / LIVING BOOK ]
                 ↓
       cinematic hero transition
                 ↓
[ RESULTS KNOWLEDGE WORKSPACE ]
                 ↓
[ CONTEXT COMPARATOR ]
                 ↓
[ WORD EVOLUTION ]
                 ↓
[ DIALECT EXPLORER ]
                 ↓
[ TRUST / EVIDENCE ]
                 ↓
[ FOOTER / DISCOVERY ]
```

หลังออกจาก Hero:

```text
Floating Glass Navbar     → top center
Main Content              → normal document flow
Persistent Search         → floating bottom center
```

---

# 8. Navbar V3

## 8.1 Hero State

ลักษณะ:

- transparent / near-transparent
- สูง 72–84px
- โลโก้ซ้าย
- menu กลาง
- utilities ขวา
- active menu ใช้ blue underline บาง
- ห้ามมี heavy background

Suggested menu:

```text
หน้าหลัก
ค้นหาคำ
สำรวจคำ
เปรียบเทียบคำ
เกี่ยวกับโครงการ
```

Utilities:

```text
Search shortcut
Theme toggle (optional)
เข้าสู่ระบบ
TH | EN
```

## 8.2 Floating State

เมื่อออกจาก Hero:

```css
.floating-nav {
  width: min(94vw, 1180px);
  border-radius: 26px;
  background: rgba(255,255,255,.72);
  border: 1px solid rgba(214,228,241,.78);
  backdrop-filter: blur(20px) saturate(118%);
  -webkit-backdrop-filter: blur(20px) saturate(118%);
  box-shadow: 0 14px 38px rgba(30,67,103,.08);
}
```

ไม่มี colored glow ใต้ navbar

---

# 9. Hero V3 — Search First, Book as Story

## 9.1 Composition

Desktop layout แนะนำ:

```text
┌──────────────────────────────────────────────────────────────┐
│ Navbar                                                       │
│                                                              │
│   Main editorial copy      Large Meaning Search              │
│   + support text           + popular prompts                 │
│                                                              │
│                Living Book 3D / open pages / blue ribbon     │
│                                                              │
│                  Feature capability strip                    │
└──────────────────────────────────────────────────────────────┘
```

องค์ประกอบสำคัญจาก Reference:

- heading ใหญ่ฝั่งซ้าย
- search ขนาดใหญ่และเด่น
- 3D book อยู่หลัง/ขวาแบบไม่บัง search
- light blue translucent ribbon / paper-like element ได้ แต่ต้องไม่กลายเป็น abstract AI blob
- ใช้ธรรมชาติ/กระดาษ/ตัวอักษรไทยเป็น ambient detail ได้เล็กน้อย

## 9.2 Hero Copy

Primary headline แนะนำ:

> **ไม่ต้องรู้คำ ก็รู้ว่าควรใช้คำไหน**

Support:

> พจนานุกรมไทยยุคใหม่ ค้นจากสิ่งที่คุณต้องการสื่อ สู่คำที่ใช่ พร้อมความหมาย บริบท ตัวอย่าง และแหล่งที่มา

Search prompt:

> **วันนี้คุณอยากสื่ออะไร?**

Placeholder:

> เช่น อยากได้คำที่หมายถึง การทำงานให้ได้ผลดีโดยใช้ทรัพยากรน้อย

## 9.3 Hero Search

```css
.hero-search {
  min-height: 86px;
  background: rgba(255,255,255,.92);
  border: 1px solid #DCE9F4;
  border-radius: 30px;
  box-shadow: 0 18px 46px rgba(36,82,126,.10);
}
```

CTA button:

- circle / rounded square ขนาดใหญ่
- blue solid
- arrow icon เท่านั้น
- hover: blue darken 4–6%, translateY(-1px)
- no gradient

## 9.4 Popular Prompt Chips

เช่น:

```text
คำที่หมายถึงความยั่งยืน
คำที่ใช้แทน “ครีเอทีฟ”
ความแตกต่างระหว่าง ประสิทธิภาพ และ ประสิทธิผล
คำที่ใช้ในทางการมากกว่า “สวย”
```

Chip ต้องบาง สงบ ไม่เงาหนัก

---

# 10. Capability Strip

หลัง Hero Search มี strip บอกว่าเว็บทำอะไรได้ โดยใช้ icon แบบ functional และข้อความสั้น

```text
ค้นหาจากความหมาย
อธิบายบริบทการใช้
เปรียบเทียบคำ
สำรวจความสัมพันธ์ของคำ
อ้างอิงจากแหล่งข้อมูลจริง
```

Design:

- full-width white surface
- 5 columns desktop
- divider บาง
- icon อยู่ใน circle tint อ่อน ไม่ใช้ gradient
- mobile = horizontal scroll / 2-column wrap

เป้าหมายคือ onboarding ไม่ใช่ decoration

---

# 11. Hero 3D Visual Contract

3D ต้องเป็น “Living Book” จริง ไม่ใช่ generic AI 3D

## 11.1 Allowed Objects

- open book
- pages
- paper ribbon / bookmark ribbon
- Thai letters / type blocks
- paper slip
- subtle leaves / natural object เล็กน้อย
- printed notes

## 11.2 Avoid

- random chrome sphere
- glowing orb
- blob
- liquid metal
- impossible glass knot
- cyber lattice
- particle field เยอะ

## 11.3 Lighting

```text
soft daylight
white-blue bounce
very light warm paper tone
no neon
no strong bloom except transition moment
```

---

# 12. Signature Hero Search Transition

คง logic จาก V2:

```text
Hero Search เท่านั้น → cinematic
Persistent Search → update results directly
```

Timeline เป้าหมาย:

```text
T+0ms    submit + loading
T+120    supporting copy fades slightly
T+220    book settles
T+340    book opens / pages react
T+650    camera moves toward page
T+900    soft white-blue paper bloom
T+1200   result data prepared
T+1300   jump / transition to #search-results
T+1500   overlay fades
T+1650   result workspace reveal
```

Target total 1.4–1.8s

ห้าม flash ขาวแรงทันที

---

# 13. Results V3 — Knowledge Workspace

V3 ให้ผลลัพธ์รู้สึกคล้ายพื้นที่ค้นคว้า ไม่ใช่ grid card ทั่วไป

## 13.1 Desktop Recommended Layout

```text
┌─────────────────┬──────────────────────────┬──────────────────┐
│ Candidate List  │ Selected Word Detail     │ Context / Source │
│                 │                          │                  │
│ 1 ประสิทธิภาพ   │ ประสิทธิภาพ     🔊 ♡ ↗ │ เหมาะกับบริบท   │
│ 2 คุ้มค่า        │ pronunciation / POS      │ คำอธิบายเพิ่ม    │
│ 3 ประสิทธิผล     │ definition               │                  │
│ 4 ผลผลิต         │ example                  │ แหล่งข้อมูล       │
│                 │ contexts / related words │ source list       │
└─────────────────┴──────────────────────────┴──────────────────┘
```

แนวคิดนี้ยึดความชัดของ reference:

- ซ้าย = เลือก candidate
- กลาง = อ่านคำที่เลือกแบบละเอียด
- ขวา = contextual guidance + source

## 13.2 Responsive Rules

### ≥ 1280px

3-column workspace

```text
280–340px / minmax(520px, 1fr) / 320–380px
```

### 900–1279px

```text
Candidate list + Detail
Context/Source ย้ายลงใต้ detail หรือ drawer
```

### < 900px

```text
Candidate tabs / cards
Selected detail full width
Context + Source stacked
```

### Mobile

single flow:

```text
Query Summary
Candidate horizontal selector
Selected Word Detail
Context Note
Source
Related Words
```

---

# 14. Candidate List

Candidate row anatomy:

```text
[01] ประสิทธิภาพ      [ตรงที่สุด]
     ความสามารถในการทำงานให้ได้ผลดี...
                                      ›
```

Selected:

- border accent blue
- very light blue surface
- no heavy glow

Status chip examples:

```text
ตรงที่สุด
ใช้ได้หลายบริบท
ใกล้เคียง
เกี่ยวข้อง
```

ไม่จำเป็นต้องโชว์ % match เสมอ ถ้า score ทำให้ดู AI เกินไป

ถ้าต้องโชว์ score:

```text
ความใกล้เคียง 94%
```

ใช้เป็น meta text ไม่ใช้ progress ring

---

# 15. Selected Word Detail Card

## 15.1 Header Anatomy

```text
คำศัพท์
ประสิทธิภาพ    [🔊 อ่านออกเสียง] [บันทึก] [แชร์]
(prà-sìt-thí-phâap)    น. (คำนาม)
```

Romanization เป็น optional layer; definition ไทยต้องเด่นกว่า

## 15.2 Core Sections

```text
ความหมาย
ตัวอย่างการใช้
เหมาะกับบริบท
คำใกล้เคียง
เปรียบเทียบคำ
หลักฐานอ้างอิง
```

## 15.3 Card Style

```css
.word-detail {
  background: #FFFFFF;
  border: 1px solid #E1EAF2;
  border-radius: 24px;
  box-shadow: 0 10px 28px rgba(30,67,103,.055);
}
```

ผลลัพธ์หลักต้องไม่ glass

---

# 16. NEW — Pronunciation / Read Aloud

## 16.1 Goal

ให้ผู้ใช้กดฟัง “คำผลลัพธ์ที่ค้นหา” ได้ทันที เพื่อช่วยเรื่อง:

- การออกเสียง
- การเรียนรู้คำใหม่
- accessibility
- การใช้งานกับคำที่ผู้ใช้ไม่มั่นใจว่าอ่านอย่างไร

## 16.2 Primary Control

ตำแหน่ง:

- ข้าง headword ใน Selected Word Detail
- optional ใน candidate card เมื่อ hover / selected

Control:

```text
[ speaker icon ]
```

Desktop tooltip:

```text
อ่านออกเสียง
```

Mobile aria-label:

```text
อ่านออกเสียงคำว่า “ประสิทธิภาพ”
```

## 16.3 Audio States

```ts
type PronunciationState =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'error';
```

UX:

```text
idle     → speaker icon
loading  → subtle spinner / wave
playing  → small 2–3 bar waveform or pause icon
paused   → play icon
error    → tooltip “ไม่สามารถเล่นเสียงได้”
```

ห้ามทำ waveform decorative ใหญ่

## 16.4 Playback Rules

- เล่นทีละคำเท่านั้น
- กดคำใหม่ → stop คำเดิมก่อน
- navigation / search ใหม่ → stop audio
- รองรับ keyboard Enter / Space
- ไม่ autoplay
- ไม่เล่นเสียงพร้อม Hero cinematic

## 16.5 API Contract Suggestion

```ts
type Pronunciation = {
  text: string;
  locale?: 'th-TH';
  audio_url?: string;
  phonetic?: string;
  source?: 'recorded' | 'tts';
};
```

Fallback:

```text
audio_url available → use server audio
otherwise           → Web Speech / TTS if supported
otherwise           → hide audio control gracefully
```

ควรแสดง distinction ถ้า pronunciation เป็น synthesized voice เฉพาะเมื่อมีเหตุผลด้าน trust; ไม่จำเป็นต้องติด “AI” ใหญ่ ๆ ใน UI

---

# 17. NEW — Share Result

## 17.1 Goal

ผู้ใช้แชร์ได้ว่า:

> “คำนี้หมายถึงอะไร ใช้ในบริบทไหน และมาจากแหล่งใด”

ไม่แชร์แค่ URL เปล่า

## 17.2 Share Entry Point

อยู่ข้าง headword:

```text
[ Share icon ] แชร์
```

Desktop เปิด compact popover

Mobile เปิด bottom sheet

## 17.3 Share Actions

```text
คัดลอกลิงก์
คัดลอกความหมาย
แชร์ข้อความสรุป
แชร์ผ่าน Web Share API
```

optional:

```text
สร้างการ์ดสำหรับแชร์
```

แต่ **Share Card** ต้องเป็น editorial card เรียบ ๆ ไม่ใช่ AI-generated social card ที่มี gradient และ sparkle

## 17.4 Shared Text Template

```text
“ประสิทธิภาพ”
ความหมาย: ความสามารถในการทำงานให้ได้ผลดี โดยใช้ทรัพยากรอย่างเหมาะสม
เหมาะกับบริบท: งานวิชาการ / การทำงาน / การวางแผน
แหล่งข้อมูล: THAI CONTEXT + แหล่งอ้างอิงที่เกี่ยวข้อง

ดูรายละเอียด: <deep-link>
```

## 17.5 Deep Link

แนะนำ URL:

```text
/word/ประสิทธิภาพ
/search?q=...
```

หรือ canonical id:

```text
/word/prasitthiphap
```

Share link เปิดแล้วต้อง:

- focus คำที่แชร์
- restore detail state
- ไม่ replay Hero cinematic

## 17.6 Share Analytics Optional

```text
share_open
share_copy_link
share_copy_definition
share_native
```

ห้าม block UX ถ้า analytics fail

---

# 18. Context Guidance Panel

แทนการใช้ label “AI อธิบาย” เป็น visual หลัก ให้ใช้ภาษาที่เป็นกลางกว่า:

```text
บริบทการใช้
คำนี้เหมาะกับสิ่งที่คุณต้องการสื่อหรือไม่?
```

ถ้าข้อความ generated / model-assisted:

```text
คำอธิบายบริบทเพิ่มเติม
```

และมี disclosure ขนาดเล็ก:

```text
ระบบช่วยสรุปจากบริบทและแหล่งข้อมูลที่มี
```

หลักการ:

- อย่าทำ sparkle เป็น icon ประจำ section
- อย่าใช้ badge “AI” สีน้ำเงินสดเป็นสิ่งแรกที่เห็น
- แยก generated explanation ออกจาก official definition และ evidence

---

# 19. Sources Panel

แหล่งข้อมูลต้องเห็นง่ายเหมือน reference

Structure:

```text
แหล่งข้อมูล
• พจนานุกรมฉบับราชบัณฑิตยสถาน (พ.ศ. 2554)
• คลังข้อมูลคำศัพท์ภาษาไทย / Open Data
• THAI CONTEXT Semantic Index

[ดูรายละเอียดแหล่งที่มา →]
```

Source row click → Evidence Drawer

Verified state:

```text
✓ ตรวจสอบแหล่งข้อมูลแล้ว
```

ใช้ muted green

---

# 20. Query Summary / Parsed Intent

แสดงเหนือ workspace แบบ compact:

```text
ผลการค้นหาสำหรับ
“การทำงานให้ได้ผลดีโดยใช้ทรัพยากรน้อย”

บริบท: การทำงาน · ทางการ
```

Smart Filters:

```text
ทางการ
งานวิชาการ
ธุรกิจ
ใช้บ่อย
```

ให้ filter เป็น secondary control ไม่ใช่ visual hero

---

# 21. Context Comparator V3

หลักการเดิมจาก V2 แต่ปรับ visual ให้ขาว สะอาด และเป็น table/editorial comparison มากขึ้น

Desktop:

```text
┌──────────────────────────────────────────────────────┐
│ เปรียบเทียบคำ                                       │
│                                                      │
│ ประสิทธิภาพ                    ประสิทธิผล            │
│ ความหมาย     ...                ความหมาย     ...      │
│ เน้น          วิธี/ความคุ้มค่า   เน้น          ผลลัพธ์   │
│ ใช้ใน         ...                ใช้ใน         ...      │
│                                                      │
│ สรุปความต่าง: ...                                   │
└──────────────────────────────────────────────────────┘
```

Difference highlight:

- thin blue marker
- pale blue row background
- no glowing comparison divider

Add pronunciation icon ข้างคำทั้งสองได้

---

# 22. Word Evolution V3

Visual:

- timeline บาง
- 3 era buttons
- definition card white
- historical change use muted gold
- added / verified use muted green

ไม่ใช้ carousel effect หนัก

```text
๒๕๔๒ —— ๒๕๕๔ —— ๒๕๖๙
                ●
```

Motion = crossfade + 12–16px horizontal shift

---

# 23. Dialect Explorer V3

ไม่ใช้ “AI map” เป็น visual hero

Desktop:

```text
คำมาตรฐาน: คิดถึง

[เหนือ]   [อีสาน]   [กลาง]   [ใต้]
กึ๊ดเติงหา คึดฮอด    คิดถึง    ...
```

แต่ละ card:

- white / subtle tinted surface
- source visible
- audio pronunciation ได้ถ้ามี
- Official / inferred disclosure ชัดแต่ไม่ฉูดฉาด

ถ้าระบบช่วยอนุมาน:

```text
◌ ยังไม่มีหลักฐานทางการเพียงพอ
```

ดีกว่าการขึ้น “AI Inferred” ใหญ่ ๆ

---

# 24. Evidence Drawer V3

Desktop = right drawer
Mobile = bottom sheet

Header glass ได้เล็กน้อย
Body solid white

Structure:

```text
หลักฐานอ้างอิง

คำ: ประสิทธิภาพ
แหล่ง: พจนานุกรม...
ปี: 2554
หน้า: ...

ข้อความอ้างอิง / ข้อมูลต้นทาง

✓ แหล่งข้อมูลที่ตรวจสอบได้
```

Safe Abstention:

> ระบบยังไม่พบหลักฐานที่เพียงพอสำหรับยืนยันข้อมูลนี้ จึงไม่ควรสรุปเป็นข้อเท็จจริง

---

# 25. Persistent Search Composer V3

หลังออกจาก Hero:

```text
fixed bottom center
width: min(780px, calc(100vw - 48px))
```

```css
.bottom-composer {
  background: rgba(255,255,255,.76);
  border: 1px solid rgba(211,225,238,.86);
  backdrop-filter: blur(20px) saturate(118%);
  border-radius: 28px;
  box-shadow: 0 16px 42px rgba(31,70,108,.10);
}
```

Placeholder:

> ลองเล่าความหมายอื่นที่คุณกำลังคิด...

Search from composer:

```text
submit
→ inline loading
→ update result workspace
→ selected result reset to best candidate
→ crossfade
```

ห้าม replay 3D cinematic

---

# 26. Motion System V3

## 26.1 Character

```text
soft
purposeful
low-amplitude
editorial
no playful bounce
```

## 26.2 Tokens

```css
:root {
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-soft: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-cinematic: cubic-bezier(0.65, 0, 0.35, 1);

  --motion-fast: 150ms;
  --motion-ui: 240ms;
  --motion-soft: 420ms;
  --motion-section: 560ms;
  --motion-cinematic: 1500ms;
}
```

## 26.3 Allowed Motion

- opacity
- translate 4–24px
- subtle scale 0.985 → 1
- gentle 3D book page motion
- navbar morph
- drawer slide
- waveform bars when audio playing

## 26.4 Avoid

- bounce
- elastic overshoot
- rotating icons without reason
- random float on every card
- mouse-follow on text
- strong parallax during reading
- 3D tilt on result card
- looping sparkle

---

# 27. Hover & Microinteraction

## Buttons

```text
hover: translateY(-1px)
active: translateY(0) scale(.985)
```

## Cards

เฉพาะ clickable card:

```text
hover: border darken slightly + shadow increase
```

ไม่ยกทุก card ขึ้น 8–12px

## Text Link

```text
arrow shifts 2–4px
underline / text color changes
```

## Speaker

```text
hover → background blue-faint
playing → icon changes to pause or quiet bars
```

---

# 28. State Architecture V3

Global experience state ไม่ควรโตตามทุก microinteraction

```ts
type AppExperienceState =
  | 'hero-idle'
  | 'hero-search-submitting'
  | 'hero-cinematic-transition'
  | 'results-active'
  | 'results-searching'
  | 'evidence-open';
```

Audio / Share ใช้ feature state แยก:

```ts
type AudioUIState = {
  activeWordId?: string;
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'error';
};

type ShareUIState = {
  open: boolean;
  wordId?: string;
};
```

Rules:

- audio ไม่เปลี่ยน global experience state
- share popover ไม่เปลี่ยน search state
- evidence drawer เปลี่ยน global state ได้เพราะมี modal behavior / focus trap
- search ใหม่หยุด audio ก่อน replace result

---

# 29. Result Data Contract V3

```ts
type SearchResponse = {
  query_understanding: {
    raw_query: string;
    detected_meaning: string;
    context?: string;
    excluded_words?: string[];
  };

  recommendations: Array<{
    id: string;
    headword: string;
    score?: number;
    pos?: string;
    pronunciation?: {
      phonetic?: string;
      audio_url?: string;
      locale?: string;
    };
    definition: string;
    contextual_explanation?: string;
    examples?: string[];
    registers?: string[];
    contexts?: string[];
    related_words?: Array<{
      id?: string;
      headword: string;
      relation?: string;
    }>;
    evidence?: Evidence[];
    canonical_url?: string;
  }>;
};
```

Frontend ห้าม assume ว่า:

- ทุกคำมี audio
- ทุกคำมี phonetic
- ทุกคำมี evidence
- ทุกคำมี AI/contextual explanation
- result count คงที่

---

# 30. Share Data Contract

```ts
type SharePayload = {
  title: string;
  text: string;
  url: string;
  wordId: string;
};
```

Priority:

```text
navigator.share available → Native Share
else → Copy Link / Copy Summary
```

Feedback:

```text
คัดลอกลิงก์แล้ว
คัดลอกความหมายแล้ว
```

ใช้ toast เล็ก ๆ 1.8–2.4s

---

# 31. Audio Technical Strategy

Priority:

```text
1. Recorded / server-generated pronunciation file
2. Backend TTS endpoint
3. Browser SpeechSynthesis fallback
4. Hide audio control gracefully
```

ควรมี `AudioManager` กลาง:

```text
play(word)
pause()
stop()
stopAll()
```

เหตุผล:

- กันเสียงซ้อน
- stop เมื่อเปลี่ยนคำ
- stop เมื่อ route change
- จัด accessibility status ได้ง่าย

---

# 32. Component Architecture V3

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   ├── layout/
│   │   ├── MorphingNavbar.tsx
│   │   ├── PageShell.tsx
│   │   └── Footer.tsx
│   │
│   ├── hero/
│   │   ├── HeroSection.tsx
│   │   ├── Hero3DScene.tsx
│   │   ├── HeroSearch.tsx
│   │   ├── PopularSuggestions.tsx
│   │   └── CapabilityStrip.tsx
│   │
│   ├── search/
│   │   ├── SearchResultsWorkspace.tsx
│   │   ├── CandidateList.tsx
│   │   ├── CandidateRow.tsx
│   │   ├── WordDetailPanel.tsx
│   │   ├── ContextGuidancePanel.tsx
│   │   ├── SourcesPanel.tsx
│   │   ├── ParsedIntent.tsx
│   │   ├── SmartFilters.tsx
│   │   └── PersistentSearchComposer.tsx
│   │
│   ├── pronunciation/
│   │   ├── PronunciationButton.tsx
│   │   ├── AudioManager.tsx
│   │   └── usePronunciation.ts
│   │
│   ├── share/
│   │   ├── ShareResultButton.tsx
│   │   ├── ShareResultPopover.tsx
│   │   ├── ShareResultSheet.tsx
│   │   └── share-result.ts
│   │
│   ├── compare/
│   │   └── ContextComparator.tsx
│   │
│   ├── evolution/
│   │   └── EvolutionExplorer.tsx
│   │
│   ├── dialect/
│   │   ├── DialectExplorer.tsx
│   │   └── DialectCard.tsx
│   │
│   ├── evidence/
│   │   └── GroundedEvidenceDrawer.tsx
│   │
│   ├── motion/
│   │   ├── HeroSearchTransition.tsx
│   │   ├── SectionReveal.tsx
│   │   └── ScrollExperience.tsx
│   │
│   └── ui/
│       ├── GlassSurface.tsx
│       ├── SoftCard.tsx
│       ├── SoftButton.tsx
│       ├── Tag.tsx
│       ├── IconButton.tsx
│       ├── Tooltip.tsx
│       ├── Toast.tsx
│       └── SectionHeading.tsx
│
├── lib/
│   ├── api-client.ts
│   ├── motion.ts
│   ├── audio-manager.ts
│   ├── share.ts
│   └── experience-state.ts
│
└── mocks/
    └── thai-context-mock.json
```

---

# 33. Search Result Layout Behaviors

## 0 result

```text
ยังไม่พบคำที่ตรงพอ
ลองเพิ่มบริบท เช่น ใช้ในงานเขียน การพูด งานราชการ หรือสถานการณ์ใด
```

Actions:

```text
เพิ่มบริบท
เลือกระดับภาษา
ระบุคำที่ไม่ต้องการ
```

## 1 result

- candidate list ยุบเหลือ compact summary
- detail panel max-width 840–940px
- context/source อยู่ขวาหรือด้านล่างตาม viewport

## 2 results

- candidate list 2 rows
- detail panel คงที่
- ไม่จำเป็นต้องทำ 2 card ใหญ่คู่กันบน desktop ถ้า workspace อ่านง่ายกว่า

## 3+

- candidate list scroll ได้ภายใน max height บางช่วง
- selected detail ไม่กระโดดเมื่อเปลี่ยน candidate

---

# 34. Loading / Skeleton V3

ใช้ skeleton neutral มาก

ห้าม shimmer bright gradient

```css
background: #EEF3F7;
```

ถ้าทำ shimmer:

- contrast ต่ำมาก
- motion ช้า
- disable ใน reduced-motion

---

# 35. Accessibility V3

ต้องรองรับ:

- keyboard navigation
- visible focus ring
- screen reader result update
- pronunciation button aria state
- share button aria-label
- evidence focus trap
- Esc close popover/drawer
- touch target ≥ 44px
- color contrast
- reduced motion
- no autoplay audio
- no information encoded by color only

Pronunciation:

```text
aria-label="อ่านออกเสียงคำว่า ประสิทธิภาพ"
aria-pressed / state ตาม implementation
```

Share:

```text
aria-label="แชร์ความหมายของคำว่า ประสิทธิภาพ"
```

---

# 36. Responsive Strategy V3

## Desktop ≥ 1280

- Full Hero composition
- 3-column result workspace
- floating nav
- floating bottom composer
- full 3D quality tier

## Tablet 900–1279

- Hero 3D simplify
- result 2-column main layout
- context/source stack lower
- capability strip 3+2 / horizontal

## Tablet 768–899

- candidate selector top
- detail full width
- side panels below
- floating composer full width minus 32–40px

## Mobile < 768

Hero:

- 100svh minimum
- 3D simplified / poster fallback
- headline 40–52px
- search 2–3 rows
- hide excessive ambient decoration

Results:

- one column
- candidate horizontal chips/cards
- headword action buttons wrap safely
- share = bottom sheet
- evidence = bottom sheet
- source section visible without hover

---

# 37. Human-Designed Guardrails

ก่อน merge visual feature ใหม่ ให้ตรวจ 8 ข้อนี้:

1. มีเหตุผลด้าน UX หรือแค่ตกแต่ง?
2. ถ้าเอา icon ออก ยังเข้าใจอยู่ไหม?
3. มี gradient เพราะจำเป็นจริงหรือไม่?
4. มี glass มากเกินไปหรือยัง?
5. มี visual effect ที่ดูเหมือน AI template หรือไม่?
6. Thai text ยังเป็นตัวเอกหรือไม่?
7. Source / evidence ยังชัดหรือไม่?
8. User ทำ task หลักได้เร็วขึ้นหรือช้าลง?

ถ้าคำตอบไม่ชัด ให้เลือกแบบเรียบกว่า

---

# 38. Anti-patterns V3

ห้าม:

- AI sparkle icon เป็น default symbol
- gradient border ทุก card
- blue-purple glow
- floating orb / blob
- random 3D letters บินเต็มหน้า
- glass card ทุก section
- white text over busy 3D background
- dashboard sidebar
- chat bubbles
- AI response typing animation ยาว ๆ
- fake confidence meter ที่ไม่มีความหมาย
- waveform animation ถ้าไม่ได้เล่นเสียงจริง
- autoplay pronunciation
- share modal ใหญ่เกิน task
- deep evidence ที่ต้อง click หลายชั้น
- text “AI” เด่นกว่าคำศัพท์

---

# 39. Development Priority V3

## Phase 0 — Audit V2

- อ่าน current V2 implementation
- preserve working search flow
- audit state machine
- audit API / mock
- snapshot current responsive behavior

## Phase 1 — Tokens + Surface Migration

- white / ice blue palette
- typography
- border / shadow system
- icon system
- remove unnecessary gradients / glow / old burgundy theme

## Phase 2 — Hero V3 Static Composition

- navbar
- hero copy
- large search
- popular prompts
- 3D slot
- capability strip

ยังไม่แตะ cinematic logic มากเกินจำเป็น

## Phase 3 — Results Knowledge Workspace

- candidate list
- selected word detail
- context guidance
- sources panel
- 0/1/2/3+ states

## Phase 4 — Pronunciation

- AudioManager
- button states
- audio_url / TTS fallback
- stop on search / route
- a11y

## Phase 5 — Share Result

- Web Share API
- copy link
- copy definition
- deep link
- toast feedback

## Phase 6 — Persistent Search + Navbar Restyle

- keep behavior from V2
- restyle to V3
- ensure no cinematic replay from persistent search

## Phase 7 — Comparator / Evolution / Dialect Restyle

- migrate to V3 surfaces
- reduce decorative iconography
- add pronunciation where useful

## Phase 8 — Evidence / Trust Polish

- clearer source visibility
- verified state
- safe abstention
- model-assisted explanation disclosure

## Phase 9 — 3D Integration / Polish

- only after core stable
- book asset
- page animation
- light bloom
- fallback

## Phase 10 — Cinematic Orchestration

- preserve central timeline
- no multiple setTimeout chains
- reduced motion

## Phase 11 — QA

Test:

```text
375
430
768
900
1024
1280
1440+
```

Scenarios:

```text
API success
API slow
API fail
Mock mode
0 result
1 result
2 results
4+ results
no evidence
no audio
TTS error
share unsupported
Web Share supported
3D fail
reduced motion
keyboard only
```

---

# 40. Final V3 Experience

```text
เปิดเว็บ
↓
เห็นพื้นที่ขาวโปร่ง + หนังสือ 3D ที่ดูมีชีวิต
↓
อ่าน “ไม่ต้องรู้คำ ก็รู้ว่าควรใช้คำไหน”
↓
พิมพ์สิ่งที่ต้องการสื่อ
↓
กดค้นหา
↓
หนังสือตอบสนอง → เปิด → paper bloom
↓
เข้าสู่ Results Workspace
↓
เห็น candidate ทางซ้าย
↓
เลือกคำ → อ่านความหมายเต็มตรงกลาง
↓
กดฟังการออกเสียงได้ทันที
↓
ดูบริบทและแหล่งข้อมูลด้านขวา
↓
แชร์ความหมาย / คัดลอกลิงก์ได้
↓
เปรียบเทียบคำ
↓
ดูวิวัฒนาการ
↓
สำรวจภาษาถิ่น
↓
เปิดหลักฐานอ้างอิง
↓
ค้นคำใหม่จาก composer โดยไม่เล่น cinematic ซ้ำ
```

ความรู้สึกสุดท้าย:

> **สะอาด — ทันสมัย — น่าเชื่อถือ — สบายตา — มีมิติ — เป็นภาษาไทย — และไม่พยายามดูเป็น AI เกินไป**

---

# 41. Master Prompt for Codex / Coding Agent — V3

```text
Read design-v3.md as the single source of truth for THAI CONTEXT frontend UX/UI and interaction behavior.

Preserve the working product flow and state-machine logic from V2, but migrate the visual system to V3.

V3 visual direction:
- Contemporary Thai Editorial
- Airy white background
- Deep navy typography
- Soft ice-blue accent
- Soft rounded surfaces
- Selective Liquid Glass only for floating layers
- Living Book 3D as storytelling, not decoration overload
- Functional line icons only
- Minimal gradients
- No AI-SaaS visual language

The website must NOT look like a generic AI product. Avoid sparkles, random AI network icons, purple/blue gradients, glowing borders, floating blobs, glass cards everywhere, chatbot bubbles, and decorative 3D objects without UX purpose.

Hero:
- Build a white/ice-blue editorial hero inspired by the approved UI reference.
- Large left-side headline: “ไม่ต้องรู้คำ ก็รู้ว่าควรใช้คำไหน”
- Large centered meaning-first search composer.
- Keep the Living Book 3D scene in the background/right side without reducing text readability.
- Add popular prompts and a compact capability strip.

Search behavior:
- Hero Search triggers the cinematic book transition.
- API request and cinematic transition start together.
- When the transition overlay reaches full coverage, commit results and jump to #search-results with behavior:auto.
- Then fade the overlay out, reveal results, morph navbar, and show persistent search.
- Searches from PersistentSearchComposer MUST update results directly and MUST NOT replay the Hero cinematic.

Results V3:
- Replace generic result-card grids with a Knowledge Workspace on large desktop:
  left = candidate list,
  center = selected word detail,
  right = context guidance + sources.
- Responsive layouts must support 0 / 1 / 2 / 3+ recommendations.
- Result detail must clearly show meaning, examples, contexts, related words, evidence, pronunciation and share actions.

Pronunciation:
- Add a functional speaker button next to the selected headword.
- Implement idle/loading/playing/paused/error states.
- Only one pronunciation may play at a time.
- Stop playback on new search or route/state replacement.
- Prefer audio_url from API; support TTS/browser fallback if needed.
- Never autoplay.

Share Result:
- Add Share beside the headword.
- Support Web Share API when available.
- Fallback to Copy Link and Copy Meaning/Summary.
- Shared content should include headword, concise definition/context, source summary, and deep link.
- Opening a shared deep link should focus the shared word and must not replay the Hero cinematic.

Trust:
- Keep official/source evidence visually separate from generated contextual explanation.
- Do not use a large “AI explained” badge as a visual centerpiece.
- Prefer neutral labels such as “บริบทการใช้” or “คำอธิบายบริบทเพิ่มเติม”.
- Evidence must be reachable in one clear action.

Motion:
- Soft, low-amplitude and purposeful.
- No bounce, elastic overshoot, constant floating, 3D tilt on result cards, or looping sparkle effects.

Accessibility:
- keyboard navigation
- visible focus
- touch targets >= 44px
- reduced motion
- screen-reader updates for search results
- accessible pronunciation and share controls
- no autoplay audio

Performance:
- Search must remain usable if 3D fails.
- Lazy-load heavy 3D assets.
- Avoid layout shifts.
- Preserve V2 fail-safe mock behavior.

Development order:
1. Audit V2 and preserve working behavior
2. V3 tokens and visual surfaces
3. Hero V3 layout
4. Results Knowledge Workspace
5. Pronunciation
6. Share Result
7. Persistent Search + Navbar V3 restyle
8. Comparator / Evolution / Dialect V3 restyle
9. Evidence polish
10. 3D polish
11. Cinematic orchestration QA
12. Responsive / accessibility / performance QA

Do not redesign the core product flow unless design-v3.md explicitly says so.
```

---

# 42. V3 North Star

> **THAI CONTEXT คือพื้นที่ที่ช่วยให้คน “คิดเป็นความหมาย แล้วพบคำที่ใช่” โดยมีภาษาไทยเป็นพระเอก เทคโนโลยีอยู่เบื้องหลัง และหลักฐานอยู่ใกล้มือ**

ในเชิง Design:

> **Hero คือโลกของหนังสือ — Results คือโต๊ะค้นคว้าภาษา — Audio และ Share คือเครื่องมือใช้งานจริง — Glass เป็นเพียงชั้นลอย — และทุกอย่างต้องนิ่งพอให้คำภาษาไทยเด่นที่สุด**
