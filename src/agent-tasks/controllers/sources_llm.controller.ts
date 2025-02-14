import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SourcesLLMService } from '../services/sources-llm.service';
import { ISourceLLM } from '../models/classes';

@Controller('api/sources-llm')
export class SourcesLLMController {
  constructor(private readonly sourcesLLMService: SourcesLLMService) {}

  @Get()
  @ApiOperation({ summary: 'Get all LLM sources' })
  @ApiResponse({ status: 200, description: 'All LLM sources retrieved successfully' })
  findAll() {
    return this.sourcesLLMService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an LLM source by ID' })
  @ApiResponse({ status: 200, description: 'LLM source retrieved successfully' })
  @ApiResponse({ status: 404, description: 'LLM source not found' })
  findOne(@Param('id') id: string) {
    return this.sourcesLLMService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new LLM source' })
  @ApiResponse({ status: 201, description: 'LLM source created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  create(@Body() createSourceLLMDto: ISourceLLM) {
    return this.sourcesLLMService.save(createSourceLLMDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an LLM source by ID' })
  @ApiResponse({ status: 200, description: 'LLM source updated successfully' })
  @ApiResponse({ status: 404, description: 'LLM source not found' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  update(@Param('id') id: string, @Body() updateSourceLLMDto: ISourceLLM) {
    return this.sourcesLLMService.update(id, updateSourceLLMDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an LLM source by ID' })
  @ApiResponse({ status: 200, description: 'LLM source deleted successfully' })
  @ApiResponse({ status: 404, description: 'LLM source not found' })
  delete(@Param('id') id: string) {
    return this.sourcesLLMService.delete(id);
  }
}
