import { Injectable } from '@nestjs/common';
import { parseNotionBlocks } from 'src/notion-module/notion-text-extraction/block-to-properties';
import { NotionService } from 'src/notion-module/notion.service';

import { Conversation } from '@dataclouder/conversation-card-nestjs';

const conversationProp = {
  description: 'Description',
  scenario: 'Scenario',
  first_mes: 'First Message',
  creator_notes: 'Creator Notes',
  mes_example: 'Message Example',
  alternate_greetings: 'Alternate Greetings',
  tags: 'tags',
  system_prompt: 'System Prompt',
  post_history_instructions: 'Post History Instructions',
  character_version: 'Character Version',
  extensions: {},
};

@Injectable()
export class NotionConversationService {
  constructor(private readonly notionService: NotionService) {}

  private transformPropertyKeys(properties: Record<string, string>): Record<string, string> {
    const transformedProperties: Record<string, string> = {};

    for (const [key, value] of Object.entries(properties)) {
      // Check if there's a key in parentheses
      const match = key.match(/\((.*?)\)/);
      // If there's a match, use the text in parentheses, otherwise use the original key splitting logic
      const newKey = match ? match[1].trim() : key.split('-').pop()?.trim() || key;

      transformedProperties[newKey] = value;
    }

    return transformedProperties;
  }

  async extractNotionDictData(pageId: string) {
    const pageAndBlocks = await this.notionService.getNotionPageBlocks(pageId);
    const properties = parseNotionBlocks(pageAndBlocks.page.blocks);
    const finalProperties = this.transformPropertyKeys(properties);
    return finalProperties;
  }
}
