import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AgentTask } from '../models/classes';
// import { addIdAfterSave } from 'src/mongo-db/utils';

export type AgentTaskDocument = AgentTaskEntity & Document;

@Schema({ collection: 'agent_tasks', timestamps: true })
export class AgentTaskEntity implements AgentTask {
  @Prop({ required: false })
  id: string;

  @Prop({ required: false })
  name: string;

  @Prop({ required: false })
  idNotionDB: string;

  @Prop({ required: false })
  idAgentCard: string;

  @Prop({ required: false })
  taskId: string;

  @Prop({ required: false })
  status: string;

  @Prop({ required: false })
  description: string;
}

export const AgentTaskSchema = SchemaFactory.createForClass(AgentTaskEntity);

// addIdAfterSave(AgentTaskSchema);
