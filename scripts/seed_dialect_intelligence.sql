BEGIN;

INSERT INTO dialect_regions (id, code, name_thai, type, description, created_at, updated_at)
VALUES ('00000010-0000-0000-0000-000000000000', 'CENTRAL', 'ภาษาถิ่นกลาง', 'REGION', 'กลุ่มภาษาไทยถิ่นกลางและลุ่มแม่น้ำเจ้าพระยา มาตรฐานภาษาไทยราชการ', NOW(), NOW())
ON CONFLICT (code) DO UPDATE 
SET name_thai = EXCLUDED.name_thai, type = EXCLUDED.type, description = EXCLUDED.description, updated_at = NOW();


INSERT INTO dialect_regions (id, code, name_thai, type, description, created_at, updated_at)
VALUES ('00000011-0000-0000-0000-000000000001', 'NORTH', 'ภาษาถิ่นเหนือ', 'REGION', 'กลุ่มภาษาล้านนา (คำเมือง) ภาคเหนือตอนบน ๘ จังหวัด', NOW(), NOW())
ON CONFLICT (code) DO UPDATE 
SET name_thai = EXCLUDED.name_thai, type = EXCLUDED.type, description = EXCLUDED.description, updated_at = NOW();


INSERT INTO dialect_regions (id, code, name_thai, type, description, created_at, updated_at)
VALUES ('00000012-0000-0000-0000-000000000002', 'NORTHEAST', 'ภาษาถิ่นอีสาน', 'REGION', 'กลุ่มภาษาไทย-ลาว และภาษาถิ่นภาคตะวันออกเฉียงเหนือ ๒๐ จังหวัด', NOW(), NOW())
ON CONFLICT (code) DO UPDATE 
SET name_thai = EXCLUDED.name_thai, type = EXCLUDED.type, description = EXCLUDED.description, updated_at = NOW();


INSERT INTO dialect_regions (id, code, name_thai, type, description, created_at, updated_at)
VALUES ('00000013-0000-0000-0000-000000000003', 'SOUTH', 'ภาษาถิ่นใต้', 'REGION', 'กลุ่มภาษาไทยถิ่นใต้ ๑๔ จังหวัดภาคใต้', NOW(), NOW())
ON CONFLICT (code) DO UPDATE 
SET name_thai = EXCLUDED.name_thai, type = EXCLUDED.type, description = EXCLUDED.description, updated_at = NOW();


INSERT INTO dialect_regions (id, code, name_thai, type, parent_region_id, description, created_at, updated_at)
SELECT 'b46ccf77-c3f9-55bc-8e3f-01fee7c1e2ac', 'CHIANG_MAI', 'เชียงใหม่', 'PROVINCE', id, 'ภาษาถิ่นเหนือ สำเนียงเชียงใหม่', NOW(), NOW()
FROM dialect_regions WHERE code = 'NORTH'
ON CONFLICT (code) DO UPDATE 
SET name_thai = EXCLUDED.name_thai, type = 'PROVINCE', description = EXCLUDED.description, updated_at = NOW();


INSERT INTO dialect_regions (id, code, name_thai, type, parent_region_id, description, created_at, updated_at)
SELECT '69af2d68-a345-5f27-be1d-e54b1b87baf6', 'CHIANG_RAI', 'เชียงราย', 'PROVINCE', id, 'ภาษาถิ่นเหนือ สำเนียงเชียงราย', NOW(), NOW()
FROM dialect_regions WHERE code = 'NORTH'
ON CONFLICT (code) DO UPDATE 
SET name_thai = EXCLUDED.name_thai, type = 'PROVINCE', description = EXCLUDED.description, updated_at = NOW();


INSERT INTO dialect_regions (id, code, name_thai, type, parent_region_id, description, created_at, updated_at)
SELECT '444db5c3-df8b-5b88-a139-b16d01458534', 'LAMPANG', 'ลำปาง', 'PROVINCE', id, 'ภาษาถิ่นเหนือ สำเนียงลำปาง', NOW(), NOW()
FROM dialect_regions WHERE code = 'NORTH'
ON CONFLICT (code) DO UPDATE 
SET name_thai = EXCLUDED.name_thai, type = 'PROVINCE', description = EXCLUDED.description, updated_at = NOW();


INSERT INTO dialect_regions (id, code, name_thai, type, parent_region_id, description, created_at, updated_at)
SELECT '8c67b4d7-3e58-520c-a54a-35982e283e6e', 'NAN', 'น่าน', 'PROVINCE', id, 'ภาษาถิ่นเหนือ สำเนียงน่าน', NOW(), NOW()
FROM dialect_regions WHERE code = 'NORTH'
ON CONFLICT (code) DO UPDATE 
SET name_thai = EXCLUDED.name_thai, type = 'PROVINCE', description = EXCLUDED.description, updated_at = NOW();


