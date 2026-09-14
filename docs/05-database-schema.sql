-- ============================================================================
-- THAI CONTEXT: Production-Quality PostgreSQL Database Schema & Seed Script
-- Platform: Semantic Thai Language Exploration Platform
-- Extensions: uuid-ossp, pg_trgm, vector (pgvector)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ----------------------------------------------------------------------------
-- 2. TABLES: SOURCES & EDITIONS (IMMUTABLE CATALOG)
-- ----------------------------------------------------------------------------
CREATE TABLE dictionary_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,          -- 'ROYAL_SOCIETY', 'DIALECT_INSTITUTE'
    name VARCHAR(255) NOT NULL,                 -- 'สำนักงานราชบัณฑิตยสภา'
    publisher VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE dictionary_editions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES dictionary_sources(id) ON DELETE RESTRICT,
    edition_code VARCHAR(50) NOT NULL UNIQUE,   -- 'ROYAL_2542', 'ROYAL_2554', 'ROYAL_2569', 'DIALECT_THAI'
    edition_year VARCHAR(10) NOT NULL,          -- '2542', '2554', '2569'
    title VARCHAR(255) NOT NULL,
    publication_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. TABLES: CANONICAL WORDS & MULTI-EDITION ENTRIES
-- ----------------------------------------------------------------------------
CREATE TABLE parts_of_speech (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,           -- 'N', 'V', 'ADJ', 'ADV', 'PRON', 'PREP', 'CONJ'
    abbr_thai VARCHAR(20) NOT NULL UNIQUE,      -- 'น.', 'ก.', 'ว.', 'ส.', 'บ.', 'สั.'
    name_thai VARCHAR(100) NOT NULL,
    name_english VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE words (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    headword VARCHAR(255) NOT NULL UNIQUE,      -- ตัวคำศัพท์หลัก เช่น "ประสิทธิภาพ"
    headword_clean VARCHAR(255) NOT NULL,      -- คำศัพท์ลบวรรณยุกต์/สระ เพื่อการ Search
    char_length INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE word_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    edition_id UUID NOT NULL REFERENCES dictionary_editions(id) ON DELETE RESTRICT,
    pronunciation VARCHAR(255),                 -- คำอ่าน เช่น 'ปฺระ-สิด-ทิ-พาบ'
    royal_sequence INT,                         -- ลำดับหน้า/ลำดับคำในเล่ม
    page_number INT,                            -- เลขหน้า
    metadata JSONB DEFAULT '{}'::jsonb,         -- ข้อมูลเสริม (เช่น รากศัพท์มคธ/สันสกฤต)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_word_edition UNIQUE (word_id, edition_id)
);

CREATE TABLE definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID NOT NULL REFERENCES word_entries(id) ON DELETE CASCADE,
    pos_id UUID REFERENCES parts_of_speech(id) ON DELETE SET NULL,
    sense_order INT NOT NULL DEFAULT 1,         -- ลำดับความหมายข้อ 1, 2, 3...
    definition_text TEXT NOT NULL,              -- ตัวนิยามความหมายทางการ
    register_level VARCHAR(50) DEFAULT 'FORMAL',-- 'FORMAL', 'SEMI_FORMAL', 'INFORMAL', 'LITERARY'
    subject_domain VARCHAR(100),                -- 'กฎหมาย', 'เศรษฐศาสตร์', 'การแพทย์'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_entry_sense UNIQUE (entry_id, sense_order)
);

CREATE TABLE examples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    definition_id UUID NOT NULL REFERENCES definitions(id) ON DELETE CASCADE,
    example_text TEXT NOT NULL,
    source_attribution VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. TABLES: DIALECT EXPLORER
