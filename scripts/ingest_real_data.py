#!/usr/bin/env python3
"""
Ingest real Thai dictionary data from data/processed/dict/ and data/processed/dialects/
into PostgreSQL database.
"""
import os
import sys
import json
import uuid
import time
from typing import Dict, List, Any

import psycopg
from app.services.embedding.provider import LocalDeterministicEmbeddingProvider

def uid(name: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, f"thai-context.{name}"))

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

def clean_thai(text: str) -> str:
    return "".join(ch for ch in text if ch.isalnum() or ch in " -_กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮะัาำิีึืฺุูเแโใไๅๆ็่้๊๋์ํ๎").strip()

def run_ingestion(db_url: str):
    print(f"🚀 Connecting to PostgreSQL at {db_url}...")
    conn = psycopg.connect(db_url, autocommit=False)
    cur = conn.cursor()
    embedder = LocalDeterministicEmbeddingProvider(dimension=1536)

    try:
        # 1. Verify/Insert Editions
        cur.execute("""
            INSERT INTO dictionary_sources (id, code, name, publisher, description)
            VALUES (%s, 'ROYAL_SOCIETY', 'สำนักงานราชบัณฑิตยสภา', 'สำนักงานราชบัณฑิตยสภา', 'พจนานุกรมและศัพท์บัญญัติฉบับมาตรฐานแห่งชาติ')
            ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
            RETURNING id;
        """, (uid("source.royal"),))
        source_id = cur.fetchone()[0]

        editions = {
            "2554": {
                "id": uid("edition.2554"),
                "code": "ROYAL_2554",
                "year": "2554",
                "title": "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
            },
            "2569": {
                "id": uid("edition.2569"),
                "code": "ROYAL_2569",
                "year": "2569",
                "title": "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๖๙ (ฉบับดิจิทัล)",
            },
            "2542": {
                "id": uid("edition.2542"),
                "code": "ROYAL_2542",
                "year": "2542",
                "title": "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๔๒",
            }
        }

        ed_id_map = {}
        for yr, ed in editions.items():
            cur.execute("""
                INSERT INTO dictionary_editions (id, source_id, edition_code, edition_year, title, is_active)
                VALUES (%s, %s, %s, %s, %s, true)
                ON CONFLICT (edition_code) DO UPDATE SET title = EXCLUDED.title, edition_year = EXCLUDED.edition_year
                RETURNING id;
            """, (ed["id"], source_id, ed["code"], ed["year"], ed["title"]))
            ed_id_map[yr] = cur.fetchone()[0]

        # Fetch POS
        cur.execute("SELECT code, id FROM parts_of_speech;")
        pos_cache = {row[0]: row[1] for row in cur.fetchall()}
        default_pos_id = pos_cache.get("N")

        # Fetch Dialect Regions
        cur.execute("SELECT code, id FROM dialect_regions;")
        dialect_regions = {row[0]: row[1] for row in cur.fetchall()}

        conn.commit()
        print("✅ Editions and metadata registered.")

        # 2. Ingest Official Dictionaries (dict_2554.json, dict_2569.json, dict_2542.json)
        for yr in ["2569", "2554", "2542"]:
            file_name = f"data/processed/dict/dict_{yr}.json"
            if not os.path.exists(file_name):
                print(f"⚠️ {file_name} not found, skipping...")
                continue

            print(f"\n📖 Loading {file_name} for edition {yr}...")
            with open(file_name, "r", encoding="utf-8") as f:
                entries = json.load(f)

            print(f"Loaded {len(entries)} entries. Ingesting in batches...")
            edition_id = ed_id_map[yr]
            batch_size = 500
            total_ingested = 0
            start_time = time.time()

            for i in range(0, len(entries), batch_size):
                chunk = entries[i : i + batch_size]
                _flush_dict_chunk(cur, chunk, edition_id, pos_cache, default_pos_id, embedder)
                conn.commit()
                total_ingested += len(chunk)
                elapsed = time.time() - start_time
                print(f"  [{yr}] Ingested {total_ingested}/{len(entries)} ({total_ingested / max(elapsed, 0.001):.1f} entries/sec)")

            print(f"🎉 Edition {yr} complete: {total_ingested} entries in {time.time() - start_time:.1f}s")

        # 3. Ingest Dialect Data
        print("\n🗣️ Ingesting dialect datasets...")
        dialect_files = {
            "NORTH": ["data/processed/dialects/dialect_north_kinship.json", "data/processed/dialects/dialect_north_body_parts.json"],
            "NORTHEAST": ["data/processed/dialects/dialect_isaan_kinship.json", "data/processed/dialects/dialect_isaan_body_parts.json"],
            "SOUTH": ["data/processed/dialects/dialect_south_kinship.json", "data/processed/dialects/dialect_south_body_parts.json"],
        }

        dialect_ed_id = None
        cur.execute("SELECT id FROM dictionary_editions WHERE edition_code = 'DIALECT_THAI' LIMIT 1;")
        row = cur.fetchone()
        if row:
            dialect_ed_id = row[0]

        total_dialects = 0
        for reg_code, files in dialect_files.items():
            region_id = dialect_regions.get(reg_code)
            if not region_id:
                continue
            for dfile in files:
                if not os.path.exists(dfile):
                    continue
                with open(dfile, "r", encoding="utf-8") as df:
                    ddata = json.load(df)
                    d_entries = ddata.get("entries", [])
                    for de in d_entries:
                        hw = de.get("headword", "").strip()
                        raw_text = de.get("raw_text", "")
                        trans = ", ".join(de.get("transcriptions", []))
                        if not hw:
                            continue
                        d_id = uid(f"dialect.{hw}.{reg_code}.{de.get('id', '')}")
                        cur.execute("""
                            INSERT INTO dialect_entries (id, region_id, edition_id, dialect_word, dialect_word_clean, ipa_phonetic, local_meaning, cultural_notes)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (id) DO UPDATE SET local_meaning = EXCLUDED.local_meaning;
                        """, (d_id, region_id, dialect_ed_id, hw, clean_thai(hw), trans, raw_text, ", ".join(de.get("notes", []))))
                        total_dialects += 1
        conn.commit()
        print(f"✅ Ingested {total_dialects} dialect entries.")

    except Exception as e:
        conn.rollback()
        print(f"❌ Ingestion error: {e}")
        raise e
    finally:
        cur.close()
        conn.close()