INSERT INTO dialect_regions (id, code, name_thai, type, parent_region_id, description, created_at, updated_at)
SELECT '0b87cb10-62c8-5b43-8753-92362dc20976', 'KHON_KAEN', 'ขอนแก่น', 'PROVINCE', id, 'ภาษาถิ่นอีสาน สำเนียงขอนแก่น', NOW(), NOW()
FROM dialect_regions WHERE code = 'NORTHEAST'
ON CONFLICT (code) DO UPDATE 
SET name_thai = EXCLUDED.name_thai, type = 'PROVINCE', description = EXCLUDED.description, updated_at = NOW();


INSERT INTO dialect_regions (id, code, name_thai, type, parent_region_id, description, created_at, updated_at)
SELECT '5444bfe3-06a8-59bb-9f43-5ae52f428243', 'UBON_RATCHATHANI', 'อุบลราชธานี', 'PROVINCE', id, 'ภาษาถิ่นอีสาน สำเนียงอุบลราชธานี', NOW(), NOW()
FROM dialect_regions WHERE code = 'NORTHEAST'
ON CONFLICT (code) DO UPDATE 
SET name_thai = EXCLUDED.name_thai, type = 'PROVINCE', description = EXCLUDED.description, updated_at = NOW();


INSERT INTO dialect_regions (id, code, name_thai, type, parent_region_id, description, created_at, updated_at)
SELECT '770db170-ef46-5880-bf28-01525a87795c', 'NAKHON_RATCHASIMA', 'นครราชสีมา', 'PROVINCE', id, 'ภาษาถิ่นอีสาน/โคราช สำเนียงโคราช', NOW(), NOW()
FROM dialect_regions WHERE code = 'NORTHEAST'
ON CONFLICT (code) DO UPDATE 
SET name_thai = EXCLUDED.name_thai, type = 'PROVINCE', description = EXCLUDED.description, updated_at = NOW();


INSERT INTO dialect_regions (id, code, name_thai, type, parent_region_id, description, created_at, updated_at)
SELECT '3529f4a1-9670-56f4-931e-8cb8d85967ac', 'UDON_THANI', 'อุดรธานี', 'PROVINCE', id, 'ภาษาถิ่นอีสาน สำเนียงอุดรธานี', NOW(), NOW()
FROM dialect_regions WHERE code = 'NORTHEAST'
ON CONFLICT (code) DO UPDATE 
SET name_thai = EXCLUDED.name_thai, type = 'PROVINCE', description = EXCLUDED.description, updated_at = NOW();


INSERT INTO dialect_regions (id, code, name_thai, type, parent_region_id, description, created_at, updated_at)
SELECT '4866a7e1-6f54-58cd-bced-7fbe5bdf1259', 'SONGKHLA', 'สงขลา', 'PROVINCE', id, 'ภาษาถิ่นใต้ สำเนียงสงขลา', NOW(), NOW()
FROM dialect_regions WHERE code = 'SOUTH'
ON CONFLICT (code) DO UPDATE 
SET name_thai = EXCLUDED.name_thai, type = 'PROVINCE', description = EXCLUDED.description, updated_at = NOW();


INSERT INTO dialect_regions (id, code, name_thai, type, parent_region_id, description, created_at, updated_at)
SELECT '2dc5cb45-380e-53f7-b5cf-3d088e45b002', 'NAKHON_SI_THAMMARAT', 'นครศรีธรรมราช', 'PROVINCE', id, 'ภาษาถิ่นใต้ สำเนียงคอน', NOW(), NOW()
FROM dialect_regions WHERE code = 'SOUTH'
ON CONFLICT (code) DO UPDATE 
SET name_thai = EXCLUDED.name_thai, type = 'PROVINCE', description = EXCLUDED.description, updated_at = NOW();


INSERT INTO dialect_regions (id, code, name_thai, type, parent_region_id, description, created_at, updated_at)
SELECT 'deaeb837-c192-5544-8e74-11927a15c36f', 'SURAT_THANI', 'สุราษฎร์ธานี', 'PROVINCE', id, 'ภาษาถิ่นใต้ สำเนียงสุราษฎร์', NOW(), NOW()
FROM dialect_regions WHERE code = 'SOUTH'
ON CONFLICT (code) DO UPDATE 
SET name_thai = EXCLUDED.name_thai, type = 'PROVINCE', description = EXCLUDED.description, updated_at = NOW();


