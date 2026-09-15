#!/usr/bin/env python3
"""
High-Performance Ingestion Script for Royal Society Dictionary (All Editions).
Ingests 52,175 entries into PostgreSQL with full vector embeddings and variant decomposition.
"""
import os
import sys
import json
import uuid
import time
import re
from typing import Dict, List, Any, Set

import psycopg

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../apps/ai-service")))
from app.services.embedding.provider import LocalDeterministicEmbeddingProvider

def uid(name: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, f"thai-context.{name}"))

def clean_thai(text: str) -> str:
    return "".join(ch for ch in text if ch.isalnum() or ch in " -_กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮะัาำิีึืฺุูเแโใไๅๆ็่้๊๋์ํ๎").strip()

def extract_headword_variants(hw: str) -> List[str]:
    variants = [hw.strip()]
    if any(c in hw for c in [",", ";", "/", "-"]):
        parts = re.split(r"[,;/]", hw)
        for p in parts:
            c = re.sub(r"[\d๑-๙\s\-\.]", "", p).strip()
            if len(c) >= 2 and c not in variants:
                variants.append(c)
    return variants

POS_MAP = {
    'น.': 'N',
    'ก.': 'V',
    'ว.': 'ADJ',
    'ก.ว.': 'ADV',
    'ส.': 'PRON',
    'บ.': 'PREP',
    'สั.': 'CONJ',
    'สัน.': 'CONJ',
    'อ.': 'INTERJ',
    'คำนาม': 'N',
    'คำกริยา': 'V',
    'คำคุณศัพท์': 'ADJ',
    'คำวิเศษณ์': 'ADJ',
    'คำสรรพนาม': 'PRON',
}

