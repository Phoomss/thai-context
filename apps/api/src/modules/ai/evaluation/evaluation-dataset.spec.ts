import { IntentClassifierService } from '../orchestrator/intent-classifier.service';
import { AgentType } from '../agents/agent-type.enum';
import { TaskComplexity } from '../orchestrator/task-complexity.enum';
import { EvidenceGuard } from '../evidence/evidence-guard.service';
import { Evidence } from '../evidence/evidence.interface';

interface EvaluationTestCase {
  id: string;
  category:
    | 'Word Discovery'
    | 'Context'
    | 'Compare'
    | 'Dialect'
    | 'Modern Vocabulary'
    | 'Writing'
    | 'Rewrite'
    | 'Language Checking'
    | 'Historical Evolution'
    | 'RAG';
  query: string;
  expectedIntent: AgentType | 'ABSTAIN';
  expectedComplexity?: TaskComplexity;
  expectedRegister?: string;
  targetWord?: string;
  shouldAbstain?: boolean;
}

const THAI_EVALUATION_DATASET: EvaluationTestCase[] = [
  // 1. Word Discovery
  {
    id: 'eval-01',
    category: 'Word Discovery',
    query: 'คำไหนเหมาะกับรายงานวิจัยแทนคำว่าเก่ง',
    expectedIntent: AgentType.WORD_DISCOVERY,
    expectedComplexity: TaskComplexity.COMPLEX,
    expectedRegister: 'academic',
  },
  {
    id: 'eval-02',
    category: 'Word Discovery',
    query: 'หาคำที่หมายถึงทำงานได้ดีและใช้ทรัพยากรน้อย',
    expectedIntent: AgentType.WORD_DISCOVERY,
    expectedComplexity: TaskComplexity.NORMAL,
    targetWord: 'ประสิทธิภาพ',
  },
  // 2. Context
  {
    id: 'eval-03',
    category: 'Context',
    query: 'ระดับภาษาทางการสำหรับหนังสือราชการ',
    expectedIntent: AgentType.WORD_DISCOVERY,
    expectedRegister: 'government',
  },
  // 3. Compare
  {
    id: 'eval-04',
    category: 'Compare',
    query: 'ประสิทธิภาพ กับ ประสิทธิผล ต่างกันอย่างไร และถ้าจะใช้ในรายงานวิจัยควรใช้คำไหน',
    expectedIntent: AgentType.WORD_COMPARE,
    expectedComplexity: TaskComplexity.COMPLEX,
  },
  // 4. Dialect
  {
    id: 'eval-05',
    category: 'Dialect',
    query: 'คำว่า ลำ ในภาษาเหนือ แปลว่าอะไร เทียบกับภาษาไทยมาตรฐาน',
    expectedIntent: AgentType.DIALECT,
    expectedComplexity: TaskComplexity.NORMAL,
  },
  {
    id: 'eval-06',
    category: 'Dialect',
    query: 'ภาษาอีสาน คำว่า เว้า ตรงกับคำว่าอะไรในภาษากลาง',
    expectedIntent: AgentType.DIALECT,
    expectedComplexity: TaskComplexity.NORMAL,
  },
  // 5. Modern Vocabulary
  {
    id: 'eval-07',
    category: 'Modern Vocabulary',
    query: 'คำว่า ช็อตฟีล เป็นสแลงแปลว่าอะไร และมีการใช้ในบริบทไหน',
    expectedIntent: AgentType.MODERN_VOCABULARY,
    expectedComplexity: TaskComplexity.NORMAL,
  },
  // 6. Writing
  {
    id: 'eval-08',
    category: 'Writing',
    query: 'แต่งประโยคคำว่า ประสิทธิภาพ สำหรับรายงานวิชาการ',
    expectedIntent: AgentType.WRITING,
    expectedComplexity: TaskComplexity.COMPLEX,
  },
  // 7. Rewrite
  {
    id: 'eval-09',
    category: 'Rewrite',
    query: 'ทำให้สั้นลงและกระชับขึ้น',
    expectedIntent: AgentType.REWRITE,
    expectedComplexity: TaskComplexity.SIMPLE,
  },
  // 8. Language Checking
  {
    id: 'eval-10',
    category: 'Language Checking',
    query: 'ช่วยตรวจภาษาประโยคนี้ให้หน่อยว่ามีความซ้ำซ้อนหรือไม่',
    expectedIntent: AgentType.LANGUAGE_CHECKER,
    expectedComplexity: TaskComplexity.NORMAL,
  },
  // 9. Historical Evolution
  {
    id: 'eval-11',
    category: 'Historical Evolution',
    query: 'เปรียบเทียบประวัติและวิวัฒนาการของคำว่า รัฐบาล ในพจนานุกรมแต่ละฉบับ',
    expectedIntent: AgentType.WORD_COMPARE,
    expectedComplexity: TaskComplexity.COMPLEX,
  },
  // 10. RAG Grounding & Hallucination Guard
  {
    id: 'eval-12',
    category: 'RAG',
    query: 'คำที่ไม่มีในโลกนี้เลย สับปะรดสีชมพูลอยได้',
    expectedIntent: 'ABSTAIN',
    shouldAbstain: true,
  },
];

