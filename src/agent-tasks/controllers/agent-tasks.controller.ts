import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { AgentTasksService } from '../services/agent-tasks.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AgentTask } from '../models/classes';

@Controller('api/agent-tasks')
export class AgentTasksController {
  constructor(private readonly agentTasksService: AgentTasksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all agent tasks' })
  @ApiResponse({ status: 200, description: 'All agent tasks retrieved successfully' })
  findAll() {
    return this.agentTasksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an agent task by ID' })
  @ApiResponse({ status: 200, description: 'Agent task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Agent task not found' })
  findOne(@Param('id') id: string) {
    return this.agentTasksService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new agent task' })
  @ApiResponse({ status: 201, description: 'Agent task created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  create(@Body() createAgentTaskDto: AgentTask) {
    console.log(createAgentTaskDto);
    return this.agentTasksService.create(createAgentTaskDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an agent task by ID' })
  @ApiResponse({ status: 200, description: 'Agent task updated successfully' })
  @ApiResponse({ status: 404, description: 'Agent task not found' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  update(@Param('id') id: string, @Body() updateAgentTaskDto: any) {
    return this.agentTasksService.update(id, updateAgentTaskDto);
  }
}
