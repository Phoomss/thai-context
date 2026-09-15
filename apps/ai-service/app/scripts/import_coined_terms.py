#!/usr/bin/env python3
"""
Coined Terms Ingestion Pipeline for THAI CONTEXT
Extracts Royal Society coined terms (ศัพท์บัญญัติสำนักงานราชบัณฑิตยสภา) from raw-wiktextract-data.json
and imports them into PostgreSQL database with edition ROYAL_COINED.
Also exports a structured JSON dataset to data/seed/coined_terms.json.
"""
import sys
import os
import json
import re
import uuid
import time
import argparse
from typing import Dict, List, Any, Optional

import psycopg
from app.core.config import settings
from app.services.embedding.provider import LocalDeterministicEmbeddingProvider

def uid(name: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, f"thai-context.{name}"))

POS_MAP = {
    'คำนาม': 'N',
    'คำกริยา': 'V',
    'คำคุณศัพท์': 'ADJ',
    'คำวิเศษณ์': 'ADJ',
    'คำกริยาวิเศษณ์': 'ADV',
    'คำบุพบท': 'PREP',
    'คำสันธาน': 'CONJ',
    'คำสรรพนาม': 'PRON',
    'คำอุทาน': 'INTERJ',
    'คำอาการนาม': 'N',
    'คำวิสามานยนาม': 'N',
    'คำลักษณนาม': 'N',
    'noun': 'N',
    'verb': 'V',
    'adj': 'ADJ',
    'adv': 'ADV',
    'prep': 'PREP',
    'conj': 'CONJ',
    'pron': 'PRON',
    'intj': 'INTERJ',
}

ENGLISH_TERM_REGEX = re.compile(
    r"เป็นศัพท์บัญญัติ(?:ของ|สำนักงานราชบัณฑิตยสภาของ)\s*([^\n\r]+?)(?:\.|$)",
    re.IGNORECASE
)
FALLBACK_EN_REGEX = re.compile(
    r"ศัพท์บัญญัติ.*?ของ\s*([A-Za-z0-9\s,\-\/\(\)]+?)(?:\.|\n|$)",
    re.IGNORECASE
)

def clean_thai_text(text: str) -> str:
    return "".join(ch for ch in text if ch.isalnum() or ch in " -_กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮะัาำิีึืฺุูเแโใไๅๆ็่้๊๋์ํ๎").strip()

def extract_english_term(etymology_texts: List[str]) -> Optional[str]:
    for ety in etymology_texts:
        m = ENGLISH_TERM_REGEX.search(ety)
        if m:
            val = m.group(1).strip(" \t\n\r.;:,()\"'")
            return val[:80] if val else None
        m2 = FALLBACK_EN_REGEX.search(ety)
        if m2:
            val = m2.group(1).strip(" \t\n\r.;:,()\"'")
            return val[:80] if val else None
    return None