INSERT INTO dialect_regions (id, code, name_thai, type, parent_region_id, description, created_at, updated_at)
SELECT 'cacd638a-080d-5c09-ae64-d40c8043f388', 'PHUKET', 'ภูเก็ต', 'PROVINCE', id, 'ภาษาถิ่นใต้ สำเนียงภูเก็ต (เพอรานากัน)', NOW(), NOW()
FROM dialect_regions WHERE code = 'SOUTH'
ON CONFLICT (code) DO UPDATE 
SET name_thai = EXCLUDED.name_thai, type = 'PROVINCE', description = EXCLUDED.description, updated_at = NOW();


INSERT INTO dialect_regions (id, code, name_thai, type, parent_region_id, description, created_at, updated_at)
SELECT 'd811a0ef-3312-572e-9943-7e5d8815822b', 'SUPHAN_BURI', 'สุพรรณบุรี', 'PROVINCE', id, 'ภาษาถิ่นกลาง สำเนียงสุพรรณบุรีเหน่อ', NOW(), NOW()
FROM dialect_regions WHERE code = 'CENTRAL'
ON CONFLICT (code) DO UPDATE 
SET name_thai = EXCLUDED.name_thai, type = 'PROVINCE', description = EXCLUDED.description, updated_at = NOW();


INSERT INTO dialect_regions (id, code, name_thai, type, parent_region_id, description, created_at, updated_at)
SELECT '1e691b48-d4a8-587e-9e10-830ccf523ad3', 'AYUTTHAYA', 'พระนครศรีอยุธยา', 'PROVINCE', id, 'ภาษาถิ่นกลาง สำเนียงอยุธยา', NOW(), NOW()
FROM dialect_regions WHERE code = 'CENTRAL'
ON CONFLICT (code) DO UPDATE 
SET name_thai = EXCLUDED.name_thai, type = 'PROVINCE', description = EXCLUDED.description, updated_at = NOW();


-- Backfill existing dialect entries into dialect_definitions
INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
SELECT gen_random_uuid(), de.id, de.local_meaning, 'SOURCE_DEFINED', TRUE, NOW(), NOW()
FROM dialect_entries de
WHERE NOT EXISTS (
    SELECT 1 FROM dialect_definitions dd WHERE dd.dialect_entry_id = de.id
);

