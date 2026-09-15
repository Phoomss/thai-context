# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: hero-video.spec.ts >> video remains cover-sized while responsive Search and cinematic flow work
- Location: tests\browser\hero-video.spec.ts:70:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+ ]
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - region "ค้นหาคำจากความหมาย" [ref=e4]:
        - generic:
          - generic [ref=e9]:
            - paragraph [ref=e10]: พจนานุกรมไทยร่วมสมัย
            - heading "ไม่ต้องรู้คำ ก็รู้ว่าควรใช้คำไหน" [level=1] [ref=e12]: ไม่ต้องรู้คำก็รู้ว่าควรใช้คำไหน
            - paragraph [ref=e13]: ค้นจากสิ่งที่คุณต้องการสื่อ สู่คำที่ใช่ พร้อมความหมาย บริบท ตัวอย่าง และแหล่งที่มา
            - paragraph [ref=e14]: วันนี้คุณอยากสื่ออะไร?
            - generic [ref=e15]:
              - search [ref=e16]:
                - generic [ref=e17]: ความหมายที่คุณอยากสื่อ
                - textbox "ความหมายที่คุณอยากสื่อ" [disabled] [ref=e21]:
                  - /placeholder: "เช่น อยากได้คำที่หมายถึง “ทำงานได้ผลดี\nโดยใช้ทรัพยากรน้อย”"
                  - text: ทำงานทรัพยากร
                - button "กำลังเปิดโลกของคำ" [disabled] [ref=e22]
              - group "Search mode" [ref=e29]:
                - button "Context Search" [pressed] [ref=e30] [cursor=pointer]
                - button "AI Assistant" [ref=e31] [cursor=pointer]
                - link "AI Workspace" [ref=e32] [cursor=pointer]:
                  - /url: /workspace
              - generic [ref=e34]:
                - button "เขียนรายงาน" [disabled] [ref=e35]:
                  - text: เขียนรายงาน
                  - generic [aria-hidden] [ref=e36]: ↗
                - button "หาคำทางการ" [disabled] [ref=e37]:
                  - text: หาคำทางการ
                  - generic [aria-hidden] [ref=e38]: ↗
                - button "คำที่สุภาพกว่า" [disabled] [ref=e39]:
                  - text: คำที่สุภาพกว่า
                  - generic [aria-hidden] [ref=e40]: ↗
                - button "งานวิชาการ" [disabled] [ref=e41]:
                  - text: งานวิชาการ
                  - generic [aria-hidden] [ref=e42]: ↗
          - generic: ไม่ต้องรู้คำ ก็รู้ว่าควรใช้คำไหน
      - generic [ref=e43]:
        - link "THAI CONTEXT หน้าแรก" [ref=e44] [cursor=pointer]:
          - /url: "#hero"
          - generic [ref=e46]:
            - generic "THAI CONTEXT" [ref=e47]:
              - generic [ref=e48]: THAI
              - generic [ref=e49]: CONTEXT
            - generic [ref=e50]: จากค้นคำ สู่เข้าใจภาษา
        - button "เปิดเมนู" [ref=e51] [cursor=pointer]
      - navigation "สำรวจความสามารถ" [ref=e55]:
        - link "ค้นจากความหมาย" [ref=e56] [cursor=pointer]:
          - /url: "#meaning"
        - link "เข้าใจบริบทการใช้" [ref=e60] [cursor=pointer]:
          - /url: "#search-results"
        - link "เปรียบเทียบคำ" [ref=e64] [cursor=pointer]:
          - /url: "#compare"
        - link "สำรวจการเดินทางของคำ" [ref=e68] [cursor=pointer]:
          - /url: "#evolution"
        - link "ตรวจสอบแหล่งที่มา" [ref=e72] [cursor=pointer]:
          - /url: "#search-results"
      - region [ref=e76]:
        - generic [ref=e77]:
          - generic [ref=e78]:
            - generic [ref=e79]:
              - paragraph [ref=e80]: จากความหมาย สู่คำที่ใช่
              - heading "คำที่ใกล้กับสิ่งที่คุณกำลังคิด" [active] [level=2] [ref=e81]
            - status [ref=e82]: 4 คำแนะนำ
          - generic [ref=e83]:
            - text: คุณกำลังมองหาคำที่สื่อถึง
            - paragraph [ref=e84]: “ทำงานทรัพยากร”
          - group [ref=e85]:
            - generic [ref=e86]: ปรับบริบทของคำแนะนำ
            - generic [ref=e91]:
              - generic [ref=e92]: "เลือกระดับภาษาด่วน:"
              - group "เลือกระดับภาษาด่วน" [ref=e93]:
                - button "🌐 ทั้งหมด" [ref=e94] [cursor=pointer]
                - button "🏛️ ทางการ (Official)" [ref=e95] [cursor=pointer]
                - button "💼 ธุรกิจ / กึ่งทางการ" [ref=e96] [cursor=pointer]
                - button "💬 ภาษาปาก / พูด" [ref=e97] [cursor=pointer]
            - generic [ref=e98]:
              - generic [ref=e99]:
                - generic [ref=e100]:
                  - generic [aria-hidden] [ref=e101]: 📜
                  - generic [ref=e102]: ระดับภาษา
                - generic [ref=e103]:
                  - combobox "เลือกระดับภาษา" [ref=e104] [cursor=pointer]:
                    - option "ทั้งหมด" [selected]
                    - option "ทางการ"
                    - option "ทั่วไป"
                  - generic [aria-hidden]: ▾
              - generic [ref=e105]:
                - generic [ref=e106]:
                  - generic [aria-hidden] [ref=e107]: 🎯
                  - generic [ref=e108]: บริบท
                - generic [ref=e109]:
                  - combobox "เลือกบริบท" [ref=e110] [cursor=pointer]:
                    - option "ทุกบริบท" [selected]
                    - option "การทำงาน"
                    - option "งานเขียน"
                    - option "ชีวิตประจำวัน"
                  - generic [aria-hidden]: ▾
              - generic [ref=e111]:
                - generic [ref=e112]:
                  - generic [aria-hidden] [ref=e113]: 🚫
                  - generic [ref=e114]: คำที่ไม่ต้องการใช้
                - textbox "ระบุคำที่ไม่ต้องการใช้" [ref=e116]:
                  - /placeholder: เช่น เก่ง, สวย...
          - generic [ref=e117]:
            - complementary "คำแนะนำ" [ref=e118]:
              - heading "คำที่ค้นพบ 4" [level=3] [ref=e119]:
                - text: คำที่ค้นพบ
                - generic [ref=e120]: "4"
              - generic [ref=e121]:
                - button "01 ประสิทธิภาพ · efficiency ทางการ ความใกล้เคียง 96%" [pressed] [ref=e122] [cursor=pointer]:
                  - generic [ref=e123]: "01"
                  - generic [ref=e124]:
                    - strong [ref=e125]:
                      - text: ประสิทธิภาพ
                      - generic [ref=e126]: · efficiency
                    - generic [ref=e127]: ทางการ
                    - generic [ref=e128]: ความใกล้เคียง 96%
                  - generic [aria-hidden] [ref=e129]: ›
                - button "02 ประสิทธิผล · effectiveness ทางการ ความใกล้เคียง 88%" [ref=e130] [cursor=pointer]:
                  - generic [ref=e131]: "02"
                  - generic [ref=e132]:
                    - strong [ref=e133]:
                      - text: ประสิทธิผล
                      - generic [ref=e134]: · effectiveness
                    - generic [ref=e135]: ทางการ
                    - generic [ref=e136]: ความใกล้เคียง 88%
                  - generic [aria-hidden] [ref=e137]: ›
                - button "03 สัมฤทธิผล · achievement ทางการ ความใกล้เคียง 84%" [ref=e138] [cursor=pointer]:
                  - generic [ref=e139]: "03"
                  - generic [ref=e140]:
                    - strong [ref=e141]:
                      - text: สัมฤทธิผล
                      - generic [ref=e142]: · achievement
                    - generic [ref=e143]: ทางการ
                    - generic [ref=e144]: ความใกล้เคียง 84%
                  - generic [aria-hidden] [ref=e145]: ›
                - button "04 มัธยัสถ์ · frugal ทั่วไป ความใกล้เคียง 78%" [ref=e146] [cursor=pointer]:
                  - generic [ref=e147]: "04"
                  - generic [ref=e148]:
                    - strong [ref=e149]:
                      - text: มัธยัสถ์
                      - generic [ref=e150]: · frugal
                    - generic [ref=e151]: ทั่วไป
                    - generic [ref=e152]: ความใกล้เคียง 78%
                  - generic [aria-hidden] [ref=e153]: ›
            - article [ref=e154]:
              - generic [ref=e155]:
                - generic [ref=e156]:
                  - paragraph [ref=e157]: ความหมายของคำ
                  - generic [ref=e158]:
                    - heading "ประสิทธิภาพ (efficiency)" [level=3] [ref=e159]:
                      - text: ประสิทธิภาพ
                      - generic [ref=e160]: (efficiency)
                    - button "คัดลอกคำว่า ประสิทธิภาพ" [ref=e161] [cursor=pointer]:
                      - generic [aria-hidden] [ref=e162]: 📋
                      - generic [ref=e163]: คัดลอกคำ
                  - paragraph [ref=e164]:
                    - generic [ref=e165]: น.
                - generic "เครื่องมือเสริมการใช้งานคำ" [ref=e166]:
                  - button "ฟังการออกเสียงคำว่า ประสิทธิภาพ" [ref=e168] [cursor=pointer]:
                    - generic [ref=e171]: ฟังเสียง
                  - button "ดูภาษามือไทยสำหรับคำว่า ประสิทธิภาพ" [ref=e172] [cursor=pointer]:
                    - generic [ref=e173]: "[ภาษามือไทย 🤟]"
                  - button "ดูอักษรเบรลล์สำหรับคำว่า ประสิทธิภาพ" [ref=e174] [cursor=pointer]:
                    - generic [ref=e175]: "[Braille ⠃]"
                  - button "แชร์ความหมายของคำว่า ประสิทธิภาพ" [ref=e177] [cursor=pointer]:
                    - generic [ref=e180]: แชร์
                - generic [ref=e181]:
                  - heading "ความหมาย" [level=4] [ref=e182]
                  - paragraph [ref=e183]: ความสามารถในการทำงานให้ได้ผล โดยใช้เวลาและทรัพยากรอย่างคุ้มค่า
                - generic [ref=e184]:
                  - heading "ตัวอย่างการใช้" [level=4] [ref=e185]
                  - generic [ref=e187]:
                    - blockquote [ref=e188]: ทีมปรับขั้นตอนเพื่อเพิ่มประสิทธิภาพการทำงาน
                    - 'button "คัดลอกประโยคตัวอย่าง: ทีมปรับขั้นตอนเพื่อเพิ่มประสิทธิภาพการทำงาน" [ref=e189] [cursor=pointer]':
                      - generic [aria-hidden] [ref=e190]: 📋
                      - generic [ref=e191]: คัดลอกประโยค
                - generic [ref=e192]:
                  - heading "เหมาะกับบริบท" [level=4] [ref=e193]
                  - generic [ref=e194]:
                    - generic [ref=e195]: ทางการ
                    - generic [ref=e196]: การทำงาน
                - region [ref=e197]:
                  - generic [ref=e198]:
                    - heading "คำแปล & ศัพท์บัญญัติ / คำทับศัพท์ (Translations)" [level=4] [ref=e199]
                    - status [ref=e200]: 2 รายการ
                  - list "รายการคำแปล" [ref=e201]:
                    - listitem [ref=e202]:
                      - generic [ref=e203]:
                        - generic [ref=e204]:
                          - generic [ref=e205]: efficiency
                          - generic "ภาษา EN" [ref=e206]: EN
                        - 'status "แหล่งที่มา: ศัพท์บัญญัติราชบัณฑิต" [ref=e207]':
                          - generic [aria-hidden] [ref=e208]: 📜
                          - generic [ref=e209]: ศัพท์บัญญัติราชบัณฑิต
                      - generic [ref=e210]: "คำแปลเทียบเคียง: competence, productivity"
                      - paragraph [ref=e211]: ความสามารถในการสร้างผลผลิตสูงสุดโดยใช้ทรัพยากรน้อยที่สุด
                      - generic [ref=e212]:
                        - strong [ref=e213]: "ข้อสังเกตการใช้:"
                        - text: ภาษาทางการและบริบทการบริหารจัดการ
                    - listitem [ref=e214]:
                      - generic [ref=e215]:
                        - generic [ref=e216]:
                          - generic [ref=e217]: performance efficacy
                          - generic "ภาษา EN" [ref=e218]: EN
                        - 'status "แหล่งที่มา: AI แนะนำ" [ref=e219]':
                          - generic [aria-hidden] [ref=e220]: 🤖
                          - generic [ref=e221]: AI แนะนำ
                      - generic [ref=e222]: "คำแปลเทียบเคียง: operational efficiency"
                      - paragraph [ref=e223]: คำแปลแนะนำสำหรับการทำงานในองค์กรร่วมสมัย
                      - generic [ref=e224]:
                        - strong [ref=e225]: "ข้อสังเกตการใช้:"
                        - text: บริบทการปฏิบัติการสมัยใหม่
                - region [ref=e226]:
                  - generic [ref=e227]:
                    - generic [ref=e228]:
                      - generic [ref=e229]: 🤟
                      - heading "ภาษามือไทย (Thai Sign Language)" [level=4] [ref=e230]
                    - generic [ref=e231]:
                      - generic [ref=e232]: ⚡ DEMO (ต้นแบบ)
                      - button "ขยายแบบเต็มหน้าต่าง" [ref=e233] [cursor=pointer]: "[ขยาย ⤢]"
                  - generic [ref=e234]:
                    - region "เครื่องเล่นการเคลื่อนไหวภาษามือไทยสำหรับคำว่า ประสิทธิภาพ" [ref=e235]:
                      - generic [ref=e236]:
                        - img "แบบจำลอง 3 มิติ อวตารแสดงท่าภาษามือไทย" [ref=e237]
                        - generic [ref=e238]: 3D Avatar (อวตาร)
                        - generic: ⏸ พักท่ามือ (Paused)
                      - generic [ref=e241]:
                        - generic [ref=e242]:
                          - generic [ref=e243]: 0.0s
                          - generic [ref=e244]: 1.8s
                        - slider "แถบเลื่อนความคืบหน้าท่าภาษามือ" [ref=e245] [cursor=pointer]: "0"
                      - generic [ref=e246]:
                        - generic [ref=e247]:
                          - button "เล่นท่ามือ (Play)" [ref=e248] [cursor=pointer]:
                            - generic [ref=e251]: เล่น (Play)
                          - button "เล่นอีกครั้ง (Replay)" [ref=e252] [cursor=pointer]:
                            - generic [ref=e253]: ↻
                            - generic [ref=e254]: เล่นอีกครั้ง
                          - generic [ref=e255] [cursor=pointer]:
                            - checkbox "วนซ้ำ" [checked] [ref=e256]
                            - generic [ref=e257]: วนซ้ำ
                        - generic [ref=e258]:
                          - group "ความเร็วการเล่น (Playback Speed)" [ref=e259]:
                            - button "0.5x" [ref=e260] [cursor=pointer]
                            - button "1x" [pressed] [ref=e261] [cursor=pointer]
                            - button "1.5x" [ref=e262] [cursor=pointer]
                          - 'button "สลับมุมมอง: ขณะนี้แสดง 3D อวตาร" [ref=e263] [cursor=pointer]': 🦴 ดูโครงกระดูก
                      - generic [ref=e264]:
                        - generic [ref=e265]:
                          - generic [ref=e266]: 🤟 คำอธิบายท่าทาง (Gesture Description)
                          - generic [ref=e267]: ผ่านการตรวจสอบ (Verified)
                        - paragraph [ref=e268]: มือขวาตั้งนิ้วชี้และนิ้วกลาง หมุนวนเป็นเกลียวไปข้างหน้าแล้วประกบฝ่ามือซ้าย แสดงถึงกระบวนการที่รวดเร็วและคุ้มค่า
                        - paragraph [ref=e269]: Right hand index and middle finger form a precision directional spiral forward to meet the left palm, symbolizing swift and optimized process.
                    - generic [ref=e270]:
                      - generic [ref=e271]:
                        - strong [ref=e272]: "แหล่งที่มา (Source):"
                        - generic [ref=e273]: THAI CONTEXT 3D Gesture Lab (Demo Prototype)
                        - generic [ref=e274]: "สัญญาอนุญาต: Creative Commons CC-BY 4.0"
                      - generic [ref=e275]:
                        - strong [ref=e276]: "สถานะการตรวจสอบ (Verification):"
                        - generic [ref=e277]: "ข้อมูลตัวอย่างต้นแบบ (ตรวจทานโดย: คณะทำงานวิจัยสรีระการเคลื่อนไหวทางภาษา)"
                        - generic [ref=e278]: ข้อมูลท่าทางจำลอง 3 มิติเพื่อการทดสอบต้นแบบ Accessibility (Hackathon MVP)
                - generic [ref=e279]:
                  - heading "คำใกล้เคียง" [level=4] [ref=e280]
                  - generic [ref=e281]:
                    - button "ประสิทธิผล ↗" [ref=e282] [cursor=pointer]:
                      - text: ประสิทธิผล
                      - generic [ref=e283]: ↗
                    - button "สัมฤทธิผล ↗" [ref=e284] [cursor=pointer]:
                      - text: สัมฤทธิผล
                      - generic [ref=e285]: ↗
                    - button "มัธยัสถ์ ↗" [ref=e286] [cursor=pointer]:
                      - text: มัธยัสถ์
                      - generic [ref=e287]: ↗
                - generic [ref=e288]:
                  - button "เลือกเปรียบเทียบ" [ref=e289] [cursor=pointer]
                  - button "ปรึกษาผู้ช่วย AI เกี่ยวกับคำนี้" [ref=e292] [cursor=pointer]:
                    - generic [aria-hidden] [ref=e293]: ✨
                - group [ref=e295]:
                  - generic [ref=e296]:
                    - generic [ref=e297]:
                      - heading "คำนี้ตรงกับสิ่งที่คุณค้นหาหรือไม่?" [level=4] [ref=e298]
                      - paragraph [ref=e299]: ทุกการประเมินช่วยสอนระบบให้เข้าใจบริบทภาษาไทยได้แม่นยำยิ่งขึ้น
                    - generic [ref=e300]:
                      - button "คำว่า ประสิทธิภาพ ตรงใจ" [ref=e301] [cursor=pointer]:
                        - generic [ref=e304]: ตรงใจ
                      - button "คำว่า ประสิทธิภาพ ไม่ตรงบริบท" [ref=e305] [cursor=pointer]:
                        - generic [ref=e308]: ไม่ตรงบริบท
            - complementary [ref=e309]:
              - generic [ref=e310]:
                - heading "บริบทการใช้" [level=3] [ref=e313]
                - paragraph [ref=e314]: ตัวอย่างนี้เน้นวิธีทำงานและการใช้ทรัพยากร
                - text: คำอธิบายตัวอย่างประกอบการใช้งาน
              - generic [ref=e315]:
                - heading "แหล่งข้อมูล" [level=3] [ref=e318]
                - paragraph [ref=e319]: พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔
                - generic [ref=e320]: พ.ศ. ๒๕๕๔ พ.ศ. 2554
                - paragraph [ref=e321]: ข้อมูลตัวอย่าง / ยังไม่รับรอง
                - button "ตรวจสอบหลักฐาน" [ref=e322] [cursor=pointer]
                - button "ปรึกษาผู้ช่วย AI" [ref=e325] [cursor=pointer]:
                  - generic [aria-hidden] [ref=e326]: ✨
      - generic [ref=e328]:
        - region [ref=e329]:
          - generic [ref=e330]:
            - paragraph [ref=e331]: อ่านความต่างในไม่กี่วินาที
            - heading "เปรียบเทียบคำในบริบท" [level=2] [ref=e332]
            - text: เลือกหรือกรอกคำภาษาไทย 2–5 คำ แล้วดูว่าน้ำหนักและจังหวะการใช้ต่างกันอย่างไร
          - complementary "สรุปจุดต่างสำคัญ" [ref=e333]:
            - generic [ref=e334]: 💡
            - generic [ref=e335]:
              - strong [ref=e336]: "สรุปจุดต่างสำคัญ (Nuance Delta):"
              - paragraph [ref=e337]:
                - text: คำว่า
                - strong [ref=e338]: “ประสิทธิภาพ”
                - text: เน้นวิธีทำงานและความคุ้มค่าของทรัพยากร — ในขณะที่คำว่า
                - strong [ref=e339]: “ประสิทธิผล”
                - text: เน้นผลลัพธ์ที่บรรลุตามเป้าหมาย
          - generic [ref=e340]:
            - generic [ref=e341]:
              - generic [ref=e342]: คำที่ 1
              - combobox "คำที่ 1" [ref=e344]: ประสิทธิภาพ
            - generic [ref=e345]:
              - generic [ref=e346]: คำที่ 2
              - combobox "คำที่ 2" [ref=e348]: ประสิทธิผล
            - generic [ref=e349]:
              - button "+ เพิ่มคำ" [ref=e350] [cursor=pointer]
              - button "เปรียบเทียบคำ" [ref=e351] [cursor=pointer]
          - button "ปรึกษาผู้ช่วย AI เพื่อวิเคราะห์ความต่างระหว่าง \"ประสิทธิภาพ\" กับ \"ประสิทธิผล\"" [ref=e353] [cursor=pointer]:
            - generic [aria-hidden] [ref=e354]: ✨
        - region [ref=e356]:
          - generic [ref=e357]:
            - paragraph [ref=e358]: ภาษาเดินทางไปพร้อมกับสังคม
            - heading "วิวัฒนาการคำศัพท์ตามยุคสมัย" [level=2] [ref=e359]
            - generic [ref=e360]: สำรวจสถานะของ “ประสิทธิภาพ” ในชุดข้อมูลแต่ละยุค
          - generic [ref=e361]:
            - generic [ref=e362]:
              - generic [ref=e363]: "คำที่น่าสนใจ:"
              - group "เลือกคำศัพท์เพื่อดูวิวัฒนาการ" [ref=e364]:
                - button "ประสิทธิภาพ" [pressed] [ref=e365] [cursor=pointer]
                - button "สมานฉันท์" [ref=e366] [cursor=pointer]
                - button "ประสิทธิผล" [ref=e367] [cursor=pointer]
                - button "สนทนา" [ref=e368] [cursor=pointer]
                - button "กระตือรือร้น" [ref=e369] [cursor=pointer]
                - button "ก" [ref=e370] [cursor=pointer]
            - generic [ref=e371]:
              - generic [ref=e372]: ค้นหาวิวัฒนาการคำศัพท์
              - textbox "ค้นหาวิวัฒนาการคำศัพท์" [ref=e373]:
                - /placeholder: พิมพ์คำที่ต้องการสำรวจ...
              - button "ค้นหา" [ref=e374] [cursor=pointer]
          - generic [ref=e375]:
            - tablist "เลือกยุคของคำศัพท์" [ref=e376]:
              - tab "พ.ศ. ๒๕๔๒" [ref=e377] [cursor=pointer]
              - tab "พ.ศ. ๒๕๕๔" [selected] [ref=e378] [cursor=pointer]
              - tab "พ.ศ. ๒๕๖๙" [ref=e379] [cursor=pointer]
            - tabpanel "พ.ศ. ๒๕๕๔" [ref=e380]:
              - generic [ref=e381]:
                - generic [ref=e382]:
                  - generic [ref=e383]: ปรับปรุงนิยามความหมาย · MODIFIED (CHANGED)
                  - generic [ref=e384]: 🔄 ปรับปรุงนิยาม
                - generic [ref=e385]:
                  - heading "ประสิทธิภาพ" [level=3] [ref=e386]
                  - button "ฟังเสียงอ่านคำว่า ประสิทธิภาพ" [ref=e387] [cursor=pointer]
                - paragraph [ref=e390]: วิวัฒนาการจากนิยามทั่วไปสู่การเน้นความคุ้มค่าของทรัพยากร และขยายครอบคลุมระบบงานกับเทคโนโลยีดิจิทัล
              - generic [ref=e391]:
                - paragraph [ref=e392]: ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการปฏิบัติงานโดยใช้ทรัพยากรและเวลาอย่างคุ้มค่าที่สุด
                - generic [ref=e393]: พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔ (หน้า ๗๓๔)
                - generic [ref=e394]:
                  - strong [ref=e395]: "พลวัตทางภาษา:"
                  - text: ปรับปรุงนิยาม เพิ่มเงื่อนไขความคุ้มค่าของทรัพยากรและเวลา
            - navigation "เส้นทางวิวัฒนาการ 3 ยุคสมัย" [ref=e396]:
              - button "ไปยังฉบับ พ.ศ. ๒๕๔๒" [ref=e397] [cursor=pointer]:
                - generic [ref=e398]:
                  - text: พ.ศ. ๒๕๔๒
                  - generic [ref=e399]: ฉบับแรกที่บันทึก
                - generic [ref=e400]: ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการทำงาน
              - button "ไปยังฉบับ พ.ศ. ๒๕๕๔" [ref=e401] [cursor=pointer]:
                - generic [ref=e402]:
                  - text: พ.ศ. ๒๕๕๔
                  - generic [ref=e403]: ปรับปรุงนิยาม
                - generic [ref=e404]: ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการปฏิบัติงานโดยใช้ทรัพยากรและเวลาอย่างคุ้มค่าที่สุด
              - button "ไปยังฉบับ พ.ศ. ๒๕๖๙" [ref=e405] [cursor=pointer]:
                - generic [ref=e406]:
                  - text: พ.ศ. ๒๕๖๙
                  - generic [ref=e407]: ขยายความครอบคลุม
                - generic [ref=e408]: ความสามารถในการปฏิบัติการที่ให้ผลลัพธ์สูงสุดโดยสูญเสียทรัพยากร พลังงาน หรือเวลาน้อยที่สุด ครอบคลุมทั้งระบบการทำงานและเทคโนโลยี
        - region [ref=e409]:
          - generic [ref=e410]:
            - paragraph [ref=e411]: หนึ่งความหมาย หลายเสียงของภาษา
            - heading "สำรวจคลังคำภาษาถิ่น 4 ภาค" [level=2] [ref=e412]
            - generic [ref=e413]: "คำมาตรฐาน: คิดถึง — แตะการ์ดเพื่อดูที่มาของข้อมูล"
          - generic [ref=e414]:
            - tablist "เลือกหมวดหมู่คำภาษาถิ่น" [ref=e415]:
              - tab "สนทนายอดนิยม คำทั่วไป" [selected] [ref=e416] [cursor=pointer]:
                - generic [ref=e417]: สนทนายอดนิยม
                - generic [ref=e418]: คำทั่วไป
              - tab "หมวดเครือญาติ ๓๔๖ รายการ" [ref=e419] [cursor=pointer]:
                - generic [ref=e420]: หมวดเครือญาติ
                - generic [ref=e421]: ๓๔๖ รายการ
              - tab "หมวดอวัยวะร่างกาย ๑,๑๐๒ รายการ" [ref=e422] [cursor=pointer]:
                - generic [ref=e423]: หมวดอวัยวะร่างกาย
                - generic [ref=e424]: ๑,๑๐๒ รายการ
            - generic [ref=e425]:
              - generic [ref=e426]:
                - generic [ref=e427]: ค้นหาคำในภาษาถิ่น
                - searchbox "ค้นหาคำในภาษาถิ่น" [ref=e428]
              - group "เลือกคำศัพท์มาตรฐาน" [ref=e429]:
                - button "คิดถึง" [pressed] [ref=e430] [cursor=pointer]
                - button "อร่อย" [ref=e431] [cursor=pointer]
                - button "พูด" [ref=e432] [cursor=pointer]
                - button "โกหก" [ref=e433] [cursor=pointer]
                - button "กลับบ้าน" [ref=e434] [cursor=pointer]
            - generic [ref=e435]:
              - generic [ref=e436]:
                - generic [ref=e437]: "สำเนียงกลาง:"
                - strong [ref=e438]: คิดถึง
                - generic [ref=e439]: "[คิด-ถึง]"
              - button "ฟังเสียงคำว่า คิดถึง" [ref=e440] [cursor=pointer]:
                - generic [ref=e443]: ฟังเสียงอ่าน
          - generic [ref=e444]:
            - button "กลาง คิดถึง [คิด-ถึง] นึกถึงด้วยความผูกพันหรือระลึกถึง ✓ คลังข้อมูลภาษาถิ่นทางการ พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔" [pressed] [ref=e445] [cursor=pointer]:
              - generic [ref=e446]: กลาง
              - strong [ref=e447]: คิดถึง
              - generic [ref=e448]: "[คิด-ถึง]"
              - generic [ref=e449]: นึกถึงด้วยความผูกพันหรือระลึกถึง
              - generic [ref=e450]: ✓ คลังข้อมูลภาษาถิ่นทางการ
              - generic [ref=e451]: พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔
            - button "เหนือ กึ๊ดเติงหา [กึ๊ด-เติง-หา] คิดถึง ระลึกถึง, คำแสดงความผูกพันในภาษาถิ่นล้านนา ('กึ๊ด' = คิด, 'เติง' = ถึง) คำเมืองล้านนานิยมใช้ 'กึ๊ดเติง' หรือ 'กึ๊ดเติงหา' ในบทกวีและเพลงซอ ✓ คลังข้อมูลภาษาถิ่นทางการ คลังข้อมูลภาษาถิ่นภาคเหนือ สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย มหาวิทยาลัยมหิดล" [ref=e452] [cursor=pointer]:
              - generic [ref=e453]: เหนือ
              - strong [ref=e454]: กึ๊ดเติงหา
              - generic [ref=e455]: "[กึ๊ด-เติง-หา]"
              - generic [ref=e456]: คิดถึง ระลึกถึง, คำแสดงความผูกพันในภาษาถิ่นล้านนา ('กึ๊ด' = คิด, 'เติง' = ถึง)
              - generic [ref=e457]: คำเมืองล้านนานิยมใช้ 'กึ๊ดเติง' หรือ 'กึ๊ดเติงหา' ในบทกวีและเพลงซอ
              - generic [ref=e458]: ✓ คลังข้อมูลภาษาถิ่นทางการ
              - generic [ref=e459]: คลังข้อมูลภาษาถิ่นภาคเหนือ สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย มหาวิทยาลัยมหิดล
            - button "อีสาน คึดฮอด [คึด-ฮอด] คิดถึง อยากพบ, ปรากฏในวรรณกรรมและภาษาถิ่นอีสาน ('คึด' = คิด, 'ฮอด' = ถึง) ใช้ทั่วไปในชีวิตประจำวันและวรรณกรรมอีสาน เช่น 'คึดฮอดหลายๆ' ✓ คลังข้อมูลภาษาถิ่นทางการ คลังข้อมูลภาษาถิ่นอีสาน สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย มหาวิทยาลัยมหิดล" [ref=e460] [cursor=pointer]:
              - generic [ref=e461]: อีสาน
              - strong [ref=e462]: คึดฮอด
              - generic [ref=e463]: "[คึด-ฮอด]"
              - generic [ref=e464]: คิดถึง อยากพบ, ปรากฏในวรรณกรรมและภาษาถิ่นอีสาน ('คึด' = คิด, 'ฮอด' = ถึง)
              - generic [ref=e465]: ใช้ทั่วไปในชีวิตประจำวันและวรรณกรรมอีสาน เช่น 'คึดฮอดหลายๆ'
              - generic [ref=e466]: ✓ คลังข้อมูลภาษาถิ่นทางการ
              - generic [ref=e467]: คลังข้อมูลภาษาถิ่นอีสาน สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย มหาวิทยาลัยมหิดล
            - button "ใต้ ข้องใจ [ข้อง-ใจ / ขิด-ถึง] คิดถึง ระลึกถึงด้วยความห่วงใยในภาษาถิ่นใต้ (คนใต้มักใช้ 'ข้องใจ' ในบริบทห่วงหา หรือใช้ 'คิดถึง' สำเนียงใต้) ในภาษาถิ่นใต้ดั้งเดิม คำว่า 'ข้องใจ' แปลว่า เป็นห่วงหรือคิดถึงอย่างห่วงใย ส่วนคำว่า 'คิดถึง' ออกเสียงสำเนียงใต้ว่า 'ขิดถึง' ◌ อยู่ระหว่างการตรวจสอบ AI ช่วยอนุมาน — ต้องตรวจสอบกับผู้รู้ภาษาถิ่นก่อนใช้งานจริง" [ref=e468] [cursor=pointer]:
              - generic [ref=e469]: ใต้
              - strong [ref=e470]: ข้องใจ
              - generic [ref=e471]: "[ข้อง-ใจ / ขิด-ถึง]"
              - generic [ref=e472]: คิดถึง ระลึกถึงด้วยความห่วงใยในภาษาถิ่นใต้ (คนใต้มักใช้ 'ข้องใจ' ในบริบทห่วงหา หรือใช้ 'คิดถึง' สำเนียงใต้)
              - generic [ref=e473]: ในภาษาถิ่นใต้ดั้งเดิม คำว่า 'ข้องใจ' แปลว่า เป็นห่วงหรือคิดถึงอย่างห่วงใย ส่วนคำว่า 'คิดถึง' ออกเสียงสำเนียงใต้ว่า 'ขิดถึง'
              - generic [ref=e474]: ◌ อยู่ระหว่างการตรวจสอบ
              - generic [ref=e475]: AI ช่วยอนุมาน — ต้องตรวจสอบกับผู้รู้ภาษาถิ่นก่อนใช้งานจริง
          - paragraph [ref=e476]: ข้อมูลภาษาถิ่นอ้างอิงจากคลังข้อมูลภาษาถิ่น ๔ ภาค สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย มหาวิทยาลัยมหิดล และพจนานุกรม ฉบับราชบัณฑิตยสถาน
        - region [ref=e477]:
          - generic [ref=e478]:
            - paragraph [ref=e479]: เปิดคลังพจนานุกรมฉบับพิมพ์
            - heading "ค้นหาคำตรงตัวตามเล่มพจนานุกรม" [level=2] [ref=e481]
            - paragraph [ref=e482]: สำหรับผู้ใช้ที่ต้องการเปิดพจนานุกรมแบบเดิม โดยค้นหาจากแม่คำตรง ๆ พร้อมฟิลเตอร์เลือกปีฉบับพิมพ์ พ.ศ. และแหล่งข้อมูลอ้างอิงตามหลักวิชาการ
          - search "ค้นหาคำศัพท์ตามเล่ม" [ref=e484]:
            - generic [ref=e485]:
              - generic [ref=e486]:
                - generic [ref=e487]: แม่คำ / คำศัพท์ที่ต้องการค้น
                - generic [ref=e488]:
                  - searchbox "ค้นหาคำศัพท์ตามแม่คำ" [ref=e489]: ประสิทธิภาพ
                  - button "ค้นหาคำศัพท์" [ref=e490] [cursor=pointer]
              - generic [ref=e493]:
                - generic [ref=e494]: ฉบับพิมพ์ (พ.ศ.)
                - combobox "เลือกฉบับพจนานุกรม" [ref=e495]:
                  - option "ทุกฉบับ (All Editions)" [selected]
                  - option "พ.ศ. ๒๕๖๙ (ร่างปรับปรุงล่าสุด)"
                  - option "พ.ศ. ๒๕๕๔ (พิมพ์ครั้งที่ ๔)"
                  - option "พ.ศ. ๒๕๔๒ (พิมพ์ครั้งที่ ๓)"
                  - option "พ.ศ. ๒๕๖๗ (ฉบับดิจิทัล)"
              - generic [ref=e496]:
                - generic [ref=e497]: แหล่งข้อมูล / หน่วยงาน
                - combobox "เลือกแหล่งข้อมูล" [ref=e498]:
                  - option "ทุกแหล่งข้อมูล (All Sources)" [selected]
                  - option "สำนักงานราชบัณฑิตยสภา"
                  - option "สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย"
                  - option "วิกิพจนานุกรมภาษาไทย"
              - button "ค้นหาตามเล่ม" [ref=e500] [cursor=pointer]
            - generic [ref=e504]:
              - generic [ref=e505] [cursor=pointer]:
                - checkbox "ค้นหาเฉพาะแม่คำที่ตรงกันเป๊ะ (Exact Match)" [ref=e506]
                - generic [ref=e507]: ค้นหาเฉพาะแม่คำที่ตรงกันเป๊ะ (Exact Match)
              - generic [ref=e508]:
                - generic [ref=e509]: "คำค้นแนะนำ:"
                - button "ประสิทธิภาพ" [ref=e510] [cursor=pointer]
                - button "สมานฉันท์" [ref=e511] [cursor=pointer]
                - button "ประสิทธิผล" [ref=e512] [cursor=pointer]
                - button "วิจัย" [ref=e513] [cursor=pointer]
                - button "ร่วมมือ" [ref=e514] [cursor=pointer]
                - button "นวัตกรรม" [ref=e515] [cursor=pointer]
          - generic [ref=e517]:
            - heading "ผลการค้นหา \"ประสิทธิภาพ\"" [level=3] [ref=e518]
            - generic [ref=e519]: พบ 3 รายการ
          - generic [ref=e520]:
            - article [ref=e521]:
              - generic [ref=e522]:
                - generic [ref=e523]:
                  - generic [ref=e524]:
                    - heading "ประสิทธิภาพ" [level=4] [ref=e525]
                    - generic [ref=e526]: "[น.]"
                  - generic [ref=e527]:
                    - button "ดูภาษามือไทยสำหรับคำว่า ประสิทธิภาพ" [ref=e528] [cursor=pointer]: 🤟
                    - button "ฟังเสียงคำว่า ประสิทธิภาพ" [ref=e529] [cursor=pointer]
                - paragraph [ref=e532]: ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการปฏิบัติงานโดยใช้ทรัพยากรและเวลาอย่างคุ้มค่าที่สุด
              - generic [ref=e533]:
                - generic [ref=e534]:
                  - generic [ref=e535]: พ.ศ. ๒๕๕๔
                  - generic [ref=e536]: สำนักงานราชบัณฑิตยสภา
                - generic [ref=e537]: หน้า ๗๓๔
            - article [ref=e538]:
              - generic [ref=e539]:
                - generic [ref=e540]:
                  - generic [ref=e541]:
                    - heading "ประสิทธิภาพ" [level=4] [ref=e542]
                    - generic [ref=e543]: "[น.]"
                  - generic [ref=e544]:
                    - button "ดูภาษามือไทยสำหรับคำว่า ประสิทธิภาพ" [ref=e545] [cursor=pointer]: 🤟
                    - button "ฟังเสียงคำว่า ประสิทธิภาพ" [ref=e546] [cursor=pointer]
                - paragraph [ref=e549]: ความสามารถที่ทำให้เกิดผลในการทำงาน
              - generic [ref=e551]:
                - generic [ref=e552]: พ.ศ. ๒๕๔๒
                - generic [ref=e553]: สำนักงานราชบัณฑิตยสภา
            - article [ref=e554]:
              - generic [ref=e555]:
                - generic [ref=e556]:
                  - generic [ref=e557]:
                    - heading "ประสิทธิภาพ" [level=4] [ref=e558]
                    - generic [ref=e559]: "[น.]"
                  - generic [ref=e560]:
                    - button "ดูภาษามือไทยสำหรับคำว่า ประสิทธิภาพ" [ref=e561] [cursor=pointer]: 🤟
                    - button "ฟังเสียงคำว่า ประสิทธิภาพ" [ref=e562] [cursor=pointer]
                - paragraph [ref=e565]: ความสามารถในการดำเนินการให้บรรลุผลลัพธ์สูงสุดโดยใช้ทรัพยากรอย่างคุ้มค่าและเกิดประโยชน์สูงสุด
              - generic [ref=e567]:
                - generic [ref=e568]: พ.ศ. ๒๕๖๙
                - generic [ref=e569]: สำนักงานราชบัณฑิตยสภา
        - generic [ref=e570]:
          - generic [ref=e571]:
            - text: THAI CONTEXT
            - paragraph [ref=e572]: จาก “ค้นคำ” สู่ “เข้าใจภาษา”
          - link "กลับสู่จุดเริ่มต้น ↑" [ref=e573] [cursor=pointer]:
            - /url: "#hero"
      - generic [ref=e574]:
        - group "Search mode" [ref=e576]:
          - button "Context Search" [pressed] [ref=e577] [cursor=pointer]
          - button "AI Assistant" [ref=e578] [cursor=pointer]
          - link "AI Workspace" [ref=e579] [cursor=pointer]:
            - /url: /workspace
        - search "ค้นหาความหมายเพิ่มเติม" [ref=e580]:
          - generic [ref=e581]: เล่าความหมายอื่นที่คุณกำลังคิด
          - textbox "เล่าความหมายอื่นที่คุณกำลังคิด" [ref=e582]:
            - /placeholder: เล่าความหมายอื่นที่คุณกำลังคิด…
            - text: ทำงานทรัพยากร
          - button "ค้นหาคำอีกครั้ง" [ref=e583] [cursor=pointer]: ↑
        - status [ref=e584]: เล่าความหมายใหม่ได้เสมอ
      - status [ref=e585]
  - alert [ref=e586]
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | test("Hero background video autoplays behind the existing interface", async ({ page }) => {
  4   |   const errors: string[] = [];
  5   |   page.on("pageerror", error => errors.push(error.message));
  6   |   page.on("console", message => {
  7   |     if (message.type() === "error") errors.push(message.text());
  8   |   });
  9   |   await page.setViewportSize({ width: 1440, height: 900 });
  10  |   await page.goto("/");
  11  | 
  12  |   const hero = page.locator("#hero");
  13  |   const video = page.locator(".hero-background-video");
  14  |   const initialHeroBox = await hero.boundingBox();
  15  |   await expect(video).toBeVisible();
  16  |   await expect(video).toHaveAttribute("autoplay", "");
  17  |   await expect(video).toHaveAttribute("loop", "");
  18  |   await expect(video).toHaveAttribute("playsinline", "");
  19  |   await expect(video).toHaveAttribute("preload", "metadata");
  20  |   await expect(video).toHaveAttribute(
  21  |     "poster",
  22  |     "/assets/thai-context-hero-poster.webp",
  23  |   );
  24  |   expect(
  25  |     await video.locator("source").evaluateAll(sources =>
  26  |       sources.map(source => ({
  27  |         src: source.getAttribute("src"),
  28  |         type: source.getAttribute("type"),
  29  |       })),
  30  |     ),
  31  |   ).toEqual([
  32  |     { src: "/assets/thai-context-hero-bg.webm", type: "video/webm" },
  33  |     { src: "/assets/thai-context-hero-bg.mp4", type: "video/mp4" },
  34  |   ]);
  35  | 
  36  |   await expect.poll(() => video.evaluate(element => (element as HTMLVideoElement).readyState)).toBeGreaterThanOrEqual(2);
  37  |   await expect.poll(() => video.evaluate(element => (element as HTMLVideoElement).paused)).toBe(false);
  38  |   expect(await video.evaluate(element => (element as HTMLVideoElement).muted)).toBe(true);
  39  |   expect(await video.evaluate(element => (element as HTMLVideoElement).currentSrc)).toMatch(
  40  |     /thai-context-hero-bg\.webm$/,
  41  |   );
  42  |   await expect(video).toHaveCSS("object-fit", "cover");
  43  |   await expect(video).toHaveCSS("pointer-events", "none");
  44  |   await expect(page.locator("#meaning")).toBeEditable();
  45  |   await expect(page.locator(".navbar")).toBeVisible();
  46  |   expect(await hero.boundingBox()).toEqual(initialHeroBox);
  47  | 
  48  |   const firstTime = await video.evaluate(element => (element as HTMLVideoElement).currentTime);
  49  |   await page.waitForTimeout(300);
  50  |   expect(await video.evaluate(element => (element as HTMLVideoElement).currentTime)).toBeGreaterThan(firstTime);
  51  |   expect(await video.evaluate(element => (element as HTMLVideoElement).error)).toBeNull();
  52  | 
  53  |   const duration = await video.evaluate(element => (element as HTMLVideoElement).duration);
  54  |   await expect
  55  |     .poll(
  56  |       () => video.evaluate(element => (element as HTMLVideoElement).currentTime),
  57  |       { timeout: 12000, intervals: [100] },
  58  |     )
  59  |     .toBeGreaterThan(duration - 0.75);
  60  |   await expect
  61  |     .poll(
  62  |       () => video.evaluate(element => (element as HTMLVideoElement).currentTime),
  63  |       { timeout: 3000, intervals: [50] },
  64  |     )
  65  |     .toBeLessThan(0.75);
  66  |   expect(await video.evaluate(element => (element as HTMLVideoElement).paused)).toBe(false);
  67  |   expect(errors).toEqual([]);
  68  | });
  69  | 
  70  | test("video remains cover-sized while responsive Search and cinematic flow work", async ({ page }) => {
  71  |   const errors: string[] = [];
  72  |   page.on("pageerror", error => errors.push(error.message));
  73  |   page.on("console", message => {
  74  |     if (message.type() === "error" || /hydration|react warning/i.test(message.text()))
  75  |       errors.push(message.text());
  76  |   });
  77  |   await page.goto("/");
  78  | 
  79  |   for (const width of [1440, 768, 375]) {
  80  |     await page.setViewportSize({ width, height: 900 });
  81  |     const heroBox = await page.locator("#hero").boundingBox();
  82  |     const videoBox = await page.locator(".hero-background-video").boundingBox();
  83  |     expect(videoBox).toEqual(heroBox);
  84  |     expect(
  85  |       await page.evaluate(
  86  |         () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
  87  |       ),
  88  |     ).toBe(true);
  89  |     await expect(page.locator("#meaning")).toBeEditable();
  90  |     await expect(page.locator(".navbar")).toBeVisible();
  91  |   }
  92  | 
  93  |   await page.locator("#meaning").fill("ทำงานทรัพยากร");
  94  |   await page.locator(".search-submit").click();
  95  |   await expect(page.locator(".experience")).toHaveAttribute(
  96  |     "data-experience-state",
  97  |     "results-active",
  98  |   );
  99  |   await expect(page.locator("#word-title")).toBeVisible();
  100 |   await expect(page.locator(".transition-overlay")).toHaveCSS("opacity", "0");
> 101 |   expect(errors).toEqual([]);
      |                  ^ Error: expect(received).toEqual(expected) // deep equality
  102 | });
  103 | 
  104 | test("reduced motion uses the poster without requesting video files", async ({ page }) => {
  105 |   const videoRequests: string[] = [];
  106 |   page.on("request", request => {
  107 |     if (/thai-context-hero-bg\.(?:webm|mp4)$/.test(request.url()))
  108 |       videoRequests.push(request.url());
  109 |   });
  110 |   await page.emulateMedia({ reducedMotion: "reduce" });
  111 |   await page.goto("/");
  112 | 
  113 |   await expect(page.locator(".hero-background-video")).toHaveCount(0);
  114 |   await expect(page.locator(".hero-background")).toHaveCSS(
  115 |     "background-image",
  116 |     /thai-context-hero-poster\.webp/,
  117 |   );
  118 |   await expect(page.locator("#meaning")).toBeEditable();
  119 |   expect(videoRequests).toEqual([]);
  120 | });
  121 | 
```