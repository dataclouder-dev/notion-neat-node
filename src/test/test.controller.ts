import { Controller, Get, Query } from '@nestjs/common';
import { TestService } from './test.service';
import { YouTubeService } from '../youtube/functions';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get()
  getHello(): string {
    return this.testService.getHello();
  }

  @Get('youtube')
  async getYoutube(@Query('url') url: string): Promise<string> {
    const youtubeService = new YouTubeService(process.env.YOUTUBE_API_KEY);
    console.log(url);
    const transcript = await youtubeService.getVideoTranscript(url);
    return transcript.text;
  }
}
