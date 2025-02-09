import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { IConversationSettings, IUser, PersonalData } from './user.class';
import { AppAuthClaims } from 'src/dc-claims-module/clams.class';

@Schema({ collection: 'users' })
export class UserEntity extends Document implements IUser {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, auto: true })
  _id: string;

  @Prop({ type: mongoose.Schema.Types.String, required: false })
  id: string;

  @Prop({ type: mongoose.Schema.Types.String, required: false })
  email: string;

  @Prop({ type: mongoose.Schema.Types.String, required: false })
  urlPicture: string;

  @Prop({ type: mongoose.Schema.Types.String, required: false })
  authStrategy: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: false })
  claims: AppAuthClaims;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: false })
  personalData: PersonalData;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: false })
  conversationSettings: IConversationSettings;
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);
