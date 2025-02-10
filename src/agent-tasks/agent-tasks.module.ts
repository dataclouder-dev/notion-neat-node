import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentTasksController } from './controllers/agent-tasks.controller';
import { AgentTasksService } from './services/agent-tasks.service';
import { AgentTaskEntity, AgentTaskSchema } from './schemas/agent-task.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: AgentTaskEntity.name, schema: AgentTaskSchema }])],
  controllers: [AgentTasksController],
  providers: [AgentTasksService],
  exports: [AgentTasksService],
})
export class AgentTasksModule {}