-- ----------------------------------------------------------------------------
CREATE TABLE dialect_regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,           -- 'NORTH', 'NORTHEAST', 'SOUTH', 'CENTRAL'
    name_thai VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE dialect_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID NOT NULL REFERENCES dialect_regions(id) ON DELETE RESTRICT,
    edition_id UUID NOT NULL REFERENCES dictionary_editions(id) ON DELETE RESTRICT,
    dialect_word VARCHAR(255) NOT NULL,         -- 'ลำ', 'แซ่บ', 'หรอย'
    dialect_word_clean VARCHAR(255) NOT NULL,
    ipa_phonetic VARCHAR(255),
    local_meaning TEXT NOT NULL,
    cultural_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE semantic_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    standard_entry_id UUID NOT NULL REFERENCES word_entries(id) ON DELETE CASCADE,
    dialect_entry_id UUID NOT NULL REFERENCES dialect_entries(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL,     -- 'EXACT_EQUIVALENT', 'NEAR_SYNONYM', 'CULTURAL_ANALOG'
    confidence_score NUMERIC(5,4) NOT NULL,     -- 0.0000 - 1.0000
    source_type VARCHAR(50) NOT NULL,           -- 'OFFICIAL_DATA' หรือ 'AI_INFERRED'
    curated_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_source_type CHECK (source_type IN ('OFFICIAL_DATA', 'AI_INFERRED')),
    CONSTRAINT uq_std_dialect_map UNIQUE (standard_entry_id, dialect_entry_id)
);

CREATE TABLE word_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    target_word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL,     -- 'SYNONYM', 'ANTONYM', 'HYPERNYM', 'NEAR_SYNONYM'
    source_type VARCHAR(50) NOT NULL DEFAULT 'OFFICIAL_DATA',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_rel_source CHECK (source_type IN ('OFFICIAL_DATA', 'AI_INFERRED')),
    CONSTRAINT chk_no_self_rel CHECK (source_word_id <> target_word_id)
);

-- ----------------------------------------------------------------------------
-- 5. TABLES: SEMANTIC SEARCH & VECTOR EMBEDDINGS (pgvector)
-- ----------------------------------------------------------------------------
-- หมายเหตุการตั้งค่ามิติเวกเตอร์ (Vector Dimensions):
-- - OpenAI text-embedding-3-small: vector(1536) [ค่าเริ่มต้น]
-- - BGE-M3: vector(1024)
-- - Typhoon / Multilingual-e5-base: vector(768)
CREATE TABLE search_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,           -- 'WORD_ENTRY', 'DEFINITION', 'DIALECT_ENTRY'
    entity_id UUID NOT NULL,                    -- Polymorphic FK
    edition_id UUID REFERENCES dictionary_editions(id) ON DELETE CASCADE,
    searchable_text TEXT NOT NULL,
    model_name VARCHAR(100) NOT NULL,           -- 'text-embedding-3-small'
    model_dimension INT NOT NULL DEFAULT 1536,
    embedding vector(1536) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_entity_type CHECK (entity_type IN ('WORD_ENTRY', 'DEFINITION', 'DIALECT_ENTRY'))
);

-- ----------------------------------------------------------------------------
-- 6. TABLES: GROUNDED AI, AUDIT & EVIDENCE (RAG)
-- ----------------------------------------------------------------------------
CREATE TABLE ai_explanations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_query TEXT NOT NULL,
    explanation_type VARCHAR(50) NOT NULL,      -- 'MEANING_RECOMMEND', 'WORD_COMPARE', 'USAGE_GUIDANCE'
    generated_content TEXT NOT NULL,
    model_identifier VARCHAR(100) NOT NULL,     -- 'gemini-1.5-pro', 'gpt-4o'
    temperature NUMERIC(3,2) DEFAULT 0.20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE rag_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    explanation_id UUID NOT NULL REFERENCES ai_explanations(id) ON DELETE CASCADE,
    entry_id UUID NOT NULL REFERENCES word_entries(id) ON DELETE CASCADE,
    definition_id UUID REFERENCES definitions(id) ON DELETE CASCADE,
    relevance_score NUMERIC(5,4) NOT NULL,
    cited_snippet TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. TABLES: USER FEEDBACK
-- ----------------------------------------------------------------------------
CREATE TABLE search_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_text TEXT NOT NULL,
    recommended_word_id UUID REFERENCES words(id) ON DELETE SET NULL,
    user_action VARCHAR(50) NOT NULL,           -- 'CLICK', 'COPY', 'THUMBS_UP', 'THUMBS_DOWN'
    rating INT CHECK (rating BETWEEN 1 AND 5),
    feedback_notes TEXT,
    session_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7.1 TABLES: ACCESSIBILITY, PRONUNCIATION, MULTILINGUAL & SIGN LANGUAGE
