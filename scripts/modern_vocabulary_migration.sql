-- Modern Thai Vocabulary Layer Schema Migration
-- Strictly separated from official dictionary tables

CREATE TABLE IF NOT EXISTS modern_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term VARCHAR(255) NOT NULL,
    normalized_term VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    language VARCHAR(10) NOT NULL DEFAULT 'th',
    term_type VARCHAR(50) NOT NULL DEFAULT 'WORD',
    status VARCHAR(50) NOT NULL DEFAULT 'COMMON',
    description TEXT,
    origin VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN',
    register VARCHAR(50) DEFAULT 'NEUTRAL',
    audience VARCHAR(50) DEFAULT 'GENERAL',
    first_seen_at DATE,
    last_seen_at DATE,
    source_count INT NOT NULL DEFAULT 1,
    confidence DECIMAL(5, 4) NOT NULL DEFAULT 1.0000,
    is_searchable BOOLEAN NOT NULL DEFAULT TRUE,
    official_word_id UUID REFERENCES words(id) ON DELETE SET NULL,
    transliteration VARCHAR(255),
    english_meaning TEXT,
    pronunciation VARCHAR(255),
    usage_warning TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modern_terms_term ON modern_terms(term);
CREATE INDEX IF NOT EXISTS idx_modern_terms_normalized ON modern_terms(normalized_term);
CREATE INDEX IF NOT EXISTS idx_modern_terms_status ON modern_terms(status);
CREATE INDEX IF NOT EXISTS idx_modern_terms_type ON modern_terms(term_type);
CREATE INDEX IF NOT EXISTS idx_modern_terms_origin ON modern_terms(origin);
CREATE INDEX IF NOT EXISTS idx_modern_terms_official_word ON modern_terms(official_word_id);

CREATE TABLE IF NOT EXISTS modern_term_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modern_term_id UUID NOT NULL REFERENCES modern_terms(id) ON DELETE CASCADE,
    source_type VARCHAR(50) NOT NULL DEFAULT 'DEMO',
    source_name VARCHAR(255) NOT NULL,
    source_url TEXT,
    source_date VARCHAR(50),
    excerpt TEXT,
    license VARCHAR(100) DEFAULT 'CC-BY-SA 4.0',
    verification_status VARCHAR(50) NOT NULL DEFAULT 'UNVERIFIED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modern_term_sources_term_id ON modern_term_sources(modern_term_id);
CREATE INDEX IF NOT EXISTS idx_modern_term_sources_type ON modern_term_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_modern_term_sources_status ON modern_term_sources(verification_status);

CREATE TABLE IF NOT EXISTS modern_term_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modern_term_id UUID NOT NULL REFERENCES modern_terms(id) ON DELETE CASCADE,
    definition TEXT NOT NULL,
    definition_type VARCHAR(50) NOT NULL DEFAULT 'SOURCE_DEFINED',
    source_id UUID,
    generated_by VARCHAR(100),
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modern_term_definitions_term_id ON modern_term_definitions(modern_term_id);

CREATE TABLE IF NOT EXISTS modern_term_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modern_term_id UUID NOT NULL REFERENCES modern_terms(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modern_term_categories_term_id ON modern_term_categories(modern_term_id);
CREATE INDEX IF NOT EXISTS idx_modern_term_categories_cat ON modern_term_categories(category);

CREATE TABLE IF NOT EXISTS modern_term_examples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modern_term_id UUID NOT NULL REFERENCES modern_terms(id) ON DELETE CASCADE,
    example_text TEXT NOT NULL,
    context_note TEXT,
    source_attribution VARCHAR(255),
    register VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modern_term_examples_term_id ON modern_term_examples(modern_term_id);

CREATE TABLE IF NOT EXISTS modern_term_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modern_term_id UUID NOT NULL REFERENCES modern_terms(id) ON DELETE CASCADE,
    target_term VARCHAR(255) NOT NULL,
    target_modern_term_id UUID REFERENCES modern_terms(id) ON DELETE SET NULL,
    relationship_type VARCHAR(50) NOT NULL,
    source_type VARCHAR(50) NOT NULL DEFAULT 'AI_INFERRED',
    confidence DECIMAL(5, 4) NOT NULL DEFAULT 0.8500,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modern_term_rel_term_id ON modern_term_relationships(modern_term_id);
CREATE INDEX IF NOT EXISTS idx_modern_term_rel_target ON modern_term_relationships(target_term);

CREATE TABLE IF NOT EXISTS modern_term_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term VARCHAR(255) NOT NULL,
    definition TEXT NOT NULL,
    context TEXT,
    example TEXT,
    category VARCHAR(50),
    source_name VARCHAR(255),
    source_url TEXT,
    submitter_name VARCHAR(100),
    submitter_email VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_REVIEW',
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_modern_term_submissions_status ON modern_term_submissions(status);
CREATE INDEX IF NOT EXISTS idx_modern_term_submissions_term ON modern_term_submissions(term);
