import { Injectable } from '@nestjs/common';
import { AgentJobDocument, AgentJobEntity } from '../schemas/agent-job.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AgentJobService {
  constructor(
    @InjectModel(AgentJobEntity.name)
    private agentJobModel: Model<AgentJobDocument>
  ) {}

  async create(createJobDto: Partial<AgentJobEntity>): Promise<AgentJobDocument> {
    const createdJob = new this.agentJobModel(createJobDto);
    return createdJob.save();
  }

  async findAll(): Promise<AgentJobDocument[]> {
    return this.agentJobModel.find().exec();
  }

  async findOne(id: string): Promise<AgentJobDocument> {
    return this.agentJobModel.findById(id).exec();
  }

  async update(id: string, updateJobDto: Partial<AgentJobEntity>): Promise<AgentJobDocument> {
    return this.agentJobModel.findByIdAndUpdate(id, updateJobDto, { new: true }).exec();
  }

  async delete(id: string): Promise<AgentJobDocument> {
    return this.agentJobModel.findByIdAndDelete(id).exec();
  }

  // Additional utility methods

  async findByStatus(status: string): Promise<AgentJobDocument[]> {
    return this.agentJobModel.find({ status }).exec();
  }

  async findByAgentId(agentId: string): Promise<AgentJobDocument[]> {
    return this.agentJobModel.find({ agentId }).exec();
  }

  async findByTaskId(taskId: string): Promise<AgentJobDocument[]> {
    return this.agentJobModel.find({ 'task.id': taskId }).exec();
  }
}
