import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IAgentTask, AgentTaskType, ISourceTask, IAgentCardMinimal } from '../models/classes';
import { addIdAfterSave } from 'src/mongo-db/utils';

export type AgentTaskDocument = AgentTaskEntity & Document;

@Schema({ collection: 'agent_tasks', timestamps: true })
export class AgentTaskEntity implements IAgentTask {
  @Prop({ required: false, type: Object })
  notionOutput: { id: string; name: string; type: string };

  @Prop({ required: false, type: Object })
  agentCard: IAgentCardMinimal;

  @Prop({ required: false, type: [Object] })
  agentCards: IAgentCardMinimal[];

  @Prop({ required: false })
  sources: ISourceTask[];

  @Prop({ required: false })
  id: string;

  @Prop({ required: false })
  name: string;

  @Prop({ required: false })
  idNotionDB: string;

  @Prop({ required: false })
  taskId: string;

  @Prop({ required: false })
  status: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false, type: String, enum: AgentTaskType })
  taskType: AgentTaskType;

  @Prop({ required: false })
  provider: string;
  @Prop({ required: false })
  modelName: string;
}

export const AgentTaskSchema = SchemaFactory.createForClass(AgentTaskEntity);

addIdAfterSave(AgentTaskSchema);
