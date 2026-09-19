export interface AIRequest {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  metadata?: Record<string, unknown>;
  responseSchema?: any;
}

export interface AIResponse {
  text: string;
  model: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
  latencyMs: number;
  finishReason?: string;
}

export interface StructuredAIRequest<T = any> extends AIRequest {
  schema?: any;
  parser?: (raw: string) => T;
}

export interface AIStreamChunk {
  text: string;
  model?: string;
  finishReason?: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
}

export interface AIModel {
  readonly modelName: string;
  readonly tier: string;

  generateText(request: AIRequest): Promise<AIResponse>;

  generateStructured<T>(request: StructuredAIRequest<T>): Promise<T>;

  generateStream(request: AIRequest): AsyncIterable<AIStreamChunk>;
}
