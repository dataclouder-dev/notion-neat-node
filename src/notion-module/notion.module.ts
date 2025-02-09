import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotionDBService } from './notion-db.service';
import { NotionController } from './notion.controller';
import { NotionService } from './notion.service';
import { NotionDBPageEntity, NotionDBPageSchema } from './entities/notion-db-page.entity';
import { NotionWritesService } from './notion-writes.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: NotionDBPageEntity.name, schema: NotionDBPageSchema }])],
  controllers: [NotionController],
  providers: [NotionService, NotionDBService, NotionWritesService],
  exports: [NotionService, NotionDBService, NotionWritesService],
})
export class NotionModule {}
