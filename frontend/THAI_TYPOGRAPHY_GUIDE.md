อ่านโครงสร้าง project และตรวจสอบระบบ font / typography ที่ใช้อยู่ในโปรเจกต์ THAI CONTEXT ก่อนเริ่มแก้ไข

## Task

ปรับ font ของข้อความภาษาไทยที่ผู้ใช้ต้อง “อ่านเพื่อศึกษาคำศัพท์ ภาษาไทย และรูปทรงตัวอักษรไทย” ให้ใช้ฟอนต์:

**Sarabun**

เนื่องจาก Sarabun เป็นฟอนต์ไทยแบบมีหัว อ่านรูปทรงพยัญชนะ สระ และวรรณยุกต์ได้ชัดเจน แต่ยังคงดูสะอาด ทันสมัย และเข้ากับ UI ของ THAI CONTEXT

---

## Important

**ห้ามเปลี่ยน font ทั้งเว็บไซต์แบบ global**

ให้เปลี่ยนเฉพาะข้อความที่เป็นเนื้อหาสำหรับการอ่านและเรียนรู้ภาษาไทย

ต้องรักษา font เดิมของ UI / Brand / Navigation ไว้ เพื่อไม่ให้ visual identity ของเว็บไซต์เปลี่ยน

แนวคิดคือแยก Typography ออกเป็น 2 กลุ่ม:

### 1. UI / Brand Typography

คง font ปัจจุบันไว้สำหรับ:

* Navbar
* Logo / Brand
* Button
* Menu
* Navigation
* Section Heading
* UI Label
* Badge
* English Text
* Decorative Text
* Search UI
* Interface controls

### 2. Thai Reading / Learning Typography

เปลี่ยนเป็น `Sarabun` สำหรับ:

* คำศัพท์หลักที่ค้นหา
* Headword
* ความหมายของคำ
* Definition
* คำอธิบาย
* ตัวอย่างประโยค
* Context ของคำ
* คำแนะนำการใช้คำ
* Formality / Register
* Synonym
* Antonym
* คำใกล้เคียง
* Collocation
* Evidence ที่เป็นข้อความภาษาไทย
* Dictionary Content
* Search Result ที่เป็นเนื้อหาภาษาไทย
* ข้อความที่มีไว้เพื่อให้ผู้ใช้ศึกษารูปแบบภาษาไทย

หลักการง่าย ๆ:

> ถ้าข้อความนั้นมีเป้าหมายให้ผู้ใช้ “อ่าน เรียนรู้ หรือศึกษาภาษาไทย” ให้ใช้ Sarabun

---

# Font Implementation

ให้ตรวจสอบก่อนว่า project ใช้ font system แบบใดอยู่

ถ้าเป็น Next.js ให้ใช้ implementation ที่เหมาะสมกับ architecture ปัจจุบัน เช่น `next/font/google`

ตัวอย่างแนวทาง:

```tsx
import { Sarabun } from "next/font/google";

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
```

แต่ให้ปรับ implementation ให้เข้ากับ project จริง

อย่าเพิ่ม font ซ้ำถ้ามี Sarabun อยู่แล้ว

---

# Create Reusable Thai Reading Style

อย่า hardcode `font-family` ซ้ำในทุก component

ให้สร้าง reusable typography token / class เช่น:

```css
.font-thai-reading {
  font-family: var(--font-sarabun), "Sarabun", sans-serif;
}
```

หรือใช้วิธีที่เหมาะกับ Tailwind / CSS Module / Global CSS ของ project

เป้าหมายคือสามารถ reuse ได้ง่าย เช่น:

```tsx
<p className="font-thai-reading">
  ...
</p>
```

หรือสร้าง utility / component ตาม architecture ปัจจุบัน

---

# Headword Typography

คำศัพท์หลักควรเด่นและสามารถมองโครงสร้างตัวอักษรได้ชัด

ตัวอย่าง:

```text
ละเอียดอ่อน
```

แนะนำประมาณ:

```css
font-family: Sarabun;
font-weight: 600;
line-height: 1.35;
```

ไม่ควรใช้ font-weight บางเกินไป

ไม่ควรใช้ letter-spacing กว้างเกินไปกับภาษาไทย

---

# Definition / Reading Content

เนื้อหาความหมายและตัวอย่างประโยคควรอ่านสบาย

แนะนำ:

```css
font-weight: 400;
line-height: 1.7;
```

ขนาด font หลักบน Desktop ไม่ควรเล็กเกินไป