def _flush_dict_chunk(cur, chunk, edition_id, pos_cache, default_pos_id, embedder):
    # 1. Words upsert
    for item in chunk:
        hw = item.get("headword", "").strip()
        if not hw:
            continue
        clean_hw = clean_thai(hw)
        w_id = uid(f"word.{hw}")
        cur.execute("""
            INSERT INTO words (id, headword, headword_clean, char_length)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (headword) DO UPDATE SET headword_clean = EXCLUDED.headword_clean
            RETURNING id;
        """, (w_id, hw, clean_hw, len(hw)))
        item["word_id"] = cur.fetchone()[0]

    # 2. Word entries upsert
    for item in chunk:
        if not item.get("word_id"):
            continue
        entry_id = uid(f"entry.{item['word_id']}.{edition_id}")
        pron = item.get("pronunciation")
        meta = json.dumps({
            "is_subword": item.get("is_subword", False),
            "etymology": item.get("etymology"),
            "register": item.get("register"),
            "subject_field": item.get("subject_field"),
        })
        cur.execute("""
            INSERT INTO word_entries (id, word_id, edition_id, pronunciation, metadata)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (word_id, edition_id) DO UPDATE SET pronunciation = EXCLUDED.pronunciation, metadata = EXCLUDED.metadata
            RETURNING id;
        """, (entry_id, item["word_id"], edition_id, pron, meta))
        item["entry_id"] = cur.fetchone()[0]

    # 3. Definitions upsert & embedding items
    embeddings_to_insert = []
    for item in chunk:
        if not item.get("entry_id"):
            continue
        definition_text = (item.get("definition") or "").strip()
        if not definition_text:
            continue
        pos_raw = item.get("pos") or ""
        pos_code = POS_MAP.get(pos_raw, "N")
        pos_id = pos_cache.get(pos_code, default_pos_id)
        sense_order = item.get("sense_order", 1)

        def_id = uid(f"def.{item['entry_id']}.{sense_order}")
        cur.execute("""
            INSERT INTO definitions (id, entry_id, pos_id, sense_order, definition_text, register_level)
            VALUES (%s, %s, %s, %s, %s, 'GENERAL')
            ON CONFLICT (entry_id, sense_order) DO UPDATE SET definition_text = EXCLUDED.definition_text
            RETURNING id;
        """, (def_id, item["entry_id"], pos_id, sense_order, definition_text))
        actual_def_id = cur.fetchone()[0]

        hw = item.get("headword", "")
        searchable_text = f"{hw}: {definition_text}"
        vec = embedder.embed_text(searchable_text)
        vec_str = f"[{','.join(f'{x:.6f}' for x in vec)}]"
        emb_id = uid(f"emb.{actual_def_id}")

        embeddings_to_insert.append((
            emb_id,
            actual_def_id,
            edition_id,
            "DEFINITION",
            searchable_text,
            "local-hash-projection",
            1536,
            vec_str
        ))

    # 4. Batch insert search_embeddings
    if embeddings_to_insert:
        cur.executemany("""
            INSERT INTO search_embeddings (id, entity_id, edition_id, entity_type, searchable_text, model_name, model_dimension, embedding)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s::vector)
            ON CONFLICT (id) DO UPDATE SET searchable_text = EXCLUDED.searchable_text, embedding = EXCLUDED.embedding;
        """, embeddings_to_insert)

if __name__ == "__main__":
    db_url = os.environ.get("DATABASE_URL", "postgresql://postgres:postgrespassword@localhost:5433/thai_context")
    run_ingestion(db_url)
