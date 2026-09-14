import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Synchronized deterministic embedding generator (1536 dims) matching Python Random Projection
function hashFeature(feature: string, seed = 42, dimension = 1536): { idx: number; sign: number } {
  let h = seed;
  for (let i = 0; i < feature.length; i++) {
    h = ((h << 5) - h + feature.charCodeAt(i)) & 0xffffffff;
    if (h >= 0x80000000) h -= 0x100000000;
  }
  const idx = Math.abs(h) % dimension;
  const sign = Math.abs(h) % 2 === 0 ? 1.0 : -1.0;
  return { idx, sign };
}

function generateDeterministicVector(text: string, dimension = 1536): number[] {
  if (!text) return new Array(dimension).fill(0);

  const cleaned = text.trim();
  const vec = new Array(dimension).fill(0);

  // 1. Whole text fingerprint
  const { idx: wholeIdx, sign: wholeSign } = hashFeature(cleaned, 101, dimension);
  vec[wholeIdx] += 3.0 * wholeSign;

  // 2. Token features (words separated by whitespace)
  const tokens = cleaned.split(/\s+/);
  for (const t of tokens) {
    if (!t) continue;
    const { idx, sign } = hashFeature(t, 202, dimension);
    vec[idx] += 2.0 * sign;
  }

  // 3. Character 2-grams, 3-grams & 4-grams for Thai morphological capture
  const chars = cleaned.replace(/\s+/g, '');
  for (const n of [2, 3, 4]) {
    if (chars.length >= n) {
      for (let i = 0; i <= chars.length - n; i++) {
        const gram = chars.substring(i, i + n);
        const { idx, sign } = hashFeature(gram, 404 + n, dimension);
        vec[idx] += 1.2 * sign;
      }
    }
  }

  // 4. L2 Normalization
  let norm = 0;
  for (let i = 0; i < dimension; i++) {
    norm += vec[i] * vec[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    return vec.map((v) => Number((v / norm).toFixed(6)));
  }
  return new Array(dimension).fill(0);
}

async function main() {
  console.log('🌱 Starting THAI CONTEXT database seed...');
  const candidatePaths = [
    path.resolve(__dirname, './demo_dictionary.json'),
    path.resolve(__dirname, '../../../data/seed/demo_dictionary.json'),
    path.resolve(__dirname, '../../data/seed/demo_dictionary.json'),
    '/app/prisma/demo_dictionary.json',
  ];
  const dataPath = candidatePaths.find((p) => fs.existsSync(p));
  if (!dataPath) {
    throw new Error(`Seed data file not found in candidates: ${candidatePaths.join(', ')}`);
  }
  console.log(`Loading seed data from ${dataPath}`);

  const raw = fs.readFileSync(dataPath, 'utf-8');
  const seedData = JSON.parse(raw);

  console.log('Inserting Dictionary Sources...');
  for (const src of seedData.sources) {
    await prisma.dictionarySource.upsert({
      where: { code: src.code },
      update: { name: src.name, publisher: src.publisher, description: src.description },
      create: src,
    });
  }

  console.log('Inserting Dictionary Editions...');
  for (const ed of seedData.editions) {
    await prisma.dictionaryEdition.upsert({
      where: { editionCode: ed.editionCode },
      update: { title: ed.title, editionYear: ed.editionYear, isActive: ed.isActive },
      create: {
        ...ed,
        publicationDate: ed.publicationDate ? new Date(ed.publicationDate) : null,
      },
    });
  }

  console.log('Inserting Parts of Speech...');
  for (const pos of seedData.partsOfSpeech) {
    await prisma.partOfSpeech.upsert({
      where: { code: pos.code },
      update: { nameThai: pos.nameThai, nameEnglish: pos.nameEnglish, abbrThai: pos.abbrThai },
      create: pos,
    });
  }

  console.log('Inserting Dialect Regions...');
  for (const reg of seedData.dialectRegions) {
    await prisma.dialectRegion.upsert({
      where: { code: reg.code },
      update: { nameThai: reg.nameThai, description: reg.description },
      create: reg,
    });
  }

  console.log('Resolving actual database catalog IDs...');
  const editionsInDb = await prisma.dictionaryEdition.findMany();
  const edCodeMap = new Map(editionsInDb.map((e) => [e.editionCode, e.id]));
  const edIdMap = new Map(editionsInDb.map((e) => [e.id, e.id]));

  const posInDb = await prisma.partOfSpeech.findMany();
  const posCodeMap = new Map(posInDb.map((p) => [p.code, p.id]));
  const posIdMap = new Map(posInDb.map((p) => [p.id, p.id]));

  const regInDb = await prisma.dialectRegion.findMany();
  const regCodeMap = new Map(regInDb.map((r) => [r.code, r.id]));
  const regIdMap = new Map(regInDb.map((r) => [r.id, r.id]));

  // Map seed edition IDs to actual DB IDs
  const seedEditionIdToActual = new Map<string, string>();
  for (const ed of seedData.editions) {
    const actualId = edCodeMap.get(ed.editionCode) || ed.id;
    seedEditionIdToActual.set(ed.id, actualId);
  }

  const seedPosIdToActual = new Map<string, string>();
  for (const pos of seedData.partsOfSpeech) {
    const actualId = posCodeMap.get(pos.code) || pos.id;
    seedPosIdToActual.set(pos.id, actualId);
  }

  const seedRegIdToActual = new Map<string, string>();
  for (const reg of seedData.dialectRegions) {
    const actualId = regCodeMap.get(reg.code) || reg.id;
    seedRegIdToActual.set(reg.id, actualId);
  }

  console.log('Inserting Words...');
  const wordHeadwordToId = new Map<string, string>();
  for (const w of seedData.words) {
    const upserted = await prisma.word.upsert({
      where: { headword: w.headword },
      update: { headwordClean: w.headwordClean, charLength: w.charLength },
      create: w,
    });
    wordHeadwordToId.set(w.headword, upserted.id);
  }

  console.log('Inserting Word Entries...');
  for (const entry of seedData.wordEntries) {
    const actualEdId = seedEditionIdToActual.get(entry.editionId) || entry.editionId;
    await prisma.wordEntry.upsert({
      where: {
        uq_word_edition: {
          wordId: entry.wordId,
          editionId: actualEdId,
        },
      },
      update: {
        pronunciation: entry.pronunciation,
        royalSequence: entry.royalSequence,
        pageNumber: entry.pageNumber,
        metadata: entry.metadata,
      },
      create: {
        ...entry,
        editionId: actualEdId,
      },
    });
  }

  console.log('Inserting Definitions & Examples...');
  for (const def of seedData.definitions) {
    const actualPosId = def.posId ? (seedPosIdToActual.get(def.posId) || def.posId) : null;
    await prisma.definition.upsert({
      where: {
        uq_entry_sense: {
          entryId: def.entryId,
          senseOrder: def.senseOrder,
        },
      },
      update: {
        definitionText: def.definitionText,
        registerLevel: def.registerLevel,
        subjectDomain: def.subjectDomain,
        posId: actualPosId,
      },
      create: {
        ...def,
        posId: actualPosId,
      },
    });
  }

  for (const ex of seedData.examples) {
    await prisma.example.upsert({
      where: { id: ex.id },
      update: { exampleText: ex.exampleText, sourceAttribution: ex.sourceAttribution },
      create: ex,
    });
  }

  console.log('Inserting Dialect Entries...');
  for (const dia of seedData.dialectEntries) {
    const actualRegId = seedRegIdToActual.get(dia.regionId) || dia.regionId;
    const actualEdId = seedEditionIdToActual.get(dia.editionId) || dia.editionId;
    await prisma.dialectEntry.upsert({
      where: { id: dia.id },
      update: {
        dialectWord: dia.dialectWord,
        dialectWordClean: dia.dialectWordClean,
        localMeaning: dia.localMeaning,
        culturalNotes: dia.culturalNotes,
        regionId: actualRegId,
        editionId: actualEdId,
      },
      create: {
        ...dia,
        regionId: actualRegId,
        editionId: actualEdId,
      },
    });
  }

  console.log('Inserting Semantic Mappings...');
  for (const sm of seedData.semanticMappings) {
    await prisma.semanticMapping.upsert({
      where: { id: sm.id },
      update: {
        relationshipType: sm.relationshipType,
        confidenceScore: sm.confidenceScore,
        sourceType: sm.sourceType,
      },
      create: sm,
    });
  }

  console.log('Inserting Word Relationships...');
  for (const rel of seedData.wordRelationships) {
    await prisma.wordRelationship.upsert({
      where: { id: rel.id },
      update: {
        relationshipType: rel.relationshipType,
        sourceType: rel.sourceType,
      },
      create: rel,
    });
  }

  console.log('Generating & Seeding Embeddings for pgvector...');
  for (const def of seedData.definitions) {
    const entry = seedData.wordEntries.find((e: any) => e.id === def.entryId);
    const word = entry ? seedData.words.find((w: any) => w.id === entry.wordId) : null;
    const searchableText = `${word ? word.headword + ': ' : ''}${def.definitionText}`;
    const vec = generateDeterministicVector(searchableText, 1536);
    const vecString = `[${vec.join(',')}]`;

    const actualEdId = entry ? (seedEditionIdToActual.get(entry.editionId) || entry.editionId) : null;
    await prisma.$executeRawUnsafe(
      `INSERT INTO search_embeddings (id, entity_type, entity_id, edition_id, searchable_text, model_name, model_dimension, embedding)
       VALUES (gen_random_uuid(), 'DEFINITION', $1::uuid, $2::uuid, $3, 'text-embedding-3-small', 1536, $4::vector)
       ON CONFLICT (id) DO NOTHING`,
      def.id,
      actualEdId,
      searchableText,
      vecString
    );
  }

  // Check and seed Royal Society Coined Terms
  const coinedCandidatePaths = [
    path.resolve(__dirname, './coined_terms.json'),
    path.resolve(__dirname, '../../../data/seed/coined_terms.json'),
    path.resolve(__dirname, '../../data/seed/coined_terms.json'),
    '/app/data/seed/coined_terms.json',
  ];
  const coinedPath = coinedCandidatePaths.find((p) => fs.existsSync(p));
  if (coinedPath) {
    console.log(`📦 Loading Royal Society Coined Terms from ${coinedPath}...`);
    const coinedData = JSON.parse(fs.readFileSync(coinedPath, 'utf-8'));
    
    // Ensure Royal Society Source
    const royalSrc = await prisma.dictionarySource.findFirst({ where: { code: 'ROYAL_SOCIETY' } });
    if (royalSrc) {
      const coinedEdition = await prisma.dictionaryEdition.upsert({
        where: { editionCode: coinedData.source.edition_code || 'ROYAL_COINED' },
        update: {
          title: coinedData.source.title,
          editionYear: coinedData.source.edition_year || '2567',
          isActive: true,
        },
        create: {
          sourceId: royalSrc.id,
          editionCode: coinedData.source.edition_code || 'ROYAL_COINED',
          editionYear: coinedData.source.edition_year || '2567',
          title: coinedData.source.title,
          isActive: true,
        },
      });

      const posMap = new Map((await prisma.partOfSpeech.findMany()).map((p) => [p.code, p.id]));
      const defaultPosId = posMap.get('N');

      console.log(`Inserting ${coinedData.items.length} Coined Terms...`);
      for (const item of coinedData.items) {
        const wordRecord = await prisma.word.upsert({
          where: { headword: item.word },
          update: { headwordClean: item.clean },
          create: {
            headword: item.word,
            headwordClean: item.clean,
            charLength: item.word.length,
          },
        });

        const entry = await prisma.wordEntry.upsert({
          where: {
            uq_word_edition: {
              wordId: wordRecord.id,
              editionId: coinedEdition.id,
            },
          },
          update: {
            pronunciation: item.pronunciation,
            metadata: item.metadata,
          },
          create: {
            wordId: wordRecord.id,
            editionId: coinedEdition.id,
            pronunciation: item.pronunciation,
            metadata: item.metadata,
          },
        });

        const posId = posMap.get(item.pos_code) || defaultPosId;
        for (let i = 0; i < item.definitions.length; i++) {
          const defText = item.definitions[i];
          const subject = item.english_term ? `ศัพท์บัญญัติ (${item.english_term})` : 'ศัพท์บัญญัติ';
          await prisma.definition.upsert({
            where: {
              uq_entry_sense: {
                entryId: entry.id,
                senseOrder: i + 1,
              },
            },
            update: {
              definitionText: defText,
              subjectDomain: subject,
            },
            create: {
              entryId: entry.id,
              posId,
              senseOrder: i + 1,
              definitionText: defText,
              registerLevel: 'FORMAL',
              subjectDomain: subject,
            },
          });
        }
      }
      console.log(`✅ Royal Society Coined Terms successfully seeded (${coinedData.items.length} words)!`);
    }
  }

  console.log('Inserting Accessibility & Multilingual Data...');
  const accessibilitySeedMap: Record<string, {
    pronunciation: { phonetic: string; rtgs: string; ipa: string; tone: string };
    translation: { en: string; secondary?: string[]; explanation: string; provenance: string };
    sign?: { name: string; description: string; source: string; videoUrl: string };
  }> = {
    'ประสิทธิภาพ': {
      pronunciation: {
        phonetic: 'ประ-สิด-ทิ-พาบ',
        rtgs: 'pra-sit-thi-phap',
        ipa: 'praʔ˨˩.sit̚˨˩.tʰi˦˥.pʰaːp̚˥˩',
        tone: 'L-L-H-L',
      },
      translation: {
        en: 'efficiency',
        secondary: ['competence', 'productivity', 'performance'],
        explanation: 'The ability to produce maximum productive output with the least waste of time, resources, or energy.',
        provenance: 'OFFICIAL_CURATED',
      },
      sign: {
        name: 'ประสิทธิภาพ',
        description: 'มือขวาตั้งนิ้วชี้และนิ้วกลาง หมุนวนเป็นเกลียวไปข้างหน้าแล้วประกบฝ่ามือซ้าย',
        source: 'วิทยาลัยราชสุดา มหาวิทยาลัยมหิดล',
        videoUrl: 'https://assets.thai-context.org/tsl/videos/prasitthiphap.mp4',
      },
    },
    'ประสิทธิผล': {
      pronunciation: {
        phonetic: 'ประ-สิด-ทิ-ผน',
        rtgs: 'pra-sit-thi-phon',
        ipa: 'praʔ˨˩.sit̚˨˩.tʰi˦˥.pʰon˩˩˦',
        tone: 'L-L-H-R',
      },
      translation: {
        en: 'effectiveness',
        secondary: ['efficacy', 'fruitfulness'],
        explanation: 'The degree to which objectives are achieved and targeted problems are resolved.',
        provenance: 'OFFICIAL_CURATED',
      },
    },
    'ศักยภาพ': {
      pronunciation: {
        phonetic: 'สัก-กะ-ยะ-พาบ',
        rtgs: 'sak-ka-ya-phap',
        ipa: 'sak̚˨˩.kaʔ˨˩.jaʔ˦˥.pʰaːp̚˥˩',
        tone: 'L-L-H-L',
      },
      translation: {
        en: 'potential',
        secondary: ['capability', 'capacity'],
        explanation: 'Latent qualities or abilities that may be developed and lead to future success or usefulness.',
        provenance: 'OFFICIAL_CURATED',
      },
    },
    'ปัญญาประดิษฐ์': {
      pronunciation: {
        phonetic: 'ปัน-ยา-ปฺระ-ดิด',
        rtgs: 'pan-ya-pra-dit',
        ipa: 'pan˧˧.jaː˧˧.praʔ˨˩.dit̚˨˩',
        tone: 'M-M-L-L',
      },
      translation: {
        en: 'artificial intelligence (AI)',
        secondary: ['machine intelligence'],
        explanation: 'The branch of computer science emphasizing the simulation of human intelligence processes by machines.',
        provenance: 'OFFICIAL_CURATED',
      },
      sign: {
        name: 'ปัญญาประดิษฐ์',
        description: 'ชี้นิ้วชี้ขวาที่ขมับ แตะเบาๆ แล้วกางมือทั้งสองขยับนิ้วคล้ายวงจรอิเล็กทรอนิกส์',
        source: 'สมาคมคนหูหนวกแห่งประเทศไทย',
        videoUrl: 'https://assets.thai-context.org/tsl/videos/ai.mp4',
      },
    },
    'นวัตกรรม': {
      pronunciation: {
        phonetic: 'นะ-วัด-ตะ-กำ',
        rtgs: 'na-wat-ta-kam',
        ipa: 'naʔ˦˥.wat̚˨˩.taʔ˨˩.kam˧˧',
        tone: 'H-L-L-M',
      },
      translation: {
        en: 'innovation',
        secondary: ['novelty', 'modernization'],
        explanation: 'A new method, idea, or product newly introduced into society or commerce.',
        provenance: 'OFFICIAL_CURATED',
      },
    },
    'บูรณาการ': {
      pronunciation: {
        phonetic: 'บู-ระ-นา-กาน',
        rtgs: 'bu-ra-na-kan',
        ipa: 'buː˧˧.raʔ˦˥.naː˧˧.kaːn˧˧',
        tone: 'M-H-M-M',
      },
      translation: {
        en: 'integration',
        secondary: ['holistic coordination'],
        explanation: 'Combining various components or sectors into a cohesive and harmonious whole.',
        provenance: 'OFFICIAL_CURATED',
      },
    },
    'อร่อย': {
      pronunciation: {
        phonetic: 'อะ-หฺร่อย',
        rtgs: 'a-roi',
        ipa: 'ʔaʔ˨˩.rɔːj˨˩',
        tone: 'L-L',
      },
      translation: {
        en: 'delicious',
        secondary: ['tasty', 'flavorful', 'savory'],
        explanation: 'Having a delightful and savory taste that appeals to the palate.',
        provenance: 'OFFICIAL_CURATED',
      },
      sign: {
        name: 'อร่อย',
        description: 'ใช้ปลายนิ้วชี้และนิ้วโป้งขวาแตะที่มุมปาก วนเบาๆ พร้อมพยักหน้าเล็กน้อย',
        source: 'สมาคมคนหูหนวกแห่งประเทศไทย',
        videoUrl: 'https://assets.thai-context.org/tsl/videos/aroi.mp4',
      },
    },
    'รับประทาน': {
      pronunciation: {
        phonetic: 'รับ-ปฺระ-ทาน',
        rtgs: 'rap-pra-than',
        ipa: 'rap̚˦˥.praʔ˨˩.tʰaːn˧˧',
        tone: 'H-L-M',
      },
      translation: {
        en: 'dine / partake (formal)',
        secondary: ['consume'],
        explanation: 'Polite formal term for eating food in official contexts.',
        provenance: 'OFFICIAL_CURATED',
      },
    },
    'มิตรภาพ': {
      pronunciation: {
        phonetic: 'มิด-ตฺระ-พาบ',
        rtgs: 'mit-tra-phap',
        ipa: 'mit̚˦˥.traʔ˨˩.pʰaːp̚˥˩',
        tone: 'H-L-F',
      },
      translation: {
        en: 'friendship',
        secondary: ['amity', 'fellowship'],
        explanation: 'A state of mutual trust, support, and warmth between individuals.',
        provenance: 'OFFICIAL_CURATED',
      },
      sign: {
        name: 'มิตรภาพ',
        description: 'ประสานนิ้วก้อยทั้งสองมือเข้าด้วยกัน แล้วดึงเข้ามาใกล้หน้าอกอย่างอ่อนโยน',
        source: 'วิทยาลัยราชสุดา มหาวิทยาลัยมหิดล',
        videoUrl: 'https://assets.thai-context.org/tsl/videos/friendship.mp4',
      },
    },
  };

  for (const [headword, data] of Object.entries(accessibilitySeedMap)) {
    const wordRecord = await prisma.word.findUnique({
      where: { headword },
      include: { entries: { take: 1 } },
    });
    if (!wordRecord) continue;

    // 1. Seed Pronunciation
    if (wordRecord.entries.length > 0) {
      const entryId = wordRecord.entries[0].id;
      const existingPron = await prisma.wordPronunciation.findFirst({
        where: { entryId },
      });
      if (!existingPron) {
        await prisma.wordPronunciation.create({
          data: {
            entryId,
            phoneticSpelling: data.pronunciation.phonetic,
            transliterationRtgs: data.pronunciation.rtgs,
            ipaNotation: data.pronunciation.ipa,
            tonePattern: data.pronunciation.tone,
            sourceType: 'OFFICIAL_DATA',
          },
        });
      }
    }

    // 2. Seed Translation
    const existingTrans = await prisma.wordTranslation.findFirst({
      where: { wordId: wordRecord.id, languageCode: 'en' },
    });
    if (!existingTrans) {
      await prisma.wordTranslation.create({
        data: {
          wordId: wordRecord.id,
          languageCode: 'en',
          translatedWord: data.translation.en,
          contextualExplanation: data.translation.explanation,
          provenance: data.translation.provenance,
          confidenceScore: 1.0,
        },
      });
    }

    // 3. Seed Sign Language (if any)
    if (data.sign) {
      const existingSign = await prisma.signLanguageEntry.findFirst({
        where: { wordId: wordRecord.id },
      });
      let signId = existingSign?.id;
      if (!existingSign) {
        const createdSign = await prisma.signLanguageEntry.create({
          data: {
            wordId: wordRecord.id,
            signName: data.sign.name,
            handshapeDescription: data.sign.description,
            dialectRegion: 'CENTRAL',
            verificationStatus: 'OFFICIAL',
            sourceAttribution: data.sign.source,
            license: 'CC-BY-SA 4.0',
          },
        });
        signId = createdSign.id;
      }

      if (signId) {
        const existingMedia = await prisma.signMedia.findFirst({
          where: { signId },
        });
        if (!existingMedia) {
          await prisma.signMedia.create({
            data: {
              signId,
              mediaType: 'VIDEO_MP4',
              mediaUrl: data.sign.videoUrl,
              isPrimary: true,
            },
          });
        }
      }
    }
  }

  console.log('✅ Accessibility & Multilingual data successfully seeded!');
  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
