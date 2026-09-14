import { parseResponse, type SearchResponse } from "./search-types";
import {
  sortTranslations,
  type SignLanguageEntry,
  type TranslationItem,
  type BrailleData,
  type DecodedBrailleResult,
} from "./accessibility-types";
import { encodeThaiToBraille, decodeBrailleToThai } from "./braille-encoder";

// Editorial mock fallback data for offline / demo environments
export const MOCK_SIGN_LANGUAGE: Record<string, SignLanguageEntry[]> = {
  ประสิทธิภาพ: [
    {
      signName: "ประสิทธิภาพ",
      handshapeDescription:
        "มือขวาตั้งนิ้วชี้และนิ้วกลาง หมุนวนเป็นเกลียวไปข้างหน้าแล้วประกบฝ่ามือซ้าย แสดงถึงกระบวนการที่รวดเร็วและคุ้มค่า",
      dialectRegion: "ภาคกลาง (CENTRAL)",
      verificationStatus: "OFFICIAL",
      sourceAttribution: "วิทยาลัยราชสุดา มหาวิทยาลัยมหิดล",
      license: "CC-BY-SA 4.0",
      media: [
        {
          mediaType: "VIDEO_MP4",
          mediaUrl:
            "https://assets.thai-context.org/tsl/videos/prasitthiphap.mp4",
          thumbnailUrl:
            "https://assets.thai-context.org/tsl/thumbs/prasitthiphap.jpg",
          isPrimary: true,
        },
      ],
    },
  ],
  ประสิทธิผล: [
    {
      signName: "ประสิทธิผล",
      handshapeDescription:
        "กำมือทั้งสองข้าง ชูนิ้วโป้งขึ้นพร้อมกันระดับอก แล้วเลื่อนออกไปข้างหน้า แสดงถึงผลสำเร็จตามเป้าหมาย",
      dialectRegion: "ภาคกลาง (CENTRAL)",
      verificationStatus: "OFFICIAL",
      sourceAttribution: "วิทยาลัยราชสุดา มหาวิทยาลัยมหิดล",
      license: "CC-BY-SA 4.0",
      media: [
        {
          mediaType: "VIDEO_MP4",
          mediaUrl:
            "https://assets.thai-context.org/tsl/videos/prasitthiphon.mp4",
          thumbnailUrl:
            "https://assets.thai-context.org/tsl/thumbs/prasitthiphon.jpg",
          isPrimary: true,
        },
      ],
    },
  ],
  ร่วมมือ: [
    {
      signName: "ร่วมมือ",
      handshapeDescription:
        "ประสานนิ้วมือทั้งสองข้างเข้าด้วยกัน แล้วดึงเข้าหาลำตัวเล็กน้อย แสดงความร่วมแรงร่วมใจ",
      dialectRegion: "ภาคกลาง (CENTRAL)",
      verificationStatus: "OFFICIAL",
      sourceAttribution: "วิทยาลัยราชสุดา มหาวิทยาลัยมหิดล",
      license: "CC-BY-SA 4.0",
      media: [
        {
          mediaType: "VIDEO_MP4",
          mediaUrl:
            "https://assets.thai-context.org/tsl/videos/ruammo.mp4",
          isPrimary: true,
        },
      ],
    },
  ],
  วิจัย: [
    {
      signName: "วิจัย",
      handshapeDescription:
        "ทำมือขวาเป็นรูปตัว C ส่องดูฝ่ามือซ้ายที่หงายอยู่ เสมือนใช้แว่นขยายตรวจสอบข้อมูลอย่างละเอียด",
      dialectRegion: "ภาคกลาง (CENTRAL)",
      verificationStatus: "OFFICIAL",
      sourceAttribution: "วิทยาลัยราชสุดา มหาวิทยาลัยมหิดล",
      license: "CC-BY-SA 4.0",
      media: [
        {
          mediaType: "VIDEO_MP4",
          mediaUrl:
            "https://assets.thai-context.org/tsl/videos/wichai.mp4",
          isPrimary: true,
        },
      ],
    },
  ],
};

