import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { NotionConversationService } from './notion-conversation.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Notion Agent Tasks')
@Controller('notion-agent-tasks')
export class NotionAgentTaskController {
  constructor(private readonly notionConversationService: NotionConversationService) {}

  @Get('start-post-task/:conversation_id')
  async startPostTask(@Param('conversation_id') conversation_id: string, @Query('db_id') db_id: string) {
    // return await this.notionConversationService.startPostTask(pageId);
  }
}
