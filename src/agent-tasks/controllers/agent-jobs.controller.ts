import { Controller, Get, Post, Put, Delete, Body, Param, HttpStatus, HttpException } from '@nestjs/common';
import { AgentJobService } from '../services/agent-job.service';
import { AgentJobEntity } from '../schemas/agent-job.schema';

@Controller('api/agent-jobs')
export class AgentJobsController {
  constructor(private readonly agentJobService: AgentJobService) {}

  @Post()
  async create(@Body() createJobDto: Partial<AgentJobEntity>) {
    try {
      return await this.agentJobService.create(createJobDto);
    } catch (error) {
      throw new HttpException('Failed to create agent job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.agentJobService.findAll();
    } catch (error) {
      throw new HttpException('Failed to fetch agent jobs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const job = await this.agentJobService.findOne(id);
      if (!job) {
        throw new HttpException('Agent job not found', HttpStatus.NOT_FOUND);
      }
      return job;
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException('Failed to fetch agent job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateJobDto: Partial<AgentJobEntity>) {
    try {
      const updatedJob = await this.agentJobService.update(id, updateJobDto);
      if (!updatedJob) {
        throw new HttpException('Agent job not found', HttpStatus.NOT_FOUND);
      }
      return updatedJob;
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException('Failed to update agent job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      const deletedJob = await this.agentJobService.delete(id);
      if (!deletedJob) {
        throw new HttpException('Agent job not found', HttpStatus.NOT_FOUND);
      }
      return deletedJob;
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException('Failed to delete agent job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('status/:status')
  async findByStatus(@Param('status') status: string) {
    try {
      return await this.agentJobService.findByStatus(status);
    } catch (error) {
      throw new HttpException('Failed to fetch agent jobs by status', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('task/:taskId')
  async findByTaskId(@Param('taskId') taskId: string) {
    try {
      return await this.agentJobService.findByTaskId(taskId);
    } catch (error) {
      throw new HttpException('Failed to fetch agent jobs by task ID', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('agent/:agentId')
  async findByAgentId(@Param('agentId') agentId: string) {
    try {
      return await this.agentJobService.findByAgentId(agentId);
    } catch (error) {
      throw new HttpException('Failed to fetch agent jobs by agent ID', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
