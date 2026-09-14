import logging
from typing import List, Dict, Optional, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

CURATED_TRANSLATIONS: Dict[str, Dict[str, Any]] = {
    "ประสิทธิภาพ": {
        "primary_translation": "efficiency",
        "secondary_translations": ["competence", "productivity", "performance"],
        "contextual_explanation_en": "The ability to produce maximum output or desired results with the least waste of time, resources, or energy.",
        "usage_nuance_en": "Commonly used in administrative, organizational, and technological contexts. Contrasts with 'effectiveness' (ประสิทธิผล) which focuses on objective attainment rather than resource economy.",
        "provenance": "OFFICIAL_CURATED",
        "confidence_score": 1.0
    },
    "ประสิทธิผล": {
        "primary_translation": "effectiveness",
        "secondary_translations": ["efficacy", "fruitfulness", "successfulness"],
        "contextual_explanation_en": "The degree to which objectives are achieved and the targeted problems or goals are resolved.",
        "usage_nuance_en": "Emphasizes the ultimate accomplishment and outcome regardless of the volume of resources consumed.",
        "provenance": "OFFICIAL_CURATED",
        "confidence_score": 1.0
    },
    "ศักยภาพ": {
        "primary_translation": "potential",
        "secondary_translations": ["capability", "capacity", "latent ability"],
        "contextual_explanation_en": "Latent qualities or abilities that may be developed and lead to future success or usefulness.",
        "usage_nuance_en": "Used in educational, corporate human resources, and strategic planning discourses.",
        "provenance": "OFFICIAL_CURATED",
        "confidence_score": 1.0
    },
    "ปัญญาประดิษฐ์": {
        "primary_translation": "artificial intelligence (AI)",
        "secondary_translations": ["machine intelligence", "synthetic intelligence"],
        "contextual_explanation_en": "The branch of computer science emphasizing the simulation of human intelligence processes by machines.",
        "usage_nuance_en": "Standard official coined terminology endorsed by the Royal Society of Thailand.",
        "provenance": "OFFICIAL_CURATED",
        "confidence_score": 1.0
    },
    "นวัตกรรม": {
        "primary_translation": "innovation",
        "secondary_translations": ["novelty", "modernization", "breakthrough"],
        "contextual_explanation_en": "A new method, idea, or product newly introduced into society or commerce.",
        "usage_nuance_en": "Widely used in business, science, and governance; implies transformative modern advancement.",
        "provenance": "OFFICIAL_CURATED",
        "confidence_score": 1.0
    },
    "บูรณาการ": {
        "primary_translation": "integration",
        "secondary_translations": ["holistic coordination", "unification"],
        "contextual_explanation_en": "Combining various components or sectors into a cohesive, harmonious, and unified whole.",
        "usage_nuance_en": "Formal administrative and academic register frequently seen in public policy documents.",
        "provenance": "OFFICIAL_CURATED",
        "confidence_score": 1.0
    },
    "อร่อย": {
        "primary_translation": "delicious",
        "secondary_translations": ["tasty", "flavorful", "savory", "yummy"],
        "contextual_explanation_en": "Highly pleasant to the taste; having a savory, satisfying flavor.",
        "usage_nuance_en": "Informal to neutral register. Standard Thai equivalent of regional dialect terms like 'ลำ' (North), 'แซ่บ' (Isan), 'หรอย' (South).",
        "provenance": "OFFICIAL_CURATED",
        "confidence_score": 1.0
    },
    "รับประทาน": {
        "primary_translation": "dine / eat (formal)",
        "secondary_translations": ["consume", "partake"],
        "contextual_explanation_en": "To consume food in a polite, formal setting.",
        "usage_nuance_en": "Polite formal register, preferred over the informal 'กิน' (kin) in official and etiquette contexts.",
        "provenance": "OFFICIAL_CURATED",
        "confidence_score": 1.0
    }
}

def _load_processed_bilingual_terms():
    import json
    import glob
    import os

    candidates = [
        "data/processed",
        "../../data/processed",
        "../../../data/processed",
        "/app/data/processed"
    ]
    base_dir = next((c for c in candidates if os.path.isdir(c)), None)
    if not base_dir:
        return

    # 1. Load Royal Society Transliterations (termsTransliteration)
    trans_path = os.path.join(base_dir, "termsTransliteration", "terms_transliteration.json")
    if os.path.exists(trans_path):
        try:
            with open(trans_path, "r", encoding="utf-8") as f:
                trans_items = json.load(f)
                for item in trans_items:
                    th = item.get("transliteration_thai")
                    en = item.get("term_english")
                    if th and en:
                        th_clean = th.strip()
                        en_clean = en.strip()
                        if th_clean not in CURATED_TRANSLATIONS:
                            CURATED_TRANSLATIONS[th_clean] = {
                                "primary_translation": en_clean,
                                "secondary_translations": [],
                                "contextual_explanation_en": f"Official Royal Society Thai transliteration (คำทับศัพท์) for the English term '{en_clean}'.",
                                "usage_nuance_en": "Official Royal Society transliteration standard (ราชบัณฑิตยสภา).",
                                "provenance": "OFFICIAL_ROYAL_TRANSLITERATION",
                                "confidence_score": 1.0
                            }
        except Exception as e:
            logger.warning(f"Error loading terms_transliteration.json: {e}")

    # 2. Load Royal Society Coined Terms (terms/terms_*.json)
    terms_pattern = os.path.join(base_dir, "terms", "*.json")
    for fpath in glob.glob(terms_pattern):
        try:
            with open(fpath, "r", encoding="utf-8") as f:
                coined_items = json.load(f)
                for item in coined_items:
                    en = item.get("term")
                    th_defs = item.get("definition", "")
                    field = item.get("field", "ศัพท์บัญญัติ")
                    if en and th_defs:
                        en_clean = en.strip()
                        # Split multiple comma-separated Thai translations
                        for part in th_defs.split(","):
                            clean_part = part.strip()
                            if clean_part and clean_part not in CURATED_TRANSLATIONS:
                                CURATED_TRANSLATIONS[clean_part] = {
                                    "primary_translation": en_clean,
                                    "secondary_translations": [],
                                    "contextual_explanation_en": f"Official Royal Society coined terminology for '{en_clean}' in the domain of {field}.",
                                    "usage_nuance_en": f"Technical register: {field}",
                                    "provenance": "OFFICIAL_ROYAL_COINED",
                                    "confidence_score": 1.0
                                }
        except Exception as e:
            logger.warning(f"Error loading {fpath}: {e}")