export const MOCK_TRANSLATIONS: Record<string, TranslationItem[]> = {
  ประสิทธิภาพ: [
    {
      translatedWord: "efficiency",
      languageCode: "en",
      secondaryTranslations: ["competence", "productivity"],
      contextualExplanation:
        "ความสามารถในการสร้างผลผลิตสูงสุดโดยใช้ทรัพยากรน้อยที่สุด",
      usageNuance: "ภาษาทางการและบริบทการบริหารจัดการ",
      provenance: "OFFICIAL_ROYAL_COINED",
      confidenceScore: 1.0,
    },
    {
      translatedWord: "performance efficacy",
      languageCode: "en",
      secondaryTranslations: ["operational efficiency"],
      contextualExplanation:
        "คำแปลแนะนำสำหรับการทำงานในองค์กรร่วมสมัย",
      usageNuance: "บริบทการปฏิบัติการสมัยใหม่",
      provenance: "AI_GENERATED",
      confidenceScore: 0.88,
    },
  ],
  ประสิทธิผล: [
    {
      translatedWord: "effectiveness",
      languageCode: "en",
      secondaryTranslations: ["efficacy", "fruitfulness"],
      contextualExplanation:
        "ผลสำเร็จที่เกิดขึ้นตามเป้าหมายหรือวัตถุประสงค์ที่กำหนดไว้",
      usageNuance: "เน้นการบรรลุเป้าหมายของงานหรือนโยบาย",
      provenance: "OFFICIAL_ROYAL_COINED",
      confidenceScore: 1.0,
    },
    {
      translatedWord: "outcome success",
      languageCode: "en",
      provenance: "AI_GENERATED",
      confidenceScore: 0.82,
    },
  ],
  ดิจิทัล: [
    {
      translatedWord: "digital",
      languageCode: "en",
      secondaryTranslations: ["electronic"],
      contextualExplanation:
        'คำทับศัพท์ภาษาไทยตามประกาศสำนักงานราชบัณฑิตยสภา จากคำภาษาอังกฤษ "digital"',
      usageNuance: "ราชบัณฑิตยสภากำหนดให้ใช้ 'ดิจิทัล' แทน 'ดิจิตอล'",
      provenance: "OFFICIAL_ROYAL_TRANSLITERATION",
      confidenceScore: 1.0,
    },
  ],
  สัมฤทธิผล: [
    {
      translatedWord: "achievement",
      languageCode: "en",
      secondaryTranslations: ["accomplishment", "success"],
      contextualExplanation: "ความสำเร็จลุล่วงตามความมุ่งหมายอย่างสมบูรณ์",
      provenance: "OFFICIAL_ROYAL_COINED",
      confidenceScore: 1.0,
    },
  ],
  มัธยัสถ์: [
    {
      translatedWord: "frugal",
      languageCode: "en",
      secondaryTranslations: ["thrifty", "economical"],
      contextualExplanation: "การใช้จ่ายอย่างระมัดระวังและประหยัดรอบคอบ",
      provenance: "AI_GENERATED",
      confidenceScore: 0.92,
    },
  ],
  ร่วมมือ: [
    {
      translatedWord: "cooperate",
      languageCode: "en",
      secondaryTranslations: ["collaborate", "team up"],
      contextualExplanation:
        "การร่วมแรงร่วมใจกันทำงานเพื่อให้บรรลุจุดมุ่งหมายเดียวกัน",
      provenance: "AI_GENERATED",
      confidenceScore: 0.95,
    },
  ],
  ประสานงาน: [
    {
      translatedWord: "coordinate",
      languageCode: "en",
      secondaryTranslations: ["liaise", "synchronize"],
      contextualExplanation:
        "การเชื่อมโยงและจัดระเบียบการทำงานร่วมกันระหว่างฝ่าย",
      provenance: "AI_GENERATED",
      confidenceScore: 0.94,
    },
  ],
  กรุณารอสักครู่: [
    {
      translatedWord: "please hold on",
      languageCode: "en",
      secondaryTranslations: ["please wait a moment", "just a moment"],
      contextualExplanation: "ถ้อยคำสุภาพเพื่อขอให้อีกฝ่ายรอสักครู่",
      provenance: "AI_GENERATED",
      confidenceScore: 0.89,
    },
  ],
  วิจัย: [
    {
      translatedWord: "research",
      languageCode: "en",
      secondaryTranslations: ["investigation", "study"],
      contextualExplanation:
        "การค้นคว้าหาความจริงหรือองค์ความรู้อย่างเป็นระเบียบแบบแผน",
      provenance: "OFFICIAL_ROYAL_COINED",
      confidenceScore: 1.0,
    },
    {
      translatedWord: "systematic investigation",
      languageCode: "en",
      provenance: "AI_GENERATED",
      confidenceScore: 0.86,
    },
  ],
  สวัสดี: [
    {
      translatedWord: "hello / greetings",
      languageCode: "en",
      secondaryTranslations: ["good morning / afternoon", "good day", "greetings"],
      contextualExplanation:
        "คำทักทายสากลของไทย ใช้ได้ทุกช่วงเวลาเพื่อทักทายหรืออำลา มาจากภาษาสันสกฤตหมายถึงความดีงามและความเจริญรุ่งเรือง",
      usageNuance: "ใช้ได้ทั้งในบริบทสุภาพ ทางการ และชีวิตประจำวัน",
      provenance: "OFFICIAL_CURATED",
      confidenceScore: 1.0,
    },
  ],
  คิดถึง: [
    {
      translatedWord: "miss / think of",
      languageCode: "en",
      secondaryTranslations: ["yearn for", "long for"],
      contextualExplanation:
        "การนึกถึงบุคคลหรือสิ่งใดสิ่งหนึ่งด้วยความผูกพันหรือห่วงหา",
      usageNuance: "แสดงความรู้สึกผูกพัน ตรงกับภาษาถิ่น: กึ๊ดเติงหา (เหนือ), คึดฮอด (อีสาน), ข้องใจ (ใต้)",
      provenance: "OFFICIAL_CURATED",
      confidenceScore: 1.0,
    },
  ],
};

