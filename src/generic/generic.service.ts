import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GenericEntity, GenericDocument } from './schema.entity';
import { CreateGenericDto, UpdateGenericDto } from './generic.models';
import { FiltersConfig, IQueryResponse, MongoService } from '@dataclouder/dc-mongo';

@Injectable()
export class GenericService {
  constructor(
    @InjectModel(GenericEntity.name)
    private genericModel: Model<GenericDocument>,
    private mongoService: MongoService
  ) {}

  async create(createGenericDto: CreateGenericDto): Promise<GenericEntity> {
    const createdGeneric = new this.genericModel(createGenericDto);
    return await createdGeneric.save();
  }

  async queryUsingFiltersConfig(filterConfig: FiltersConfig): Promise<IQueryResponse> {
    return await this.mongoService.queryUsingFiltersConfig(filterConfig, this.genericModel);
  }

  async findAll(): Promise<GenericEntity[]> {
    return await this.genericModel.find().exec();
  }

  async findOne(id: string): Promise<GenericEntity> {
    return await this.genericModel.findById(id).exec();
  }

  async update(id: string, updateGenericDto: UpdateGenericDto): Promise<GenericEntity> {
    return await this.genericModel.findByIdAndUpdate(id, updateGenericDto, { new: true }).exec();
  }

  async remove(id: string): Promise<void> {
    await this.genericModel.findByIdAndDelete(id).exec();
  }
}
