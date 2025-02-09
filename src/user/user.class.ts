import { AppAuthClaims } from 'src/dc-claims-module/clams.class';

export class PersonalData {
  firstname: string;
  lastname: string;
  nickname: string;
  gender: string;
  birthday: Date;
}

export interface IUser {
  id: string;
  urlPicture: string;
  email: string;
  personalData: Partial<PersonalData>;
  claims: AppAuthClaims;
  authStrategy: string;
  conversationSettings: IConversationSettings;
}

export interface IConversationSettings {
  realTime: boolean;
  repeatRecording: boolean;
  fixGrammar: boolean;
  superHearing: boolean;
  voice: string;
  autoTranslate: boolean;
  highlightWords: boolean;
  modelName: string;
  provider: string;
  speed: string;
  speedRate: number; // Temporal only 0 to 100.
}
