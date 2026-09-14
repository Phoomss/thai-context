import re
from typing import List, Dict, Optional, Any

try:
    from pythainlp.transliterate import romanize, transliterate
    from pythainlp.tokenize import subword_tokenize
    HAS_PYTHAINLP = True
except ImportError:
    HAS_PYTHAINLP = False

# Known high-accuracy phonetic dictionary for core Thai vocabulary & demo terms
KNOWN_PHONETICS_DICT: Dict[str, Dict[str, str]] = {
    "ประสิทธิภาพ": {
        "phonetic_spelling": "ประ-สิด-ทิ-พาบ",
        "transliteration_rtgs": "pra-sit-thi-phap",
        "ipa": "praʔ˨˩.sit̚˨˩.tʰi˦˥.pʰaːp̚˥˩",
        "tone_pattern": "L-L-H-L"
    },
    "ประสิทธิผล": {
        "phonetic_spelling": "ประ-สิด-ทิ-ผน",
        "transliteration_rtgs": "pra-sit-thi-phon",
        "ipa": "praʔ˨˩.sit̚˨˩.tʰi˦˥.pʰon˩˩˦",
        "tone_pattern": "L-L-H-R"
    },
    "ศักยภาพ": {
        "phonetic_spelling": "สัก-กะ-ยะ-พาบ",
        "transliteration_rtgs": "sak-ka-ya-phap",
        "ipa": "sak̚˨˩.kaʔ˨˩.jaʔ˦˥.pʰaːp̚˥˩",
        "tone_pattern": "L-L-H-L"
    },
    "ปัญญาประดิษฐ์": {
        "phonetic_spelling": "ปัน-ยา-ปฺระ-ดิด",
        "transliteration_rtgs": "pan-ya-pra-dit",
        "ipa": "pan˧˧.jaː˧˧.praʔ˨˩.dit̚˨˩",
        "tone_pattern": "M-M-L-L"
    },
    "นวัตกรรม": {
        "phonetic_spelling": "นะ-วัด-ตะ-กำ",
        "transliteration_rtgs": "na-wat-ta-kam",
        "ipa": "naʔ˦˥.wat̚˨˩.taʔ˨˩.kam˧˧",
        "tone_pattern": "H-L-L-M"
    },
    "บูรณาการ": {
        "phonetic_spelling": "บู-ระ-นา-กาน",
        "transliteration_rtgs": "bu-ra-na-kan",
        "ipa": "buː˧˧.raʔ˦˥.naː˧˧.kaːn˧˧",
        "tone_pattern": "M-H-M-M"
    },
    "วิจารณญาณ": {
        "phonetic_spelling": "วิ-จา-ระ-นะ-ยาน",
        "transliteration_rtgs": "wi-cha-ra-na-yan",
        "ipa": "wi˦˥.t͡ɕaː˧˧.raʔ˦˥.naʔ˦˥.jaːn˧˧",
        "tone_pattern": "H-M-H-H-M"
    },
    "อร่อย": {
        "phonetic_spelling": "อะ-หฺร่อย",
        "transliteration_rtgs": "a-roi",
        "ipa": "ʔaʔ˨˩.rɔːj˨˩",
        "tone_pattern": "L-L"
    },
    "รับประทาน": {
        "phonetic_spelling": "รับ-ปฺระ-ทาน",
        "transliteration_rtgs": "rap-pra-than",
        "ipa": "rap̚˦˥.praʔ˨˩.tʰaːn˧˧",
        "tone_pattern": "H-L-M"
    },
    "บริโภค": {
        "phonetic_spelling": "บอ-ริ-โพก",
        "transliteration_rtgs": "bo-ri-phok",
        "ipa": "bɔː˧˧.riʔ˦˥.pʰoːk̚˥˩",
        "tone_pattern": "M-H-F"
    },
    "มิตรภาพ": {
        "phonetic_spelling": "มิด-ตฺระ-พาบ",
        "transliteration_rtgs": "mit-tra-phap",
        "ipa": "mit̚˦˥.traʔ˨˩.pʰaːp̚˥˩",
        "tone_pattern": "H-L-F"
    },
    "สัมพันธภาพ": {
        "phonetic_spelling": "สำ-พัน-ทะ-พาบ",
        "transliteration_rtgs": "sam-phan-tha-phap",
        "ipa": "sam˩˩˦.pʰan˧˧.tʰaʔ˦˥.pʰaːp̚˥˩",
        "tone_pattern": "R-M-H-F"
    },
    "พัฒนา": {
        "phonetic_spelling": "พัด-ทะ-นา",
        "transliteration_rtgs": "phat-tha-na",
        "ipa": "pʰat̚˦˥.tʰaʔ˦˥.naː˧˧",
        "tone_pattern": "H-H-M"
    },
    "รวดเร็ว": {
        "phonetic_spelling": "รวด-เหฺร็ว",
        "transliteration_rtgs": "ruat-reo",
        "ipa": "ruat̚˥˩.rew˧˧",
        "tone_pattern": "F-M"
    },
    "เชี่ยวชาญ": {
        "phonetic_spelling": "เชี่ยว-ชาน",
        "transliteration_rtgs": "chiao-chan",
        "ipa": "t͡ɕʰiaw˥˩.t͡ɕʰaːn˩˩˦",
        "tone_pattern": "F-R"
    },
    "อัตลักษณ์": {
        "phonetic_spelling": "อัด-ตะ-ลัก",
        "transliteration_rtgs": "at-ta-lak",
        "ipa": "ʔat̚˨˩.taʔ˨˩.lak̚˦˥",
        "tone_pattern": "L-L-H"
    },
    "ภูมิปัญญา": {
        "phonetic_spelling": "พูม-ปัน-ยา",
        "transliteration_rtgs": "phum-pan-ya",
        "ipa": "pʰuːm˧˧.pan˧˧.jaː˧˧",
        "tone_pattern": "M-M-M"
    },
    "ประณีต": {
        "phonetic_spelling": "ปฺระ-นีด",
        "transliteration_rtgs": "pra-nit",
        "ipa": "praʔ˨˩.niːt̚˥˩",
        "tone_pattern": "L-F"
    }
}

