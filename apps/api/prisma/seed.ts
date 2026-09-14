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