def run_ingestion(db_url: str):
    print(f"🚀 Connecting to PostgreSQL at {db_url}...")
    conn = psycopg.connect(db_url, autocommit=False)
    cur = conn.cursor()
    embedder = LocalDeterministicEmbeddingProvider(dimension=1536)

    try:
        # Resolve edition IDs
        cur.execute("SELECT edition_year, id FROM dictionary_editions;")
        ed_map = {row[0]: row[1] for row in cur.fetchall()}
        default_edition_id = ed_map.get("2554") or ed_map.get("2542") or list(ed_map.values())[0]

        # Resolve POS IDs
        cur.execute("SELECT code, id FROM parts_of_speech;")
        pos_cache = {row[0]: row[1] for row in cur.fetchall()}
        default_pos_id = pos_cache.get("N")

        # Load existing words into memory cache
        cur.execute("SELECT headword, id FROM words;")
        word_cache = {row[0]: str(row[1]) for row in cur.fetchall()}
        print(f"Cached {len(word_cache)} existing words from database.")

        file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/processed/dict/dict_all_editions.json"))
        if not os.path.exists(file_path):
            file_path = "data/processed/dict/dict_all_editions.json"

        print(f"📖 Loading entries from {file_path}...")
        with open(file_path, "r", encoding="utf-8") as f:
            all_entries = json.load(f)

        print(f"Loaded {len(all_entries)} dictionary entries. Ingesting in batches of 500...")
        start_time = time.time()
        batch_size = 500
        total_ingested = 0

        cur.execute("SELECT word_id, edition_id, id FROM word_entries;")
        entry_cache: Dict[tuple, str] = {(str(r[0]), str(r[1])): str(r[2]) for r in cur.fetchall()}
        print(f"Cached {len(entry_cache)} existing word_entries.")

        cur.execute("SELECT entry_id, COALESCE(MAX(sense_order), 0) FROM definitions GROUP BY entry_id;")
        known_senses: Dict[str, int] = {str(r[0]): int(r[1]) for r in cur.fetchall()}
        print(f"Cached senses for {len(known_senses)} entries.")

        for i in range(0, len(all_entries), batch_size):
            chunk = all_entries[i : i + batch_size]

            # 1. Upsert words (both main headword and extracted sub-variants)
            new_words = []
            for item in chunk:
                hw = (item.get("headword") or "").strip()
                if not hw:
                    continue
                for v in extract_headword_variants(hw):
                    if v not in word_cache:
                        clean_v = clean_thai(v)
                        w_id = uid(f"word.{v}")
                        new_words.append((w_id, v, clean_v, len(v)))
                        word_cache[v] = w_id

            if new_words:
                cur.executemany("""
                    INSERT INTO words (id, headword, headword_clean, char_length)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (headword) DO NOTHING;
                """, new_words)

            # 2. Link word_entries and definitions
            entry_dict: Dict[str, tuple] = {}
            def_dict: Dict[str, tuple] = {}
            emb_dict: Dict[str, tuple] = {}

            for item in chunk:
                hw = (item.get("headword") or "").strip()
                definition_text = (item.get("definition") or "").strip()
                if not hw or not definition_text:
                    continue

                ed_year = str(item.get("edition") or "2554")
                edition_id = ed_map.get(ed_year, default_edition_id)
                pos_raw = item.get("pos") or "น."
                pos_code = POS_MAP.get(pos_raw, "N")
                pos_id = pos_cache.get(pos_code, default_pos_id)

                for v in extract_headword_variants(hw):
                    w_id = word_cache.get(v)
                    if not w_id:
                        continue
                    
                    key = (str(w_id), str(edition_id))
                    if key in entry_cache:
                        entry_id = entry_cache[key]
                    else:
                        entry_id = uid(f"entry.{w_id}.{edition_id}")
                        entry_cache[key] = entry_id
                        entry_dict[entry_id] = (
                            entry_id,
                            w_id,
                            edition_id,
                            item.get("pronunciation"),
                            item.get("index") or 1,
                            json.dumps({
                                "register": item.get("register"),
                                "subject_field": item.get("subject_field"),
                                "canonical_headword": hw
                            })
                        )

                    curr_sense = known_senses.get(entry_id, 0) + 1
                    known_senses[entry_id] = curr_sense
                    def_id = uid(f"def.{entry_id}.{curr_sense}")

                    def_dict[def_id] = (
                        def_id,
                        entry_id,
                        pos_id,
                        curr_sense,
                        definition_text,
                        "FORMAL"
                    )

                    # Vector embedding
                    searchable_text = f"{v}: {definition_text}"
                    vec = embedder.embed_text(searchable_text)
                    vec_str = f"[{','.join(f'{x:.6f}' for x in vec)}]"
                    emb_id = uid(f"emb.{def_id}")

                    emb_dict[emb_id] = (
                        emb_id,
                        def_id,
                        edition_id,
                        "DEFINITION",
                        searchable_text,
                        "local-hash-projection",
                        1536,
                        vec_str
                    )

            if entry_dict:
                cur.executemany("""
                    INSERT INTO word_entries (id, word_id, edition_id, pronunciation, page_number, metadata)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (word_id, edition_id) DO NOTHING;
                """, list(entry_dict.values()))

            if def_dict:
                cur.executemany("""
                    INSERT INTO definitions (id, entry_id, pos_id, sense_order, definition_text, register_level)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (entry_id, sense_order) DO UPDATE SET definition_text = EXCLUDED.definition_text;
                """, list(def_dict.values()))

            if emb_dict:
                cur.executemany("""
                    INSERT INTO search_embeddings (id, entity_id, edition_id, entity_type, searchable_text, model_name, model_dimension, embedding)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s::vector)
                    ON CONFLICT (id) DO UPDATE SET searchable_text = EXCLUDED.searchable_text, embedding = EXCLUDED.embedding;
                """, list(emb_dict.values()))

            conn.commit()
            total_ingested += len(chunk)
            if total_ingested % 2500 == 0 or total_ingested == len(all_entries):
                elapsed = time.time() - start_time
                print(f"  Processed {total_ingested}/{len(all_entries)} ({total_ingested / max(elapsed, 0.001):.1f} entries/sec)")

        print(f"🎉 All {total_ingested} Royal Society entries successfully ingested in {time.time() - start_time:.1f}s!")

    except Exception as e:
        conn.rollback()
        print(f"❌ Ingestion error: {e}")
        raise e
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    db_url = os.environ.get("DATABASE_URL", "postgresql://postgres:postgrespassword@localhost:5433/thai_context")
    run_ingestion(db_url)
