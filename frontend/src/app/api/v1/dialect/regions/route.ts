import { NextResponse } from "next/server";

function getDialectBackendUrl(): string {
  const envUrl =
    process.env.THAI_CONTEXT_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001/api/v1";
  const trimmed = envUrl.replace(/\/+$/, "");
  if (trimmed.endsWith("/api/v1")) return trimmed;
  if (trimmed.endsWith("/api")) return `${trimmed}/v1`;
  return `${trimmed}/api/v1`;
}

export async function GET() {
  const backendUrl = getDialectBackendUrl();
  const targetUrl = `${backendUrl}/dialect/regions`;

  try {
    const upstream = await fetch(targetUrl, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });

    if (upstream.ok) {
      const data = await upstream.json();
      return NextResponse.json(data);
    }
  } catch {
    // Backend unreachable, fallback
  }

  // Fallback regions
  return NextResponse.json({
    regions: [
      {
        id: "reg-central",
        code: "CENTRAL",
        name_thai: "ภาคกลาง",
        type: "REGION",
        description: "ภาษาไทยมาตรฐานและภาษาถิ่นภาคกลาง",
        entry_count: 368,
        provinces: [
          { id: "prov-bkk", code: "BANGKOK", name_thai: "กรุงเทพมหานคร" },
          { id: "prov-ay", code: "AYUTTHAYA", name_thai: "พระนครศรีอยุธยา" },
          { id: "prov-sp", code: "SUPHANBURI", name_thai: "สุพรรณบุรี" },
        ],
      },
      {
        id: "reg-north",
        code: "NORTH",
        name_thai: "ภาคเหนือ",
        type: "REGION",
        description: "ภาษาถิ่นเหนือ (คำเมือง/ล้านนา)",
        entry_count: 480,
        provinces: [
          { id: "prov-cm", code: "CHIANG_MAI", name_thai: "เชียงใหม่" },
          { id: "prov-cr", code: "CHIANG_RAI", name_thai: "เชียงราย" },
          { id: "prov-lp", code: "LAMPANG", name_thai: "ลำปาง" },
          { id: "prov-nn", code: "NAN", name_thai: "น่าน" },
        ],
      },
      {
        id: "reg-northeast",
        code: "NORTHEAST",
        name_thai: "ภาคอีสาน",
        type: "REGION",
        description: "ภาษาถิ่นอีสาน (กลุ่มภาษาลาว-อีสาน และไทย-โคราช)",
        entry_count: 520,
        provinces: [
          { id: "prov-kk", code: "KHON_KAEN", name_thai: "ขอนแก่น" },
          { id: "prov-ub", code: "UBON_RATCHATHANI", name_thai: "อุบลราชธานี" },
          { id: "prov-nr", code: "NAKHON_RATCHASIMA", name_thai: "นครราชสีมา" },
          { id: "prov-ud", code: "UDON_THANI", name_thai: "อุดรธานี" },
        ],
      },
      {
        id: "reg-south",
        code: "SOUTH",
        name_thai: "ภาคใต้",
        type: "REGION",
        description: "ภาษาถิ่นใต้ (ปักษ์ใต้)",
        entry_count: 440,
        provinces: [
          { id: "prov-sk", code: "SONGKHLA", name_thai: "สงขลา" },
          { id: "prov-ns", code: "NAKHON_SI_THAMMARAT", name_thai: "นครศรีธรรมราช" },
          { id: "prov-pk", code: "PHUKET", name_thai: "ภูเก็ต" },
          { id: "prov-st", code: "SURAT_THANI", name_thai: "สุราษฎร์ธานี" },
        ],
      },
    ],
  });
}