-- ----------------------------------------------------------------------------
CREATE TABLE word_pronunciations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID NOT NULL REFERENCES word_entries(id) ON DELETE CASCADE,
    phonetic_spelling VARCHAR(255) NOT NULL,     -- เช่น "ประ-สิด-ทิ-พาบ"
    transliteration_rtgs VARCHAR(255) NOT NULL,  -- เช่น "pra-sit-thi-phap"
    ipa_notation VARCHAR(255),
    tone_pattern VARCHAR(100),
    source_type VARCHAR(50) NOT NULL DEFAULT 'OFFICIAL_DATA',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_pronunciation_source CHECK (source_type IN ('OFFICIAL_DATA', 'AI_INFERRED'))
);

CREATE TABLE word_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL DEFAULT 'en',
    translated_word VARCHAR(255) NOT NULL,
    contextual_explanation TEXT,
    provenance VARCHAR(50) NOT NULL DEFAULT 'OFFICIAL_CURATED',
    confidence_score NUMERIC(5,4) DEFAULT 1.0000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_trans_provenance CHECK (provenance IN ('OFFICIAL_CURATED', 'AI_GENERATED', 'COMMUNITY'))
);

CREATE TABLE sign_language_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    sign_name VARCHAR(255) NOT NULL,
    handshape_description TEXT,
    dialect_region VARCHAR(50) NOT NULL DEFAULT 'CENTRAL',
    verification_status VARCHAR(50) NOT NULL DEFAULT 'VERIFIED',
    source_attribution VARCHAR(255),
    license VARCHAR(100) DEFAULT 'CC-BY-SA 4.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_sign_verification CHECK (verification_status IN ('OFFICIAL', 'VERIFIED', 'COMMUNITY', 'AI_INFERRED'))
);

CREATE TABLE sign_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sign_id UUID NOT NULL REFERENCES sign_language_entries(id) ON DELETE CASCADE,
    media_type VARCHAR(50) NOT NULL DEFAULT 'VIDEO_MP4',
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_media_type CHECK (media_type IN ('VIDEO_MP4', 'GIF', 'SVG'))
);

CREATE TABLE tts_cache (
    cache_key VARCHAR(64) PRIMARY KEY,          -- SHA-256(text + provider + voice)
    text_content TEXT NOT NULL,
    provider_name VARCHAR(50) NOT NULL,
    voice_id VARCHAR(100) NOT NULL,
    audio_storage_path TEXT NOT NULL,
    duration_ms INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. INDEXES FOR HIGH PERFORMANCE
-- ----------------------------------------------------------------------------
-- B-Tree Indexes
CREATE INDEX idx_word_entries_word_id ON word_entries(word_id);
CREATE INDEX idx_word_entries_edition_id ON word_entries(edition_id);
CREATE INDEX idx_definitions_entry_id ON definitions(entry_id);
CREATE INDEX idx_definitions_pos_id ON definitions(pos_id);
CREATE INDEX idx_examples_definition_id ON examples(definition_id);
CREATE INDEX idx_dialect_entries_region_id ON dialect_entries(region_id);
CREATE INDEX idx_dialect_entries_edition_id ON dialect_entries(edition_id);
CREATE INDEX idx_semantic_mappings_std ON semantic_mappings(standard_entry_id);
CREATE INDEX idx_semantic_mappings_dia ON semantic_mappings(dialect_entry_id);
CREATE INDEX idx_rag_evidence_explanation ON rag_evidence(explanation_id);
CREATE INDEX idx_rag_evidence_entry ON rag_evidence(entry_id);
CREATE INDEX idx_word_pronunciations_entry ON word_pronunciations(entry_id);
CREATE INDEX idx_word_translations_word_lang ON word_translations(word_id, language_code);
CREATE INDEX idx_sign_language_entries_word ON sign_language_entries(word_id);
CREATE INDEX idx_sign_media_sign ON sign_media(sign_id);

-- Trigram GIN Indexes (Fuzzy & Keyword Search)
CREATE INDEX idx_words_headword_trgm ON words USING gin (headword gin_trgm_ops);
CREATE INDEX idx_words_clean_trgm ON words USING gin (headword_clean gin_trgm_ops);
CREATE INDEX idx_definitions_text_trgm ON definitions USING gin (definition_text gin_trgm_ops);
CREATE INDEX idx_dialect_word_trgm ON dialect_entries USING gin (dialect_word gin_trgm_ops);

-- HNSW Vector Index (Dense Semantic Search)
CREATE INDEX idx_search_embeddings_vector_hnsw 
ON search_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX idx_search_embeddings_lookup ON search_embeddings(entity_type, edition_id);

-- ============================================================================
-- 9. MINIMAL SEED DATA [DEMO / SAMPLE DATA — FOR DEVELOPMENT ONLY]
-- ============================================================================

INSERT INTO dictionary_sources (id, code, name, publisher) VALUES
('11111111-1111-1111-1111-111111111111', 'ROYAL_SOCIETY', 'สำนักงานราชบัณฑิตยสภา', 'สำนักงานราชบัณฑิตยสภา'),
('22222222-2222-2222-2222-222222222222', 'DIALECT_INSTITUTE', 'สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย', 'ศูนย์ศึกษาภาษาถิ่น');

INSERT INTO dictionary_editions (id, source_id, edition_code, edition_year, title, publication_date) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'ROYAL_2542', '2542', 'พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๔๒', '1999-12-01'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'ROYAL_2554', '2554', 'พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔', '2012-04-05'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'ROYAL_2569', '2569', 'พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๖๙ (ฉบับดิจิทัล)', '2026-01-01'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'DIALECT_THAI', '2565', 'คลังรวบรวมพจนานุกรมภาษาถิ่นไทย ๔ ภาค', '2022-06-15');

