import { Body, Controller, Param, Get, Post, Put, Delete, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VideoGeneratorService } from '../services/videoGenerator.service';
import { CreateVideoGeneratorDto, UpdateVideoGeneratorDto } from '../models/videoGenerator.models';
import { VideoGeneratorEntity } from '../schemas/video-project.entity';
import { FiltersConfig, IQueryResponse } from '@dataclouder/dc-mongo';

@ApiTags('video-generator')
@Controller('api/video-generator')
export class VideoGeneratorController {
  constructor(private readonly videoGeneratorService: VideoGeneratorService) {}

  @Get()
  @ApiOperation({ summary: 'Get all newComponent items' })
  @ApiResponse({ status: 200, description: 'Return all newComponent items.', type: [VideoGeneratorEntity] })
  async findAll(): Promise<VideoGeneratorEntity[]> {
    return await this.videoGeneratorService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a newComponent item by id' })
  @ApiResponse({ status: 200, description: 'Return the newComponent item.', type: VideoGeneratorEntity })
  async findOne(@Param('id') id: string): Promise<VideoGeneratorEntity> {
    return await this.videoGeneratorService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new newComponent item' })
  @ApiResponse({ status: 201, description: 'The item has been successfully created.', type: VideoGeneratorEntity })
  async create(@Body() createVideoGeneratorDto: CreateVideoGeneratorDto): Promise<VideoGeneratorEntity> {
    return await this.videoGeneratorService.create(createVideoGeneratorDto);
  }

  @Post('query')
  @ApiOperation({ summary: 'Create a new newComponent item' })
  @ApiResponse({ status: 201, description: 'The item has been successfully created.', type: VideoGeneratorEntity })
  async query(@Body() filterConfig: FiltersConfig): Promise<IQueryResponse> {
    return await this.videoGeneratorService.queryUsingFiltersConfig(filterConfig);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a newComponent item' })
  @ApiResponse({ status: 200, description: 'The item has been successfully updated.', type: VideoGeneratorEntity })
  async update(@Param('id') id: string, @Body() updateVideoGeneratorDto: UpdateVideoGeneratorDto): Promise<VideoGeneratorEntity> {
    return await this.videoGeneratorService.update(id, updateVideoGeneratorDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a newComponent item' })
  @ApiResponse({ status: 204, description: 'The item has been successfully deleted.' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.videoGeneratorService.remove(id);
  }
}
