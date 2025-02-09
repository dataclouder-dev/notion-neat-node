import { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints';

export type ExportMediumResult = { exported: boolean; db?: string; title?: string; mediumUrl?: string; description?: string };

export type DbEntries = { [key: string]: DatabaseObjectResponse[] };

// SelectColor Copied from notion since is not exported
export type SelectColor = 'default' | 'gray' | 'brown' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'red';

export enum ColorOptions {
  Default = 'default',
  Gray = 'gray',
  Brown = 'brown',
  Orange = 'orange',
  Yellow = 'yellow',
  Green = 'green',
  Blue = 'blue',
  Purple = 'purple',
  Pink = 'pink',
  Red = 'red',
  GrayBackground = 'gray_background',
  BrownBackground = 'brown_background',
  OrangeBackground = 'orange_background',
  YellowBackground = 'yellow_background',
  GreenBackground = 'green_background',
  BlueBackground = 'blue_background',
  PurpleBackground = 'purple_background',
  PinkBackground = 'pink_background',
  RedBackground = 'red_background',
}

export type MediumStory = {
  title: string;
  contentFormat: string;
  content: string;
  tags: string[];
  canonicalUrl?: string;
  publishStatus: string;
  license?: string;
  notifyFollowers?: boolean;
};

export type MediumStoryResponse = {
  id: string;
  title: string;
  authorId: string;
  tags: string[];
  url: string;
  canonicalUrl?: string;
  publishStatus: string;
  publishedAt: number;
  license?: string;
  notifyFollowers?: boolean;
};

export enum MediumStatus {
  Draft = 'Draft',
  Ready = 'Ready',
  Published = 'Published',
}

export type ExportResults = { [key: string]: ExportMediumResult[] };
