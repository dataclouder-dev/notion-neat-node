import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentTasksController } from './controllers/agent-tasks.controller';
import { AgentTasksService } from './services/agent-tasks.service';
import { AgentTaskEntity, AgentTaskSchema } from './schemas/agent-task.schema';
import { HttpModule } from '@nestjs/axios';

import { ConversationCardsModule } from '@dataclouder/conversation-card-nestjs';
import { NotionModule } from '@dataclouder/notion';
import { AgentJobsController } from './controllers/agent-jobs.controller';
import { AgentJobService } from './services/agent-job.service';
import { AgentJobEntity, AgentJobSchema } from './schemas/agent-job.schema';
import { AgentSourceEntity, AgentSourceSchema } from './schemas/agent-sources.schema';
import { SourcesLLMService } from './services/agent-sources.service';
import { SourcesLLMController } from './controllers/agent-sources.controller';
import { DCMongoDBModule } from '@dataclouder/dc-mongo';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AgentTaskEntity.name, schema: AgentTaskSchema }]),
    MongooseModule.forFeature([{ name: AgentJobEntity.name, schema: AgentJobSchema }]),
    MongooseModule.forFeature([{ name: AgentSourceEntity.name, schema: AgentSourceSchema }]),
    DCMongoDBModule,
    HttpModule,
    ConversationCardsModule,
    NotionModule,
  ],
  controllers: [AgentTasksController, AgentJobsController, SourcesLLMController],
  providers: [AgentTasksService, AgentJobService, SourcesLLMService],
  exports: [AgentTasksService, AgentJobService, SourcesLLMService],
})
export class AgentTasksModule {}