_load_processed_bilingual_terms()


BILINGUAL_PROMPT = """You are the Grounded Bilingual Translation Agent for THAI CONTEXT.
Your task is to provide an accurate English bridge for the official Thai dictionary word based STRICTLY on its Thai definition.

STRICT RULES:
1. Do NOT hallucinate meanings not found in the Thai definition.
2. Clearly distinguish the official definition context.
3. If the definition is empty or insufficient, return 'insufficient_evidence'.
4. Respond in JSON with keys:
   - "primary_translation": string (lowercase English term)
   - "secondary_translations": list of strings
   - "contextual_explanation_en": string (concise explanation of definition in English)
   - "usage_nuance_en": string (register, formality, or domain context)
"""

class BilingualTranslatorService:
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY

    def translate_and_explain(
        self,
        headword: str,
        definition_text: Optional[str] = None,
        pos: Optional[str] = None,
        domain: Optional[str] = None
    ) -> Dict[str, Any]:
        cleaned = headword.strip()

        # 1. Curated database check (OFFICIAL_CURATED)
        if cleaned in CURATED_TRANSLATIONS:
            data = CURATED_TRANSLATIONS[cleaned]
            return {
                "headword": cleaned,
                "primary_translation": data["primary_translation"],
                "secondary_translations": data["secondary_translations"],
                "contextual_explanation_en": data["contextual_explanation_en"],
                "usage_nuance_en": data["usage_nuance_en"],
                "provenance": data["provenance"],
                "confidence_score": data["confidence_score"]
            }

        # 2. If no definition given, return safe abstention
        if not definition_text or len(definition_text.strip()) < 3:
            return {
                "headword": cleaned,
                "primary_translation": cleaned,
                "secondary_translations": [],
                "contextual_explanation_en": "No verified official definition available for bilingual translation.",
                "usage_nuance_en": "N/A",
                "provenance": "AI_GENERATED",
                "confidence_score": 0.0
            }

        # 3. If Gemini key available, generate grounded explanation
        if self.gemini_key and settings.LLM_PROVIDER == "gemini":
            try:
                import httpx
                import json
                prompt = (
                    f"{BILINGUAL_PROMPT}\n\n"
                    f"Thai Word: {cleaned}\n"
                    f"Part of Speech: {pos or 'N/A'}\n"
                    f"Domain: {domain or 'General'}\n"
                    f"Official Thai Definition: {definition_text}\n\n"
                    f"Return valid JSON only:"
                )
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.LLM_MODEL}:generateContent?key={self.gemini_key}"
                res = httpx.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=8.0)
                resp_json = res.json()
                raw_text = resp_json["candidates"][0]["content"]["parts"][0]["text"].strip()
                # Clean possible markdown block
                if raw_text.startswith("```"):
                    raw_text = raw_text.strip("`").replace("json\n", "", 1).strip()
                parsed = json.loads(raw_text)
                return {
                    "headword": cleaned,
                    "primary_translation": parsed.get("primary_translation", cleaned),
                    "secondary_translations": parsed.get("secondary_translations", []),
                    "contextual_explanation_en": parsed.get("contextual_explanation_en", definition_text),
                    "usage_nuance_en": parsed.get("usage_nuance_en", "Standard formal Thai register"),
                    "provenance": "AI_GENERATED",
                    "confidence_score": 0.88
                }
            except Exception as e:
                logger.warning(f"Gemini bilingual translation error: {e}")

        # 4. Deterministic fallback synthesis
        return {
            "headword": cleaned,
            "primary_translation": f"[{cleaned}]",
            "secondary_translations": [],
            "contextual_explanation_en": f"Official definition: \"{definition_text}\"",
            "usage_nuance_en": f"Register: {pos or 'Standard'}",
            "provenance": "AI_GENERATED",
            "confidence_score": 0.70
        }

bilingual_translator = BilingualTranslatorService()
