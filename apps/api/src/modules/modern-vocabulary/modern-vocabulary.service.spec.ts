import { Test, TestingModule } from '@nestjs/testing';
import { ModernVocabularyService } from './modern-vocabulary.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ModernVocabularyService', () => {
  let service: ModernVocabularyService;
  let prisma: any;

  const mockModernTerm = {
    id: 'mod-1',
    term: 'RAG',
    normalizedTerm: 'rag',
    slug: 'rag',
    language: 'en',
    termType: 'ACRONYM',
    status: 'COMMON',
    origin: 'ENGLISH_BORROWING',
    register: 'SPECIALIZED',
    audience: 'TECHNICAL',
    description: 'Retrieval-Augmented Generation',
    confidence: 0.95,
    sourceCount: 2,
    isSearchable: true,
    transliteration: 'อาร์เอจี',
    englishMeaning: 'Retrieval-Augmented Generation',
    pronunciation: 'อาร์-เอ-จี',
    usageWarning: 'เป็นศัพท์เฉพาะทางเทคนิค',
    firstSeenAt: new Date('2020-05-22'),
    lastSeenAt: new Date('2026-03-01'),
    officialWordId: null,
    categories: [{ category: 'AI' }, { category: 'TECHNOLOGY' }],
    definitions: [
      {
        id: 'def-1',
        definition: 'สถาปัตยกรรมระบบ AI ที่ค้นคืนเอกสารภายนอก',
        definitionType: 'SOURCE_DEFINED',
        generatedBy: null,
        verified: true,
      },
    ],
    sources: [
      {
        id: 'src-1',
        sourceType: 'RESEARCH',
        sourceName: 'Lewis et al. (NeurIPS 2020)',
        sourceUrl: 'https://arxiv.org/abs/2005.11401',
        sourceDate: '2020-05-22',
        excerpt: 'RAG paper',
        license: 'arXiv',
        verificationStatus: 'VERIFIED',
      },
    ],
    examples: [
      {
        id: 'ex-1',
        exampleText: 'การทำ RAG ช่วยลดภาพหลอนของ AI',
        contextNote: 'วิศวกรรม AI',
        sourceAttribution: 'Tech Report',
        register: 'SPECIALIZED',
      },
    ],
    relationshipsAsSource: [
      {
        targetTerm: 'การสร้างเนื้อหาโดยอาศัยการค้นคืนข้อมูล',
        relationshipType: 'FORMAL_ALTERNATIVE',
        sourceType: 'AI_INFERRED',
        confidence: 0.92,
        notes: 'คำแปลทางการในภาษาไทย',
        targetModernTerm: null,
      },
    ],
    officialWord: null,
  };

  beforeEach(async () => {
    prisma = {
      modernTerm: {
        count: jest.fn().mockResolvedValue(1),
        findMany: jest.fn().mockResolvedValue([mockModernTerm]),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.OR && where.OR.some((w: any) => w.term === 'RAG' || w.slug === 'rag')) {
            return Promise.resolve(mockModernTerm);
          }
          if (where.OR && where.OR.some((w: any) => w.term === 'ป้ายยา')) {
            return Promise.resolve({
              ...mockModernTerm,
              id: 'mod-2',
              term: 'ป้ายยา',
              slug: 'pai-ya',
              termType: 'SLANG',
              register: 'SLANG',
              origin: 'INTERNET',
              categories: [{ category: 'SOCIAL_MEDIA' }],
              definitions: [{ definition: 'การแนะนำของดีจนอยากซื้อตาม', definitionType: 'SOURCE_DEFINED' }],
              sources: [{ sourceName: 'คลังคำสแลง', sourceType: 'COMMUNITY', verificationStatus: 'VERIFIED' }],
            });
          }
          if (where.OR && where.OR.some((w: any) => w.term === 'จึ้ง')) {
            return Promise.resolve({
              ...mockModernTerm,
              id: 'mod-3',
              term: 'จึ้ง',
              slug: 'jueng',
              termType: 'SLANG',
              register: 'SLANG',
              origin: 'COMMUNITY',
              officialWord: {
                headword: 'จึ้ง',
                entries: [
                  {
                    edition: { editionYear: '2554', title: 'พจนานุกรม ฉบับราชบัณฑิตยสถาน' },
                    definitions: [{ definitionText: 'คำโบราณ หมายถึง จังงัง หรือ หยุดชะงัก', pos: { abbrThai: 'ก.' } }],
                  },
                ],
              },
            });
          }
          return Promise.resolve(null);
        }),
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'new-mod-1', ...data })),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'mod-1', ...data })),
        groupBy: jest.fn().mockResolvedValue([]),
      },
      modernTermCategory: {
        groupBy: jest.fn().mockResolvedValue([
          { category: 'AI', _count: { modernTermId: 8 } },
          { category: 'SOCIAL_MEDIA', _count: { modernTermId: 12 } },
        ]),
      },
      modernTermSource: {
        groupBy: jest.fn().mockResolvedValue([
          { sourceType: 'RESEARCH', _count: { id: 5 } },
          { sourceType: 'COMMUNITY', _count: { id: 10 } },
        ]),
      },
      modernTermSubmission: {
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'sub-1', ...data, createdAt: new Date() })),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'sub-1') {
            return Promise.resolve({
              id: 'sub-1',
              term: 'คำใหม่',
              definition: 'นิยามใหม่',
              category: 'AI',
              sourceName: 'แหล่งข่าว',
              status: 'PENDING_REVIEW',
            });
          }
          return Promise.resolve(null);
        }),
        update: jest.fn().mockResolvedValue({ id: 'sub-1', status: 'APPROVED' }),
      },
      word: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.OR && where.OR.some((w: any) => w.headword === 'เนื้อหา')) {
            return Promise.resolve({
              headword: 'เนื้อหา',
              entries: [{
                edition: { editionYear: '2554', title: 'พจนานุกรม ฉบับราชบัณฑิตยสถาน' },
                definitions: [{ definitionText: 'สาระสำคัญ หรือเรื่องราว', pos: { abbrThai: 'น.' } }],
              }],
            });
          }
          if (where.OR && where.OR.some((w: any) => w.headword === 'โน้มน้าว')) {
            return Promise.resolve({
              headword: 'โน้มน้าว',
              entries: [{
                edition: { editionYear: '2554', title: 'พจนานุกรม ฉบับราชบัณฑิตยสถาน' },
                definitions: [{ definitionText: 'ชักนำให้คล้อยตาม, ชักจูงใจ', pos: { abbrThai: 'ก.' } }],
              }],
            });
          }
          return Promise.resolve(null);
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModernVocabularyService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ModernVocabularyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listTerms', () => {
    it('returns paginated modern terms with category and provenance', async () => {
      const result = await service.listTerms({ category: 'AI', page: 1, limit: 10 });
      expect(result.total).toBe(1);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].term).toBe('RAG');
      expect(result.results[0].categories).toContain('AI');
      expect(result.results[0].primary_source?.verification_status).toBe('VERIFIED');
    });
  });

  describe('getTermDetail', () => {
    it('returns full term detail with sources, definitions, and foreigner support', async () => {
      const detail = await service.getTermDetail('RAG');
      expect(detail.term).toBe('RAG');
      expect(detail.term_type).toBe('ACRONYM');
      expect(detail.definitions).toHaveLength(1);
      expect(detail.sources).toHaveLength(1);
      expect(detail.sources[0].source_type).toBe('RESEARCH');
      expect(detail.foreigner_support.transliteration).toBe('อาร์เอจี');
      expect(detail.dictionary_evolution.relationship).toBe('MODERN_ONLY');
    });

    it('cross-links and displays official dictionary entries when word exists in both', async () => {
      const detail = await service.getTermDetail('จึ้ง');
      expect(detail.term).toBe('จึ้ง');
      expect(detail.dictionary_evolution.relationship).toBe('BOTH');
      expect(detail.dictionary_evolution.found_in_official).toBe(true);
      expect(detail.dictionary_evolution.editions).toHaveLength(1);
      expect(detail.dictionary_evolution.editions[0].edition_year).toBe('2554');
    });

    it('throws NotFoundException for non-existent term', async () => {
      await expect(service.getTermDetail('คำที่ไม่มีในระบบ999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('compareTerms', () => {
    it('compares modern term vs formal term and provides context guidance', async () => {
      const comparison = await service.compareTerms('ป้ายยา', 'โน้มน้าว');
      expect(comparison.wordA.word).toBe('ป้ายยา');
      expect(comparison.wordA.type).toBe('MODERN');
      expect(comparison.wordB.word).toBe('โน้มน้าว');
      expect(comparison.wordB.type).toBe('OFFICIAL');
      expect(comparison.guidance).toContain('ควรใช้ "โน้มน้าว"');
      expect(comparison.guidance).toContain('ป้ายยา');
    });
  });

  describe('suggestTerm', () => {
    it('accepts suggestion and marks as PENDING_REVIEW', async () => {
      const res = await service.suggestTerm({
        term: 'เทคสแต็ก',
        definition: 'ชุดเทคโนโลยีที่ใช้ในการพัฒนาระบบ',
        category: 'TECHNOLOGY',
      });
      expect(res.success).toBe(true);
      expect(res.status).toBe('PENDING_REVIEW');
    });

    it('throws BadRequestException if term is empty', async () => {
      await expect(service.suggestTerm({ term: '   ', definition: 'นิยาม' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('admin workflow', () => {
    it('approves submission and creates modern term', async () => {
      const res = await service.approveSubmission('sub-1');
      expect(res.success).toBe(true);
      expect(prisma.modernTerm.create).toHaveBeenCalled();
      expect(prisma.modernTermSubmission.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'APPROVED' }) }),
      );
    });

    it('rejects submission with review notes', async () => {
      const res = await service.rejectSubmission('sub-1', { reviewNotes: 'ไม่ผ่านการตรวจสอบ' });
      expect(res.success).toBe(true);
      expect(prisma.modernTermSubmission.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'REJECTED' }) }),
      );
    });
  });
});
