import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentTasksController } from './controllers/agent-tasks.controller';
import { AgentTasksService } from './services/agent-tasks.service';
import { AgentTaskEntity, AgentTaskSchema } from './schemas/agent-task.schema';
import { HttpModule } from '@nestjs/axios';

import { ConversationCardsModule } from '@dataclouder/conversation-card-nestjs';
import { NotionModule } from 'src/notion-module/notion.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AgentTaskEntity.name, schema: AgentTaskSchema }]),
    HttpModule,
    ConversationCardsModule,
    NotionModule,
  ],
  controllers: [AgentTasksController],
  providers: [AgentTasksService],
  exports: [AgentTasksService],
})
export class AgentTasksModule {}
