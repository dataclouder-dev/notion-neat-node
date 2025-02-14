import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotionDBPageDocument = NotionDBPageEntity & Document;

@Schema({ collection: 'notion_db_pages', timestamps: true })
export class NotionDBPageEntity {
  @Prop({ required: true })
  db_id: string;

  @Prop({ required: true, unique: true })
  page_id: string;

  @Prop({ required: false })
  title: string;

  @Prop({ required: false })
  blocks: any[];

  @Prop({ type: Object, required: false })
  json: any;
}

export const NotionDBPageSchema = SchemaFactory.createForClass(NotionDBPageEntity);
