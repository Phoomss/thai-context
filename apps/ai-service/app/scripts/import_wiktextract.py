#!/usr/bin/env python3
"""
Wiktextract Ingestion Pipeline for THAI CONTEXT
Ingests real Thai dictionary data from raw-wiktextract-data.json
Populates words, word_entries, definitions, dialect_entries, and vector search_embeddings.
"""
import sys
import os
import json
import uuid
import math
import argparse
import time
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

def clean_thai_text(text: str) -> str:
    return "".join(ch for ch in text if ch.isalnum() or ch in " -_กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮะัาำิีึืฺุูเแโใไๅๆ็่้๊๋์ํ๎").strip()

def run_import(file_path: str, limit: int = 0, batch_size: int = 500):
    if not os.path.exists(file_path):
        print(f"❌ Error: File not found at {file_path}")
        sys.exit(1)

    print(f"📖 Starting Wiktextract Ingestion from: {file_path}")
    print(f"⚙️  Settings: limit={limit or 'ALL'}, batch_size={batch_size}")

    embedder = LocalDeterministicEmbeddingProvider(dimension=1536)

    conn = psycopg.connect(settings.DATABASE_URL, autocommit=False)
    cur = conn.cursor()

    try:
        # 1. Setup Source & Edition
        cur.execute("""
            INSERT INTO dictionary_sources (id, code, name, publisher, description)
            VALUES (%s, 'WIKTIONARY', 'วิกิพจนานุกรมภาษาไทย (Wiktionary)', 'Wikimedia Foundation / Kaikki', 'คลังข้อมูลพจนานุกรมภาษาไทยแบบเปิดจาก Wiktextract')
            ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
            RETURNING id;
        """, (uid("source.wiktionary"),))
        source_id = cur.fetchone()[0]

        cur.execute("""
            INSERT INTO dictionary_editions (id, source_id, edition_code, edition_year, title, is_active)
            VALUES (%s, %s, 'WIKT_TH', '2567', 'วิกิพจนานุกรมภาษาไทย ฉบับดิจิทัล (Wiktextract)', true)
            ON CONFLICT (edition_code) DO UPDATE SET title = EXCLUDED.title
            RETURNING id;
        """, (uid("edition.wikt_th"), source_id))
        edition_id = cur.fetchone()[0]

        # 2. Fetch POS cache
        cur.execute("SELECT code, id FROM parts_of_speech;")
        pos_cache = {row[0]: row[1] for row in cur.fetchall()}

        # 3. Fetch Dialect Regions
        cur.execute("SELECT code, id FROM dialect_regions;")
        dialect_regions = {row[0]: row[1] for row in cur.fetchall()}

        conn.commit()
        print(f"✅ Source & Edition verified. Edition ID: {edition_id}")

        # 4. Stream & process file
        total_read = 0
        total_ingested = 0
        total_dialects = 0
        batch_items = []
        seen_words = set()

        start_time = time.time()

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
                if not word or len(word) > 150 or word in seen_words:
                    continue

                senses = data.get("senses", [])
                definitions = []
                for s in senses:
                    glosses = s.get("glosses", [])
                    if glosses and glosses[0].strip():
                        definitions.append(glosses[0].strip())

                if not definitions:
                    continue

                seen_words.add(word)
                total_read += 1

                pos_raw = data.get("pos_title") or data.get("pos") or ""
                pos_code = POS_MAP.get(pos_raw, "OTHER")
                pos_id = pos_cache.get(pos_code, pos_cache.get("N"))

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

                cats = data.get("categories", [])
                cat_text = " ".join(cats)
                gloss_text = " ".join(definitions)

                # Dialect classification
                dialect_region = None
                if "ภาษาถิ่นเหนือ" in cat_text or "ถิ่นเหนือ" in gloss_text or "พายัพ" in gloss_text:
                    dialect_region = "NORTH"
                elif "ภาษาถิ่นอีสาน" in cat_text or "ถิ่นอีสาน" in gloss_text or "อีสาน" in cat_text:
                    dialect_region = "NORTHEAST"
                elif "ภาษาถิ่นใต้" in cat_text or "ถิ่นใต้" in gloss_text or "ปักษ์ใต้" in gloss_text:
                    dialect_region = "SOUTH"

                metadata = {
                    "ipa": ipa,
                    "romanization": roman,
                    "etymology": data.get("etymology_texts", [None])[0] if data.get("etymology_texts") else None,
                    "categories": cats[:5],
                }

                batch_items.append({
                    "word": word,
                    "clean": clean_thai_text(word),
                    "pos_id": pos_id,
                    "pos_name": pos_raw or pos_code,
                    "pronunciation": pron or roman,
                    "definitions": definitions[:3],
                    "metadata": metadata,
                    "dialect_region": dialect_region,
                })

                if len(batch_items) >= batch_size:
                    _flush_batch(cur, conn, batch_items, edition_id, dialect_regions, embedder)
                    total_ingested += len(batch_items)
                    batch_items = []
                    elapsed = time.time() - start_time
                    rate = total_ingested / elapsed if elapsed > 0 else 0
                    print(f"  ⚡ Ingested {total_ingested} words ({rate:.1f} words/sec)")

                if limit > 0 and total_read >= limit:
                    break

        if batch_items:
            _flush_batch(cur, conn, batch_items, edition_id, dialect_regions, embedder)
            total_ingested += len(batch_items)

        conn.commit()
        total_time = time.time() - start_time
        print(f"\n🎉 Wiktextract Ingestion Complete!")
        print(f"📊 Total Thai words ingested: {total_ingested}")
        print(f"⏱️  Time elapsed: {total_time:.2f} seconds ({total_ingested / max(total_time, 0.001):.1f} words/sec)")

    except Exception as e:
        conn.rollback()
        print(f"❌ Ingestion error: {e}")
        raise e
    finally:
        cur.close()
        conn.close()

