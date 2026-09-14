import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceOrchestratorService } from './workspace-orchestrator.service';
import { AgentRegistry } from './agent.registry';
import { ContextAgent } from './agents/context.agent';
import { WordDiscoveryAgent } from './agents/word-discovery.agent';
import { WordCompareAgent } from './agents/word-compare.agent';
import { WritingAgent } from './agents/writing.agent';
import { RewriteAgent } from './agents/rewrite.agent';
import { LanguageCheckerAgent } from './agents/language-checker.agent';
import { LanguageBridgeAgent } from './agents/language-bridge.agent';
import { PrismaService } from '../../../database/prisma.service';
import { AIService } from '../ai.service';

describe('WorkspaceOrchestratorService (Section 37 Test Suite)', () => {
  let orchestrator: WorkspaceOrchestratorService;

  beforeEach(async () => {
    const mockPrisma = {
      word: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const mockAIService = {
      getRecommendations: jest.fn().mockResolvedValue({ recommendations: [] }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceOrchestratorService,
        AgentRegistry,
        ContextAgent,
        WordDiscoveryAgent,
        WordCompareAgent,
        WritingAgent,
        RewriteAgent,
        LanguageCheckerAgent,
        LanguageBridgeAgent,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AIService, useValue: mockAIService },
      ],
    }).compile();

    orchestrator = module.get<WorkspaceOrchestratorService>(WorkspaceOrchestratorService);
  });

  it('should be defined', () => {
    expect(orchestrator).toBeDefined();
  });

  // Test 1: Discovery Test
  describe('Test 1: Word Discovery', () => {
    it('should return official headwords and citations from natural language query', async () => {
      const res = await orchestrator.process({
        message: 'หาคำที่หมายถึงทำงานได้ดีและใช้ทรัพยากรน้อย',
      });

      expect(res.recommendations).toBeDefined();
      expect(res.recommendations.length).toBeGreaterThan(0);
      expect(res.recommendations[0].word).toBe('ประสิทธิภาพ');
      expect(res.evidence.length).toBeGreaterThan(0);
      expect(res.evidence[0].source_book).toContain('ราชบัณฑิตยสถาน');
      expect(res.evidence[0].is_official).toBe(true);
      expect(res.confidence_level).toBe('HIGH');
    });
  });

  // Test 2: Writing Test
  describe('Test 2: Writing Agent', () => {
    it('should generate grounded contextual sentences in academic register', async () => {
      const res = await orchestrator.process({
        message: 'แต่งประโยคคำว่า ประสิทธิภาพ สำหรับรายงานวิชาการ',
        context: { type: 'academic', tone: 'formal' },
      });

      expect(res.generated_content).toBeDefined();
      expect(res.generated_content.length).toBeGreaterThan(0);
      const academicItem = res.generated_content.find(
        (i) => i.register === 'academic' && i.type === 'sentence',
      );
      expect(academicItem).toBeDefined();
      expect(academicItem?.content).toContain('ประสิทธิภาพ');
      expect(academicItem?.content).toContain('ประมวลผล');
    });
  });

  // Test 3: Rewrite Test
  describe('Test 3: Rewrite Agent', () => {
    it('should shorten or formalize text and provide change notes', async () => {
      const res = await orchestrator.process({
        message: 'ทำให้สั้นลงและกระชับขึ้น',
        current_text:
          'การประยุกต์ใช้อัลกอริทึมใหม่ช่วยเพิ่มประสิทธิภาพในการประมวลผลข้อมูลขนาดใหญ่ และลดระยะเวลาการทำงานได้อย่างมีนัยสำคัญ',
      });

      expect(res.generated_content.length).toBeGreaterThan(0);
      const rewriteItem = res.generated_content[0];
      expect(rewriteItem.content.length).toBeLessThan(
        'การประยุกต์ใช้อัลกอริทึมใหม่ช่วยเพิ่มประสิทธิภาพในการประมวลผลข้อมูลขนาดใหญ่ และลดระยะเวลาการทำงานได้อย่างมีนัยสำคัญ'
          .length,
      );
      expect(rewriteItem.content).toContain('ประสิทธิภาพ');
      expect(rewriteItem.notes).toBeDefined();
    });
  });

  // Test 4: Word Compare Test
  describe('Test 4: Word Compare', () => {
    it('should contrast two candidate words and provide guidance', async () => {
      const res = await orchestrator.process({
        message: 'ประสิทธิภาพ หรือ ประสิทธิผล ต่างกันอย่างไร',
        selected_words: ['ประสิทธิภาพ', 'ประสิทธิผล'],
      });

      expect(res.comparison).toBeDefined();
      expect(res.comparison?.wordA).toBe('ประสิทธิภาพ');
      expect(res.comparison?.wordB).toBe('ประสิทธิผล');
      expect(res.comparison?.difference_summary).toContain('Efficiency');
      expect(res.comparison?.difference_summary).toContain('Effectiveness');
      expect(res.comparison?.guidance).toBeDefined();
      expect(res.comparison?.details['ประสิทธิภาพ']).toBeDefined();
    });
  });

  // Test 5: Language Checker Test
  describe('Test 5: Language Checker', () => {
    it('should detect redundancies and awkward phrasing with suggestions', async () => {
      const res = await orchestrator.process({
        message: 'ช่วยตรวจภาษาประโยคนี้ให้หน่อย',
        current_text: 'ระบบนี้สามารถที่จะทำการประมวลผลได้อย่างรวดเร็ว',
      });

      expect(res.language_check).toBeDefined();
      expect(res.language_check?.issues.length).toBeGreaterThan(0);
      const redundancy = res.language_check?.issues.find((i) => i.type === 'REDUNDANCY');
      expect(redundancy).toBeDefined();
      expect(redundancy?.suggestion).toBe('สามารถ');
      expect(redundancy?.rule_type).toBe('AI_LANGUAGE_SUGGESTION');
    });
  });

  // Test 6: Hallucination Guard / Insufficient Evidence Test
  describe('Test 6: Hallucination Guard & Abstention', () => {
    it('should abstain and report low confidence on non-existent gibberish words', async () => {
      const res = await orchestrator.process({
        message: 'คำที่ไม่มีในโลกนี้เลย สับปะรดสีชมพูลอยได้',
      });

      expect(res.abstained).toBe(true);
      expect(res.confidence_level).toBe('LOW');
      expect(res.abstention_reason).toContain('ไม่พบข้อมูลที่เพียงพอจากแหล่งข้อมูลพจนานุกรมที่ระบบรองรับ');
      expect(res.recommendations).toHaveLength(0);
    });
  });

  // Test 7: Multi-Agent Pipeline Test
  describe('Test 7: Multi-Agent Pipeline', () => {
    it('should execute context analysis, discovery, and compare in integrated pipeline', async () => {
      const res = await orchestrator.process({
        message: 'หาคำที่หมายถึงทำงานได้ดีและใช้ทรัพยากรน้อย และเปรียบเทียบคำให้ด้วย',
      });

      expect(res.tasks).toContain('CONTEXT_ANALYSIS');
      expect(res.tasks).toContain('WORD_DISCOVERY');
      expect(res.tasks).toContain('WORD_COMPARE');
      expect(res.agent_traces.length).toBeGreaterThanOrEqual(3);
      expect(res.recommendations.length).toBeGreaterThan(0);
      expect(res.comparison).toBeDefined();
      expect(res.context.type).toBeDefined();
    });
  });

  // Test 8: Continuation Session Test
  describe('Test 8: Session Continuation Memory', () => {
    it('should retain context and text across multi-turn interactions without re-specifying', async () => {
      const sessionId = 'session-test-multi-turn-001';

      // Turn 1: Generate sentence
      const turn1 = await orchestrator.process({
        session_id: sessionId,
        message: 'แต่งประโยคคำว่า ประสิทธิภาพ ในเชิงวิชาการ',
      });

      expect(turn1.session_id).toBe(sessionId);
      expect(turn1.generated_content.length).toBeGreaterThan(0);
      const generatedText = turn1.generated_content[0].content;

      // Turn 2: Follow-up instruction "ทำให้สั้นลง" without providing text again
      const turn2 = await orchestrator.process({
        session_id: sessionId,
        message: 'ทำให้สั้นลง',
      });

      expect(turn2.session_id).toBe(sessionId);
      expect(turn2.intent).toBe('REWRITE');
      expect(turn2.generated_content.length).toBeGreaterThan(0);
      // Rewritten content should be shorter than or derived from turn 1
      expect(turn2.generated_content[0].content).not.toEqual(generatedText);
      expect(turn2.generated_content[0].notes).toBeDefined();
    });
  });

  // Secondary Scenario: Language Bridge
  describe('Secondary Scenario: Thai-English Cultural Bridge', () => {
    it('should provide pronunciation, transliteration, English explanation, and cultural context', async () => {
      const res = await orchestrator.process({
        message: 'คำว่า เกรงใจ แปลเป็นภาษาอังกฤษและมีบริบททางวัฒนธรรมอย่างไร',
      });

      expect(res.language_bridge).toBeDefined();
      expect(res.language_bridge?.word).toBe('เกรงใจ');
      expect(res.language_bridge?.english_translation).toContain('Considerate');
      expect(res.language_bridge?.pronunciation).toBeDefined();
      expect(res.language_bridge?.cultural_context).toContain('harmony');
    });
  });
});
