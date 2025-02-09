import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotionDBService } from './notion-db.service';
import { NotionController } from './notion.controller';
import { NotionService } from './notion.service';
import { NotionDBPageEntity, NotionDBPageSchema } from './entities/notion-db-page.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: NotionDBPageEntity.name, schema: NotionDBPageSchema }])],
  controllers: [NotionController],
  providers: [NotionService, NotionDBService],
  exports: [NotionService, NotionDBService],
})
export class NotionModule {}
