import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CloudStorageData, IVideoSource, IImageSource, IAudioSource, IAgentSource } from 'src/agent-tasks/models/classes';

export interface IAssets {
  audios: Record<string, IAudioSource>;
  images: Record<string, IImageSource>;
  videos: Record<string, IVideoSource>;
}
export interface IVideoProjectGenerator {
  id: string;
  name: string;
  description: string;
  assets: IAssets;
  sources: IAgentSource[];
  type: 'video-project';
}

export class CreateVideoGeneratorDto {
  @ApiProperty({ description: 'The name of the videoGenerator item' })
  name: string;

  @ApiProperty({ description: 'The description of the videoGenerator item' })
  description: string;

  @ApiProperty({ description: 'The content of the videoGenerator item' })
  content: string;

  @ApiProperty({ description: 'The image of the videoGenerator item' })
  img: string;
}

export class UpdateVideoGeneratorDto extends PartialType(CreateVideoGeneratorDto) {}
