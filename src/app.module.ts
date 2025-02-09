import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import envVariables from './config/environment';
import { TestModule } from './test/test.module';
import { NotionModule } from './notion-module/notion.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MongoDBModule } from './mongo-db/database.module';
import { UserModule } from './user/user.module';
import { ConversationCardsModule } from '@dataclouder/conversation-card-nestjs';
import { NotionConversationModule } from './notion-conversation-module/notion.module';

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
    MongoDBModule.forRoot(),
    NotionModule,
    UserModule,
    ConversationCardsModule,
    NotionConversationModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
