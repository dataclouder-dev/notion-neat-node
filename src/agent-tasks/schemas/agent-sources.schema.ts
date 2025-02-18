import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IAgentSource, SourceType } from '../models/classes';
import { addIdAfterSave } from 'src/mongo-db/utils';

export type SourceLLMDocument = SourceLLMEntity & Document;

@Schema({ collection: 'sources_llm', timestamps: true })
export class SourceLLMEntity implements IAgentSource {
  @Prop({ required: false })
  id: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false })
  sourceUrl: string;

  @Prop({ required: false })
  img: string;

  @Prop({ required: false })
  name: string;

  @Prop({ required: false, type: String, enum: SourceType })
  type: SourceType;

  @Prop({ required: false })
  content: string;

  @Prop({ required: false })
  contentEnhancedAI: string;
}

export const SourceLLMSchema = SchemaFactory.createForClass(SourceLLMEntity);

addIdAfterSave(SourceLLMSchema);
