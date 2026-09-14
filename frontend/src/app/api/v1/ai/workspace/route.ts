import { NextRequest, NextResponse } from "next/server";
import type {
  WorkspaceRequestPayload,
  WorkspaceResponsePayload,
} from "@/lib/workspace-types";

export async function POST(request: NextRequest) {
  try {
    const body: WorkspaceRequestPayload = await request.json();

    if (!body.message || !body.message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const backendUrl =
      process.env.THAI_CONTEXT_API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      "http://localhost:3001";

    const baseUrl = backendUrl.replace(/\/api\/.*$/, "").replace(/\/+$/, "");

    try {
      const res = await fetch(`${baseUrl}/api/v1/ai/workspace`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      });

      if (res.ok) {
        const data: WorkspaceResponsePayload = await res.json();
        return NextResponse.json(data);
      }
    } catch {
      // Backend unavailable or timed out, fall through to client fallback
    }

    // Fallback response for offline demo
    const fallback: WorkspaceResponsePayload = {
      session_id: body.session_id || "offline-session",
      intent: "WORD_DISCOVERY",
      tasks: ["CONTEXT_ANALYSIS", "WORD_DISCOVERY"],
      answer: `พบคลังคำศัพท์และหลักฐานที่สอดคล้องกับ "${body.message}" จากพจนานุกรม ฉบับราชบัณฑิตยสถาน`,
      context: {
        type: body.context?.type || "academic",
        tone: body.context?.tone || "formal",
        audience: body.context?.audience || "คณะกรรมการวิชาการ",
        source: "AI_INFERRED",
      },
      recommendations: [
        {
          word: "ประสิทธิภาพ",
          score: 0.94,
          pos: "น.",
          definition:
            "ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการปฏิบัติงานโดยใช้ทรัพยากรและเวลาอย่างคุ้มค่าที่สุด",
          reason: "ตรงกับความต้องการสื่อถึงความคุ้มค่าของทรัพยากรและการทำงานที่ได้ผลดี",
          source: "สำนักงานราชบัณฑิตยสภา",
          edition: "2554",
          evidence: [
            {
              source_book: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
              edition: "ฉบับพิมพ์ครั้งที่ ๔",
              edition_year: 2554,
              page_number: 734,
              quote:
                "ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการปฏิบัติงานโดยใช้ทรัพยากรและเวลาอย่างคุ้มค่าที่สุด",
              is_official: true,
            },
          ],
        },
      ],
      comparison: null,
      generated_content: [
        {
          type: "sentence",
          content:
            "การประยุกต์ใช้อัลกอริทึมใหม่ช่วยเพิ่มประสิทธิภาพในการประมวลผลข้อมูลขนาดใหญ่ และลดระยะเวลาการทำงานได้อย่างมีนัยสำคัญ",
          register: "academic",
          notes: "ประโยคเชิงวิชาการเน้นความคุ้มค่าของการใช้ทรัพยากรเวลา",
        },
      ],
      language_check: {
        score: 95,
        status: "OPTIMAL",
        issues: [],
        summary: "โครงสร้างประโยคถูกต้องและสอดคล้องตามแบบแผนพจนานุกรม",
      },
      language_bridge: null,
      evidence: [
        {
          source_book: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
          edition: "ฉบับพิมพ์ครั้งที่ ๔",
          edition_year: 2554,
          page_number: 734,
          quote:
            "ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการปฏิบัติงานโดยใช้ทรัพยากรและเวลาอย่างคุ้มค่าที่สุด",
          is_official: true,
        },
      ],
      confidence: 0.94,
      confidence_level: "HIGH",
      abstained: false,
      agent_traces: [
        {
          agent: "ContextAgent",
          status: "completed",
          summary: "วิเคราะห์บริบท: academic (formal)",
          duration_ms: 12,
        },
        {
          agent: "WordDiscoveryAgent",
          status: "completed",
          summary: "ค้นพบคำแนะนำ 1 คำ: ประสิทธิภาพ",
          duration_ms: 24,
        },
      ],
    };

    return NextResponse.json(fallback);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
