import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IAgentTask, AgentTaskType, ISourceTask, IAgentJob } from '../models/classes';
import { addIdAfterSave } from 'src/mongo-db/utils';

export type AgentJobDocument = AgentJobEntity & Document;

@Schema({ collection: 'agent_jobs', timestamps: true })
export class AgentJobEntity implements IAgentJob {
  @Prop({ required: false })
  id: string;

  @Prop({ required: false })
  idTask: string;

  @Prop({ required: false })
  idAgentCard: string;

  @Prop({ required: false })
  messages: any[];

  @Prop({ type: Object })
  response: any;

  @Prop({ required: false })
  sources: ISourceTask[];
}

export const AgentJobSchema = SchemaFactory.createForClass(AgentJobEntity);

addIdAfterSave(AgentJobSchema);
