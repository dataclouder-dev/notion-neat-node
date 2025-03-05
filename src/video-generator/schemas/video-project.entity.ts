import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IAssets, IVideoProjectGenerator } from '../models/videoGenerator.models';
import * as mongoose from 'mongoose';
import { IAgentSource } from 'src/agent-tasks/models/classes';
import { addIdAfterSave } from '@dataclouder/dc-mongo';

export type VideoGeneratorDocument = VideoGeneratorEntity & Document;

@Schema({ timestamps: true, collection: 'video_projects' })
export class VideoGeneratorEntity implements IVideoProjectGenerator {
  @Prop({ type: [mongoose.Schema.Types.Mixed], required: false })
  sources: IAgentSource[];

  @Prop({ type: String, required: false })
  type: 'video-project';

  @Prop({ type: mongoose.Schema.Types.Mixed, required: false })
  assets: IAssets;

  @Prop({ type: String, required: false })
  id: string;

  @Prop({ required: false })
  name: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false })
  content: string;

  @Prop({ required: false })
  img: string;
}

export const VideoGeneratorSchema = SchemaFactory.createForClass(VideoGeneratorEntity);

addIdAfterSave(VideoGeneratorSchema);
