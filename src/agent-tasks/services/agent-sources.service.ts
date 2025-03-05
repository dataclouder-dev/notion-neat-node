import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AgentSourceEntity, AgentSourceDocument } from '../schemas/agent-sources.schema';
import { IAgentSource } from '../models/classes';

import { YouTubeService } from '../../youtube/functions';
import { FiltersConfig, IQueryResponse, MongoService } from '@dataclouder/dc-mongo';

@Injectable()
export class SourcesLLMService {
  constructor(
    @InjectModel(AgentSourceEntity.name)
    private sourceLLMModel: Model<AgentSourceDocument>,
    private mongoService: MongoService
  ) {}

  async findAll(): Promise<AgentSourceEntity[]> {
    return this.sourceLLMModel.find().exec();
  }

  async findOne(id: string): Promise<AgentSourceEntity> {
    return this.sourceLLMModel.findOne({ id }).exec();
  }

  async findManyByIds(ids: string[]): Promise<AgentSourceEntity[]> {
    return this.sourceLLMModel.find({ id: { $in: ids } }).exec();
  }

  async save(sourceLLM: IAgentSource): Promise<AgentSourceEntity> {
    if (sourceLLM.id) {
      return this.update(sourceLLM.id, sourceLLM);
    } else {
      const createdSourceLLM = new this.sourceLLMModel(sourceLLM);
      return createdSourceLLM.save();
    }
  }

  async update(id: string, sourceLLM: IAgentSource): Promise<AgentSourceEntity> {
    return this.sourceLLMModel.findOneAndUpdate({ id }, sourceLLM, { new: true }).exec();
  }

  async delete(id: string): Promise<AgentSourceEntity> {
    return this.sourceLLMModel.findOneAndDelete({ id }).exec();
  }

  async getYoutubeTranscript(url: string): Promise<any> {
    const youtubeService = new YouTubeService(process.env.YOUTUBE_API_KEY);
    const transcript = await youtubeService.getVideoTranscript(url);
    return transcript;
  }

  async queryUsingFiltersConfig(filterConfig: FiltersConfig): Promise<IQueryResponse> {
    return await this.mongoService.queryUsingFiltersConfig(filterConfig, this.sourceLLMModel);
  }
}
