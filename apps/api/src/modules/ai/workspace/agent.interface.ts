import { AgentTask, WorkspaceContext } from './workspace.types';

export interface LanguageAgent {
  readonly name: string;
  readonly description: string;

  canHandle(task: AgentTask, context: WorkspaceContext): boolean;

  execute(task: AgentTask, context: WorkspaceContext): Promise<WorkspaceContext>;
}
