import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ISourceLLM } from '../models/classes';
import { addIdAfterSave } from 'src/mongo-db/utils';

export type SourceLLMDocument = SourceLLMEntity & Document;

@Schema({ collection: 'sources_llm', timestamps: true })
export class SourceLLMEntity implements ISourceLLM {
  @Prop({ required: false })
  id: string;

  @Prop({ required: false })
  img: string;

  @Prop({ required: false })
  name: string;

  @Prop({ required: false })
  type: string;

  @Prop({ required: false })
  content: string;
}

export const SourceLLMSchema = SchemaFactory.createForClass(SourceLLMEntity);

addIdAfterSave(SourceLLMSchema);
