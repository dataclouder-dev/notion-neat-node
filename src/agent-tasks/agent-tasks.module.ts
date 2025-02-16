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
import { SourceLLMEntity, SourceLLMSchema } from './schemas/source-llm.schema';
import { SourcesLLMService } from './services/sources-llm.service';
import { SourcesLLMController } from './controllers/sources_llm.controller';
import { DCMongoDBModule } from '@dataclouder/dc-mongo';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AgentTaskEntity.name, schema: AgentTaskSchema }]),
    MongooseModule.forFeature([{ name: AgentJobEntity.name, schema: AgentJobSchema }]),
    MongooseModule.forFeature([{ name: SourceLLMEntity.name, schema: SourceLLMSchema }]),
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
