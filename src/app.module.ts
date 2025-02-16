import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import envVariables from './config/environment';
import { TestModule } from './test/test.module';
// import { NotionModule } from './notion-module/notion.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UserModule } from './user/user.module';
import { NotionAgentsModule } from './notion-agents-module/notion-agents.module';
import { ConversationCardsModule } from '@dataclouder/conversation-card-nestjs';
import { AgentTasksModule } from './agent-tasks/agent-tasks.module';

import { NotionModule } from '@dataclouder/notion';
import { DCMongoDBModule } from '@dataclouder/dc-mongo';
@Module({
  imports: [
    ConfigModule.forRoot({ load: [envVariables], isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public/',
      serveStaticOptions: {
        index: false,
      },
    }),
    TestModule,
    DCMongoDBModule.forRoot(),
    NotionModule,
    UserModule,
    ConversationCardsModule,
    NotionAgentsModule,
    AgentTasksModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
