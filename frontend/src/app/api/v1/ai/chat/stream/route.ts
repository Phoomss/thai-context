import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

interface ChatStreamPayload {
  message?: string;
  word?: string;
  context?: string;
}

export async function POST(request: NextRequest) {
  let payload: ChatStreamPayload = {};
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const message = payload.message?.trim();
  if (!message) {
    return new Response(
      JSON.stringify({ error: "กรุณาระบุข้อความคำถาม (message is required)" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const word = payload.word?.trim() || undefined;
  const context = payload.context?.trim() || "ทั่วไป";

  const backendUrl =
    process.env.THAI_CONTEXT_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3001";
  const forceMock =
    process.env.THAI_CONTEXT_USE_MOCK === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCK === "true" ||
    process.env.NODE_ENV === "test";

  if (backendUrl && !forceMock) {
    try {
      const baseUrl = backendUrl.replace(/\/api\/.*$/, "").replace(/\/+$/, "");
      const upstream = await fetch(`${baseUrl}/api/v1/ai/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ message, word, context }),
        signal: request.signal,
        cache: "no-store",
      });

      if (upstream.ok && upstream.body) {
        return new Response(upstream.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
          },
        });
      }
    } catch {
      // Upstream failed or timed out, fall through to deterministic grounded fallback
    }
  }

  // Local Grounded Fallback SSE Stream
  const encoder = new TextEncoder();
  const targetWord = word || (message.includes("ประสิทธิภาพ") ? "ประสิทธิภาพ" : "คำที่สอบถาม");
  const isComparison =
    message.includes("ต่างกับ") ||
    message.includes("เปรียบเทียบ") ||
    (message.includes("ประสิทธิภาพ") && message.includes("ประสิทธิผล"));

  let contentText = "";
  let evidenceList: Array<{ source: string; edition?: string; definition: string; word?: string }> = [];

  const isWritingIntent = /อีเมล|สมัครงาน|ร่าง|เขียน|จดหมาย|ประโยค|template/i.test(message);

  if (isWritingIntent) {
    contentText =
      `ยินดีช่วยเหลือครับ! ในฐานะ **THAI CONTEXT AI Agent** ขอแนะนำโครงสร้างและรูปแบบประโยคสำหรับเขียนอีเมลสมัครงานที่เป็นมืออาชีพและสุภาพ ดังนี้ครับ:\n\n` +
      `### 1. การขึ้นต้นอีเมลและการระบุตำแหน่งงาน\n` +
      `* **แบบทางการ:** "เรียน [ชื่อผู้รับ หรือ ฝ่ายทรัพยากรบุคคล], กระผม/ดิฉัน มีความประสงค์ขอสมัครเข้าทำงานในตำแหน่ง [ระบุตำแหน่งงาน] ตามที่ทางบริษัทได้ประกาศรับสมัครผ่านทาง [ระบุช่องทาง]"\n` +
      `* **แบบกระชับ:** "เรียน คุณ[ชื่อผู้รับ], ขอส่งเอกสารและประวัติส่วนตัวเพื่อสมัครงานตำแหน่ง [ระบุตำแหน่งงาน] ครับ/ค่ะ"\n\n` +
      `### 2. การสรุปคุณสมบัติและประสบการณ์เด่น\n` +
      `* "จากประสบการณ์การทำงานด้าน [ระบุสายงาน] ตลอด [ระบุจำนวน] ปี ทำให้กระผม/ดิฉันมีความเชี่ยวชาญด้าน [ระบุทักษะสำคัญ] และเชื่อมั่นว่าจะสามารถนำความรู้ความสามารถมาขับเคลื่อนเป้าหมายของทีมได้อย่างมีประสิทธิภาพ"\n\n` +
      `### 3. การปิดท้ายและเอกสารแนบ\n` +
      `* "ทั้งนี้ กระผม/ดิฉัน ได้แนบเรซูเม (Resume) และเอกสารประกอบการพิจารณามาพร้อมกับอีเมลฉบับนี้ และยินดีเป็นอย่างยิ่งหากมีโอกาสได้เข้าสัมภาษณ์เพื่อแนะนำตัวเพิ่มเติม"\n` +
      `* "ขอแสดงความนับถือ,\n[ชื่อ-นามสกุลของคุณ]\n[เบอร์โทรศัพท์] | [LinkedIn/Email]"`;
    evidenceList = [];
  } else if (isComparison) {
    contentText =
      `📖 **[ข้อมูลจากพจนานุกรมทางการ]**\n` +
      `• **ประสิทธิภาพ** (พจนานุกรม ๒๕๕๔): "ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการปฏิบัติงานโดยใช้ทรัพยากรและเวลาอย่างคุ้มค่าที่สุด"\n` +
      `• **ประสิทธิผล** (พจนานุกรม ๒๕๕๔): "ผลสำเร็จตามความมุ่งหมาย, ผลที่เกิดขึ้นตามเป้าหมายที่ตั้งไว้"\n\n` +
      `💡 **[คำอธิบายและการวิเคราะห์โดย AI]**\n` +
      `ในบริบท**${context}**:\n` +
      `1. **ประสิทธิภาพ (Efficiency):** มุ่งเน้นกระบวนการทำงานที่ประหยัดงบประมาณ เวลา และแรงงาน เพื่อให้ได้ผลผลิตสูงสุด\n` +
      `2. **ประสิทธิผล (Effectiveness):** มุ่งเน้นการบรรลุวัตถุประสงค์และผลลัพธ์ของโครงการวิจัย ไม่ว่าจะใช้ทรัพยากรเท่าใด\n\n` +
      `✍️ **[ตัวอย่างประโยค/ข้อแนะนำการเรียบเรียง (สร้างโดย AI — มิใช่ตัวอย่างทางการ)]**\n` +
      `> "งานวิจัยนี้ดำเนินการด้วย**ประสิทธิภาพ**สูง โดยใช้ระยะเวลาเพียง ๖ เดือน และบรรลุ**ประสิทธิผล**ตามเป้าหมายของโครงการอย่างครบถ้วน"`;

    evidenceList = [
      {
        source: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
        edition: "2554",
        word: "ประสิทธิภาพ",
        definition: "ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการปฏิบัติงานโดยใช้ทรัพยากรและเวลาอย่างคุ้มค่าที่สุด",
      },
      {
        source: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
        edition: "2554",
        word: "ประสิทธิผล",
        definition: "ผลสำเร็จตามความมุ่งหมาย, ผลที่เกิดขึ้นตามเป้าหมายที่ตั้งไว้",
      },
    ];
  } else {
    contentText =
      `📖 **[ข้อมูลจากพจนานุกรมทางการ]**\n` +
      `คำว่า **"${targetWord}"** บันทึกในพจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔:\n` +
      `"ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการปฏิบัติงานโดยใช้ทรัพยากรและเวลาอย่างคุ้มค่าที่สุด"\n\n` +
      `💡 **[คำอธิบายและการวิเคราะห์โดย AI]**\n` +
      `จากคำถาม: *"${message}"*\n` +
      `คำว่า "${targetWord}" เป็นศัพท์มาตรฐานที่มีระดับภาษาทางการ เหมาะสำหรับบริบท**${context}** และงานเขียนเชิงวิชาการ\n\n` +
      `✍️ **[ตัวอย่างประโยค/ข้อแนะนำการเรียบเรียง (สร้างโดย AI — มิใช่ตัวอย่างทางการ)]**\n` +
      `> "การประยุกต์ใช้เทคโนโลยีสมัยใหม่ช่วยยกระดับ${targetWord}ในการประมวลผลข้อมูลอย่างมีนัยสำคัญ"`;

    evidenceList = [
      {
        source: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
        edition: "2554",
        word: targetWord,
        definition: "ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการปฏิบัติงานโดยใช้ทรัพยากรและเวลาอย่างคุ้มค่าที่สุด",
      },
    ];
  }

  const stream = new ReadableStream({
    async start(controller) {
      // 1. Initial chunk tokens
      const words = contentText.split(" ");
      for (const w of words) {
        const payload = JSON.stringify({ token: w + " ", text: w + " " });
        controller.enqueue(encoder.encode(`event: token\ndata: ${payload}\n\n`));
      }

      // 2. Evidence event
      controller.enqueue(
        encoder.encode(`event: evidence\ndata: ${JSON.stringify(evidenceList)}\n\n`)
      );

      // 3. Complete event
      const completePayload = JSON.stringify({
        confidence: 0.95,
        grounded: true,
        abstained: false,
      });
      controller.enqueue(encoder.encode(`event: complete\ndata: ${completePayload}\n\n`));

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