ประมาณ:

```text
16px – 18px
```

แล้วปรับ responsive ให้เหมาะกับ Mobile

---

# Thai Character Rendering

ให้ตรวจสอบเป็นพิเศษว่า Sarabun แสดงภาษาไทยถูกต้อง

ทดสอบกับคำ เช่น:

```text
เกื้อหนุน
ละเอียดอ่อน
ผู้เชี่ยวชาญ
วิจารณญาณ
สิ่งแวดล้อม
ประณีต
น้ำใจ
เข้าใจ
พึ่งพา
```

ตรวจสอบ:

* สระบน
* สระล่าง
* วรรณยุกต์
* ไม้เอก
* ไม้โท
* ไม้ตรี
* ไม้จัตวา
* การซ้อนสระและวรรณยุกต์

ห้ามมีอาการ:

* วรรณยุกต์ถูกตัด
* ตัวอักษรชนกัน
* line-height แคบเกินไป
* overflow ตัดสระ
* text clipping

ตรวจสอบ component ที่มี:

```css
overflow: hidden;
```

หรือ fixed height ด้วย หากทำให้ตัวอักษรไทยถูก crop

---

# Visual Direction

แม้เปลี่ยนเป็น Sarabun แต่หน้าเว็บต้องยังคงความรู้สึก:

* Modern
* Clean
* Technology
* Minimal
* Professional
* Contemporary Thai

อย่าทำให้หน้าตาเปลี่ยนไปเป็นเว็บราชการหรือเอกสารทางการ

Sarabun ใช้สำหรับเพิ่ม readability ของเนื้อหาภาษาไทยเท่านั้น

รักษา:

* layout เดิม
* spacing เดิม
* color เดิม
* card style เดิม
* animation เดิม
* glass UI เดิม
* interaction เดิม

ให้ปรับ spacing / line-height เฉพาะเมื่อจำเป็นต่อ readability ของตัวอักษรไทย

---

# Do Not

ห้าม:

* redesign หน้าเว็บ
* เปลี่ยน layout
* เปลี่ยน color scheme
* เปลี่ยน animation
* เปลี่ยน component structure โดยไม่จำเป็น
* เปลี่ยน font ของ Logo
* เปลี่ยน font ของ Navbar ทั้งหมด
* เปลี่ยน font global ทั้ง project
* ใช้ Sarabun กับทุก element โดยอัตโนมัติ

Task นี้เป็น **Typography Refinement เท่านั้น**

---

# Workflow

ให้ทำตามลำดับนี้:

1. ตรวจสอบ font configuration ปัจจุบัน
2. ค้นหา component ที่เกี่ยวข้องกับ Search Result / Dictionary / Learning Content
3. ตรวจสอบว่า text ใดเป็น UI และ text ใดเป็นเนื้อหาเรียนรู้ภาษา
4. เพิ่ม Sarabun อย่างถูกต้อง
5. สร้าง reusable Thai Reading typography
6. Apply เฉพาะเนื้อหาที่เหมาะสม
7. Run project
8. ตรวจสอบ Search Result จริง
9. ตรวจสอบ Desktop
10. ตรวจสอบ Tablet
11. ตรวจสอบ Mobile
12. ตรวจสอบ Thai diacritics
13. ตรวจสอบ console error
14. ตรวจสอบ build error
15. แก้ปัญหาที่เกิดจากการเปลี่ยน font ให้ครบ

## Expected Result

หลังจากแก้เสร็จ:

THAI CONTEXT ต้องยังดูทันสมัยเหมือนเดิม

แต่เนื้อหาที่เกี่ยวข้องกับภาษาไทย เช่น:

```text
คำศัพท์
ความหมาย
ตัวอย่างประโยค
บริบท
คำใกล้เคียง
```

ต้องอ่านง่ายขึ้นอย่างชัดเจนด้วย **Sarabun แบบมีหัว**

ผู้ใช้ต้องสามารถมองเห็นรูปทรงของตัวอักษรไทย พยัญชนะ สระ และวรรณยุกต์ได้ง่าย เหมาะทั้งสำหรับคนไทยและผู้ที่กำลังศึกษาภาษาไทย

ให้ลงมือแก้ code จริงใน project

ก่อนแก้ให้ตรวจสอบ component และ architecture จริง ห้ามเดาชื่อไฟล์หรือ component

หลังแก้ให้ run และตรวจสอบผลจริง ไม่ต้องตอบแค่แนวทางหรือ code example
