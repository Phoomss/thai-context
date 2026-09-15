import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sentence = typeof body?.sentence === "string" ? body.sentence.trim() : "";
    const style = typeof body?.style === "string" ? body.style.trim() : "ancient";
    const mode = typeof body?.mode === "string" ? body.mode.trim() : "quirkify";

    if (!sentence || sentence.length > 300) {
      return NextResponse.json(
        { error: "กรุณาระบุประโยคความยาว 1–300 ตัวอักษร" },
        { status: 400 }
      );
    }

    const apiBase =
      process.env.THAI_CONTEXT_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3001";
    const aiBase =
      process.env.AI_SERVICE_URL ||
      "http://localhost:8000";

    const endpoints = [
      `${apiBase.replace(/\/api\/.*$/, "").replace(/\/+$/, "")}/api/v1/ai/quirkify`,
      `${aiBase.replace(/\/+$/, "")}/ai/quirkify`,
      "http://localhost:3001/api/v1/ai/quirkify",
      "http://localhost:8000/ai/quirkify",
    ];

    for (const endpoint of endpoints) {
      try {
        const upstream = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sentence, style, mode }),
          signal: AbortSignal.timeout(18000),
          cache: "no-store",
        });

        if (upstream.ok) {
          const data = await upstream.json();
          return NextResponse.json(data);
        }
      } catch {
        // Try next endpoint
      }
    }

    // Rich local fallback if upstream services are unreachable or offline
    const fallbackData = generateRichFallback(sentence, style, mode);
    return NextResponse.json(fallbackData);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "เกิดข้อผิดพลาดในการแปลงประโยค" },
      { status: 500 }
    );
  }
}

interface FallbackRule {
  vibe_style: string;
  punchline: string;
  transform: (text: string) => {
    sentence: string;
    mappings: Array<{
      original_phrase: string;
      replaced_word: string;
      part_of_speech: string;
      official_definition: string;
      source_edition: string;
      quirk_reason: string;
    }>;
  };
}

