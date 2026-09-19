import * as fs from 'fs';
import * as path from 'path';
import { ModernTerm } from './modern-vocabulary-types';

let cachedModernTerms: ModernTerm[] | null = null;

export function loadSeedModernVocabulary(): ModernTerm[] {
  if (cachedModernTerms && cachedModernTerms.length > 0) {
    return cachedModernTerms;
  }

  const candidatePaths = [
    path.resolve(process.cwd(), '../data/seed/modern_vocabulary.json'),
    path.resolve(process.cwd(), 'data/seed/modern_vocabulary.json'),
    path.resolve(process.cwd(), '../../data/seed/modern_vocabulary.json'),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          cachedModernTerms = data.map((item, idx) => ({
            id: item.id || `term-${idx + 1}`,
            term: item.term,
            slug: item.slug || item.term.toLowerCase(),
            language: item.language || 'th',
            term_type: item.term_type || 'WORD',
            categories: item.categories || [],
            status: item.status || 'COMMON',
            origin: item.origin || 'NEOLOGISM',
            register: item.register || 'INFORMAL',
            audience: item.audience || 'GENERAL',
            description: item.description || '',
            first_seen_at: item.first_seen_at || null,
            last_seen_at: item.last_seen_at || null,
            confidence: item.confidence ?? 0.85,
            transliteration: item.transliteration || null,
            english_meaning: item.english_meaning || null,
            pronunciation: item.pronunciation || null,
            usage_warning: item.usage_warning || null,
            sources: item.sources || [],
            definitions: item.definitions || [],
            examples: item.examples || [],
            relationships: item.relationships || [],
            foreigner_support: {
              pronunciation: item.pronunciation || null,
              transliteration: item.transliteration || null,
              english_meaning: item.english_meaning || null,
              usage_guidance: `How to use: "${item.term}" is generally used in ${item.register} contexts.`,
            },
            official_comparison: {
              word: item.term,
              found_in_official: false,
              relationship: 'MODERN_ONLY',
              editions: [
                { edition_year: '2542', status: 'ไม่พบข้อมูล' },
                { edition_year: '2554', status: 'ไม่พบข้อมูล' },
                { edition_year: '2569', status: 'ไม่พบข้อมูล' },
              ],
              note: `คำว่า "${item.term}" เป็นคำภาษาร่วมสมัย ยังไม่ปรากฏในพจนานุกรมฉบับทางการ`,
            },
          }));
          return cachedModernTerms;
        }
      } catch (err) {
        console.error('Failed to load modern vocabulary seed:', err);
      }
    }
  }

  return [];
}

export function filterModernTerms(params: {
  q?: string;
  category?: string;
  status?: string;
  register?: string;
  origin?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const terms = loadSeedModernVocabulary();
  let filtered = [...terms];

  if (params.q) {
    const qLower = params.q.toLowerCase().trim();
    filtered = filtered.filter(
      (t) =>
        t.term.toLowerCase().includes(qLower) ||
        t.description.toLowerCase().includes(qLower) ||
        (t.english_meaning && t.english_meaning.toLowerCase().includes(qLower)) ||
        (t.transliteration && t.transliteration.toLowerCase().includes(qLower)) ||
        t.categories.some((c) => c.toLowerCase().includes(qLower)),
    );
  }

  if (params.category && params.category !== 'ALL') {
    filtered = filtered.filter((t) =>
      t.categories.some((c) => c.toUpperCase() === params.category!.toUpperCase()),
    );
  }

  if (params.status && params.status !== 'ALL') {
    filtered = filtered.filter((t) => t.status.toUpperCase() === params.status!.toUpperCase());
  }

  if (params.register && params.register !== 'ALL') {
    filtered = filtered.filter((t) => t.register.toUpperCase() === params.register!.toUpperCase());
  }

  if (params.origin && params.origin !== 'ALL') {
    filtered = filtered.filter((t) => t.origin.toUpperCase() === params.origin!.toUpperCase());
  }

  // Sort
  if (params.sort === 'alphabetical') {
    filtered.sort((a, b) => a.term.localeCompare(b.term, 'th'));
  } else if (params.sort === 'newest') {
    filtered.sort(
      (a, b) =>
        new Date(b.first_seen_at || 0).getTime() - new Date(a.first_seen_at || 0).getTime(),
    );
  } else {
    // default: confidence desc
    filtered.sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
  }

  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  // Category aggregations
  const catCountMap = new Map<string, number>();
  for (const t of terms) {
    for (const c of t.categories) {
      catCountMap.set(c, (catCountMap.get(c) || 0) + 1);
    }
  }
  const categories = Array.from(catCountMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  return {
    items: paginated,
    total: filtered.length,
    page,
    limit,
    categories,
  };
}

export function findModernTerm(termOrSlug: string): ModernTerm | null {
  const terms = loadSeedModernVocabulary();
  const normalized = termOrSlug.toLowerCase().trim();
  return (
    terms.find(
      (t) =>
        t.term.toLowerCase() === normalized ||
        t.slug.toLowerCase() === normalized ||
        decodeURIComponent(termOrSlug).toLowerCase() === t.term.toLowerCase(),
    ) || null
  );
}
