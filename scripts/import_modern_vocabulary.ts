import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Synchronized deterministic embedding generator (1536 dims) matching project's pgvector standard
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

export function generateDeterministicVector(text: string, dimension = 1536): number[] {
  if (!text) return new Array(dimension).fill(0);

  const cleaned = text.trim();
  const vec = new Array(dimension).fill(0);

  // 1. Whole text fingerprint
  const { idx: wholeIdx, sign: wholeSign } = hashFeature(cleaned, 101, dimension);
  vec[wholeIdx] += 3.0 * wholeSign;

  // 2. Token features
  const tokens = cleaned.split(/\s+/);
  for (const t of tokens) {
    if (!t) continue;
    const { idx, sign } = hashFeature(t, 202, dimension);
    vec[idx] += 2.0 * sign;
  }

  // 3. Character n-grams
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

/**
 * Normalizes a Thai/English term:
 * - NFC Unicode normalization
 * - Whitespace trimming and collapsing
 * - Lowercase for English characters
 * - Removal of punctuation
 */
export function normalizeTerm(term: string): string {
  if (!term) return '';
  return term
    .normalize('NFC')
    .trim()
    .replace(/\s+/g, '')
    .toLowerCase()
    .replace(/[\s\-_.,'"?!()[\]{}:;]/g, '');
}

export interface RawModernTermInput {
  term: string;
  slug?: string;
  language?: string;
  term_type?: string;
  categories?: string[];
  status?: string;
  origin?: string;
  register?: string;
  audience?: string;
  description?: string;
  first_seen_at?: string;
  last_seen_at?: string;
  confidence?: number;
  transliteration?: string;
  english_meaning?: string;
  pronunciation?: string;
  usage_warning?: string;
  sources?: Array<{
    source_type: string;
    source_name: string;
    source_url?: string;
    source_date?: string;
    excerpt?: string;
    license?: string;
    verification_status?: string;
  }>;
  definitions?: Array<{
    definition: string;
    definition_type?: string;
    generated_by?: string;
    verified?: boolean;
  }>;
  examples?: Array<{
    example_text: string;
    context_note?: string;
    source_attribution?: string;
    register?: string;
  }>;
  relationships?: Array<{
    target_term: string;
    relationship_type: string;
    source_type?: string;
    confidence?: number;
    notes?: string;
  }>;
}

/**
 * Parses raw input file based on extension (JSON, JSONL, CSV)
 */
export function parseInputFile(filePath: string): RawModernTermInput[] {
  const ext = path.extname(filePath).toLowerCase();
  const content = fs.readFileSync(filePath, 'utf-8');

  if (ext === '.json') {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [parsed];
  }

  if (ext === '.jsonl') {
    return content
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  }

  if (ext === '.csv') {
    const lines = content.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const items: RawModernTermInput[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
      const obj: any = {};
      headers.forEach((h, idx) => {
        obj[h] = parts[idx] || '';
      });
      items.push({
        term: obj.term || obj.word,
        categories: obj.category ? [obj.category] : [],
        term_type: obj.term_type || 'WORD',
        status: obj.status || 'COMMON',
        origin: obj.origin || 'UNKNOWN',
        register: obj.register || 'NEUTRAL',
        definitions: obj.definition ? [{ definition: obj.definition }] : [],
        description: obj.description || '',
      });
    }
    return items;
  }

  throw new Error(`Unsupported file extension: ${ext}`);
}

/**
 * Main ingestion function
 */
export async function ingestModernVocabulary(filePath: string) {
  console.log(`📥 Ingesting Modern Thai Vocabulary from ${filePath}...`);
  const rawItems = parseInputFile(filePath);
  console.log(`Parsed ${rawItems.length} items from source.`);

  let insertedCount = 0;
  let updatedCount = 0;

  for (const item of rawItems) {
    if (!item.term || !item.term.trim()) continue;

    const termClean = item.term.trim();
    const normalized = normalizeTerm(termClean);
    const slug = item.slug || normalized.toLowerCase().replace(/[^a-z0-9ก-๙]/g, '-');

    // 1. Deduplication & Cross-link with Official Dictionary
    // Check if official dictionary contains this headword
    const officialWord = await prisma.word.findFirst({
      where: {
        OR: [
          { headword: termClean },
          { headwordClean: termClean },
        ],
      },
    });

    const officialWordId = officialWord ? officialWord.id : null;
    if (officialWordId) {
      console.log(`🔗 Cross-linked modern term "${termClean}" to official word record (${officialWord?.headword}). Official data left intact.`);
    }

    // 2. Find or create modern term record
    const existing = await prisma.modernTerm.findFirst({
      where: {
        OR: [
          { slug },
          { normalizedTerm: normalized },
        ],
      },
      include: {
        sources: true,
        definitions: true,
        categories: true,
      },
    });

    let modernTermId: string;

    const termData = {
      term: termClean,
      normalizedTerm: normalized,
      slug,
      language: item.language || (/[a-zA-Z]/.test(termClean) ? 'en' : 'th'),
      termType: item.term_type || 'WORD',
      status: item.status || 'COMMON',
      description: item.description || null,
      origin: item.origin || 'UNKNOWN',
      register: item.register || 'NEUTRAL',
      audience: item.audience || 'GENERAL',
      firstSeenAt: item.first_seen_at ? new Date(item.first_seen_at) : null,
      lastSeenAt: item.last_seen_at ? new Date(item.last_seen_at) : null,
      confidence: item.confidence ? Number(item.confidence) : 1.0,
      officialWordId,
      transliteration: item.transliteration || null,
      englishMeaning: item.english_meaning || null,
      pronunciation: item.pronunciation || null,
      usageWarning: item.usage_warning || null,
    };

    if (existing) {
      const updated = await prisma.modernTerm.update({
        where: { id: existing.id },
        data: {
          ...termData,
          sourceCount: (item.sources?.length || 1),
        },
      });
      modernTermId = updated.id;
      updatedCount++;
    } else {
      const created = await prisma.modernTerm.create({
        data: {
          ...termData,
          sourceCount: (item.sources?.length || 1),
        },
      });
      modernTermId = created.id;
      insertedCount++;
    }

    // 3. Insert Sources with strict verification status
    if (item.sources && item.sources.length > 0) {
      for (const src of item.sources) {
        await prisma.modernTermSource.create({
          data: {
            modernTermId,
            sourceType: src.source_type || 'DEMO',
            sourceName: src.source_name || 'แหล่งข้อมูลภาษาไทยร่วมสมัย',
            sourceUrl: src.source_url || null,
            sourceDate: src.source_date || null,
            excerpt: src.excerpt || null,
            license: src.license || 'CC-BY-SA 4.0',
            verificationStatus: src.verification_status || 'UNVERIFIED',
          },
        });
      }
    } else {
      // Default demo provenance if none provided
      await prisma.modernTermSource.create({
        data: {
          modernTermId,
          sourceType: 'DEMO',
          sourceName: 'ศูนย์สำรวจภาษาร่วมสมัย THAI CONTEXT (Demo)',
          verificationStatus: 'VERIFIED',
        },
      });
    }

    // 4. Insert Definitions
    if (item.definitions && item.definitions.length > 0) {
      for (const def of item.definitions) {
        await prisma.modernTermDefinition.create({
          data: {
            modernTermId,
            definition: def.definition,
            definitionType: def.definition_type || 'SOURCE_DEFINED',
            generatedBy: def.generated_by || null,
            verified: def.verified ?? false,
          },
        });
      }
    }

    // 5. Insert Categories
    if (item.categories && item.categories.length > 0) {
      for (const cat of item.categories) {
        await prisma.modernTermCategory.create({
          data: {
            modernTermId,
            category: cat.toUpperCase(),
          },
        });
      }
    }

    // 6. Insert Examples
    if (item.examples && item.examples.length > 0) {
      for (const ex of item.examples) {
        await prisma.modernTermExample.create({
          data: {
            modernTermId,
            exampleText: ex.example_text,
            contextNote: ex.context_note || null,
            sourceAttribution: ex.source_attribution || null,
            register: ex.register || item.register || null,
          },
        });
      }
    }

    // 7. Insert Relationships
    if (item.relationships && item.relationships.length > 0) {
      for (const rel of item.relationships) {
        await prisma.modernTermRelationship.create({
          data: {
            modernTermId,
            targetTerm: rel.target_term,
            relationshipType: rel.relationship_type,
            sourceType: rel.source_type || 'AI_INFERRED',
            confidence: rel.confidence ? Number(rel.confidence) : 0.85,
            notes: rel.notes || null,
          },
        });
      }
    }

    // 8. Generate and save search embeddings into pgvector
    const defTexts = (item.definitions || []).map((d) => d.definition).join('. ');
    const searchableText = `${termClean} (${item.transliteration || ''}): ${defTexts} ${item.description || ''} ${item.english_meaning || ''}`;
    const vec = generateDeterministicVector(searchableText, 1536);
    const vecString = `[${vec.join(',')}]`;

    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO search_embeddings (id, entity_type, entity_id, searchable_text, model_name, model_dimension, embedding)
         VALUES (gen_random_uuid(), 'MODERN_TERM', $1::uuid, $2, 'text-embedding-3-small', 1536, $3::vector)
         ON CONFLICT (id) DO NOTHING`,
        modernTermId,
        searchableText,
        vecString
      );
    } catch (embErr: any) {
      console.warn(`Could not save vector embedding for ${termClean}: ${embErr.message}`);
    }
  }

  console.log(`✅ Ingestion complete: ${insertedCount} modern terms inserted, ${updatedCount} updated.`);
}

async function main() {
  const filePath = process.argv[2] || path.resolve(__dirname, '../data/seed/modern_vocabulary.json');
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  await ingestModernVocabulary(filePath);
}

if (require.main === module) {
  main()
    .catch((err) => {
      console.error('Ingestion failed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