INSERT INTO parts_of_speech (id, code, abbr_thai, name_thai, name_english) VALUES
('pos00001-0000-0000-0000-000000000001', 'N', 'น.', 'คำนาม', 'Noun'),
('pos00002-0000-0000-0000-000000000002', 'V', 'ก.', 'คำกริยา', 'Verb'),
('pos00003-0000-0000-0000-000000000003', 'ADJ', 'ว.', 'คำวิเศษณ์', 'Adjective');

INSERT INTO dialect_regions (id, code, name_thai, description) VALUES
('reg00001-0000-0000-0000-000000000001', 'NORTH', 'ภาษาถิ่นเหนือ', 'กลุ่มภาษาล้านนา ภาคเหนือ'),
('reg00002-0000-0000-0000-000000000002', 'NORTHEAST', 'ภาษาถิ่นอีสาน', 'กลุ่มภาษาไทย-ลาว ภาคตะวันออกเฉียงเหนือ'),
('reg00003-0000-0000-0000-000000000003', 'SOUTH', 'ภาษาถิ่นใต้', 'กลุ่มภาษาถิ่น ๑๔ จังหวัดภาคใต้');

-- Words & Evolution
INSERT INTO words (id, headword, headword_clean, char_length) VALUES
('w0000001-0000-0000-0000-000000000001', 'ประสิทธิภาพ', 'ประสิทธิภาพ', 11),
('w0000002-0000-0000-0000-000000000002', 'ประสิทธิผล', 'ประสิทธิผล', 10),
('w0000003-0000-0000-0000-000000000003', 'อร่อย', 'อร่อย', 4);

