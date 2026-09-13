#!/usr/bin/env python3
"""
Data Import Pipeline for THAI CONTEXT
Supports: JSON, JSONL, CSV
Usage:
    python -m app.scripts.import_data --file path/to/file.json
"""
import sys
import os
import json
import csv
import argparse
import psycopg
from app.core.config import settings
from app.services.embedding.provider import embedding_provider

def import_file(file_path: str):
    if not os.path.exists(file_path):
        print(f"Error: file not found at {file_path}")
        return

    ext = os.path.splitext(file_path)[1].lower()
    print(f"Importing {file_path} (format: {ext})...")

    entries = []
    if ext == ".json":
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                entries = data
            elif isinstance(data, dict) and "words" in data:
                # Seed dictionary format
                print(f"Detected full dictionary seed format with {len(data['words'])} words.")
                return
    elif ext == ".jsonl":
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    entries.append(json.loads(line))
    elif ext == ".csv":
        with open(file_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            entries = list(reader)
    else:
        print(f"Unsupported file format: {ext}")
        return

    print(f"Parsed {len(entries)} entries. Ingesting into database...")

    try:
        with psycopg.connect(settings.DATABASE_URL) as conn:
            with conn.cursor() as cur:
                for entry in entries:
                    headword = entry.get("headword") or entry.get("word")
                    definition = entry.get("definition") or entry.get("definition_text")
                    if not headword or not definition:
                        continue

                    # Insert word
                    cur.execute(
                        """
                        INSERT INTO words (headword, headword_clean, char_length)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (headword) DO NOTHING
                        RETURNING id;
                        """,
                        (headword, headword, len(headword))
                    )
                    word_row = cur.fetchone()

                conn.commit()
        print("Import completed successfully.")
    except Exception as e:
        print(f"Database ingestion error: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="THAI CONTEXT Data Importer")
    parser.add_argument("--file", default="data/seed/demo_dictionary.json", help="Path to JSON/JSONL/CSV")
    args = parser.parse_args()
    import_file(args.file)
