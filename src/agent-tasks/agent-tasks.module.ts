import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentTasksController } from './controllers/agent-tasks.controller';
import { AgentTasksService } from './services/agent-tasks.service';
import { AgentTaskEntity, AgentTaskSchema } from './schemas/agent-task.schema';
import { HttpModule } from '@nestjs/axios';

import { ConversationCardsModule } from '@dataclouder/conversation-card-nestjs';
import { NotionModule } from 'src/notion-module/notion.module';
import { AgentJobsController } from './controllers/agent-jobs.controller';
import { AgentJobService } from './services/agent-job.service';
import { AgentJobEntity, AgentJobSchema } from './schemas/agent-job.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AgentTaskEntity.name, schema: AgentTaskSchema }]),
    MongooseModule.forFeature([{ name: AgentJobEntity.name, schema: AgentJobSchema }]),

    HttpModule,
    ConversationCardsModule,
    NotionModule,
  ],
  controllers: [AgentTasksController, AgentJobsController],
  providers: [AgentTasksService, AgentJobService],
  exports: [AgentTasksService, AgentJobService],
})
export class AgentTasksModule {}
