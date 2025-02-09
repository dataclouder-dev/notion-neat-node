import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { NotionConversationService } from './notion-conversation.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Notion Conversation')
@Controller('notion-conversation')
export class NotionConversationController {
  constructor(private readonly notionConversationService: NotionConversationService) {}

  @ApiOperation({
    summary: 'Extract dictionary data from a Notion page',
    description:
      'Retrieves content from a Notion page and converts it into a key-value dictionary format where titles are keys and text content are values',
  })
  @ApiParam({
    name: 'pageId',
    description: 'The ID of the Notion page to extract data from',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Dictionary data successfully extracted',
    schema: {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
      example: {
        'Title 1': 'Content text 1',
        'Title 2': 'Content text 2',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid page ID' })
  @ApiResponse({ status: 404, description: 'Notion page not found' })
  @Get('extract-dict-data/:pageId')
  async extractNotionDictData(@Param('pageId') pageId: string) {
    return await this.notionConversationService.extractNotionDictData(pageId);
  }
}
