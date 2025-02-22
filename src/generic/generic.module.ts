import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GenericController } from './generic.controller';
import { GenericService } from './generic.service';
import { GenericEntity, GenericSchema } from './schema.entity';
import { DCMongoDBModule } from '@dataclouder/dc-mongo';

@Module({
  imports: [MongooseModule.forFeature([{ name: GenericEntity.name, schema: GenericSchema }]), DCMongoDBModule],
  controllers: [GenericController],
  providers: [GenericService],
  exports: [GenericService],
})
export class GenericModule {}