def run_import(file_path: str, export_path: str = "data/seed/coined_terms.json", batch_size: int = 200):
    if not os.path.exists(file_path):
        print(f"❌ Error: File not found at {file_path}")
        sys.exit(1)

    print(f"📖 Scanning {file_path} for Royal Society coined terms (ศัพท์บัญญัติสำนักงานราชบัณฑิตยสภา)...")
    start_time = time.time()

    coined_items: List[Dict[str, Any]] = []
    seen_headwords = set()

    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            try:
                data = json.loads(line)
            except Exception:
                continue

            if data.get("lang_code") != "th":
                continue

            word = data.get("word", "").strip()
            if not word or len(word) > 150:
                continue

            cats = data.get("categories", [])
            etys = data.get("etymology_texts", [])
            ety_str = "\n".join(etys)

            is_coined = any("ศัพท์บัญญัติ" in c for c in cats) or "ศัพท์บัญญัติ" in ety_str
            if not is_coined:
                continue

            senses = data.get("senses", [])
            definitions = []
            for s in senses:
                glosses = s.get("glosses", [])
                if glosses and glosses[0].strip():
                    definitions.append(glosses[0].strip())

            if not definitions:
                definitions = [word]

            en_term = extract_english_term(etys)

            # Pronunciation
            pron = None
            ipa = None
            roman = None
            for snd in data.get("sounds", []):
                if snd.get("other") and not pron:
                    pron = snd.get("other")
                if snd.get("ipa") and not ipa:
                    ipa = snd.get("ipa")
                if snd.get("tags") and "Royal-Institute" in snd.get("tags", []):
                    roman = snd.get("roman")

            pos_raw = data.get("pos_title") or data.get("pos") or "คำนาม"
            pos_code = POS_MAP.get(pos_raw, "N")

            # Avoid exact duplicate headword in the same edition
            if word in seen_headwords:
                continue
            seen_headwords.add(word)

            coined_items.append({
                "word": word,
                "clean": clean_thai_text(word),
                "english_term": en_term or "",
                "pos_raw": pos_raw,
                "pos_code": pos_code,
                "definitions": definitions,
                "pronunciation": pron or roman,
                "metadata": {
                    "is_coined_term": True,
                    "english_term": en_term or "",
                    "coined_by": "สำนักงานราชบัณฑิตยสภา",
                    "etymology": ety_str,
                    "categories": [c for c in cats if "ศัพท์บัญญัติ" in c] or ["ศัพท์บัญญัติสำนักงานราชบัณฑิตยสภา"],
                    "ipa": ipa,
                    "romanization": roman,
                }
            })

    scan_elapsed = time.time() - start_time
    print(f"✅ Found {len(coined_items)} unique Thai coined terms in {scan_elapsed:.2f}s.")

    # Export clean JSON file for fast seeds
    try:
        os.makedirs(os.path.dirname(export_path), exist_ok=True)
        with open(export_path, "w", encoding="utf-8") as f:
            json.dump({
                "source": {
                    "code": "ROYAL_SOCIETY",
                    "name": "สำนักงานราชบัณฑิตยสภา",
                    "edition_code": "ROYAL_COINED",
                    "title": "คลังศัพท์ไทย / ศัพท์บัญญัติสำนักงานราชบัณฑิตยสภา",
                    "edition_year": "2567"
                },
                "total_items": len(coined_items),
                "items": coined_items
            }, f, ensure_ascii=False, indent=2)
        print(f"💾 Exported clean dataset to {export_path}")
    except Exception as e:
        print(f"⚠️ Warning: Could not export JSON: {e}")

    # Database ingestion
    print("🔌 Ingesting into PostgreSQL...")
    embedder = LocalDeterministicEmbeddingProvider(dimension=1536)

    conn = psycopg.connect(settings.DATABASE_URL, autocommit=False)
    cur = conn.cursor()

    try:
        # 1. Setup Source
        cur.execute("""
            INSERT INTO dictionary_sources (id, code, name, publisher, description)
            VALUES (%s, 'ROYAL_SOCIETY', 'สำนักงานราชบัณฑิตยสภา', 'สำนักงานราชบัณฑิตยสภา', 'พจนานุกรมและคลังศัพท์บัญญัติมาตรฐานแห่งชาติ')
            ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
            RETURNING id;
        """, (uid("source.royal"),))
        source_id = cur.fetchone()[0]

        # 2. Setup Edition for Coined Terms
        cur.execute("""
            INSERT INTO dictionary_editions (id, source_id, edition_code, edition_year, title, is_active)
            VALUES (%s, %s, 'ROYAL_COINED', '2567', 'คลังศัพท์ไทย / ศัพท์บัญญัติสำนักงานราชบัณฑิตยสภา', true)
            ON CONFLICT (edition_code) DO UPDATE SET title = EXCLUDED.title, is_active = true
            RETURNING id;
        """, (uid("edition.royal_coined"), source_id))
        edition_id = cur.fetchone()[0]

        # 3. Cache POS IDs
        cur.execute("SELECT code, id FROM parts_of_speech;")
        pos_cache = {row[0]: row[1] for row in cur.fetchall()}
        default_pos_id = pos_cache.get("N")

        # 4. Insert in batches
        for i in range(0, len(coined_items), batch_size):
            batch = coined_items[i:i + batch_size]
            _flush_coined_batch(cur, conn, batch, edition_id, pos_cache, default_pos_id, embedder)
            print(f"  ⚡ Ingested {min(i + batch_size, len(coined_items))}/{len(coined_items)} coined terms...")

        conn.commit()
        total_time = time.time() - start_time
        print(f"\n🎉 Coined Terms Ingestion Complete!")
        print(f"📊 Total items ingested: {len(coined_items)}")
        print(f"⏱️ Total time: {total_time:.2f}s")

    except Exception as e:
        conn.rollback()
        print(f"❌ Ingestion error: {e}")
        raise e
    finally:
        cur.close()
        conn.close()

