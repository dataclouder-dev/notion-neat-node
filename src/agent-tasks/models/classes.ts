export enum AgentTaskType {
  POST_NOTION = 'post_notion',
}

export interface ISourceTask {
  id: string;
  name: string;
  type: string;
}

export interface IAgentTask {
  _id?: string;
  id: string;
  idAgentCard: string;
  name: string;
  description: string;
  status: string;
  idNotionDB: string;
  taskType: AgentTaskType;
  sources: ISourceTask[];
}

export interface IAgentJob {
  _id?: string;
  id?: string;
  idTask: string;
  idAgentCard: string;
  messages: any[];
  response: any;
}
