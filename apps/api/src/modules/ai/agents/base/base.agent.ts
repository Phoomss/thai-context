import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { SubAgent, AgentContext, AgentResult } from './agent.interface';
import { AgentType } from '../agent-type.enum';
import { ModelTier } from '../../router/model-tier.enum';
import { ModelRouter } from '../../router/model-router.service';

export abstract class BaseAgent implements SubAgent {
  protected readonly logger: Logger;
  abstract readonly type: AgentType;
  abstract readonly defaultTier: ModelTier;

  constructor(protected readonly modelRouter: ModelRouter) {
    this.logger = new Logger(this.constructor.name);
  }

  abstract execute(context: AgentContext): Promise<AgentResult>;

  protected loadPrompt(promptRelativePath: string): string {
    const candidates = [
      path.resolve(__dirname, '../../prompts', promptRelativePath),
      path.resolve(process.cwd(), 'src/modules/ai/prompts', promptRelativePath),
      path.resolve(process.cwd(), 'dist/modules/ai/prompts', promptRelativePath),
      path.resolve(__dirname, '../../../prompts', promptRelativePath),
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return fs.readFileSync(candidate, 'utf-8');
      }
    }

    return '';
  }
}
