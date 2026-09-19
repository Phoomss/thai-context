import { Injectable, Logger } from '@nestjs/common';
import { ModelTier } from './model-tier.enum';

@Injectable()
export class ModelOverrideService {
  private readonly logger = new Logger(ModelOverrideService.name);
  private globalOverride: ModelTier | null = null;
  private readonly agentOverrides: Map<string, ModelTier> = new Map();

  setGlobalOverride(tier: ModelTier | null): void {
    this.globalOverride = tier;
    this.logger.log(`Global model tier override set to: ${tier || 'NONE'}`);
  }

  setAgentOverride(agent: string, tier: ModelTier | null): void {
    if (tier === null) {
      this.agentOverrides.delete(agent);
      this.logger.log(`Agent ${agent} model tier override removed.`);
    } else {
      this.agentOverrides.set(agent, tier);
      this.logger.log(`Agent ${agent} model tier override set to: ${tier}`);
    }
  }

  resolveTier(agent: string, intendedTier: ModelTier): ModelTier {
    if (this.globalOverride) {
      return this.globalOverride;
    }
    if (this.agentOverrides.has(agent)) {
      return this.agentOverrides.get(agent)!;
    }
    return intendedTier;
  }

  clearOverrides(): void {
    this.globalOverride = null;
    this.agentOverrides.clear();
    this.logger.log('All model tier overrides cleared.');
  }

  getOverrides(): { global: ModelTier | null; agents: Record<string, ModelTier> } {
    const agents: Record<string, ModelTier> = {};
    this.agentOverrides.forEach((tier, agent) => {
      agents[agent] = tier;
    });
    return {
      global: this.globalOverride,
      agents,
    };
  }
}