-- 'ประสิทธิภาพ' across editions
INSERT INTO word_entries (id, word_id, edition_id, pronunciation, page_number) VALUES
('e2542001-0000-0000-0000-000000000001', 'w0000001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ปฺระ-สิด-ทิ-พาบ', 712),
('e2554001-0000-0000-0000-000000000001', 'w0000001-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ปฺระ-สิด-ทิ-พาบ', 734),
('e2569001-0000-0000-0000-000000000001', 'w0000001-0000-0000-0000-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'ปฺระ-สิด-ทิ-พาบ', 820);

INSERT INTO definitions (id, entry_id, pos_id, sense_order, definition_text, register_level, subject_domain) VALUES
('def42001-0000-0000-0000-000000000001', 'e2542001-0000-0000-0000-000000000001', 'pos00001-0000-0000-0000-000000000001', 1, 
'[SAMPLE DEFINITION — 2542] ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการทำงาน', 'FORMAL', 'ทั่วไป'),
('def54001-0000-0000-0000-000000000001', 'e2554001-0000-0000-0000-000000000001', 'pos00001-0000-0000-0000-000000000001', 1, 
'[SAMPLE DEFINITION — 2554] ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการปฏิบัติงานโดยใช้ทรัพยากรและเวลาอย่างคุ้มค่าที่สุด', 'FORMAL', 'การบริหาร'),
('def69001-0000-0000-0000-000000000001', 'e2569001-0000-0000-0000-000000000001', 'pos00001-0000-0000-0000-000000000001', 1, 
'[SAMPLE DEFINITION — 2569] ความสามารถในการปฏิบัติการที่ให้ผลลัพธ์สูงสุดโดยสูญเสียทรัพยากร พลังงาน หรือเวลาน้อยที่สุด ครอบคลุมทั้งระบบการทำงานและเทคโนโลยี', 'FORMAL', 'การบริหารและเทคโนโลยี');

-- Dialects & Semantic Mappings
INSERT INTO word_entries (id, word_id, edition_id, pronunciation, page_number) VALUES
('e2569003-0000-0000-0000-000000000003', 'w0000003-0000-0000-0000-000000000003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'อะ-หฺร่อย', 1420);

INSERT INTO definitions (id, entry_id, pos_id, sense_order, definition_text, register_level) VALUES
('def69003-0000-0000-0000-000000000003', 'e2569003-0000-0000-0000-000000000003', 'pos00003-0000-0000-0000-000000000003', 1,
'[SAMPLE DEFINITION — 2569] มีรสดีเป็นที่ถูกปาก, มีรสชาติถูกอัธยาศัย', 'INFORMAL');

INSERT INTO dialect_entries (id, region_id, edition_id, dialect_word, dialect_word_clean, local_meaning) VALUES
('dia00001-0000-0000-0000-000000000001', 'reg00001-0000-0000-0000-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'ลำ', 'ลำ', '[SAMPLE DIALECT] รสชาติอร่อย มีรสโอชา'),
('dia00002-0000-0000-0000-000000000002', 'reg00002-0000-0000-0000-000000000002', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'แซ่บ', 'แซบ', '[SAMPLE DIALECT] รสชาติอร่อย เผ็ดนัวถึงใจ'),
('dia00003-0000-0000-0000-000000000003', 'reg00003-0000-0000-0000-000000000003', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'หรอย', 'หรอย', '[SAMPLE DIALECT] รสชาติอร่อย ได้อารมณ์ สะใจ');

INSERT INTO semantic_mappings (standard_entry_id, dialect_entry_id, relationship_type, confidence_score, source_type, curated_by) VALUES
('e2569003-0000-0000-0000-000000000003', 'dia00001-0000-0000-0000-000000000001', 'EXACT_EQUIVALENT', 1.0000, 'OFFICIAL_DATA', 'พจนานุกรมภาษาถิ่นเปรียบเทียบ'),
('e2569003-0000-0000-0000-000000000003', 'dia00002-0000-0000-0000-000000000002', 'EXACT_EQUIVALENT', 1.0000, 'OFFICIAL_DATA', 'พจนานุกรมภาษาถิ่นเปรียบเทียบ'),
('e2569003-0000-0000-0000-000000000003', 'dia00003-0000-0000-0000-000000000003', 'EXACT_EQUIVALENT', 1.0000, 'OFFICIAL_DATA', 'พจนานุกรมภาษาถิ่นเปรียบเทียบ');

-- Search Embedding Demo Sample
INSERT INTO search_embeddings (entity_type, entity_id, edition_id, searchable_text, model_name, embedding) VALUES
('DEFINITION', 'def69001-0000-0000-0000-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 
'ประสิทธิภาพ: ความสามารถในการปฏิบัติการที่ให้ผลลัพธ์สูงสุดโดยสูญเสียทรัพยากร พลังงาน หรือเวลาน้อยที่สุด', 
'text-embedding-3-small', 
array_fill(0.024::float4, ARRAY[1536])::vector);

-- Grounded AI & Evidence
INSERT INTO ai_explanations (id, user_query, explanation_type, generated_content, model_identifier) VALUES
('exp00001-0000-0000-0000-000000000001', 
'อยากบอกว่าทำงานได้ผลลัพธ์ดีเลิศ ใช้เวลาและงบประมาณอย่างคุ้มค่าที่สุด แต่ไม่อยากใช้คำว่าเร็ว', 
'MEANING_RECOMMEND', 
'ขอแนะนำคำว่า "ประสิทธิภาพ" เนื่องจากนิยามระบุถึงการกระทำที่ส่งผลสัมฤทธิ์โดยใช้ทรัพยากรและเวลาอย่างคุ้มค่า เหมาะกับบริบทการทำงานเชิงบริหาร', 
'gemini-1.5-pro');

INSERT INTO rag_evidence (explanation_id, entry_id, definition_id, relevance_score, cited_snippet) VALUES
('exp00001-0000-0000-0000-000000000001', 
'e2569001-0000-0000-0000-000000000001', 
'def69001-0000-0000-0000-000000000001', 
0.9420, 
'พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๖๙: "ความสามารถในการปฏิบัติการที่ให้ผลลัพธ์สูงสุดโดยสูญเสียทรัพยากร..."');

-- ----------------------------------------------------------------------------
-- 9. ACCESSIBILITY & MULTILINGUAL DEMO SEEDS
-- ----------------------------------------------------------------------------
-- Pronunciations & RTGS
INSERT INTO word_pronunciations (id, entry_id, phonetic_spelling, transliteration_rtgs, ipa_notation, tone_pattern, source_type) VALUES
('pro00001-0000-0000-0000-000000000001', 'e2569001-0000-0000-0000-000000000001', 'ประ-สิด-ทิ-พาบ', 'pra-sit-thi-phap', 'praʔ˨˩.sit̚˨˩.tʰi˦˥.pʰaːp̚˥˩', 'L-L-H-L', 'OFFICIAL_DATA'),
('pro00002-0000-0000-0000-000000000002', 'e2569003-0000-0000-0000-000000000003', 'อะ-หฺร่อย', 'a-roi', 'ʔaʔ˨˩.rɔːj˨˩', 'L-L', 'OFFICIAL_DATA');

-- Translations & English Bridge
INSERT INTO word_translations (id, word_id, language_code, translated_word, contextual_explanation, provenance, confidence_score) VALUES
('tra00001-0000-0000-0000-000000000001', 'w0000001-0000-0000-0000-000000000001', 'en', 'efficiency', 'The capacity to deliver maximum productive output with the least consumption of inputs (time, budget, energy).', 'OFFICIAL_CURATED', 1.0000),
('tra00002-0000-0000-0000-000000000002', 'w0000002-0000-0000-0000-000000000002', 'en', 'effectiveness', 'The degree to which objectives are achieved and targeted problems are resolved.', 'OFFICIAL_CURATED', 1.0000),
('tra00003-0000-0000-0000-000000000003', 'w0000003-0000-0000-0000-000000000003', 'en', 'delicious', 'Having a delightful and savory taste that appeals to the palate.', 'OFFICIAL_CURATED', 1.0000);

-- Thai Sign Language (TSL) Metadata & Media
INSERT INTO sign_language_entries (id, word_id, sign_name, handshape_description, dialect_region, verification_status, source_attribution) VALUES
('tsl00001-0000-0000-0000-000000000001', 'w0000001-0000-0000-0000-000000000001', 'ประสิทธิภาพ', 'มือขวาตั้งนิ้วชี้และนิ้วกลาง หมุนวนเป็นเกลียวไปข้างหน้าแล้วประกบฝ่ามือซ้าย', 'CENTRAL', 'OFFICIAL', 'วิทยาลัยราชสุดา มหาวิทยาลัยมหิดล'),
('tsl00002-0000-0000-0000-000000000002', 'w0000003-0000-0000-0000-000000000003', 'อร่อย', 'ใช้ปลายนิ้วชี้และนิ้วโป้งขวาแตะที่มุมปาก วนเบาๆ พร้อมพยักหน้าเล็กน้อย', 'CENTRAL', 'OFFICIAL', 'สมาคมคนหูหนวกแห่งประเทศไทย');

INSERT INTO sign_media (id, sign_id, media_type, media_url, thumbnail_url, is_primary) VALUES
('med00001-0000-0000-0000-000000000001', 'tsl00001-0000-0000-0000-000000000001', 'VIDEO_MP4', 'https://assets.thai-context.org/tsl/videos/prasitthiphap.mp4', 'https://assets.thai-context.org/tsl/thumbs/prasitthiphap.jpg', TRUE),
('med00002-0000-0000-0000-000000000002', 'tsl00002-0000-0000-0000-000000000002', 'VIDEO_MP4', 'https://assets.thai-context.org/tsl/videos/aroi.mp4', 'https://assets.thai-context.org/tsl/thumbs/aroi.jpg', TRUE);

