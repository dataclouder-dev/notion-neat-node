import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SourceLLMDocument, SourceLLMEntity } from '../schemas/source-llm.schema';
import { ISourceLLM } from '../models/classes';

@Injectable()
export class SourcesLLMService {
  constructor(
    @InjectModel(SourceLLMEntity.name)
    private sourceLLMModel: Model<SourceLLMDocument>
  ) {}

  async findAll(): Promise<SourceLLMEntity[]> {
    return this.sourceLLMModel.find().exec();
  }

  async findOne(id: string): Promise<SourceLLMEntity> {
    return this.sourceLLMModel.findOne({ id }).exec();
  }

  async save(sourceLLM: ISourceLLM): Promise<SourceLLMEntity> {
    const createdSourceLLM = new this.sourceLLMModel(sourceLLM);
    return createdSourceLLM.save();
  }

  async update(id: string, sourceLLM: ISourceLLM): Promise<SourceLLMEntity> {
    return this.sourceLLMModel.findOneAndUpdate({ id }, sourceLLM, { new: true }).exec();
  }

  async delete(id: string): Promise<SourceLLMEntity> {
    return this.sourceLLMModel.findOneAndDelete({ id }).exec();
  }
}
