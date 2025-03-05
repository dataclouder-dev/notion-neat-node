import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VideoGeneratorEntity, VideoGeneratorDocument } from '../schemas/video-project.entity';
import { CreateVideoGeneratorDto, UpdateVideoGeneratorDto } from '../models/videoGenerator.models';
import { FiltersConfig, IQueryResponse, MongoService } from '@dataclouder/dc-mongo';

@Injectable()
export class VideoGeneratorService {
  constructor(
    @InjectModel(VideoGeneratorEntity.name)
    private videoGeneratorModel: Model<VideoGeneratorDocument>,
    private mongoService: MongoService
  ) {}

  async create(createVideoGeneratorDto: CreateVideoGeneratorDto): Promise<VideoGeneratorEntity> {
    const createdVideoGenerator = new this.videoGeneratorModel(createVideoGeneratorDto);
    return await createdVideoGenerator.save();
  }

  async queryUsingFiltersConfig(filterConfig: FiltersConfig): Promise<IQueryResponse> {
    return await this.mongoService.queryUsingFiltersConfig(filterConfig, this.videoGeneratorModel);
  }

  async findAll(): Promise<VideoGeneratorEntity[]> {
    return await this.videoGeneratorModel.find().exec();
  }

  async findOne(id: string): Promise<VideoGeneratorEntity> {
    return await this.videoGeneratorModel.findById(id).exec();
  }

  async update(id: string, updateVideoGeneratorDto: UpdateVideoGeneratorDto): Promise<VideoGeneratorEntity> {
    return await this.videoGeneratorModel.findByIdAndUpdate(id, updateVideoGeneratorDto, { new: true }).exec();
  }

  async remove(id: string): Promise<void> {
    await this.videoGeneratorModel.findByIdAndDelete(id).exec();
  }
}