export async function searchMeaning(
  query: string,
  signal: AbortSignal,
): Promise<SearchResponse> {
  const response = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]),
  });
  if (!response.ok) throw new Error("ขณะนี้ค้นหาไม่ได้ กรุณาลองอีกครั้ง");
  const raw = await response.json();
  return parseResponse(
    raw,
    raw.mode === "demo" || raw.mode === "fallback" ? raw.mode : "live",
  );
}

export async function fetchSignLanguage(
  word: string,
  signal?: AbortSignal,
): Promise<SignLanguageEntry[]> {
  const cleanWord = word.trim();
  if (!cleanWord) return [];

  const timeoutSignal = AbortSignal.timeout(6000);
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutSignal])
    : timeoutSignal;

  try {
    const response = await fetch(
      `/api/v1/dictionary/words/${encodeURIComponent(cleanWord)}/sign-language`,
      {
        headers: { Accept: "application/json" },
        signal: combinedSignal,
      },
    );

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) return data;
      if (data && typeof data === "object" && Array.isArray(data.signLanguage)) {
        return data.signLanguage;
      }
    }
  } catch {
    // Network / offline fallback below
  }

  // Graceful fallback to mock data or empty array
  return MOCK_SIGN_LANGUAGE[cleanWord] ?? [];
}

export async function fetchTranslations(
  word: string,
  signal?: AbortSignal,
): Promise<TranslationItem[]> {
  const cleanWord = word.trim();
  if (!cleanWord) return [];

  const timeoutSignal = AbortSignal.timeout(6000);
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutSignal])
    : timeoutSignal;

  try {
    const response = await fetch(
      `/api/v1/dictionary/words/${encodeURIComponent(cleanWord)}/translations`,
      {
        headers: { Accept: "application/json" },
        signal: combinedSignal,
      },
    );

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return sortTranslations(data);
      }
      if (data && typeof data === "object" && Array.isArray(data.translations)) {
        return sortTranslations(data.translations);
      }
    }
  } catch {
    // Network / offline fallback below
  }

  // Graceful fallback to mock data or empty array
  const fallback = MOCK_TRANSLATIONS[cleanWord];
  return fallback ? sortTranslations(fallback) : [];
}

export async function fetchBraille(
  word: string,
  signal?: AbortSignal,
): Promise<BrailleData | null> {
  const cleanWord = word.trim();
  if (!cleanWord) return null;

  const timeoutSignal = AbortSignal.timeout(6000);
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutSignal])
    : timeoutSignal;

  try {
    const response = await fetch(
      `/api/v1/dictionary/words/${encodeURIComponent(cleanWord)}/braille`,
      {
        headers: { Accept: "application/json" },
        signal: combinedSignal,
      },
    );

    if (response.ok) {
      const data = await response.json();
      if (data && typeof data === "object" && data.brailleUnicode) {
        return data as BrailleData;
      }
    }
  } catch {
    // Network / offline fallback below
  }

  // Graceful fallback to high-accuracy client encoder
  return encodeThaiToBraille(cleanWord);
}

export async function decodeBrailleText(
  braille: string,
  signal?: AbortSignal,
): Promise<DecodedBrailleResult> {
  const clean = braille.trim();
  if (!clean) {
    return decodeBrailleToThai("");
  }

  const timeoutSignal = AbortSignal.timeout(6000);
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutSignal])
    : timeoutSignal;

  try {
    const response = await fetch("/api/v1/dictionary/braille/decode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ braille: clean }),
      signal: combinedSignal,
    });
    if (response.ok) {
      const data = await response.json();
      if (
        data &&
        typeof data === "object" &&
        typeof data.decodedText === "string"
      ) {
        return data as DecodedBrailleResult;
      }
    }
  } catch {
    // Network / offline fallback below
  }

  return decodeBrailleToThai(clean);
}