def _load_processed_dict_phonetics():
    import json
    import os

    candidates = [
        "data/processed/dict",
        "../../data/processed/dict",
        "../../../data/processed/dict",
        "/app/data/processed/dict"
    ]
    dict_dir = next((c for c in candidates if os.path.isdir(c)), None)
    if not dict_dir:
        return

    # Ingest from dict_2569.json and dict_2554.json
    for fname in ["dict_2569.json", "dict_2554.json"]:
        fpath = os.path.join(dict_dir, fname)
        if os.path.exists(fpath):
            try:
                with open(fpath, "r", encoding="utf-8") as f:
                    entries = json.load(f)
                    for e in entries:
                        hw = e.get("headword")
                        pron = e.get("pronunciation")
                        if hw and pron and hw not in KNOWN_PHONETICS_DICT:
                            KNOWN_PHONETICS_DICT[hw] = {
                                "phonetic_spelling": pron.strip(),
                                "transliteration_rtgs": hw, # default
                                "ipa": "",
                                "tone_pattern": "M"
                            }
            except Exception:
                pass

_load_processed_dict_phonetics()

class ThaiPhoneticsService:
    @staticmethod
    def get_phonetics(headword: str, known_spelling: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate or lookup Thai phonetic spelling, RTGS transliteration, and IPA.
        Hierarchy:
        1. Known dictionary lookup
        2. Provided known_spelling from database
        3. PyThaiNLP RTGS engine="royin" + IPA
        4. Algorithmic fallback
        """
        cleaned_word = headword.strip()

        # 1. Exact match in pre-curated dictionary
        if cleaned_word in KNOWN_PHONETICS_DICT:
            info = KNOWN_PHONETICS_DICT[cleaned_word]
            syllables = info["transliteration_rtgs"].split("-")
            return {
                "headword": cleaned_word,
                "phonetic_spelling": info["phonetic_spelling"],
                "transliteration_rtgs": info["transliteration_rtgs"],
                "ipa_notation": info["ipa"],
                "tone_pattern": info["tone_pattern"],
                "syllables": syllables,
                "source_type": "OFFICIAL_DATA"
            }

        # 2. Database known_spelling provided
        phonetic_spelling = known_spelling.strip() if known_spelling else cleaned_word
        source_type = "OFFICIAL_DATA" if known_spelling else "AI_INFERRED"

        # 3. RTGS Transliteration
        rtgs = ""
        ipa = ""
        if HAS_PYTHAINLP:
            try:
                rtgs = romanize(cleaned_word, engine="royin")
            except Exception:
                rtgs = ""
            try:
                ipa = transliterate(cleaned_word, engine="ipa")
            except Exception:
                ipa = ""

        if not rtgs:
            # Fallback simple Romanization
            rtgs = ThaiPhoneticsService._simple_romanize(cleaned_word)

        # Tone pattern extraction heuristic
        tones = ThaiPhoneticsService._detect_tone_heuristic(cleaned_word)

        syllables = [s for s in re.split(r"[-_\s]+", rtgs) if s]
        if not syllables:
            syllables = [rtgs]

        return {
            "headword": cleaned_word,
            "phonetic_spelling": phonetic_spelling,
            "transliteration_rtgs": rtgs,
            "ipa_notation": ipa or f"/{rtgs}/",
            "tone_pattern": tones,
            "syllables": syllables,
            "source_type": source_type
        }

    @staticmethod
    def _detect_tone_heuristic(word: str) -> str:
        """Estimate tone pattern from tone marks"""
        tone_map = {
            "่": "L",  # Mai Ek (low/falling)
            "้": "F",  # Mai Tho (falling/high)
            "๊": "H",  # Mai Tri (high)
            "๋": "R",  # Mai Chattawa (rising)
        }
        detected = []
        for char in word:
            if char in tone_map:
                detected.append(tone_map[char])
        if not detected:
            return "M"  # Mid default
        return "-".join(detected)

    @staticmethod
    def _simple_romanize(word: str) -> str:
        """Simple deterministic fallback for words not in dictionary"""
        consonants = {
            "ก": "k", "ข": "kh", "ฃ": "kh", "ค": "kh", "ฅ": "kh", "ฆ": "kh", "ง": "ng",
            "จ": "ch", "ฉ": "ch", "ช": "ch", "ซ": "s", "ฌ": "ch", "ญ": "y", "ฎ": "d",
            "ฏ": "t", "ฐ": "th", "ฑ": "th", "ฒ": "th", "ณ": "n", "ด": "d", "ต": "t",
            "ถ": "th", "ท": "th", "ธ": "th", "น": "n", "บ": "b", "ป": "p", "ผ": "ph",
            "ฝ": "f", "พ": "ph", "ฟ": "f", "ภ": "ph", "ม": "m", "ย": "y", "ร": "r",
            "ฤ": "rue", "ล": "l", "ว": "w", "ศ": "s", "ษ": "s", "ส": "s", "ห": "h",
            "ฬ": "l", "อ": "", "ฮ": "h"
        }
        vowels = {
            "ะ": "a", "ั": "a", "า": "a", "ำ": "am", "ิ": "i", "ี": "i", "ึ": "ue",
            "ื": "ue", "ุ": "u", "ู": "u", "เ": "e", "แ": "ae", "โ": "o", "ใ": "ai",
            "ไ": "ai"
        }
        res = []
        for ch in word:
            if ch in consonants:
                res.append(consonants[ch])
            elif ch in vowels:
                res.append(vowels[ch])
            elif ch not in ["่", "้", "๊", "๋", "์", "ๆ"]:
                res.append(ch)
        out = "".join(res)
        return out if out else word

phonetics_service = ThaiPhoneticsService()
