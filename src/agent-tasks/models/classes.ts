import { IAgentCard, IAIModel } from '@dataclouder/conversation-card-nestjs';

export enum AgentTaskType {
  REVIEW_TASK = 'review_task',
  CREATE_CONTENT = 'create_content',
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
  agentCards: IAgentCardMinimal[];
  name: string;
  description: string;
  status: string;
  taskType: AgentTaskType;
  sources: ISourceTask[];
  model: IAIModel;
  output: IAgentTaskOutput;
  taskAttached: Partial<IAgentTask>;
}

// Tiene una relación con el agente y la tarea. parcial asi muestro graficamente que pasa.
export interface IAgentJob {
  _id?: string;
  id?: string;
  task: Partial<IAgentTask>;
  agentCard?: Partial<IAgentCardMinimal>;
  messages: any[];
  response: any;
  sources?: ISourceTask[];
  infoFromSources?: string;
}

export enum SourceType {
  DOCUMENT = 'document',
  WEBSITE = 'website',
  YOUTUBE = 'youtube',
  NOTION = 'notion',
}

export interface IAgentSource {
  id: string;
  name: string;
  description: string;
  type: SourceType;
  sourceUrl: string;
  content: string;
  contentEnhancedAI?: string;
  img: string;
  assets?: any;
}

export interface IAgentTaskOutput {
  id: string;
  name: string;
  type: string;
}

export enum OutputTaks {
  NOTION_PAGE = 'notion_page',
}