def _flush_coined_batch(cur, conn, items, edition_id, pos_cache, default_pos_id, embedder):
    if not items:
        return

    # 1. Upsert Words
    for item in items:
        word_id = uid(f"word.{item['word']}")
        cur.execute("""
            INSERT INTO words (id, headword, headword_clean, char_length)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (headword) DO UPDATE SET headword_clean = EXCLUDED.headword_clean
            RETURNING id;
        """, (word_id, item["word"], item["clean"], len(item["word"])))
        res = cur.fetchone()
        item["word_id"] = res[0] if res else word_id

    # 2. Upsert Word Entries under ROYAL_COINED edition
    for item in items:
        entry_id = uid(f"entry.{item['word_id']}.{edition_id}")
        cur.execute("""
            INSERT INTO word_entries (id, word_id, edition_id, pronunciation, metadata)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (word_id, edition_id) DO UPDATE SET metadata = EXCLUDED.metadata, pronunciation = EXCLUDED.pronunciation
            RETURNING id;
        """, (entry_id, item["word_id"], edition_id, item["pronunciation"], json.dumps(item["metadata"], ensure_ascii=False)))
        res = cur.fetchone()
        item["entry_id"] = res[0] if res else entry_id

    # 3. Upsert Definitions
    for item in items:
        pos_id = pos_cache.get(item["pos_code"], default_pos_id)
        for idx, def_text in enumerate(item["definitions"], start=1):
            def_id = uid(f"def.{item['entry_id']}.{idx}")
            subject = "ศัพท์บัญญัติ"
            if item["english_term"]:
                subject = f"ศัพท์บัญญัติ ({item['english_term']})"[:100]
            cur.execute("""
                INSERT INTO definitions (id, entry_id, pos_id, sense_order, definition_text, register_level, subject_domain)
                VALUES (%s, %s, %s, %s, %s, 'FORMAL', %s)
                ON CONFLICT (entry_id, sense_order) DO UPDATE SET definition_text = EXCLUDED.definition_text, subject_domain = EXCLUDED.subject_domain;
            """, (def_id, item["entry_id"], pos_id, idx, def_text, subject))

    # 4. Search Embeddings (vector representation)
    search_texts = [
        f"{item['word']} {item['english_term']} ({item['pos_raw']}) : {' ; '.join(item['definitions'])} ศัพท์บัญญัติสำนักงานราชบัณฑิตยสภา"
        for item in items
    ]
    vectors = embedder.embed_batch(search_texts)

    for item, text, vec in zip(items, search_texts, vectors):
        emb_id = uid(f"emb.{item['entry_id']}")
        cur.execute("""
            INSERT INTO search_embeddings (id, entity_type, entity_id, edition_id, searchable_text, model_name, model_dimension, embedding)
            VALUES (%s, 'WORD_ENTRY', %s, %s, %s, 'text-embedding-3-small', 1536, %s::vector)
            ON CONFLICT DO NOTHING;
        """, (emb_id, item["entry_id"], edition_id, text, vec))

    conn.commit()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest Royal Society Coined Terms")
    parser.add_argument("--file", default="/app/data/raw/raw-wiktextract-data.json", help="Path to raw json file")
    parser.add_argument("--export", default="/app/data/seed/coined_terms.json", help="Export path for clean json")
    args = parser.parse_args()

    file_path = args.file
    export_path = args.export
    if not os.path.exists(file_path) and os.path.exists("data/raw/raw-wiktextract-data.json"):
        file_path = "data/raw/raw-wiktextract-data.json"
        export_path = "data/seed/coined_terms.json"

    run_import(file_path, export_path=export_path)
