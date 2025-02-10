import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AgentTask } from '../models/classes';

export type AgentTaskDocument = AgentTaskEntity & Document;

@Schema({ collection: 'agent_tasks', timestamps: true })
export class AgentTaskEntity implements AgentTask {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  idAgentCard: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  idNotionDB: string;
}

export const AgentTaskSchema = SchemaFactory.createForClass(AgentTaskEntity);