def _flush_batch(cur, conn, items, edition_id, dialect_regions, embedder):
    if not items:
        return

    # 1. Upsert Words
    for item in items:
        word_id = uid(f"word.{item['word']}")
        item["word_id"] = word_id
        cur.execute("""
            INSERT INTO words (id, headword, headword_clean, char_length)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (headword) DO UPDATE SET headword_clean = EXCLUDED.headword_clean
            RETURNING id;
        """, (word_id, item["word"], item["clean"], len(item["word"])))
        actual_id = cur.fetchone()
        if actual_id:
            item["word_id"] = actual_id[0]

    # 2. Insert Word Entries
    for item in items:
        entry_id = uid(f"entry.{item['word_id']}.{edition_id}")
        item["entry_id"] = entry_id
        cur.execute("""
            INSERT INTO word_entries (id, word_id, edition_id, pronunciation, metadata)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (word_id, edition_id) DO UPDATE SET metadata = EXCLUDED.metadata
            RETURNING id;
        """, (entry_id, item["word_id"], edition_id, item["pronunciation"], json.dumps(item["metadata"])))
        actual_id = cur.fetchone()
        if actual_id:
            item["entry_id"] = actual_id[0]

    # 3. Insert Definitions
    for item in items:
        for idx, def_text in enumerate(item["definitions"], start=1):
            def_id = uid(f"def.{item['entry_id']}.{idx}")
            cur.execute("""
                INSERT INTO definitions (id, entry_id, pos_id, sense_order, definition_text, register_level)
                VALUES (%s, %s, %s, %s, %s, 'GENERAL')
                ON CONFLICT (entry_id, sense_order) DO UPDATE SET definition_text = EXCLUDED.definition_text;
            """, (def_id, item["entry_id"], item["pos_id"], idx, def_text))

    # 4. Dialect Entries
    for item in items:
        if item["dialect_region"] and item["dialect_region"] in dialect_regions:
            reg_id = dialect_regions[item["dialect_region"]]
            dia_id = uid(f"dialect.{item['entry_id']}")
            cur.execute("""
                INSERT INTO dialect_entries (id, region_id, edition_id, dialect_word, dialect_word_clean, local_meaning)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING;
            """, (dia_id, reg_id, edition_id, item["word"], item["clean"], item["definitions"][0]))

    # 5. Embeddings
    search_texts = [
        f"{item['word']} ({item['pos_name']}) : {' ; '.join(item['definitions'])}"
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
    parser = argparse.ArgumentParser(description="Ingest Wiktextract into THAI CONTEXT")
    parser.add_argument("--file", default="/app/data/raw/raw-wiktextract-data.json", help="Path to raw json file")
    parser.add_argument("--limit", type=int, default=0, help="Max words to import (0 for all)")
    parser.add_argument("--batch-size", type=int, default=500, help="Batch size for DB insert")
    args = parser.parse_args()

    # Fallback to local path if running outside Docker
    path = args.file
    if not os.path.exists(path) and os.path.exists("data/raw/raw-wiktextract-data.json"):
        path = "data/raw/raw-wiktextract-data.json"

    run_import(path, limit=args.limit, batch_size=args.batch_size)
