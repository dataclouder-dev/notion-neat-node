import { Module } from '@nestjs/common';
import { NotionModule } from 'src/notion-module/notion.module';
import { NotionConversationController } from './notion-conversation.controller';
import { NotionConversationService } from './notion-conversation.service';

@Module({
  imports: [NotionModule],
  controllers: [NotionConversationController],
  providers: [NotionConversationService],
  exports: [NotionConversationService],
})
export class NotionConversationModule {}
