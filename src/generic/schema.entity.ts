import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IGeneric } from './generic.models';
import * as mongoose from 'mongoose';
export type GenericDocument = GenericEntity & Document;

@Schema({ timestamps: true, collection: 'generics' })
export class GenericEntity implements IGeneric {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, auto: true })
  id: string;
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: false })
  content: string;

  @Prop({ required: false })
  img: string;
}

export const GenericSchema = SchemaFactory.createForClass(GenericEntity);
