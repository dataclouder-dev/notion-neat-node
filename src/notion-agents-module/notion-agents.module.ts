import { Module } from '@nestjs/common';
import { NotionModule } from 'src/notion-module/notion.module';
import { NotionConversationController } from './controllers/notion-conversation.controller';
import { NotionConversationService } from './notion-conversation.service';
import { ConversationCardsModule } from '@dataclouder/conversation-card-nestjs';
import { HttpModule } from '@nestjs/axios';
import { NotionAgentTaskController } from './controllers/notion-agent-task.controller';
@Module({
  imports: [NotionModule, ConversationCardsModule, HttpModule],
  controllers: [NotionConversationController, NotionAgentTaskController],
  providers: [NotionConversationService],
  exports: [NotionConversationService],
})
export class NotionAgentsModule {}
