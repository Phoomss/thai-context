import json
import os
import re

def hash_feature(feature: str, seed=42, dimension=1536):
    h = seed
    for char in feature:
        h = ((h << 5) - h + ord(char)) & 0xffffffff
        if h >= 0x80000000:
            h -= 0x100000000
    idx = abs(h) % dimension
    sign = 1.0 if abs(h) % 2 == 0 else -1.0
    return idx, sign

def generate_vector(text: str, dimension=1536):
    if not text:
        return [0.0] * dimension
    cleaned = text.strip()
    vec = [0.0] * dimension

    idx, sign = hash_feature(cleaned, 101, dimension)
    vec[idx] += 3.0 * sign

    tokens = cleaned.split()
    for t in tokens:
        if not t:
            continue
        idx, sign = hash_feature(t, 202, dimension)
        vec[idx] += 2.0 * sign

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

def normalize_term(term: str) -> str:
    return re.sub(r'[\s\-_.,\'"?!()[\]{}:;]', '', term.strip().lower())

def escape_sql(val: str) -> str:
    if val is None:
        return "NULL"
    escaped = val.replace("'", "''")
    return f"'{escaped}'"

def main():
    json_path = os.path.join(os.path.dirname(__file__), "../data/seed/modern_vocabulary.json")
    with open(json_path, "r", encoding="utf-8") as f:
        items = json.load(f)

    sql_lines = [
        "-- Seed Modern Thai Vocabulary Layer",
    ]

    for item in items:
        term = item["term"].strip()
        norm = normalize_term(term)
        slug = item.get("slug", norm)
        lang = item.get("language", "th")
        ttype = item.get("term_type", "WORD")
        status = item.get("status", "COMMON")
        origin = item.get("origin", "UNKNOWN")
        register = item.get("register", "NEUTRAL")
        audience = item.get("audience", "GENERAL")
        desc = item.get("description", "")
        f_seen = item.get("first_seen_at", None)
        l_seen = item.get("last_seen_at", None)
        conf = item.get("confidence", 1.0)
        transl = item.get("transliteration", "")
        eng = item.get("english_meaning", "")
        pron = item.get("pronunciation", "")
        warn = item.get("usage_warning", "")

        f_seen_sql = f"'{f_seen}'" if f_seen else "NULL"
        l_seen_sql = f"'{l_seen}'" if l_seen else "NULL"

        sql_lines.append(f"""
        -- Term: {term}
        INSERT INTO modern_terms (
            id, term, normalized_term, slug, language, term_type, status,
            origin, register, audience, description, first_seen_at, last_seen_at,
            confidence, source_count, transliteration, english_meaning, pronunciation,
            usage_warning, official_word_id
        ) VALUES (
            gen_random_uuid(),
            {escape_sql(term)},
            {escape_sql(norm)},
            {escape_sql(slug)},
            {escape_sql(lang)},
            {escape_sql(ttype)},
            {escape_sql(status)},
            {escape_sql(origin)},
            {escape_sql(register)},
            {escape_sql(audience)},
            {escape_sql(desc)},
            {f_seen_sql},
            {l_seen_sql},
            {conf},
            {len(item.get("sources", [])) or 1},
            {escape_sql(transl)},
            {escape_sql(eng)},
            {escape_sql(pron)},
            {escape_sql(warn)},
            (SELECT id FROM words WHERE headword = {escape_sql(term)} OR headword_clean = {escape_sql(term)} LIMIT 1)
        )
        ON CONFLICT (slug) DO UPDATE SET
            term = EXCLUDED.term,
            normalized_term = EXCLUDED.normalized_term,
            description = EXCLUDED.description,
            transliteration = EXCLUDED.transliteration,
            english_meaning = EXCLUDED.english_meaning,
            pronunciation = EXCLUDED.pronunciation,
            usage_warning = EXCLUDED.usage_warning,
            official_word_id = EXCLUDED.official_word_id,
            updated_at = NOW();
        """)

        # Categories
        for cat in item.get("categories", []):
            sql_lines.append(f"""
            INSERT INTO modern_term_categories (id, modern_term_id, category)
            SELECT gen_random_uuid(), id, {escape_sql(cat.upper())}
            FROM modern_terms WHERE slug = {escape_sql(slug)}
            AND NOT EXISTS (
                SELECT 1 FROM modern_term_categories mtc
                WHERE mtc.modern_term_id = modern_terms.id AND mtc.category = {escape_sql(cat.upper())}
            );
            """)

        # Sources
        for src in item.get("sources", []):
            stype = src.get("source_type", "DEMO")
            sname = src.get("source_name", "แหล่งข้อมูลภาษาไทยร่วมสมัย")
            surl = src.get("source_url")
            sdate = src.get("source_date")
            excerpt = src.get("excerpt")
            license = src.get("license", "CC-BY-SA 4.0")
            vstatus = src.get("verification_status", "UNVERIFIED")

            sql_lines.append(f"""
            INSERT INTO modern_term_sources (id, modern_term_id, source_type, source_name, source_url, source_date, excerpt, license, verification_status)
            SELECT gen_random_uuid(), id, {escape_sql(stype)}, {escape_sql(sname)}, {escape_sql(surl)}, {escape_sql(sdate)}, {escape_sql(excerpt)}, {escape_sql(license)}, {escape_sql(vstatus)}
            FROM modern_terms WHERE slug = {escape_sql(slug)}
            AND NOT EXISTS (
                SELECT 1 FROM modern_term_sources mts
                WHERE mts.modern_term_id = modern_terms.id AND mts.source_name = {escape_sql(sname)}
            );
            """)

        # Definitions
        for d in item.get("definitions", []):
            dtext = d.get("definition", "")
            dtype = d.get("definition_type", "SOURCE_DEFINED")
            gen_by = d.get("generated_by")
            verified = "TRUE" if d.get("verified", False) else "FALSE"

            sql_lines.append(f"""
            INSERT INTO modern_term_definitions (id, modern_term_id, definition, definition_type, generated_by, verified)
            SELECT gen_random_uuid(), id, {escape_sql(dtext)}, {escape_sql(dtype)}, {escape_sql(gen_by)}, {verified}
            FROM modern_terms WHERE slug = {escape_sql(slug)}
            AND NOT EXISTS (
                SELECT 1 FROM modern_term_definitions mtd
                WHERE mtd.modern_term_id = modern_terms.id AND mtd.definition = {escape_sql(dtext)}
            );
            """)

        # Examples
        for ex in item.get("examples", []):
            ex_text = ex.get("example_text", "")
            ctx_note = ex.get("context_note")
            src_attr = ex.get("source_attribution")
            reg = ex.get("register", register)

            sql_lines.append(f"""
            INSERT INTO modern_term_examples (id, modern_term_id, example_text, context_note, source_attribution, register)
            SELECT gen_random_uuid(), id, {escape_sql(ex_text)}, {escape_sql(ctx_note)}, {escape_sql(src_attr)}, {escape_sql(reg)}
            FROM modern_terms WHERE slug = {escape_sql(slug)}
            AND NOT EXISTS (
                SELECT 1 FROM modern_term_examples mte
                WHERE mte.modern_term_id = modern_terms.id AND mte.example_text = {escape_sql(ex_text)}
            );
            """)

        # Relationships
        for rel in item.get("relationships", []):
            t_term = rel.get("target_term", "")
            r_type = rel.get("relationship_type", "RELATED")
            s_type = rel.get("source_type", "AI_INFERRED")
            r_conf = rel.get("confidence", 0.85)
            r_notes = rel.get("notes")

            sql_lines.append(f"""
            INSERT INTO modern_term_relationships (id, modern_term_id, target_term, target_modern_term_id, relationship_type, source_type, confidence, notes)
            SELECT gen_random_uuid(), id, {escape_sql(t_term)}, (SELECT id FROM modern_terms WHERE term = {escape_sql(t_term)} LIMIT 1), {escape_sql(r_type)}, {escape_sql(s_type)}, {r_conf}, {escape_sql(r_notes)}
            FROM modern_terms WHERE slug = {escape_sql(slug)}
            AND NOT EXISTS (
                SELECT 1 FROM modern_term_relationships mtr
                WHERE mtr.modern_term_id = modern_terms.id AND mtr.target_term = {escape_sql(t_term)} AND mtr.relationship_type = {escape_sql(r_type)}
            );
            """)

        # Embeddings for pgvector
        defs = ". ".join(d.get("definition", "") for d in item.get("definitions", []))
        searchable_text = f"{term} ({transl}): {defs} {desc} {eng}"
        vec = generate_vector(searchable_text, 1536)
        vec_str = f"[{','.join(f'{x:.6f}' for x in vec)}]"

        sql_lines.append(f"""
        INSERT INTO search_embeddings (id, entity_type, entity_id, searchable_text, model_name, model_dimension, embedding)
        SELECT gen_random_uuid(), 'MODERN_TERM', id, {escape_sql(searchable_text)}, 'text-embedding-3-small', 1536, '{vec_str}'::vector
        FROM modern_terms WHERE slug = {escape_sql(slug)}
        AND NOT EXISTS (
            SELECT 1 FROM search_embeddings se
            WHERE se.entity_id = modern_terms.id AND se.entity_type = 'MODERN_TERM'
        );
        """)


    out_path = os.path.join(os.path.dirname(__file__), "seed_modern_vocabulary.sql")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_lines))

    print(f"Generated SQL migration with {len(items)} items to {out_path}")

if __name__ == "__main__":
    main()
