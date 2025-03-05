import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VideoGeneratorController } from './controllers/video-projects-generator.controller';
import { VideoGeneratorService } from './services/videoGenerator.service';
import { VideoGeneratorEntity, VideoGeneratorSchema } from './schemas/video-project.entity';
import { DCMongoDBModule } from '@dataclouder/dc-mongo';

@Module({
  imports: [MongooseModule.forFeature([{ name: VideoGeneratorEntity.name, schema: VideoGeneratorSchema }]), DCMongoDBModule],
  controllers: [VideoGeneratorController],
  providers: [VideoGeneratorService],
  exports: [VideoGeneratorService],
})
export class VideoGeneratorModule {}
