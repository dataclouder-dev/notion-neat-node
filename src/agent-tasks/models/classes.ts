import { IAgentCard } from '@dataclouder/conversation-card-nestjs';

export enum AgentTaskType {
  POST_NOTION = 'post_notion',
}

export interface ISourceTask {
  id: string;
  name: string;
  type: string;
}

export type IAgentCardMinimal = Pick<IAgentCard, 'id' | 'assets' | 'title'> & { name: string };

export interface IAgentTask {
  _id?: string;
  id: string;
  agentCard: IAgentCardMinimal;
  name: string;
  description: string;
  status: string;
  idNotionDB: string;
  taskType: AgentTaskType;
  sources: ISourceTask[];
  provider: string;
  modelName: string;
}

// Tiene una relación con el agente y la tarea. parcial asi muestro graficamente que pasa.
export interface IAgentJob {
  _id?: string;
  id?: string;
  task: Partial<IAgentTask>;
  agentCard: Partial<IAgentCardMinimal>;
  messages: any[];
  response: any;
  sources: ISourceTask[];
  infoFromSources: string;
}
