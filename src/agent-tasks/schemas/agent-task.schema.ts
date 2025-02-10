import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AgentTaskDocument = AgentTaskEntity & Document;

@Schema()
export class AgentTaskEntity {
  @Prop({ required: true })
  taskId: string;

  @Prop({ required: true })
  agentId: string;

  @Prop()
  status: string;

  @Prop()
  description: string;

  @Prop()
  result: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date })
  completedAt: Date;
}

export const AgentTaskSchema = SchemaFactory.createForClass(AgentTaskEntity);
