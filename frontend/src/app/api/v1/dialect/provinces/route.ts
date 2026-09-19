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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");
  const backendUrl = getDialectBackendUrl();
  const targetUrl = region
    ? `${backendUrl}/dialect/provinces?region=${encodeURIComponent(region)}`
    : `${backendUrl}/dialect/provinces`;

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

  const allProvinces = [
    { id: "prov-cm", code: "CHIANG_MAI", name_thai: "เชียงใหม่", parent_region: "ภาคเหนือ", parent_code: "NORTH", entry_count: 180 },
    { id: "prov-cr", code: "CHIANG_RAI", name_thai: "เชียงราย", parent_region: "ภาคเหนือ", parent_code: "NORTH", entry_count: 110 },
    { id: "prov-lp", code: "LAMPANG", name_thai: "ลำปาง", parent_region: "ภาคเหนือ", parent_code: "NORTH", entry_count: 95 },
    { id: "prov-nn", code: "NAN", name_thai: "น่าน", parent_region: "ภาคเหนือ", parent_code: "NORTH", entry_count: 95 },
    { id: "prov-kk", code: "KHON_KAEN", name_thai: "ขอนแก่น", parent_region: "ภาคอีสาน", parent_code: "NORTHEAST", entry_count: 170 },
    { id: "prov-ub", code: "UBON_RATCHATHANI", name_thai: "อุบลราชธานี", parent_region: "ภาคอีสาน", parent_code: "NORTHEAST", entry_count: 130 },
    { id: "prov-nr", code: "NAKHON_RATCHASIMA", name_thai: "นครราชสีมา", parent_region: "ภาคอีสาน", parent_code: "NORTHEAST", entry_count: 110 },
    { id: "prov-ud", code: "UDON_THANI", name_thai: "อุดรธานี", parent_region: "ภาคอีสาน", parent_code: "NORTHEAST", entry_count: 110 },
    { id: "prov-sk", code: "SONGKHLA", name_thai: "สงขลา", parent_region: "ภาคใต้", parent_code: "SOUTH", entry_count: 150 },
    { id: "prov-ns", code: "NAKHON_SI_THAMMARAT", name_thai: "นครศรีธรรมราช", parent_region: "ภาคใต้", parent_code: "SOUTH", entry_count: 120 },
    { id: "prov-pk", code: "PHUKET", name_thai: "ภูเก็ต", parent_region: "ภาคใต้", parent_code: "SOUTH", entry_count: 90 },
    { id: "prov-st", code: "SURAT_THANI", name_thai: "สุราษฎร์ธานี", parent_region: "ภาคใต้", parent_code: "SOUTH", entry_count: 80 },
    { id: "prov-bkk", code: "BANGKOK", name_thai: "กรุงเทพมหานคร", parent_region: "ภาคกลาง", parent_code: "CENTRAL", entry_count: 220 },
    { id: "prov-ay", code: "AYUTTHAYA", name_thai: "พระนครศรีอยุธยา", parent_region: "ภาคกลาง", parent_code: "CENTRAL", entry_count: 85 },
    { id: "prov-sp", code: "SUPHANBURI", name_thai: "สุพรรณบุรี", parent_region: "ภาคกลาง", parent_code: "CENTRAL", entry_count: 63 },
  ];

  const filtered = region
    ? allProvinces.filter((p) => p.parent_code === region.toUpperCase() || p.parent_region.includes(region))
    : allProvinces;

  return NextResponse.json({ provinces: filtered });
}
