import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotionDBService } from './services/notion-db.service';
import { NotionController } from './controllers/notion.controller';
import { NotionService } from './services/notion.service';
import { NotionDBPageEntity, NotionDBPageSchema } from './entities/notion-db-page.entity';
import { NotionWritesService } from './services/notion-writes.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: NotionDBPageEntity.name, schema: NotionDBPageSchema }])],
  controllers: [NotionController],
  providers: [NotionService, NotionDBService, NotionWritesService],
  exports: [NotionService, NotionDBService, NotionWritesService],
})
export class NotionModule {}