-- Backfill existing dialect entries into dialect_sources
INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, edition, verification_status, created_at)
SELECT gen_random_uuid(), de.id, 'DIALECT_DICTIONARY', COALESCE(s.name, 'พจนานุกรมภาษาถิ่นทางการ'), dict_ed.edition_year, 'VERIFIED', NOW()
FROM dialect_entries de
LEFT JOIN dictionary_editions dict_ed ON de.edition_id = dict_ed.id
LEFT JOIN dictionary_sources s ON dict_ed.source_id = s.id
WHERE NOT EXISTS (
    SELECT 1 FROM dialect_sources ds WHERE ds.dialect_entry_id = de.id
);


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := '4a36a6c5-5b43-5746-9ef6-a9127de7e38a';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'CENTRAL' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'พระนครศรีอยุธยา' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'กิน' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'กิน', 'กิน', 'kin', 'รับประทานอาหาร เคี้ยวกลืนอาหารในชีวิตประจำวัน',
        'พระนครศรีอยุธยา', 'OFFICIAL_SOURCE', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'รับประทานอาหาร เคี้ยวกลืนอาหารในชีวิตประจำวัน', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'ROYAL_SOCIETY', 'พจนานุกรม ฉบับราชบัณฑิตยสถาน', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'กินข้าวหรือยังคุณ มาทานด้วยกันก่อน', 'รับประทานอาหาร เคี้ยวแล้วกลืนลงกระเพาะ', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'กิน', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: กิน', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := '4986295f-eba9-5217-a087-7aca3fdcccc4';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'NORTH' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'เชียงใหม่' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'กิน' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'กิ๋น', 'กิ๋น', 'kin˩˩', 'รับประทานอาหาร กินข้าว ดื่มน้ำ',
        'เชียงใหม่', 'VERIFIED', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'รับประทานอาหาร กินข้าว ดื่มน้ำ', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นล้านนา-ไทย ฉบับแม่ฟ้าหลวง', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'กิ๋นข้าวแลงแล้วก๋า วันนี้มีแกงฮังเลลำขนาด', 'รับประทานอาหาร เคี้ยวแล้วกลืนลงกระเพาะ', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'กิน', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: กิน', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := '369ddfbf-ed36-53f1-a81e-ca00b702a8e2';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'NORTHEAST' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'ขอนแก่น' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'กิน' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'กิน', 'กิน', 'kin', 'รับประทานอาหาร ร่วมสำรับข้าวเหนียว',
        'ขอนแก่น', 'VERIFIED', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'รับประทานอาหาร ร่วมสำรับข้าวเหนียว', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นอีสาน-ไทย มหาวิทยาลัยขอนแก่น', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'มากินข้าวแลงนำกันเด้อ มื้อนี้มีลาบปลาคัง', 'รับประทานอาหาร เคี้ยวแล้วกลืนลงกระเพาะ', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'กิน', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: กิน', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := 'f033309d-0dd5-5d6b-b47a-59f4372e4386';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'NORTHEAST' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'อุบลราชธานี' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'กิน' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'โสภ', 'โสภ', 'soːp̚', 'กินอาหารอย่างเอร็ดอร่อย เคี้ยวอย่างเพลิดเพลิน',
        'อุบลราชธานี', 'VERIFIED', 'LOCAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'กินอาหารอย่างเอร็ดอร่อย เคี้ยวอย่างเพลิดเพลิน', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'RESEARCH_DATA', 'คลังคำภาษาถิ่นอีสาน มหาวิทยาลัยอุบลราชธานี', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'เด็กน้อยนั่งโสภข้าวจี่ฮ้อนๆ ตอนเช้า', 'รับประทานอาหาร เคี้ยวแล้วกลืนลงกระเพาะ', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'กิน', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: กิน', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := '49a55b28-94c9-51a7-9e92-757cf12f36f8';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'SOUTH' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'สงขลา' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'กิน' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'กิน', 'กิน', 'kin', 'รับประทานอาหาร เคี้ยวกลืน',
        'สงขลา', 'OFFICIAL_SOURCE', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'รับประทานอาหาร เคี้ยวกลืน', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นใต้ พ.ศ. ๒๕๒๕ สถาบันทักษิณคดีศึกษา', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'กินข้าวยังน้องเห้อ วันนี้แม่แกงส้มปลากด', 'รับประทานอาหาร เคี้ยวแล้วกลืนลงกระเพาะ', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'กิน', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: กิน', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := 'e8126cb6-9c0a-5f6d-a0d8-2dc2406e9f20';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'NORTH' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'เชียงใหม่' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'คิดถึง' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'กึดเติงหา', 'กึดเติงหา', 'kɯt̚˦˥.tɤːŋ.haː˩˩', 'คิดถึงอย่างลึกซึ้ง นึกถึงด้วยความรักและความผูกพันข้ามวันข้ามคืน',
        'เชียงใหม่', 'VERIFIED', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'คิดถึงอย่างลึกซึ้ง นึกถึงด้วยความรักและความผูกพันข้ามวันข้ามคืน', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นล้านนา สถาบันวิจัยสังคม มช.', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'เปิ้นกึดเติงหาตั๋วขนาดเน้อ เมื่อใดจะปิ๊กมาเจียงใหม่', 'นึกถึงด้วยความผูกพัน นึกถึงด้วยความเสน่หาหรืออาลัย', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'คิดถึง', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: คิดถึง', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := '12ea2207-875f-53b2-b850-41ee17fdb0f9';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'NORTHEAST' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'ขอนแก่น' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'คิดถึง' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'คึดฮอด', 'คึดฮอด', 'kʰɯt̚.hɔːt̚', 'คิดถึงอย่างจับใจ นึกถึงด้วยใจอาวรณ์และเฝ้ารอ',
        'ขอนแก่น', 'VERIFIED', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'คิดถึงอย่างจับใจ นึกถึงด้วยใจอาวรณ์และเฝ้ารอ', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'สารานุกรมภาษาอีสาน-ไทย-อังกฤษ ปรีชา พิณทอง', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'คึดฮอดบ้านหลาย อยู่กรุงเทพฯ คนเดียวบ่มีไผคือพ่อแม่', 'นึกถึงด้วยความผูกพัน นึกถึงด้วยความเสน่หาหรืออาลัย', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'คิดถึง', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: คิดถึง', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := 'b8fd66d5-0186-5165-8214-1948f09abb42';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'SOUTH' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'นครศรีธรรมราช' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'คิดถึง' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'ห่วงหา', 'ห่วงหา', 'huaŋ.haː', 'คิดถึงด้วยความห่วงใย นึกถึงความปลอดภัยและความเป็นอยู่',
        'นครศรีธรรมราช', 'VERIFIED', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'คิดถึงด้วยความห่วงใย นึกถึงความปลอดภัยและความเป็นอยู่', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นใต้ สถาบันทักษิณคดีศึกษา', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'แม่ห่วงหาน้องอยู่เสมอ ไปเรียนไกลบ้านอย่าลืมโทรกลับมานะ', 'นึกถึงด้วยความผูกพัน นึกถึงด้วยความเสน่หาหรืออาลัย', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'คิดถึง', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: คิดถึง', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := '4b350c69-8955-5b7d-b5d2-4201b15e9b8d';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'NORTH' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'เชียงใหม่' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'อร่อย' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'ลำ', 'ลำ', 'lam˧˧', 'มีรสชาติดี รสโอชา อร่อยถูกปากถูกใจ',
        'เชียงใหม่', 'VERIFIED', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'มีรสชาติดี รสโอชา อร่อยถูกปากถูกใจ', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นล้านนา-ไทย ฉบับแม่ฟ้าหลวง', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'น้ำพริกหนุ่มครกนี้ลำแต้ๆ ลำขนาด', 'มีรสดี ถูกปาก มีโอชา', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'อร่อย', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: อร่อย', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := '433af5d4-4004-5ea5-99c2-f44e43c15304';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'NORTHEAST' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'ขอนแก่น' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'อร่อย' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'แซ่บ', 'แซ่บ', 'sɛːp̚', 'รสชาติดีเยี่ยม เผ็ดนัว อร่อยถึงเครื่อง',
        'ขอนแก่น', 'VERIFIED', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'รสชาติดีเยี่ยม เผ็ดนัว อร่อยถึงเครื่อง', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นอีสาน มหาวิทยาลัยขอนแก่น', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'ส้มตำปลาร้าร้านนี้แซ่บนัวอีหลี', 'มีรสดี ถูกปาก มีโอชา', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'อร่อย', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: อร่อย', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := '5fd02e78-7194-5678-bc2f-39d0a17d98b4';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'SOUTH' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'สงขลา' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'อร่อย' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'หรอย', 'หรอย', 'rɔːj', 'รสชาติอร่อยมาก ถึงเครื่อง ถึงพริกถึงขิง ได้อารมณ์สะใจ',
        'สงขลา', 'VERIFIED', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'รสชาติอร่อยมาก ถึงเครื่อง ถึงพริกถึงขิง ได้อารมณ์สะใจ', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นใต้ สถาบันทักษิณคดีศึกษา', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'แกงไตปลาถ้วยนี้หรอยจังฮู้ กินกับผักเหนาะเข้ากันดี', 'มีรสดี ถูกปาก มีโอชา', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'อร่อย', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: อร่อย', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := '59bfad81-3aa7-53a6-8ffb-3f14b47a813c';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'NORTH' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'ลำปาง' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'มอง' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'ผ่อ', 'ผ่อ', 'pʰɔː˨˩', 'มองดู แลดู ทอดสายตาดู',
        'ลำปาง', 'VERIFIED', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'มองดู แลดู ทอดสายตาดู', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นล้านนา-ไทย', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'ผ่อตางหน้าไว้เน้อ ระวังสะดุดตอไม้', 'ใช้สายตาแลดู เพ่งสายตาไปที่สิ่งใดสิ่งหนึ่ง', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'มอง', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: มอง', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := 'b8b48371-3df1-5f6e-b62c-6009a6371fa8';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'NORTHEAST' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'อุบลราชธานี' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'มอง' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'เบิ่ง', 'เบิ่ง', 'bɤːŋ', 'มองดู เพ่งดู สังเกตดู',
        'อุบลราชธานี', 'VERIFIED', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'มองดู เพ่งดู สังเกตดู', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นอีสาน', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'มาเบิ่งหมอลำนำกันมื้อนี้ คนหลายคัก', 'ใช้สายตาแลดู เพ่งสายตาไปที่สิ่งใดสิ่งหนึ่ง', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'มอง', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: มอง', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := 'd7955152-4a7a-5937-9257-1814de7d8cc2';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'SOUTH' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'นครศรีธรรมราช' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'มอง' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'แล', 'แล', 'lɛː', 'มองดู ใช้สายตาเพ่งมอง',
        'นครศรีธรรมราช', 'VERIFIED', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'มองดู ใช้สายตาเพ่งมอง', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นใต้', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'แลทางโน้นต๊ะ มีเรือหลวงแล่นผ่านหน้าอ่าว', 'ใช้สายตาแลดู เพ่งสายตาไปที่สิ่งใดสิ่งหนึ่ง', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'มอง', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: มอง', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := 'a6b6a9f3-17e8-5d4e-b761-d40c045ba8a9';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'NORTH' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'เชียงใหม่' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'พูด' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'อู้', 'อู้', 'ʔuː˥˩', 'พูดจา สนทนา เปล่งถ้อยคำภาษา',
        'เชียงใหม่', 'VERIFIED', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'พูดจา สนทนา เปล่งถ้อยคำภาษา', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นล้านนา', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'สูเขาอู้กำเมืองได้ก่อ อู้จาเพราะๆ เน้อ', 'เปล่งเสียงออกมาเป็นถ้อยคำ สื่อความหมายทางภาษา', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'พูด', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: พูด', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := 'd423cf69-1a1d-55b3-87d5-ccd58f9650c8';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'NORTHEAST' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'ขอนแก่น' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'พูด' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'เว้า', 'เว้า', 'waːw˥˩', 'พูด พูดจา สนทนา บอกเล่า',
        'ขอนแก่น', 'VERIFIED', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'พูด พูดจา สนทนา บอกเล่า', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นอีสาน', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'เพิ่นเว้าเรื่องความหลังสู่ฟัง ฟังแล้วน้ำตาซึม', 'เปล่งเสียงออกมาเป็นถ้อยคำ สื่อความหมายทางภาษา', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'พูด', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: พูด', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := 'e0088781-852e-5b7d-9274-80f33ce5f30d';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'SOUTH' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'สงขลา' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'พูด' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'แหลง', 'แหลง', 'lɛːŋ', 'พูด เปล่งวาจา สนทนาสื่อความ',
        'สงขลา', 'VERIFIED', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'พูด เปล่งวาจา สนทนาสื่อความ', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นใต้', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'คนใต้อยู่ไหนก็แหลงใต้กันชัดเจน', 'เปล่งเสียงออกมาเป็นถ้อยคำ สื่อความหมายทางภาษา', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'พูด', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: พูด', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := 'a40670fb-1a7a-595b-ac70-9c2cb2d17ebb';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'NORTH' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'เชียงใหม่' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'โกหก' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'ขี้จุ๊', 'ขี้จุ๊', 'kʰiː˥˩.tɕuʔ˦˥', 'พูดปด หลอกลวง ไม่พูดความจริง',
        'เชียงใหม่', 'VERIFIED', 'INFORMAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'พูดปด หลอกลวง ไม่พูดความจริง', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นล้านนา', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'อย่ามาขี้จุ๊เบเบ๋ เปิ้นฮู้หมดแล้วว่าแอบไปเที่ยว', 'พูดปด พูดเท็จ ไม่เป็นความจริง', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'โกหก', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: โกหก', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := '3a300768-aa1e-5927-a086-22ac5e16c134';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'NORTHEAST' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'ขอนแก่น' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'โกหก' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'ขี้ตั๋ว', 'ขี้ตั๋ว', 'kʰiː.tua', 'พูดเท็จ หลอกลวง ตลบลอย',
        'ขอนแก่น', 'VERIFIED', 'INFORMAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'พูดเท็จ หลอกลวง ตลบลอย', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นอีสาน', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'คนขี้ตั๋วตกนรกเด้อ เว้าความจริงมาดีกว่า', 'พูดปด พูดเท็จ ไม่เป็นความจริง', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'โกหก', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: โกหก', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := '34db29b7-eb13-5a61-8ecf-115a2ab83416';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'SOUTH' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'สุราษฎร์ธานี' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'โกหก' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'ขี้ฮก', 'ขี้ฮก', 'kʰiː.hok', 'พูดไม่จริง โกหก หลอกต้ม',
        'สุราษฎร์ธานี', 'VERIFIED', 'INFORMAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'พูดไม่จริง โกหก หลอกต้ม', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นใต้', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'มึงอย่าขี้ฮกต๊ะ เมื่อวานยังเห็นอยู่แถวตลาด', 'พูดปด พูดเท็จ ไม่เป็นความจริง', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'โกหก', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: โกหก', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := '7c6802da-272b-598b-b77c-ce1af86c9a88';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'NORTH' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'น่าน' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'กลับบ้าน' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'ปิ๊กบ้าน', 'ปิ๊กบ้าน', 'pik̚.baːn', 'เดินทางกลับสู่บ้านเรือนหรือภูมิลำเนาเดิม',
        'น่าน', 'VERIFIED', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'เดินทางกลับสู่บ้านเรือนหรือภูมิลำเนาเดิม', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นล้านนา', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'เทศกาลสงกรานต์คนเมืองพากันปิ๊กบ้านไปดำหัวผู้เฒ่า', 'เดินทางกลับสู่เคหสถานหรือภูมิลำเนา', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'กลับบ้าน', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: กลับบ้าน', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := '8b5052d4-7d9b-58b4-9259-5f3cad7e596f';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'NORTHEAST' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'อุบลราชธานี' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'กลับบ้าน' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'เมือบ้าน', 'เมือบ้าน', 'mɯa.baːn', 'เดินทางกลับเคหสถาน คืนสู่ถิ่นเกิด',
        'อุบลราชธานี', 'VERIFIED', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'เดินทางกลับเคหสถาน คืนสู่ถิ่นเกิด', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นอีสาน', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'ปีใหม่นี้สิเมือบ้านไปเกี่ยวข้าวซอยแม่', 'เดินทางกลับสู่เคหสถานหรือภูมิลำเนา', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'กลับบ้าน', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: กลับบ้าน', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := '6ea60125-e4d7-5e4f-b4b1-b9896782bca4';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'SOUTH' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'สงขลา' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'กลับบ้าน' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'หลบบ้าน', 'หลบบ้าน', 'lop̚.baːn', 'เดินทางกลับบ้าน หวนคืนสู่เคหสถาน',
        'สงขลา', 'VERIFIED', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'เดินทางกลับบ้าน หวนคืนสู่เคหสถาน', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นใต้', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'ค่ำแล้วหลบบ้านได้แล้วน้อง เดี๋ยวพ่อแม่เป็นห่วง', 'เดินทางกลับสู่เคหสถานหรือภูมิลำเนา', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'กลับบ้าน', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: กลับบ้าน', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := '7b13e886-d3f3-5ecc-be6f-16dedef98edc';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'NORTH' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'เชียงใหม่' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'วิ่ง' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'ล่น', 'ล่น', 'lon˥˩', 'วิ่ง ก้าวเท้าวิ่งอย่างรวดเร็ว',
        'เชียงใหม่', 'VERIFIED', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'วิ่ง ก้าวเท้าวิ่งอย่างรวดเร็ว', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นล้านนา', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'ละอ่อนล่นไล่จับตั๊กแตนกลางต๊งนา', 'ก้าวขาไปข้างหน้าอย่างรวดเร็วกว่าการเดิน', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'วิ่ง', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: วิ่ง', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := 'df623ecc-ba12-57df-8e97-2dfe96a9d4bf';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'NORTHEAST' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'ขอนแก่น' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'วิ่ง' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'แล่น', 'แล่น', 'lɛːn˥˩', 'วิ่ง ควบก้าวขาไปข้างหน้าอย่างเร็ว',
        'ขอนแก่น', 'VERIFIED', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'วิ่ง ควบก้าวขาไปข้างหน้าอย่างเร็ว', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นอีสาน', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'ฝนตกฮำหัว แล่นเร็วๆ เข้าไปหลบในเถียงนา', 'ก้าวขาไปข้างหน้าอย่างรวดเร็วกว่าการเดิน', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'วิ่ง', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: วิ่ง', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := '230a9bde-f197-554b-a375-4097fc6f7273';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'SOUTH' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'พัทลุง' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'วิ่ง' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'แล่น', 'แล่น', 'lɛːn', 'วิ่ง สปีดเท้าไปข้างหน้า',
        'พัทลุง', 'VERIFIED', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'วิ่ง สปีดเท้าไปข้างหน้า', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นใต้', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'แล่นให้ไวตะ หมาไล่กวดหลังมาแล้ว', 'ก้าวขาไปข้างหน้าอย่างรวดเร็วกว่าการเดิน', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'วิ่ง', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: วิ่ง', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := '3fc12aa8-dba9-55f5-8473-7a405fe97910';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'NORTH' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'เชียงใหม่' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'ทำไม' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'ยะหยัง', 'ยะหยัง', 'jaʔ.jaŋ', 'ทำไม เพราะเหตุใด ทำอะไรอยู่',
        'เชียงใหม่', 'VERIFIED', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'ทำไม เพราะเหตุใด ทำอะไรอยู่', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นล้านนา', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'สุมาเต๊อะ ยะหยังบ่บอกเปิ้นก่อนล่วงหน้า', 'คำถามเพื่อถามหาเหตุผลหรือสาเหตุ', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'ทำไม', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: ทำไม', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := '758528b0-3b8d-5cef-bfad-9fe7e04d3734';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'NORTHEAST' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'ขอนแก่น' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'ทำไม' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'เป็นหยัง', 'เป็นหยัง', 'pen.jaŋ', 'ทำไม เพราะอะไร เป็นอะไรไป',
        'ขอนแก่น', 'VERIFIED', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'ทำไม เพราะอะไร เป็นอะไรไป', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นอีสาน', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'เป็นหยังคือบ่มากินข้าว ข้าวเย็นสิเซาแซ่บเด้อ', 'คำถามเพื่อถามหาเหตุผลหรือสาเหตุ', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'ทำไม', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: ทำไม', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := 'e82bee31-fdc3-56fb-8924-f5c810eb7afa';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'SOUTH' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'นครศรีธรรมราช' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'ทำไม' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'ไซร', 'ไซร', 'saj.rɤː', 'ทำไม เพราะเหตุใด มีเรื่องอันใด',
        'นครศรีธรรมราช', 'VERIFIED', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'ทำไม เพราะเหตุใด มีเรื่องอันใด', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นใต้', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'ทำไซรถึงไม่มาตามนัด เพื่อนเขารอกันเพียบ', 'คำถามเพื่อถามหาเหตุผลหรือสาเหตุ', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'ทำไม', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: ทำไม', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := '65ea041f-a7c7-5a6f-a79b-20e2601b568a';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'NORTH' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'เชียงใหม่' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'เด็ก' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'ละอ่อน', 'ละอ่อน', 'laʔ.ʔɔːn', 'เด็ก เด็กน้อย ผู้เยาว์',
        'เชียงใหม่', 'VERIFIED', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'เด็ก เด็กน้อย ผู้เยาว์', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นล้านนา', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'ละอ่อนยุคนี้เก่งเทคโนโลยีแต้ๆ เล่นโทรศัพท์คล่องมาก', 'คนที่มีอายุน้อย ยังไม่ถึงวัยผู้ใหญ่', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'เด็ก', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: เด็ก', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := '099df8e9-8624-5368-ad23-e59a4ff740f9';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'NORTHEAST' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'ขอนแก่น' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'เด็ก' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'เด็กน่อย', 'เด็กน่อย', 'dek̚.nɔːj', 'เด็กเล็ก ลูกหลานตัวน้อย',
        'ขอนแก่น', 'VERIFIED', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'เด็กเล็ก ลูกหลานตัวน้อย', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นอีสาน', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'เด็กน่อยกำลังหัดย่าง ตาฮักตาแพงหลาย', 'คนที่มีอายุน้อย ยังไม่ถึงวัยผู้ใหญ่', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'เด็ก', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: เด็ก', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := '3f3165fc-1990-5a78-976a-e01dd8cdff2f';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'SOUTH' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'สงขลา' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'เด็ก' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'เด็กเอียด', 'เด็กเอียด', 'dek̚.ʔiat̚', 'เด็กตัวเล็ก เด็กน้อย',
        'สงขลา', 'VERIFIED', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'เด็กตัวเล็ก เด็กน้อย', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นใต้', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'เด็กเอียดๆ วิ่งเล่นริมเล ระวังคลื่นซัดเด้อ', 'คนที่มีอายุน้อย ยังไม่ถึงวัยผู้ใหญ่', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'เด็ก', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: เด็ก', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := '0f338757-617e-549c-89ed-c7ee5b161d26';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'SOUTH' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'นครศรีธรรมราช' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'ฝนตก' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'ฝนห่าใหญ่', 'ฝนห่าใหญ่', 'fon.haː.jaj', 'ฝนตกหนักมาก ฝนกระหน่ำอย่างรุนแรง',
        'นครศรีธรรมราช', 'VERIFIED', 'LOCAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'ฝนตกหนักมาก ฝนกระหน่ำอย่างรุนแรง', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นใต้', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'บ่ายนี้ฝนห่าใหญ่เทลงมา น้ำป่าอาจหลากลงคลอง', 'หยาดน้ำฟ้าที่ตกลงมาจากเมฆสู่พื้นดิน', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'ฝนตก', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: ฝนตก', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := '53efe4bd-e6be-5d24-927d-4d8be3a72a92';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = 'NORTHEAST' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = 'ขอนแก่น' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = 'ฝนตก' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        'ฝนตกฮำ', 'ฝนตกฮำ', 'fon.tok̚.ham', 'ฝนตกเปียกชุ่ม ตกโปรยปรายโดนตัวจนเปียก',
        'ขอนแก่น', 'VERIFIED', 'CONVERSATIONAL', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, 'ฝนตกเปียกชุ่ม ตกโปรยปรายโดนตัวจนเปียก', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'DIALECT_DICTIONARY', 'พจนานุกรมภาษาถิ่นอีสาน', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, 'ฝนตกฮำหัวเบิด ฟ้าวเข้าในฮ่ม', 'หยาดน้ำฟ้าที่ตกลงมาจากเมฆสู่พื้นดิน', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', 'ฝนตก', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: ฝนตก', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;

COMMIT;