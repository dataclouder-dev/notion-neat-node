import { Module } from '@nestjs/common';
import { NotionModule } from 'src/notion-module/notion.module';
import { NotionConversationController } from './notion-conversation.controller';
import { NotionConversationService } from './notion-conversation.service';
import { ConversationCardsModule } from '@dataclouder/conversation-card-nestjs';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [NotionModule, ConversationCardsModule, HttpModule],
  controllers: [NotionConversationController],
  providers: [NotionConversationService],
  exports: [NotionConversationService],
})
export class NotionConversationModule {}
