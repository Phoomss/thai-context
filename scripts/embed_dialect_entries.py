#!/usr/bin/env python3
"""
Generate pgvector search embeddings for DIALECT_ENTRY in search_embeddings table
"""

import os
import re
import json
import hashlib

def hash_feature(token: str, seed: int, dimension: int = 1536) -> tuple:
    h = hashlib.sha256(f"{seed}:{token}".encode("utf-8")).digest()
    idx = int.from_bytes(h[:4], "big") % dimension
    sign = 1.0 if (h[4] % 2 == 0) else -1.0
    return idx, sign

def generate_deterministic_embedding(text: str, dimension: int = 1536) -> list:
    cleaned = text.strip().lower()
    vec = [0.0] * dimension

    words = re.findall(r'[\w\u0E00-\u0E7F]+', cleaned)
    for w in words:
        idx, sign = hash_feature(w, 42, dimension)
        vec[idx] += 3.0 * sign
        for n in (2, 3):
            if len(w) >= n:
                for i in range(len(w) - n + 1):
                    gram = w[i:i+n]
                    g_idx, g_sign = hash_feature(gram, 101 + n, dimension)
                    vec[g_idx] += 1.5 * g_sign

    chars = re.sub(r'\s+', '', cleaned)
    for n in (2, 3, 4):
        if len(chars) >= n:
            for i in range(len(chars) - n + 1):
                gram = chars[i:i+n]
                idx, sign = hash_feature(gram, 404 + n, dimension)
                vec[idx] += 1.2 * sign

    norm = sum(x * x for x in vec) ** 0.5
    if norm > 0:
        return [round(x / norm, 6) for x in vec]
    return [0.0] * dimension

def main():
    # Dump dialect entries to embed from DB
    # We can output SQL to insert into search_embeddings
    import subprocess
    cmd = [
        "docker", "exec", "thai_context_db", "psql", "-U", "postgres", "-d", "thai_context",
        "-t", "-A", "-F", "|||", "-c",
        """
        SELECT de.id, de.dialect_word, de.local_meaning, r.name_thai, COALESCE(de.province, '')
        FROM dialect_entries de
        JOIN dialect_regions r ON de.region_id = r.id;
        """
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("Failed to query dialect entries:", res.stderr)
        return

    lines = res.stdout.strip().split("\n")
    print(f"Fetched {len(lines)} dialect entries to embed.")

    sql_lines = [
        "BEGIN;",
        "DELETE FROM search_embeddings WHERE entity_type = 'DIALECT_ENTRY';"
    ]

    for line in lines:
        if not line.strip() or "|||" not in line:
            continue
        parts = line.split("|||")
        if len(parts) < 4:
            continue
        entry_id, word, meaning, region_name = parts[0], parts[1], parts[2], parts[3]
        province = parts[4] if len(parts) > 4 else ""

        searchable_text = f"คำถิ่น: {word} ความหมาย: {meaning} ภาค: {region_name} {province}".strip()
        vec = generate_deterministic_embedding(searchable_text)
        vec_str = f"[{','.join(str(v) for v in vec)}]"

        esc_text = searchable_text.replace("'", "''")
        sql_lines.append(f"""
INSERT INTO search_embeddings (
    id, entity_type, entity_id, searchable_text, model_name, model_dimension, embedding, created_at
) VALUES (
    gen_random_uuid(), 'DIALECT_ENTRY', '{entry_id}', '{esc_text}', 'text-embedding-3-small', 1536, '{vec_str}'::vector, NOW()
);
""")

    sql_lines.append("COMMIT;")

    out_file = "scripts/seed_dialect_embeddings.sql"
    with open(out_file, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_lines))

    print(f"Generated {out_file}. Applying to postgres...")
    apply_cmd = f"docker exec -i thai_context_db psql -U postgres -d thai_context < {out_file}"
    sub = subprocess.run(apply_cmd, shell=True, capture_output=True, text=True)
    if sub.returncode == 0:
        print("Successfully applied dialect embeddings to PostgreSQL!")
    else:
        print("Error applying dialect embeddings:", sub.stderr)

if __name__ == "__main__":
    main()
