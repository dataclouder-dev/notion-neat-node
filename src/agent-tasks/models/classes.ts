export enum AgentTaskType {
  POST_NOTION = 'post_notion',
}

export interface AgentTask {
  _id?: string;
  id: string;
  idAgentCard: string;
  name: string;
  description: string;
  status: string;
  idNotionDB: string;
  taskType: AgentTaskType;
}
