-- Dialect Intelligence & Discovery Migration Script
-- Thai Context Platform

BEGIN;

-- 1. Enhance dialect_regions with type and parent_region_id hierarchy
ALTER TABLE dialect_regions ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'REGION';
ALTER TABLE dialect_regions ADD COLUMN IF NOT EXISTS parent_region_id UUID REFERENCES dialect_regions(id) ON DELETE SET NULL;
ALTER TABLE dialect_regions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Enhance dialect_entries with standard word linking, province, and metadata
ALTER TABLE dialect_entries ADD COLUMN IF NOT EXISTS word_id UUID REFERENCES words(id) ON DELETE SET NULL;
ALTER TABLE dialect_entries ADD COLUMN IF NOT EXISTS province_id UUID REFERENCES dialect_regions(id) ON DELETE SET NULL;
ALTER TABLE dialect_entries ADD COLUMN IF NOT EXISTS province VARCHAR(100);
ALTER TABLE dialect_entries ADD COLUMN IF NOT EXISTS language_variant VARCHAR(100);
ALTER TABLE dialect_entries ADD COLUMN IF NOT EXISTS part_of_speech VARCHAR(50);
ALTER TABLE dialect_entries ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'OFFICIAL_SOURCE';
ALTER TABLE dialect_entries ADD COLUMN IF NOT EXISTS context VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_dialect_entries_word_id ON dialect_entries(word_id);
CREATE INDEX IF NOT EXISTS idx_dialect_entries_province_id ON dialect_entries(province_id);
CREATE INDEX IF NOT EXISTS idx_dialect_entries_status ON dialect_entries(status);

-- 3. Create dialect_sources table for full provenance tracking
CREATE TABLE IF NOT EXISTS dialect_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dialect_entry_id UUID NOT NULL REFERENCES dialect_entries(id) ON DELETE CASCADE,
    source_type VARCHAR(50) NOT NULL, -- 'ROYAL_SOCIETY', 'ORGANIZER_DATA', 'DIALECT_DICTIONARY', 'RESEARCH_DATA', 'OPEN_DATA', 'EXTERNAL', 'DEMO'
    source_name VARCHAR(255) NOT NULL,
    source_url TEXT,
    edition VARCHAR(100),
    source_date DATE,
    license VARCHAR(100),
    verification_status VARCHAR(50) NOT NULL DEFAULT 'VERIFIED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dialect_sources_entry ON dialect_sources(dialect_entry_id);

-- 4. Create dialect_definitions table distinguishing source vs AI definitions
CREATE TABLE IF NOT EXISTS dialect_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dialect_entry_id UUID NOT NULL REFERENCES dialect_entries(id) ON DELETE CASCADE,
    definition TEXT NOT NULL,
    definition_type VARCHAR(50) NOT NULL DEFAULT 'SOURCE_DEFINED', -- 'SOURCE_DEFINED', 'EDITOR_REVIEWED', 'AI_GENERATED'
    source_id UUID REFERENCES dialect_sources(id) ON DELETE SET NULL,
    verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dialect_definitions_entry ON dialect_definitions(dialect_entry_id);

-- 5. Create dialect_examples table
CREATE TABLE IF NOT EXISTS dialect_examples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dialect_entry_id UUID NOT NULL REFERENCES dialect_entries(id) ON DELETE CASCADE,
    example_text TEXT NOT NULL,
    meaning_th TEXT,
    context_note TEXT,
    source_attribution VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dialect_examples_entry ON dialect_examples(dialect_entry_id);

-- 6. Create dialect_relationships table
CREATE TABLE IF NOT EXISTS dialect_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dialect_entry_id UUID NOT NULL REFERENCES dialect_entries(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL DEFAULT 'STANDARD_WORD',
    target_id VARCHAR(255),
    standard_word_id UUID REFERENCES words(id) ON DELETE SET NULL,
    relationship_type VARCHAR(50) NOT NULL, -- 'STANDARD_EQUIVALENT', 'MEANING_EQUIVALENT', 'RELATED', 'REGIONAL_VARIANT', 'SYNONYM', 'SIMILAR_MEANING', 'OPPOSITE', 'AI_INFERRED'
    confidence_score NUMERIC(5, 4) NOT NULL DEFAULT 1.0000,
    notes TEXT,
    is_inferred BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dialect_relationships_entry ON dialect_relationships(dialect_entry_id);
CREATE INDEX IF NOT EXISTS idx_dialect_relationships_std_word ON dialect_relationships(standard_word_id);

COMMIT;