const FALLBACK_RULES: Record<string, Record<string, FallbackRule>> = {
  quirkify: {
    ancient: {
      vibe_style: "โบราณพงศาวดารราชสำนัก",
      punchline: "ยกระดับถ้อยคำสามัญประจำวันให้แลดูเสมือนพระราชสาส์นหรือพงศาวดารกรุงเก่าอันศักดิ์สิทธิ์",
      transform: (text: string) => ({
        sentence: `เพลานี้ มีเหตุให้ข้าพเจ้าจำต้อง 'ประกาศิต' เรื่อง '${text}' อันกอปรด้วยความ 'ปราชญ์เปรื่อง' และแลดู 'อัศจรรย์' ยิ่งนัก`,
        mappings: [
          {
            original_phrase: "พูด/บอก",
            replaced_word: "ประกาศิต",
            part_of_speech: "น.",
            official_definition: "คำสั่งอันเด็ดขาด, คำสั่งที่ศักดิ์สิทธิ์และมิอาจบิดพลิ้วได้.",
            source_edition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
            quirk_reason: "เปลี่ยนการบอกเล่าธรรมดาให้กลายเป็นการออกราชโองการเด็ดขาด"
          },
          {
            original_phrase: "ฉลาด/รอบรู้",
            replaced_word: "ปราชญ์เปรื่อง",
            part_of_speech: "ว.",
            official_definition: "ฉลาดรอบรู้, มีปรีชาญาณอันเฉียบแหลม.",
            source_edition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
            quirk_reason: "ยกย่องความรู้ธรรมดาให้แลดูเป็นปราชญ์ผู้เชี่ยวชาญสรรพศาสตร์"
          },
          {
            original_phrase: "แปลก/ประหลาด",
            replaced_word: "อัศจรรย์",
            part_of_speech: "ว.",
            official_definition: "แปลกประหลาด, น่าพิศวง, ไม่เคยพบเห็นมาก่อน.",
            source_edition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
            quirk_reason: "พรรณนาเหตุการณ์ชีวิตทั่วไปให้ดูเหนือธรรมชาติชวนตะลึง"
          }
        ]
      })
    },
    formal: {
      vibe_style: "วิชาการราชการขั้นสุดโต่ง",
      punchline: "แปลงประโยคสั้นๆ ให้กลายเป็นระเบียบปฏิบัติราชการและมติคณะรัฐมนตรีที่มีความยาวและความเคร่งขรึมสูงสุด",
      transform: (text: string) => ({
        sentence: `ตามที่ได้มีข้อเท็จจริงปรากฏเกี่ยวกับ '${text}' นั้น ทางหน่วยงานเห็นชอบให้ 'บังคับใช้' แนวทาง 'บูรณาการ' เพื่อเพิ่ม 'ประสิทธิภาพ' สูงสุด`,
        mappings: [
          {
            original_phrase: "นำมาใช้",
            replaced_word: "บังคับใช้",
            part_of_speech: "ก.",
            official_definition: "สั่งให้มีผลตามกฎหมายหรือตามระเบียบที่กำหนดไว้.",
            source_edition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
            quirk_reason: "แปลงพฤติกรรมธรรมดาให้กลายเป็นข้อกำหนดกฎหมายที่มีผลบังคับ"
          },
          {
            original_phrase: "ร่วมมือกัน",
            replaced_word: "บูรณาการ",
            part_of_speech: "ก.",
            official_definition: "ทำให้สมบูรณ์โดยการประสานสิ่งต่าง ๆ เข้าด้วยกันเป็นอันหนึ่งอันเดียว.",
            source_edition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
            quirk_reason: "ศัพท์ยอดฮิตประจำเอกสารราชการที่ทำให้ทุกเรื่องฟังดูซับซ้อนขึ้น 300%"
          },
          {
            original_phrase: "ผลงานดี",
            replaced_word: "ประสิทธิภาพ",
            part_of_speech: "น.",
            official_definition: "ความสามารถที่ทำให้เกิดผลสัมฤทธิ์สูงสุดโดยใช้ทรัพยากรคุ้มค่า.",
            source_edition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
            quirk_reason: "ตัวชี้วัดศักดิ์สิทธิ์ที่หน่วยงานราชการทุกแห่งต้องใส่ไว้ในทุกบรรทัด"
          }
        ]
      })
    },
    meme: {
      vibe_style: "สำนวนกวีปั่นประสาท",
      punchline: "เปรียบเปรยเรื่องเล็กๆ ในชีวิตให้กลายเป็นโศกนาฏกรรมมหากาพย์ระดับจักรวาล",
      transform: (text: string) => ({
        sentence: `วินาทีที่เกิดเหตุ '${text}' วิญญาณข้าพเจ้าพลัน 'ดิ่งพสุธา' สู่ภพภูมิอัน 'วิปลาส' จนแทบ 'บรรลัยกัลป์'`,
        mappings: [
          {
            original_phrase: "ใจหาย/ตกใจ",
            replaced_word: "ดิ่งพสุธา",
            part_of_speech: "ก.",
            official_definition: "ทิ้งตัวลงมาจากที่สูงสู่พื้นดิน, กระโดดร่มลงสู่พื้น.",
            source_edition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
            quirk_reason: "เว่อร์วังระดับตกจากฟ้าลงสู่พื้นดินเพื่อบรรยายอารมณ์ช็อก"
          },
          {
            original_phrase: "เพี้ยน/สับสน",
            replaced_word: "วิปลาส",
            part_of_speech: "ว.",
            official_definition: "คลาดเคลื่อนไปจากปรกติ, แปรปรวนไปจากสภาพเดิม.",
            source_edition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
            quirk_reason: "เปลี่ยนคำว่า 'งงจัง' ให้กลายเป็นภาวะจิตแปรปรวนเชิงจิตวิทยาโบราณ"
          },
          {
            original_phrase: "พังยับเยิน",
            replaced_word: "บรรลัยกัลป์",
            part_of_speech: "น.",
            official_definition: "ไฟเผาผลาญล้างโลกเมื่อสิ้นกัป, ความพินาศวอดวายอย่างที่สุด.",
            source_edition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
            quirk_reason: "เปรียบปัญหาจิ๊บจ๊อยว่ารุนแรงเทียบเท่ากับไฟล้างโลกาวินาศ"
          }
        ]
      })
    },
    dialect: {
      vibe_style: "ภาษาถิ่นสำนวนท้าทาย",
      punchline: "ผสานเสน่ห์สำนวนถิ่นอันกลมกล่อมเข้ากับถ้อยคำทางการได้อย่างมีอรรถรส",
      transform: (text: string) => ({
        sentence: `สูเขาเอ๋ย เรื่อง '${text}' เนี่ยเปิ้นว่ามัน 'ลำแต๊ๆ' ประหนึ่งได้ของกิ๋น 'โอชารส' จากทั่วแดนไกล`,
        mappings: [
          {
            original_phrase: "อร่อย/ดีมาก",
            replaced_word: "ลำแต๊ๆ",
            part_of_speech: "ว. (ถิ่นพายัพ)",
            official_definition: "อร่อยจริง ๆ, มีรสชาติถูกปากเป็นอย่างยิ่ง.",
            source_edition: "พจนานุกรมคำถิ่น สำนักงานราชบัณฑิตยสภา",
            quirk_reason: "สำเนียงล้านนาที่สื่อถึงความประทับใจขั้นสุด"
          },
          {
            original_phrase: "ของอร่อย",
            replaced_word: "โอชารส",
            part_of_speech: "น.",
            official_definition: "อาหารอันมีรสอร่อย, รสชาติอันน่าพึงใจ.",
            source_edition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
            quirk_reason: "ประกบคู่ภาษาถิ่นเข้ากับศัพท์บาลี-สันสกฤตให้ดูขลัง"
          }
        ]
      })
    }
  },
  beautify: {
    poetic: {
      vibe_style: "วรรณศิลป์ร้อยแก้วสละสลวย",
      punchline: "เกลาภาษาพูดให้กลายเป็นร้อยแก้ววรรณศิลป์ นุ่มนวล ละมุนละไม ดุจบทกวี",
      transform: (text: string) => ({
        sentence: `ท่ามกลางกระแสธารแห่ง '${text}' ยังคงมี 'สุนทรียภาพ' อันชวนให้จิตใจได้ 'รื่นรมย์' ในความสงบงาม`,
        mappings: [
          {
            original_phrase: "ความสวยงาม",
            replaced_word: "สุนทรียภาพ",
            part_of_speech: "น.",
            official_definition: "ความรู้สึกชื่นชมในความงามตามธรรมชาติและงานศิลปะ.",
            source_edition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
            quirk_reason: "ยกระดับสายตาธรรมดาให้มองเห็นคุณค่าแห่งความงามอันละเอียดอ่อน"
          },
          {
            original_phrase: "สบายใจ/มีความสุข",
            replaced_word: "รื่นรมย์",
            part_of_speech: "ว.",
            official_definition: "สบายใจ, เพลิดเพลินใจ, ชวนให้สบายใจ.",
            source_edition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
            quirk_reason: "เปลี่ยนคำว่าแฮปปี้ ให้เป็นความสุขอิ่มเอิบที่สงบนิ่งและนุ่มนวล"
          }
        ]
      })
    },
    gentle: {
      vibe_style: "สุภาพชนชั้นสูงละมุนละไม",
      punchline: "ถ้อยคำสุภาพ อ่อนน้อม ให้เกียรติผู้ฟัง เหมาะสำหรับกาลเทศะอันทรงเกียรติ",
      transform: (text: string) => ({
        sentence: `ด้วยความเคารพในบริบทแห่ง '${text}' ขออนุญาต 'อนุเคราะห์' ถ้อยเจรจาด้วย 'ไมตรีจิต' อันบริสุทธิ์`,
        mappings: [
          {
            original_phrase: "ช่วยเหลือ/บอกกล่าว",
            replaced_word: "อนุเคราะห์",
            part_of_speech: "ก.",
            official_definition: "เอื้อเฟื้อ, ช่วยเหลือด้วยความเมตตาปรานี.",
            source_edition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
            quirk_reason: "สื่อความปรารถนาดีอย่างเป็นทางการและสุภาพนอบน้อม"
          },
          {
            original_phrase: "ความเป็นมิตร",
            replaced_word: "ไมตรีจิต",
            part_of_speech: "น.",
            official_definition: "จิตใจที่มีความหวังดีและผูกพันด้วยความเป็นมิตร.",
            source_edition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
            quirk_reason: "เปลี่ยนความเป็นกันเองให้เปี่ยมด้วยมารยาทและความจริงใจชั้นสูง"
          }
        ]
      })
    },
    grand: {
      vibe_style: "สุนทรพจน์เฉลิมฉลองทรงคุณค่า",
      punchline: "สำนวนสง่างาม เปล่งประกายพลังใจ ดั่งสุนทรพจน์ในพิธีการสำคัญระดับชาติ",
      transform: (text: string) => ({
        sentence: `นับเป็นวาระอัน 'มงคลสมัย' ที่เราได้ร่วมสร้างสรรค์ '${text}' ให้เจริญรุดหน้าสู่ 'เกียรติภูมิ' อันยั่งยืน`,
        mappings: [
          {
            original_phrase: "โอกาสดี",
            replaced_word: "มงคลสมัย",
            part_of_speech: "น.",
            official_definition: "เวลาอันเป็นมงคล, ช่วงเวลาที่นำมาซึ่งความเจริญก้าวหน้า.",
            source_edition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
            quirk_reason: "ยกระดับจังหวะเวลาธรรมดาให้เปี่ยมด้วยคุณค่าและความเป็นสิริมงคล"
          },
          {
            original_phrase: "ชื่อเสียง/ศักดิ์ศรี",
            replaced_word: "เกียรติภูมิ",
            part_of_speech: "น.",
            official_definition: "สง่าราศี, ฐานะอันทรงเกียรติที่ได้รับการยกย่องนับถือ.",
            source_edition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
            quirk_reason: "สร้างความภาคภูมิใจและพลังขับเคลื่อนที่ยิ่งใหญ่"
          }
        ]
      })
    },
    minimal: {
      vibe_style: "คมคายลึกซึ้งสงบงาม",
      punchline: "ตัดทอนสิ่งฟุ่มเฟือย เหลือไว้เพียงแก่นแท้แห่งความหมายอันสงบนิ่งและชวนครุ่นคิด",
      transform: (text: string) => ({
        sentence: `เพียงรู้ชัดใน '${text}' จิตย่อม 'สงบระงับ' และสัมผัสถึง 'ปรมัตถ์' แห่งปัจจุบันขณะ`,
        mappings: [
          {
            original_phrase: "สงบใจ",
            replaced_word: "สงบระงับ",
            part_of_speech: "ก.",
            official_definition: "สงบลง, ระงับความฟุ้งซ่านหรือความวุ่นวายใจ.",
            source_edition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
            quirk_reason: "สำนวนเชิงภาวนาที่นำพาจิตใจออกจากความวุ่นวายภายนอก"
          },
          {
            original_phrase: "ความจริงสูงสุด",
            replaced_word: "ปรมัตถ์",
            part_of_speech: "น.",
            official_definition: "ความจริงอันลึกซึ้งสูงสุด, ประโยชน์อย่างยิ่ง.",
            source_edition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
            quirk_reason: "เชื่อมโยงเรื่องราวในชีวิตประจำวันเข้าสู่สัจธรรมอันเรียบง่าย"
          }
        ]
      })
    }
  }
};

function generateRichFallback(sentence: string, style: string, mode: string) {
  const modeRules = FALLBACK_RULES[mode] || FALLBACK_RULES.quirkify;
  const styleRule = modeRules[style] || Object.values(modeRules)[0];
  const { sentence: quirkified_sentence, mappings } = styleRule.transform(sentence);

  return {
    original_sentence: sentence,
    quirkified_sentence,
    vibe_style: styleRule.vibe_style,
    punchline_explanation: styleRule.punchline,
    word_mappings: mappings
  };
}
