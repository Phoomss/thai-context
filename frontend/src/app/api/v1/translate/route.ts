import { NextRequest, NextResponse } from "next/server";
import type {
  TranslateResult,
  ToneInfo,
  CulturalEtiquette,
  GenderVariant,
  SpeakerGender,
} from "@/lib/translate-types";

interface TranslationDatabaseEntry {
  th: string;
  en: string;
  secondaryEn?: string[];
  rtgs: string;
  ipa?: string;
  syllables: string[];
  tones: ToneInfo[];
  category: CulturalEtiquette["category"];
  politenessNote: string;
  waiGuidance?: string;
  krengJaiFactor?: string;
  registerDifference?: string;
  situationalTips?: string[];
  maleParticle?: string;
  femaleParticle?: string;
  examples: Array<{ th: string; en: string; rtgs: string }>;
  provenance: TranslateResult["provenance"];
  confidenceScore: number;
}

const TRANSLATION_DATABASE: TranslationDatabaseEntry[] = [
  // 1. GREETINGS & POLITENESS
  {
    th: "สวัสดี",
    en: "hello / greetings / goodbye",
    secondaryEn: ["good day", "hi", "peace and auspiciousness"],
    rtgs: "sa-wat-di",
    ipa: "/sa.wat.diː/",
    syllables: ["sa", "wat", "di"],
    tones: [
      { syllable: "sa", tone: "low", symbol: "↘", labelThai: "เอก", description: "Low tone, relaxed vocal cords" },
      { syllable: "wat", tone: "low", symbol: "↘", labelThai: "เอก", description: "Low tone, short stop vowel" },
      { syllable: "di", tone: "mid", symbol: "—", labelThai: "สามัญ", description: "Neutral mid pitch, regular voice" },
    ],
    category: "GREETING",
    politenessNote: "Universal Thai greeting for hello or goodbye. Always append ครับ (khrap) for men or ค่ะ (kha) for women in polite conversation.",
    waiGuidance: "Accompany with a polite 'Wai' (hands pressed together at chest level with slight head bow), especially when greeting elders, monks, or teachers.",
    krengJaiFactor: "Greeting first demonstrates warmth and mutual respect (สัมมาคารวะ).",
    registerDifference: "Universal across formal, business, and casual registers.",
    situationalTips: [
      "Say 'Sawasdee khrap' (male) or 'Sawasdee kha' (female) when entering a shop or meeting someone.",
      "Younger people or service receivers usually Wai first.",
    ],
    examples: [
      { th: "สวัสดีครับ ยินดีที่ได้รู้จัก", en: "Hello, nice to meet you.", rtgs: "sa-wat-di khrap, yin-di thi dai ru-jak" },
      { th: "สวัสดีค่ะ สบายดีไหมคะ", en: "Hello, how are you?", rtgs: "sa-wat-di kha, sa-bai-di mai kha" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },
  {
    th: "ขอบคุณ",
    en: "thank you / thanks",
    secondaryEn: ["grateful", "appreciate", "indebted"],
    rtgs: "khop-khun",
    ipa: "/kʰɔːp.kʰun/",
    syllables: ["khop", "khun"],
    tones: [
      { syllable: "khop", tone: "low", symbol: "↘", labelThai: "เอก", description: "Low tone, short stop sound" },
      { syllable: "khun", tone: "mid", symbol: "—", labelThai: "สามัญ", description: "Neutral mid pitch" },
    ],
    category: "GREETING",
    politenessNote: "Polite expression of gratitude. Men say 'ขอบคุณครับ' (khop-khun khrap); women say 'ขอบคุณค่ะ' (khop-khun kha).",
    waiGuidance: "Add a gentle Wai when thanking someone of higher social standing, elders, or for significant favors.",
    krengJaiFactor: "Core phrase reflecting 'ความซาบซึ้ง' (appreciation) for another's time and effort.",
    registerDifference: "Standard polite register. For very high respect use 'ขอบพระคุณ' (khop-phra-khun); close peer casual is 'ขอบใจ' (khop-jai, never use with elders or staff).",
    situationalTips: [
      "Use when receiving change, food at restaurants, or taxi rides.",
      "Adding ครับ/ค่ะ makes your Thai instantly sound courteous and native.",
    ],
    examples: [
      { th: "ขอบคุณมากครับสำหรับความช่วยเหลือ", en: "Thank you very much for your help.", rtgs: "khop-khun mak khrap sam-rap khwam chuai-luea" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },
  {
    th: "ขอโทษ",
    en: "sorry / excuse me / pardon",
    secondaryEn: ["apologize", "pardon me", "forgive me"],
    rtgs: "kho-thot",
    ipa: "/kʰɔ̌ː.tʰôːt/",
    syllables: ["kho", "thot"],
    tones: [
      { syllable: "kho", tone: "rising", symbol: "∨", labelThai: "จัตวา", description: "Starts mid-low, rises upwards" },
      { syllable: "thot", tone: "falling", symbol: "∧", labelThai: "โท", description: "Starts high, drops downwards" },
    ],
    category: "GREETING",
    politenessNote: "Multi-purpose phrase for apologizing, begging pardon, or politely getting someone's attention (e.g. at a table or walking through a crowd).",
    waiGuidance: "When apologizing for a mistake, bow slightly with hands folded in Wai at nose level.",
    krengJaiFactor: "Essential expression of 'เกรงใจ' (consideration) acknowledging any unintentional inconvenience caused.",
    registerDifference: "Polite standard: 'ขอโทษครับ/ค่ะ'. Formal letter: 'กราบขออภัย'.",
    situationalTips: [
      "To call a waiter politely: 'ขอโทษครับ/ค่ะ ขอเมนูหน่อยครับ' (Excuse me, may I see the menu?).",
      "When accidentally bumping into someone: 'ขอโทษครับ' with a polite nod.",
    ],
    examples: [
      { th: "ขอโทษนะคะ ห้องน้ำอยู่ที่ไหน", en: "Excuse me, where is the restroom?", rtgs: "kho-thot na kha, hong-nam yu thi-nai" },
      { th: "ขอโทษที่มาสายครับ", en: "Sorry for being late.", rtgs: "kho-thot thi ma sai khrap" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },
  {
    th: "ไม่เป็นไร",
    en: "no problem / you're welcome / it's alright",
    secondaryEn: ["don't mention it", "never mind", "it doesn't matter"],
    rtgs: "mai-pen-rai",
    ipa: "/mâj.pen.raj/",
    syllables: ["mai", "pen", "rai"],
    tones: [
      { syllable: "mai", tone: "falling", symbol: "∧", labelThai: "โท", description: "High starting pitch dropping down" },
      { syllable: "pen", tone: "mid", symbol: "—", labelThai: "สามัญ", description: "Even, neutral voice" },
      { syllable: "rai", tone: "mid", symbol: "—", labelThai: "สามัญ", description: "Even, neutral voice" },
    ],
    category: "CULTURE",
    politenessNote: "Thailand's iconic philosophy of resilience, forgiveness, and maintaining social harmony (ความสงบสุข).",
    waiGuidance: "Smile warmly when saying this to immediately put others at ease.",
    krengJaiFactor: "Used to dissolve awkwardness or reassure someone who just apologized or said thank you.",
    registerDifference: "Acceptable across all informal, semi-formal, and daily contexts.",
    situationalTips: [
      "Say this when someone thanks you or apologizes for a minor accident.",
      "Conveys a relaxed, generous, and easygoing Thai mindset (ใจเย็น).",
    ],
    examples: [
      { th: "ขอบคุณมากครับ - ไม่เป็นไรครับ ยินดีเสมอ", en: "Thank you so much. - You're welcome, always a pleasure.", rtgs: "khop-khun mak khrap - mai-pen-rai khrap yin-di sa-moe" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },
  {
    th: "เกรงใจ",
    en: "considerate / thoughtful deference / kreng jai",
    secondaryEn: ["reluctance to impose", "hesitant to bother others", "courteous respect"],
    rtgs: "kreng-jai",
    ipa: "/kreːŋ.tɕaj/",
    syllables: ["kreng", "jai"],
    tones: [
      { syllable: "kreng", tone: "mid", symbol: "—", labelThai: "สามัญ", description: "Neutral mid pitch" },
      { syllable: "jai", tone: "mid", symbol: "—", labelThai: "สามัญ", description: "Neutral mid pitch" },
    ],
    category: "CULTURE",
    politenessNote: "A quintessential Thai cultural pillar with no single English word. It means feeling reluctant to impose, burden, or cause discomfort to someone else.",
    waiGuidance: "Often accompanied by gentle body language, lowering posture, and speaking softly.",
    krengJaiFactor: "The bedrock of Thai social etiquette. Refusing an initial offer out of modesty or not asking for help until necessary is common 'Kreng Jai'.",
    registerDifference: "Understood and respected everywhere in Thai culture from family to boardroom.",
    situationalTips: [
      "If a host offers a generous treat, saying 'เกรงใจจังครับ' (I feel shy to burden you so much) shows high manners.",
    ],
    examples: [
      { th: "เกรงใจจังเลยครับ ขอบคุณมากๆ", en: "I feel so bad to trouble you! Thank you very much.", rtgs: "kreng-jai chang loei khrap, khop-khun mak-mak" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },
  {
    th: "สบายดีไหม",
    en: "how are you? / are you well?",
    secondaryEn: ["how's everything?", "are you healthy?"],
    rtgs: "sa-bai-di-mai",
    ipa: "/sa.baːj.diː.mǎj/",
    syllables: ["sa", "bai", "di", "mai"],
    tones: [
      { syllable: "sa", tone: "low", symbol: "↘", labelThai: "เอก", description: "Low tone" },
      { syllable: "bai", tone: "mid", symbol: "—", labelThai: "สามัญ", description: "Mid tone" },
      { syllable: "di", tone: "mid", symbol: "—", labelThai: "สามัญ", description: "Mid tone" },
      { syllable: "mai", tone: "rising", symbol: "∨", labelThai: "จัตวา", description: "Question pitch rising up" },
    ],
    category: "GREETING",
    politenessNote: "Standard inquiry into someone's well-being. Add ครับ/ค่ะ at the end.",
    waiGuidance: "Often follows an initial greeting with a polite smile.",
    krengJaiFactor: "Friendly inquiry into welfare.",
    registerDifference: "Standard polite: สบายดีไหมครับ/ค่ะ. Informal peer: เป็นไงบ้าง (pen ngai bang).",
    situationalTips: [
      "Typical answer: 'สบายดีครับ' (I am doing well) or 'เรื่อยๆ ครับ' (So-so / usual).",
    ],
    examples: [
      { th: "สวัสดีครับ สบายดีไหมครับ", en: "Hello, how are you doing?", rtgs: "sa-wat-di khrap, sa-bai-di mai khrap" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },
  {
    th: "ยินดีที่ได้รู้จัก",
    en: "nice to meet you / pleased to meet you",
    secondaryEn: ["glad to make your acquaintance"],
    rtgs: "yin-di-thi-dai-ru-jak",
    ipa: "/jin.diː.tʰîː.dâːj.rúː.tɕàk/",
    syllables: ["yin", "di", "thi", "dai", "ru", "jak"],
    tones: [
      { syllable: "yin", tone: "mid", symbol: "—", labelThai: "สามัญ", description: "Mid" },
      { syllable: "di", tone: "mid", symbol: "—", labelThai: "สามัญ", description: "Mid" },
      { syllable: "thi", tone: "falling", symbol: "∧", labelThai: "โท", description: "Falling" },
      { syllable: "dai", tone: "falling", symbol: "∧", labelThai: "โท", description: "Falling" },
      { syllable: "ru", tone: "high", symbol: "↗", labelThai: "ตรี", description: "High" },
      { syllable: "jak", tone: "low", symbol: "↘", labelThai: "เอก", description: "Low" },
    ],
    category: "GREETING",
    politenessNote: "Polite phrase when meeting someone for the first time in personal or business settings.",
    waiGuidance: "Combine with a courteous Wai to make an outstanding first impression.",
    krengJaiFactor: "Establishes a friendly, respectful relationship foundation.",
    registerDifference: "Warm and universally appreciated across business and social settings.",
    situationalTips: [
      "Reply with: 'เช่นกันครับ/ค่ะ' (Likewise / Same here!).",
    ],
    examples: [
      { th: "ยินดีที่ได้รู้จักครับ ผมชื่ออเล็กซ์ครับ", en: "Pleased to meet you. My name is Alex.", rtgs: "yin-di-thi-dai-ru-jak khrap, phom chue Alex khrap" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },

  // 2. FOOD, DINING & STREET FOOD
  {
    th: "ไม่เผ็ด",
    en: "not spicy / no spice",
    secondaryEn: ["mild", "non-spicy"],
    rtgs: "mai-phet",
    ipa: "/mâj.pʰèt/",
    syllables: ["mai", "phet"],
    tones: [
      { syllable: "mai", tone: "falling", symbol: "∧", labelThai: "โท", description: "Falling tone" },
      { syllable: "phet", tone: "low", symbol: "↘", labelThai: "เอก", description: "Low tone with short stop" },
    ],
    category: "FOOD",
    politenessNote: "Essential phrase for travelers dining in Thailand. Traditional Thai food default is very spicy (พริกหลายเม็ด).",
    waiGuidance: "Say clearly to the cook or server with a smile: 'ไม่เผ็ดนะครับ/คะ'.",
    krengJaiFactor: "Thai vendors are very happy to adjust spice levels to guest preference.",
    registerDifference: "Street food, local restaurants, and fine dining.",
    situationalTips: [
      "To request completely no chili: 'ไม่ใส่พริกเลยครับ' (mai sai phrik loei khrap).",
      "For just a little spice: 'เผ็ดน้อย' (phet noi).",
    ],
    examples: [
      { th: "ขอส้มตำไทย ไม่เผ็ดนะครับ", en: "May I have Papaya Salad, not spicy please.", rtgs: "kho som-tam thai, mai-phet na khrap" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },
  {
    th: "เผ็ดน้อย",
    en: "a little spicy / mild spice",
    secondaryEn: ["low chili", "lightly spiced"],
    rtgs: "phet-noi",
    ipa: "/pʰèt.nɔ́ːj/",
    syllables: ["phet", "noi"],
    tones: [
      { syllable: "phet", tone: "low", symbol: "↘", labelThai: "เอก", description: "Low tone" },
      { syllable: "noi", tone: "high", symbol: "↗", labelThai: "ตรี", description: "High tone" },
    ],
    category: "FOOD",
    politenessNote: "Perfect compromise if you want authentic Thai aroma with just 1 chili.",
    waiGuidance: "Polite dining request.",
    krengJaiFactor: "Helpful hint for chefs.",
    registerDifference: "Common across all food stalls and restaurants.",
    situationalTips: [
      "Thai 'เผ็ดน้อย' might still have 1-2 bird's eye chilies. If very sensitive, choose 'ไม่เผ็ด' (mai phet).",
    ],
    examples: [
      { th: "ข้าวกะเพราไก่ เผ็ดน้อย ไข่ดาวครับ", en: "Chicken basil rice, mild spicy with fried egg please.", rtgs: "khao ka-phrao kai, phet-noi khai-dao khrap" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },
  {
    th: "อร่อย",
    en: "delicious / tasty / yummy",
    secondaryEn: ["flavorful", "savory", "delightful taste"],
    rtgs: "a-roi",
    ipa: "/ʔa.rɔ̀j/",
    syllables: ["a", "roi"],
    tones: [
      { syllable: "a", tone: "low", symbol: "↘", labelThai: "เอก", description: "Low tone" },
      { syllable: "roi", tone: "low", symbol: "↘", labelThai: "เอก", description: "Low tone" },
    ],
    category: "FOOD",
    politenessNote: "Complimenting the cook or host will light up their face! Add 'มาก' (mak) for 'very delicious'.",
    waiGuidance: "Giving a thumbs up or smiling while saying 'อร่อยมากครับ' creates instant goodwill.",
    krengJaiFactor: "Shows appreciation for Thai hospitality.",
    registerDifference: "Universal standard Thai. Regional equivalents: 'ลำ' (North), 'แซ่บ' (Isan), 'หรอย' (South).",
    situationalTips: [
      "Say 'อร่อยมากครับ/ค่ะ' when finishing your meal or when the chef checks on your table.",
    ],
    examples: [
      { th: "อาหารไทยอร่อยมากครับ", en: "Thai food is very delicious.", rtgs: "a-han thai a-roi mak khrap" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },
  {
    th: "เช็คบิล",
    en: "check please / bill please",
    secondaryEn: ["the check", "can I pay?", "get the tab"],
    rtgs: "chek-bin",
    ipa: "/tɕʰék.bin/",
    syllables: ["chek", "bin"],
    tones: [
      { syllable: "chek", tone: "high", symbol: "↗", labelThai: "ตรี", description: "High tone (from English 'check')" },
      { syllable: "bin", tone: "mid", symbol: "—", labelThai: "สามัญ", description: "Mid tone (from English 'bill')" },
    ],
    category: "FOOD",
    politenessNote: "Most common phrase to ask for the bill at restaurants and cafes. Say: 'เช็คบิลด้วยครับ/ค่ะ'.",
    waiGuidance: "Make eye contact and raise your index finger slightly to summon the staff politely.",
    krengJaiFactor: "Courteous closing of the meal.",
    registerDifference: "Everyday restaurants use 'เช็คบิล' (chek-bin) or 'เก็บเงินด้วย' (kep-ngoen duai). Highly formal: 'คิดเงินด้วยครับ'.",
    situationalTips: [
      "In Thailand, customers usually ask the waiter to bring the bill folder to the table rather than walking directly to the register (except at food courts and coffee chains).",
    ],
    examples: [
      { th: "น้องครับ เช็คบิลด้วยครับ", en: "Excuse me, bill please.", rtgs: "nong khrap, chek-bin duai khrap" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },
  {
    th: "มังสวิรัติ",
    en: "vegetarian",
    secondaryEn: ["meatless", "plant-based diet"],
    rtgs: "mang-sa-wi-rat",
    ipa: "/maŋ.sa.wí.rát/",
    syllables: ["mang", "sa", "wi", "rat"],
    tones: [
      { syllable: "mang", tone: "mid", symbol: "—", labelThai: "สามัญ", description: "Mid tone" },
      { syllable: "sa", tone: "low", symbol: "↘", labelThai: "เอก", description: "Low tone" },
      { syllable: "wi", tone: "high", symbol: "↗", labelThai: "ตรี", description: "High tone" },
      { syllable: "rat", tone: "high", symbol: "↗", labelThai: "ตรี", description: "High tone" },
    ],
    category: "FOOD",
    politenessNote: "Indicates vegetarian food (no meat, but may include eggs, milk, fish sauce unless specified).",
    waiGuidance: "Inform the staff before ordering.",
    krengJaiFactor: "Clear dietary communication.",
    registerDifference: "Formal standard word. For strict vegan (no eggs, no dairy, no fish sauce, no garlic/onions), use 'เจ' (je).",
    situationalTips: [
      "To avoid fish sauce explicitly: 'ไม่ใส่น้ำปลา' (mai sai nam-pla).",
    ],
    examples: [
      { th: "มีเมนูมังสวิรัติไหมครับ", en: "Do you have a vegetarian menu?", rtgs: "mi me-nu mang-sa-wi-rat mai khrap" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },
  {
    th: "หวานน้อย",
    en: "less sweet / low sugar",
    secondaryEn: ["not too sweet", "little sugar"],
    rtgs: "wan-noi",
    ipa: "/wǎːn.nɔ́ːj/",
    syllables: ["wan", "noi"],
    tones: [
      { syllable: "wan", tone: "rising", symbol: "∨", labelThai: "จัตวา", description: "Rising tone" },
      { syllable: "noi", tone: "high", symbol: "↗", labelThai: "ตรี", description: "High tone" },
    ],
    category: "FOOD",
    politenessNote: "Critical phrase when ordering Thai milk tea (ชาไทย), iced coffee (กาแฟเย็น), or fruit smoothies, which are very sweet by default.",
    waiGuidance: "Specify when ordering at the beverage counter.",
    krengJaiFactor: "Personal taste preference.",
    registerDifference: "Widely used across all Thai cafes and boba shops.",
    situationalTips: [
      "For zero sugar: 'ไม่หวานเลย' (mai wan loei) or 'ไม่ใส่น้ำเชื่อม' (mai sai nam-chueam).",
    ],
    examples: [
      { th: "ชาไทยเย็น หวานน้อย แก้วหนึ่งครับ", en: "One iced Thai tea, less sweet please.", rtgs: "cha thai yen, wan-noi kaeo nueng khrap" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },
  {
    th: "น้ำเปล่า",
    en: "plain drinking water / bottled water",
    secondaryEn: ["still water", "unflavored water"],
    rtgs: "nam-plao",
    ipa: "/nám.plàw/",
    syllables: ["nam", "plao"],
    tones: [
      { syllable: "nam", tone: "high", symbol: "↗", labelThai: "ตรี", description: "High tone" },
      { syllable: "plao", tone: "low", symbol: "↘", labelThai: "เอก", description: "Low tone" },
    ],
    category: "FOOD",
    politenessNote: "Plain drinking water. In Thailand, ice is served separately: 'น้ำแข็ง' (nam-khaeng).",
    waiGuidance: "Standard beverage order.",
    krengJaiFactor: "Everyday dining staple.",
    registerDifference: "Standard dining register.",
    situationalTips: [
      "Add 'ขอน้ำแข็งด้วย' (kho nam-khaeng duai) if you'd like a glass with ice.",
    ],
    examples: [
      { th: "ขอน้ำเปล่าหนึ่งขวดครับ", en: "May I have one bottle of water please?", rtgs: "kho nam-plao nueng khuat khrap" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },

  // 3. TRANSPORTATION & GETTING AROUND
  {
    th: "ห้องน้ำ",
    en: "restroom / bathroom / toilet",
    secondaryEn: ["lavatory", "washroom", "WC"],
    rtgs: "hong-nam",
    ipa: "/hɔ̂ŋ.nám/",
    syllables: ["hong", "nam"],
    tones: [
      { syllable: "hong", tone: "falling", symbol: "∧", labelThai: "โท", description: "Falling tone" },
      { syllable: "nam", tone: "high", symbol: "↗", labelThai: "ตรี", description: "High tone" },
    ],
    category: "TRAVEL",
    politenessNote: "Compound word: ห้อง (room) + น้ำ (water). Polite standard term used everywhere.",
    waiGuidance: "Ask politely: 'ขอโทษครับ ห้องน้ำอยู่ที่ไหนครับ'.",
    krengJaiFactor: "Common public inquiry.",
    registerDifference: "Standard polite term. Formal written sign: 'สุขา' (su-kha).",
    situationalTips: [
      "In some traditional local temples or rural bus stops, remember to remove shoes outside or bring tissues.",
    ],
    examples: [
      { th: "ขอโทษครับ ห้องน้ำอยู่ที่ไหนครับ", en: "Excuse me, where is the restroom?", rtgs: "kho-thot khrap, hong-nam yu thi-nai khrap" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },
  {
    th: "ไปสนามบิน",
    en: "go to the airport",
    secondaryEn: ["to the airport", "head towards airport"],
    rtgs: "pai sa-nam-bin",
    ipa: "/paj.sa.nǎːm.bin/",
    syllables: ["pai", "sa", "nam", "bin"],
    tones: [
      { syllable: "pai", tone: "mid", symbol: "—", labelThai: "สามัญ", description: "Mid" },
      { syllable: "sa", tone: "low", symbol: "↘", labelThai: "เอก", description: "Low" },
      { syllable: "nam", tone: "rising", symbol: "∨", labelThai: "จัตวา", description: "Rising" },
      { syllable: "bin", tone: "mid", symbol: "—", labelThai: "สามัญ", description: "Mid" },
    ],
    category: "TRAVEL",
    politenessNote: "Direction for taxi drivers. Bangkok has two airports: Suvarnabhumi (สุวรรณภูมิ) and Don Mueang (ดอนเมือง).",
    waiGuidance: "State your destination when boarding the taxi.",
    krengJaiFactor: "Clear transit communication.",
    registerDifference: "Everyday transit instruction.",
    situationalTips: [
      "Be sure to specify: 'สุวรรณภูมิ' (Suvarnabhumi) or 'ดอนเมือง' (Don Mueang).",
    ],
    examples: [
      { th: "ไปสนามบินสุวรรณภูมิครับ", en: "To Suvarnabhumi Airport please.", rtgs: "pai sa-nam-bin su-wan-na-phum khrap" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },
  {
    th: "เปิดมิเตอร์",
    en: "use the meter / turn on the meter",
    secondaryEn: ["meter please", "by the meter"],
    rtgs: "poet-mi-toe",
    ipa: "/pɤ̀ːt.míː.tɤ̂ː/",
    syllables: ["poet", "mi", "toe"],
    tones: [
      { syllable: "poet", tone: "low", symbol: "↘", labelThai: "เอก", description: "Low" },
      { syllable: "mi", tone: "high", symbol: "↗", labelThai: "ตรี", description: "High" },
      { syllable: "toe", tone: "falling", symbol: "∧", labelThai: "โท", description: "Falling" },
    ],
    category: "TRAVEL",
    politenessNote: "By Thai law, Bangkok meter taxis must use the meter. Say: 'ช่วยเปิดมิเตอร์ด้วยครับ/ค่ะ' (Please turn on the meter).",
    waiGuidance: "Stay calm, polite, and friendly.",
    krengJaiFactor: "Asserting a fair and transparent standard.",
    registerDifference: "Everyday taxi interaction.",
    situationalTips: [
      "If a driver insists on flat rate (ราคาเหมา) without a meter in Bangkok, politely decline and wait for the next taxi.",
    ],
    examples: [
      { th: "ช่วยเปิดมิเตอร์ด้วยนะครับ ขอบคุณครับ", en: "Please turn on the meter, thank you.", rtgs: "chuai poet-mi-toe duai na khrap, khop-khun khrap" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },
  {
    th: "เลี้ยวซ้าย",
    en: "turn left",
    secondaryEn: ["make a left turn"],
    rtgs: "liao-sai",
    ipa: "/líaw.sáj/",
    syllables: ["liao", "sai"],
    tones: [
      { syllable: "liao", tone: "high", symbol: "↗", labelThai: "ตรี", description: "High tone" },
      { syllable: "sai", tone: "high", symbol: "↗", labelThai: "ตรี", description: "High tone" },
    ],
    category: "TRAVEL",
    politenessNote: "Direction instruction for driving, walking, or giving directions to a cab driver.",
    waiGuidance: "Point gently with open palm if needed.",
    krengJaiFactor: "Directional navigation.",
    registerDifference: "Standard Thai across all regions.",
    situationalTips: [
      "Complement: 'เลี้ยวขวา' (liao khwa - turn right); 'ตรงไป' (trong pai - go straight).",
    ],
    examples: [
      { th: "ข้างหน้าให้เลี้ยวซ้ายครับ", en: "Turn left up ahead please.", rtgs: "khang-na hai liao-sai khrap" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },
  {
    th: "เลี้ยวขวา",
    en: "turn right",
    secondaryEn: ["make a right turn"],
    rtgs: "liao-khwa",
    ipa: "/líaw.kʰwǎː/",
    syllables: ["liao", "khwa"],
    tones: [
      { syllable: "liao", tone: "high", symbol: "↗", labelThai: "ตรี", description: "High tone" },
      { syllable: "khwa", tone: "rising", symbol: "∨", labelThai: "จัตวา", description: "Rising tone" },
    ],
    category: "TRAVEL",
    politenessNote: "Standard directional cue.",
    waiGuidance: "Standard polite instruction.",
    krengJaiFactor: "Clear navigation.",
    registerDifference: "Standard Thai.",
    situationalTips: [
      "Opposite of 'เลี้ยวซ้าย' (turn left).",
    ],
    examples: [
      { th: "ถึงแยกแล้วเลี้ยวขวาครับ", en: "At the intersection, please turn right.", rtgs: "thueng yaek laeo liao-khwa khrap" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },
  {
    th: "จอดตรงนี้",
    en: "stop here / pull over here",
    secondaryEn: ["drop me off here", "stop right here"],
    rtgs: "jot trong-ni",
    ipa: "/tɕɔ̀ːt.troŋ.níː/",
    syllables: ["jot", "trong", "ni"],
    tones: [
      { syllable: "jot", tone: "low", symbol: "↘", labelThai: "เอก", description: "Low" },
      { syllable: "trong", tone: "mid", symbol: "—", labelThai: "สามัญ", description: "Mid" },
      { syllable: "ni", tone: "high", symbol: "↗", labelThai: "ตรี", description: "High" },
    ],
    category: "TRAVEL",
    politenessNote: "Phrase to tell taxi, tuk-tuk, or songthaew driver where to stop.",
    waiGuidance: "Say ahead of time with a pleasant tone: 'จอดตรงนี้ครับ/ค่ะ'.",
    krengJaiFactor: "Timely notification prevents sudden braking.",
    registerDifference: "Common transit instruction.",
    situationalTips: [
      "Say it about 20-30 meters before your actual destination to give the driver room to pull over safely.",
    ],
    examples: [
      { th: "จอดตรงนี้ได้เลยครับ ขอบคุณครับ", en: "You can pull over right here, thank you.", rtgs: "jot trong-ni dai loei khrap, khop-khun khrap" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },

  // 4. SHOPPING & BARGAINING
  {
    th: "เท่าไหร่",
    en: "how much? / what is the price?",
    secondaryEn: ["how many?", "cost"],
    rtgs: "thao-rai",
    ipa: "/tʰâw.ràj/",
    syllables: ["thao", "rai"],
    tones: [
      { syllable: "thao", tone: "falling", symbol: "∧", labelThai: "โท", description: "Falling tone" },
      { syllable: "rai", tone: "low", symbol: "↘", labelThai: "เอก", description: "Low tone" },
    ],
    category: "SHOPPING",
    politenessNote: "Crucial shopping question: 'อันนี้เท่าไหร่ครับ/ค่ะ' (How much is this one?).",
    waiGuidance: "Polite shopping query.",
    krengJaiFactor: "Clear commercial pricing question.",
    registerDifference: "Everyday retail, night markets, and street vendors.",
    situationalTips: [
      "In malls, prices are fixed. In open night markets, bargaining with a friendly smile is welcomed.",
    ],
    examples: [
      { th: "เสื้อตัวนี้ราคาเท่าไหร่ครับ", en: "How much is this shirt?", rtgs: "suea tua ni ra-kha thao-rai khrap" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },
  {
    th: "ลดหน่อยได้ไหม",
    en: "can you give a discount? / could you lower the price?",
    secondaryEn: ["can it be cheaper?", "any discount?"],
    rtgs: "lot-noi-dai-mai",
    ipa: "/lót.nɔ̀ːj.dâːj.mǎj/",
    syllables: ["lot", "noi", "dai", "mai"],
    tones: [
      { syllable: "lot", tone: "high", symbol: "↗", labelThai: "ตรี", description: "High" },
      { syllable: "noi", tone: "low", symbol: "↘", labelThai: "เอก", description: "Low" },
      { syllable: "dai", tone: "falling", symbol: "∧", labelThai: "โท", description: "Falling" },
      { syllable: "mai", tone: "rising", symbol: "∨", labelThai: "จัตวา", description: "Rising" },
    ],
    category: "SHOPPING",
    politenessNote: "Always bargain with good humor and a warm smile. If buying 2 or 3 items, discounts are much more likely!",
    waiGuidance: "A polite, friendly demeanor is the secret to getting great market deals.",
    krengJaiFactor: "Don't push too aggressively if a vendor politely declines.",
    registerDifference: "Night markets, flea markets, souvenir shops. Never use in supermarkets or department stores.",
    situationalTips: [
      "Say: 'ซื้อสองตัว ลดหน่อยได้ไหมครับ' (If I buy two, can you give a discount?).",
    ],
    examples: [
      { th: "ลดหน่อยได้ไหมครับ พอดีซื้อสามชิ้นเลย", en: "Can you give a little discount? I'm buying three pieces.", rtgs: "lot-noi dai mai khrap, pho-di sue sam chin loei" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },
  {
    th: "สแกนจ่าย",
    en: "scan to pay / promptpay QR payment",
    secondaryEn: ["QR payment", "digital payment"],
    rtgs: "sa-kaen-chai",
    ipa: "/sa.kɛːn.tɕàːj/",
    syllables: ["sa", "kaen", "chai"],
    tones: [
      { syllable: "sa", tone: "mid", symbol: "—", labelThai: "สามัญ", description: "Mid" },
      { syllable: "kaen", tone: "mid", symbol: "—", labelThai: "สามัญ", description: "Mid" },
      { syllable: "chai", tone: "low", symbol: "↘", labelThai: "เอก", description: "Low" },
    ],
    category: "SHOPPING",
    politenessNote: "Thailand is almost completely cashless via PromptPay QR codes. Even street fruit carts accept QR scan!",
    waiGuidance: "Show your phone screen to the vendor.",
    krengJaiFactor: "Fast modern checkout.",
    registerDifference: "Everyday modern Thai slang/usage.",
    situationalTips: [
      "Ask: 'สแกนจ่ายได้ไหมครับ' (Can I scan to pay?).",
    ],
    examples: [
      { th: "ที่นี่สแกนจ่ายได้ไหมครับ", en: "Can I pay by QR scan here?", rtgs: "thi-ni sa-kaen-chai dai mai khrap" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },

  // 5. EMERGENCY & HEALTH
  {
    th: "ช่วยด้วย",
    en: "help! / help me!",
    secondaryEn: ["emergency assistance", "please help"],
    rtgs: "chuai-duai",
    ipa: "/tɕʰûaj.dûaj/",
    syllables: ["chuai", "duai"],
    tones: [
      { syllable: "chuai", tone: "falling", symbol: "∧", labelThai: "โท", description: "Falling tone" },
      { syllable: "duai", tone: "falling", symbol: "∧", labelThai: "โท", description: "Falling tone" },
    ],
    category: "HEALTH",
    politenessNote: "Universal emergency cry for immediate help. Thai bystanders will rush to assist.",
    waiGuidance: "Emergency call.",
    krengJaiFactor: "Urgent need.",
    registerDifference: "Emergency phrase.",
    situationalTips: [
      "Tourist Police hotline in Thailand is 1155 (English speaking). Emergency medical is 1669.",
    ],
    examples: [
      { th: "ช่วยด้วยครับ! มีคนเป็นลม", en: "Help! Someone has fainted!", rtgs: "chuai-duai khrap! mi khon pen-lom" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },
  {
    th: "โรงพยาบาล",
    en: "hospital",
    secondaryEn: ["medical center", "clinic"],
    rtgs: "rong-pha-ya-ban",
    ipa: "/roːŋ.pʰa.jaː.baːn/",
    syllables: ["rong", "pha", "ya", "ban"],
    tones: [
      { syllable: "rong", tone: "mid", symbol: "—", labelThai: "สามัญ", description: "Mid" },
      { syllable: "pha", tone: "high", symbol: "↗", labelThai: "ตรี", description: "High" },
      { syllable: "ya", tone: "mid", symbol: "—", labelThai: "สามัญ", description: "Mid" },
      { syllable: "ban", tone: "mid", symbol: "—", labelThai: "สามัญ", description: "Mid" },
    ],
    category: "HEALTH",
    politenessNote: "Compound word: โรง (hall/facility) + พยาบาล (nursing/care). Standard term for hospital.",
    waiGuidance: "Medical destination.",
    krengJaiFactor: "Essential healthcare landmark.",
    registerDifference: "Standard formal and daily word.",
    situationalTips: [
      "Tell a taxi driver: 'ไปโรงพยาบาลที่ใกล้ที่สุดครับ' (To the nearest hospital please).",
    ],
    examples: [
      { th: "ช่วยพาไปโรงพยาบาลหน่อยครับ", en: "Please take me to a hospital.", rtgs: "chuai pha pai rong-pha-ya-ban noi khrap" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },
  {
    th: "แพ้ถั่ว",
    en: "allergic to peanuts / nut allergy",
    secondaryEn: ["allergic to nuts", "cannot eat peanuts"],
    rtgs: "phae-thua",
    ipa: "/pʰɛ́ː.tʰùa/",
    syllables: ["phae", "thua"],
    tones: [
      { syllable: "phae", tone: "high", symbol: "↗", labelThai: "ตรี", description: "High tone" },
      { syllable: "thua", tone: "low", symbol: "↘", labelThai: "เอก", description: "Low tone" },
    ],
    category: "HEALTH",
    politenessNote: "Vital for food safety. Peanuts (ถั่วลิสง) are ubiquitous in Pad Thai, Som Tum, and satay sauces.",
    waiGuidance: "Show this card or phrase to the vendor when ordering food.",
    krengJaiFactor: "Medical safety communication.",
    registerDifference: "Health and dining warning.",
    situationalTips: [
      "Tell the server: 'ผม/ฉันแพ้ถั่ว อย่าใส่ถั่วนะครับ/คะ' (I am allergic to peanuts, please do not add peanuts).",
    ],
    examples: [
      { th: "ผมแพ้ถั่วอย่างรุนแรง ไม่ใส่ถั่วทุกชนิดนะครับ", en: "I have a severe peanut allergy, please no nuts of any kind.", rtgs: "phom phae-thua yang run-raeng, mai sai thua thuk cha-nit na khrap" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },

  // 6. BUSINESS & OFFICIAL TERMINOLOGY
  {
    th: "ประสิทธิภาพ",
    en: "efficiency / competence / productivity",
    secondaryEn: ["operational capability", "streamlined execution"],
    rtgs: "pra-sit-thi-phap",
    ipa: "/pra.sìt.tʰí.pʰâːp/",
    syllables: ["pra", "sit", "thi", "phap"],
    tones: [
      { syllable: "pra", tone: "low", symbol: "↘", labelThai: "เอก", description: "Low" },
      { syllable: "sit", tone: "low", symbol: "↘", labelThai: "เอก", description: "Low" },
      { syllable: "thi", tone: "high", symbol: "↗", labelThai: "ตรี", description: "High" },
      { syllable: "phap", tone: "falling", symbol: "∧", labelThai: "โท", description: "Falling" },
    ],
    category: "BUSINESS",
    politenessNote: "Official Royal Society coined term emphasizing maximum output with minimal waste of resources or time.",
    waiGuidance: "Formal executive discourse.",
    krengJaiFactor: "Contrasts with 'ประสิทธิผล' (effectiveness - outcome achievement).",
    registerDifference: "Official, academic, governmental, and corporate registers.",
    situationalTips: [
      "Frequently used in business presentations, research papers, and administrative plans.",
    ],
    examples: [
      { th: "การเพิ่มประสิทธิภาพในการทำงาน", en: "Enhancing workplace efficiency.", rtgs: "kan phoem pra-sit-thi-phap nai kan tham-ngan" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },
  {
    th: "ประสิทธิผล",
    en: "effectiveness / efficacy",
    secondaryEn: ["goal achievement", "fruitfulness"],
    rtgs: "pra-sit-thi-phon",
    ipa: "/pra.sìt.tʰí.pʰǒn/",
    syllables: ["pra", "sit", "thi", "phon"],
    tones: [
      { syllable: "pra", tone: "low", symbol: "↘", labelThai: "เอก", description: "Low" },
      { syllable: "sit", tone: "low", symbol: "↘", labelThai: "เอก", description: "Low" },
      { syllable: "thi", tone: "high", symbol: "↗", labelThai: "ตรี", description: "High" },
      { syllable: "phon", tone: "rising", symbol: "∨", labelThai: "จัตวา", description: "Rising" },
    ],
    category: "BUSINESS",
    politenessNote: "Official term emphasizing the achievement of intended outcomes and targets, regardless of resource spent.",
    waiGuidance: "Official and academic register.",
    krengJaiFactor: "Focus on results and impact.",
    registerDifference: "Strategic planning, public policy, and organizational evaluation.",
    situationalTips: [
      "Pair with 'ประสิทธิภาพ' to express both doing things right and doing the right things.",
    ],
    examples: [
      { th: "โครงการนี้มีประสิทธิผลอย่างชัดเจน", en: "This project demonstrated clear effectiveness.", rtgs: "khrong-kan ni mi pra-sit-thi-phon yang chat-chen" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },
  {
    th: "ความร่วมมือ",
    en: "cooperation / collaboration / mutual partnership",
    secondaryEn: ["teamwork", "joint effort", "alliance"],
    rtgs: "khwam-ruam-mue",
    ipa: "/kʰwaːm.rûam.mɯː/",
    syllables: ["khwam", "ruam", "mue"],
    tones: [
      { syllable: "khwam", tone: "mid", symbol: "—", labelThai: "สามัญ", description: "Mid" },
      { syllable: "ruam", tone: "falling", symbol: "∧", labelThai: "โท", description: "Falling" },
      { syllable: "mue", tone: "mid", symbol: "—", labelThai: "สามัญ", description: "Mid" },
    ],
    category: "BUSINESS",
    politenessNote: "High-value business concept in Thai corporate culture. Emphasizes harmony, mutual benefit, and long-term relationships.",
    waiGuidance: "Express gratitude for collaboration with a Wai during meetings.",
    krengJaiFactor: "Core diplomatic and commercial value.",
    registerDifference: "Business, diplomatic, and organizational partnerships.",
    situationalTips: [
      "Say: 'ขอบคุณสำหรับความร่วมมือครับ/ค่ะ' (Thank you for your cooperation/collaboration).",
    ],
    examples: [
      { th: "ยินดีที่ได้รับความร่วมมือจากทุกท่านครับ", en: "Delighted to receive cooperation from everyone.", rtgs: "yin-di thi dai-rap khwam-ruam-mue chak thuk-than khrap" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },
  {
    th: "นวัตกรรม",
    en: "innovation / novelty / breakthrough",
    secondaryEn: ["modernization", "cutting-edge advancement"],
    rtgs: "na-wat-ta-kam",
    ipa: "/na.wát.tá.kam/",
    syllables: ["na", "wat", "ta", "kam"],
    tones: [
      { syllable: "na", tone: "high", symbol: "↗", labelThai: "ตรี", description: "High" },
      { syllable: "wat", tone: "high", symbol: "↗", labelThai: "ตรี", description: "High" },
      { syllable: "ta", tone: "low", symbol: "↘", labelThai: "เอก", description: "Low" },
      { syllable: "kam", tone: "mid", symbol: "—", labelThai: "สามัญ", description: "Mid" },
    ],
    category: "BUSINESS",
    politenessNote: "Royal Society coined term for technological, artistic, and commercial innovations.",
    waiGuidance: "Modern tech and business register.",
    krengJaiFactor: "Implies forward-looking progress.",
    registerDifference: "Used across government tech grants, startup pitches, and corporate research.",
    situationalTips: [
      "Key buzzword in Thailand 4.0 and digital transformation.",
    ],
    examples: [
      { th: "การส่งเสริมนวัตกรรมสู่ระดับสากล", en: "Promoting innovation on an international level.", rtgs: "kan song-soem na-wat-ta-kam su ra-dap sa-kon" },
    ],
    provenance: "OFFICIAL_CURATED",
    confidenceScore: 1.0,
  },
];

// Transliteration map for English phonetic spelling variants to target entries
const ROMANIZED_LOOKUP: Record<string, string> = {
  sawasdee: "สวัสดี",
  sawadee: "สวัสดี",
  sawatdee: "สวัสดี",
  swatdi: "สวัสดี",
  khopkhun: "ขอบคุณ",
  kopkun: "ขอบคุณ",
  khobkhun: "ขอบคุณ",
  khothot: "ขอโทษ",
  kothot: "ขอโทษ",
  maipenrai: "ไม่เป็นไร",
  krengjai: "เกรงใจ",
  sabaideemai: "สบายดีไหม",
  yindee: "ยินดีที่ได้รู้จัก",
  aroi: "อร่อย",
  maiphet: "ไม่เผ็ด",
  chekbin: "เช็คบิล",
  hongnam: "ห้องน้ำ",
  chuaiduai: "ช่วยด้วย",
};

function buildGenderVariants(th: string, rtgs: string): GenderVariant {
  const maleText = th.endsWith("ครับ") || th.endsWith("ค่ะ") ? th : `${th}ครับ`;
  const femaleText = th.endsWith("ครับ") || th.endsWith("ค่ะ") ? th : `${th}ค่ะ`;
  return {
    male: {
      text: maleText,
      rtgs: `${rtgs} khrap`,
      particle: "ครับ (khrap)",
    },
    female: {
      text: femaleText,
      rtgs: `${rtgs} kha`,
      particle: "ค่ะ / คะ (kha)",
    },
  };
}

function matchEntry(query: string): TranslationDatabaseEntry | null {
  const clean = query.trim().toLowerCase();
  if (!clean) return null;

  // 1. Direct Thai match
  for (const entry of TRANSLATION_DATABASE) {
    if (entry.th === query.trim()) return entry;
  }

  // 2. Direct English primary or secondary match
  for (const entry of TRANSLATION_DATABASE) {
    if (entry.en.toLowerCase().includes(clean)) return entry;
    if (entry.secondaryEn?.some((s) => s.toLowerCase().includes(clean))) return entry;
  }

  // 3. Romanized phonetic match
  const romanizedMatch = ROMANIZED_LOOKUP[clean.replace(/[\s-]/g, "")];
  if (romanizedMatch) {
    const found = TRANSLATION_DATABASE.find((e) => e.th === romanizedMatch);
    if (found) return found;
  }

  // 4. Substring in Thai
  for (const entry of TRANSLATION_DATABASE) {
    if (query.trim().length >= 2 && entry.th.includes(query.trim())) return entry;
  }

  // 5. Word boundaries in English
  for (const entry of TRANSLATION_DATABASE) {
    const words = entry.en.toLowerCase().split(/[\s,/]+/);
    if (words.some((w) => w === clean)) return entry;
  }

  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = (searchParams.get("q") || "").trim();
  const gender = (searchParams.get("gender") || "male") as SpeakerGender;

  if (!q) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required for translation" },
      { status: 400 }
    );
  }

  // Check built-in database first
  const match = matchEntry(q);
  if (match) {
    const isThaiQuery = /[\u0E00-\u0E7F]/.test(q);
    const result: TranslateResult = {
      sourceText: q,
      sourceLanguage: isThaiQuery ? "th" : "en",
      targetLanguage: isThaiQuery ? "en" : "th",
      translatedText: isThaiQuery ? match.en : match.th,
      thaiScript: match.th,
      englishGloss: match.en,
      phoneticRtgs: match.rtgs,
      phoneticIpa: match.ipa,
      syllables: match.syllables,
      tones: match.tones,
      genderVariants: buildGenderVariants(match.th, match.rtgs),
      secondaryMeanings: match.secondaryEn,
      culturalEtiquette: {
        category: match.category,
        politenessNote: match.politenessNote,
        waiGuidance: match.waiGuidance,
        krengJaiFactor: match.krengJaiFactor,
        registerDifference: match.registerDifference,
        situationalTips: match.situationalTips,
      },
      examples: match.examples,
      provenance: match.provenance,
      confidenceScore: match.confidenceScore,
    };
    return NextResponse.json(result);
  }

  // Fallback: Query backend API or PyThaiNLP service if available
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
      const upstream = await fetch(
        `${baseUrl}/api/v1/dictionary/words/${encodeURIComponent(q)}/accessibility`,
        {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(3500),
          cache: "no-store",
        }
      );

      if (upstream.ok) {
        const data = await upstream.json();
        const primaryTrans = data.translations?.[0];
        const pron = data.pronunciation;
        const rtgs = pron?.transliterationRtgs || q;
        const syllables = pron?.syllables || [rtgs];

        const fallbackResult: TranslateResult = {
          sourceText: q,
          sourceLanguage: "th",
          targetLanguage: "en",
          translatedText: primaryTrans?.translatedWord || rtgs,
          thaiScript: data.headword || q,
          englishGloss: primaryTrans?.translatedWord || "Thai cultural concept",
          phoneticRtgs: rtgs,
          phoneticIpa: pron?.ipaNotation,
          syllables,
          tones: syllables.map((s: string) => ({
            syllable: s,
            tone: "mid",
            symbol: "—",
            labelThai: "สามัญ",
            description: "Mid tone",
          })),
          genderVariants: buildGenderVariants(data.headword || q, rtgs),
          secondaryMeanings: primaryTrans?.secondaryTranslations || [],
          culturalEtiquette: {
            category: "GENERAL",
            politenessNote:
              primaryTrans?.usageNuance ||
              "Standard Thai terminology. Always remember to append ครับ (khrap) or ค่ะ (kha) for politeness.",
            waiGuidance: "Wai when greeting elders or showing gratitude.",
          },
          examples: [],
          provenance: primaryTrans?.provenance || "AI_INFERRED",
          confidenceScore: primaryTrans?.confidenceScore || 0.85,
        };
        return NextResponse.json(fallbackResult);
      }
    } catch {
      // Continue to local fallback generator
    }
  }

  // Dynamic fallback for arbitrary English or Thai phrases
  const isThai = /[\u0E00-\u0E7F]/.test(q);
  const fallbackResult: TranslateResult = {
    sourceText: q,
    sourceLanguage: isThai ? "th" : "en",
    targetLanguage: isThai ? "en" : "th",
    translatedText: isThai ? `${q} (Thai expression)` : q,
    thaiScript: isThai ? q : q,
    englishGloss: isThai ? "Thai lexical entry" : `Meaning for "${q}"`,
    phoneticRtgs: q.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    syllables: [q],
    tones: [
      {
        syllable: q,
        tone: "mid",
        symbol: "—",
        labelThai: "สามัญ",
        description: "Standard mid pitch",
      },
    ],
    genderVariants: buildGenderVariants(isThai ? q : q, q),
    culturalEtiquette: {
      category: "GENERAL",
      politenessNote:
        "In Thai society, politeness particles ครับ (khrap) for men and ค่ะ (kha) for women are essential to sound courteous.",
      waiGuidance: "Press palms together at chest level with a smile when greeting or thanking someone.",
      krengJaiFactor: "Practice 'เกรงใจ' (considerate respect for others).",
    },
    examples: [],
    provenance: "AI_INFERRED",
    confidenceScore: 0.75,
  };

  return NextResponse.json(fallbackResult);
}

export async function POST(request: NextRequest) {
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = (body.text || body.q || "").trim();
  const gender = (body.speakerGender || "male") as SpeakerGender;

  if (!text) {
    return NextResponse.json({ error: "Field 'text' is required" }, { status: 400 });
  }

  // Delegate to match logic
  const mockReq = new NextRequest(`http://localhost:3000/api/v1/translate?q=${encodeURIComponent(text)}&gender=${gender}`);
  return GET(mockReq);
}
