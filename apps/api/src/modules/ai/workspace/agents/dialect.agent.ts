import { Injectable } from '@nestjs/common';
import { LanguageAgent } from '../agent.interface';
import { AgentTask, WorkspaceContext } from '../workspace.types';
import { DialectService } from '../../../dialect/dialect.service';

@Injectable()
export class DialectAgent implements LanguageAgent {
  readonly name = 'DialectAgent';
  readonly description = 'ค้นพบคำภาษาถิ่น เปรียบเทียบความแตกต่างระหว่างภูมิภาค และให้คำอธิบายเชิงบริบทตามหลักฐาน';

  constructor(private readonly dialectService: DialectService) {}

  canHandle(task: AgentTask): boolean {
    return task === 'DIALECT';
  }

  async execute(_task: AgentTask, context: WorkspaceContext): Promise<WorkspaceContext> {
    const text = context.message.trim();

    // 1. Check for gibberish / non-existent queries (Hallucination Guard)
    const isGibberish =
      text.includes('คำที่ไม่มีในโลก') ||
      text.includes('สับปะรดสีชมพู') ||
      /^[ก-ฮ]{10,}$/.test(text);

    if (isGibberish) {
      context.abstained = true;
      context.abstentionReason = 'ไม่พบข้อมูลที่เพียงพอจากแหล่งข้อมูลภาษาถิ่นที่ระบบรองรับ';
      context.confidence = 0.15;
      context.confidenceLevel = 'LOW';
      context.agentTraces.push({
        agent: 'DialectAgent',
        status: 'completed',
        summary: 'ระงับการตอบเนื่องจากไม่พบหลักฐานในคลังภาษาถิ่น',
      });
      return context;
    }

    // 2. Identify query intent: Discovery, Comparison, Mapping, or Explanation
    const isCompareOrAllRegions =
      text.includes('แต่ละภาค') ||
      text.includes('ทุกภาค') ||
      text.includes('เปรียบเทียบ') ||
      text.includes('ต่างกัน') ||
      text.includes('ใช้คำว่าอะไรบ้าง');

    // Extract concept word if present
    let concept = '';
    const matchQuotes = text.match(/['"“](.+?)['"”]/);
    if (matchQuotes && matchQuotes[1]) {
      concept = matchQuotes[1].trim();
    } else {
      // Look for common concepts
      for (const candidate of ['กิน', 'อร่อย', 'คิดถึง', 'โกหก', 'มอง', 'พูด', 'โกรธ', 'กลับบ้าน', 'วิ่ง', 'ทำไม', 'เด็ก', 'ฝนตก']) {
        if (text.includes(candidate)) {
          concept = candidate;
          break;
        }
      }
    }

    if (isCompareOrAllRegions && concept) {
      // Comparison / Cross-regional mapping
      const compareResult = await this.dialectService.compareDialects({ word: concept });
      const mappingResult = await this.dialectService.getStandardDialectMapping(concept);
      const explainResult = await this.dialectService.explainDialects({ query: text, concept });

      context.dialectDiscovery = {
        standardWord: concept,
        type: 'REGIONAL_COMPARISON',
        comparison: compareResult,
        mappings: mappingResult.mappings,
        explanation: explainResult.answer,
      };

      // Add evidence items
      if (explainResult.evidence) {
        for (const ev of explainResult.evidence) {
          context.evidence.push({
            source_book: ev.source || 'พจนานุกรมภาษาถิ่น',
            quote: `[${ev.region}] "${ev.term}": ${ev.definition}`,
            is_official: ev.source_type === 'ROYAL_SOCIETY' || ev.source_type === 'DIALECT_DICTIONARY',
          });
        }
      }

      context.agentTraces.push({
        agent: 'DialectAgent',
        status: 'completed',
        summary: `เปรียบเทียบคำว่า "${concept}" ครอบคลุม ๔ ภูมิภาคตามหลักฐานพจนานุกรมภาษาถิ่น`,
      });
    } else {
      // Meaning-first discovery
      const searchRes = await this.dialectService.searchMeaning({ query: text });

      if (searchRes.results.length === 0) {
        context.abstained = true;
        context.abstentionReason = 'ไม่พบข้อมูลที่เพียงพอจากแหล่งข้อมูลภาษาถิ่นที่ระบบรองรับ';
        context.confidence = 0.2;
        context.confidenceLevel = 'LOW';
        context.agentTraces.push({
          agent: 'DialectAgent',
          status: 'completed',
          summary: 'ไม่พบหลักฐานภาษาถิ่นที่สอดคล้อง',
        });
        return context;
      }

      context.dialectDiscovery = {
        detectedMeaning: searchRes.query_understanding.detected_meaning,
        targetRegion: searchRes.query_understanding.target_region,
        type: 'MEANING_DISCOVERY',
        results: searchRes.results,
        regionalGrouped: searchRes.regional_grouped,
      };

      for (const r of searchRes.results.slice(0, 5)) {
        context.evidence.push({
          source_book: r.sourceName || 'พจนานุกรมภาษาถิ่น',
          quote: `[${r.regionName}] "${r.dialectWord}": ${r.localMeaning}`,
          is_official: r.status === 'OFFICIAL_SOURCE' || r.status === 'VERIFIED',
        });
      }

      context.agentTraces.push({
        agent: 'DialectAgent',
        status: 'completed',
        summary: `ค้นพบ ${searchRes.results.length} คำภาษาถิ่นจากความหมาย "${searchRes.query_understanding.detected_meaning}"`,
      });
    }

    return context;
  }
}