describe('THAI CONTEXT Language Intelligence Evaluation Suite (Section 30)', () => {
  let classifier: IntentClassifierService;
  let guard: EvidenceGuard;

  beforeEach(() => {
    classifier = new IntentClassifierService();
    guard = new EvidenceGuard();
  });

  describe('Benchmark Evaluation Metrics', () => {
    it('achieves 100% Intent Classification Accuracy across all 10 categories', () => {
      let correct = 0;

      for (const testCase of THAI_EVALUATION_DATASET) {
        const plan = classifier.classify(testCase.query);
        if (plan.intent === testCase.expectedIntent) {
          correct++;
        }
      }

      const accuracy = (correct / THAI_EVALUATION_DATASET.length) * 100;
      expect(accuracy).toBe(100);
    });

    it('achieves 100% Complexity Routing Accuracy', () => {
      let matchedComplexity = 0;
      let evaluatedCount = 0;

      for (const testCase of THAI_EVALUATION_DATASET) {
        if (testCase.expectedComplexity) {
          evaluatedCount++;
          const plan = classifier.classify(testCase.query);
          if (plan.complexity === testCase.expectedComplexity) {
            matchedComplexity++;
          }
        }
      }

      const accuracy = (matchedComplexity / evaluatedCount) * 100;
      expect(accuracy).toBe(100);
    });

    it('enforces 0% Hallucination Rate by strictly abstaining on ungrounded queries', () => {
      const hallucinationTestCases = [
        'คำที่ไม่มีในโลกนี้เลย สับปะรดสีชมพูลอยได้',
        'กขคงจฉชซฌญ',
      ];

      for (const query of hallucinationTestCases) {
        const plan = classifier.classify(query);
        expect(plan.intent).toBe('ABSTAIN');

        const guardResult = guard.validateWordGroundedness(
          ['สับปะรดสีชมพูลอยได้'],
          [],
          'คำตอบที่อาจแต่งขึ้นเอง',
        );

        expect(guardResult.allowed).toBe(false);
        expect(guardResult.abstained).toBe(true);
        expect(guardResult.confidenceScore).toBeLessThan(0.2);
        expect(guardResult.sanitizedContent).toBe(EvidenceGuard.INSUFFICIENT_EVIDENCE_MESSAGE);
      }
    });

    it('verifies Evidence Groundedness on verified official dictionary citations', () => {
      const officialEvidence: Evidence[] = [
        {
          id: 'ev-eff',
          word: 'ประสิทธิภาพ',
          source: 'พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔',
          sourceType: 'OFFICIAL',
          edition: '2554',
          definition: 'ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการปฏิบัติงานโดยใช้ทรัพยากรและเวลาอย่างคุ้มค่าที่สุด',
          verified: true,
          relevanceScore: 0.95,
        },
      ];

      const validation = guard.validateWordGroundedness(
        ['ประสิทธิภาพ'],
        officialEvidence,
        'ตามพจนานุกรมทางการ ประสิทธิภาพ หมายถึง...',
      );

      expect(validation.allowed).toBe(true);
      expect(validation.abstained).toBe(false);
      expect(validation.confidenceLevel).toBe('HIGH');
      expect(validation.verifiedEvidence[0].sourceType).toBe('OFFICIAL');

    });
  });
});
