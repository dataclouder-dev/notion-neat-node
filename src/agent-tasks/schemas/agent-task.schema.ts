import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IAgentTask, AgentTaskType, ISourceTask, IAgentCardMinimal } from '../models/classes';
import { addIdAfterSave } from '@dataclouder/dc-mongo';
import { IAIModel } from '@dataclouder/conversation-card-nestjs';

export type AgentTaskDocument = AgentTaskEntity & Document;

@Schema({ collection: 'agent_tasks', timestamps: true })
export class AgentTaskEntity implements IAgentTask {
  _id?: string;

  @Prop({ required: false, type: Object })
  model: IAIModel;

  @Prop({ required: false, type: Object })
  output: { id: string; name: string; type: string };

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
  status: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false, type: String, enum: AgentTaskType })
  taskType: AgentTaskType;

  @Prop({ required: false, type: Object })
  taskAttached: Partial<IAgentTask>;
}

export const AgentTaskSchema = SchemaFactory.createForClass(AgentTaskEntity);

addIdAfterSave(AgentTaskSchema);
