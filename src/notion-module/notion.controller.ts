import { Controller, Get, Param, Query } from '@nestjs/common';
import { NotionService } from './notion.service';
import { ExportResults } from './notion.types';
import { NotionDBService } from './notion-db.service';
import { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { extractPagePlainText, renderPageContentToHtml, renderPageContentToMarkdown } from './notion.transforms';
import { ApiQuery } from '@nestjs/swagger';

enum ExportType {
  HTML = 'html',
  MARKDOWN = 'markdown',
  PLAIN_TEXT = 'plain_text',
  SIMPLE_BLOCKS = 'simple_blocks',
}

@Controller('notion')
export class NotionController {
  constructor(
    private readonly notionService: NotionService,
    private readonly notionDBService: NotionDBService
  ) {}

  @Get()
  async exportToMedium(): Promise<ExportResults> {
    return this.notionService.processAndExportEntries();
  }

  @Get('test')
  async testNotion(): Promise<any> {
    return { working: 200 };
  }

  @Get('databases')
  async listDatabases() {
    return await this.notionService.listAccessibleDatabases();
  }

  @Get('pages')
  async listPages() {
    return await this.notionService.listAccessiblePages();
  }

  @Get('page/:pageId')
  async getNotionPage(@Param('pageId') pageId: string): Promise<any> {
    return this.notionService.getNotionPage(pageId);
  }

  @Get('page-content/:pageId')
  async getNotionPageContent(@Param('pageId') pageId: string): Promise<any> {
    return this.notionService.getNotionPageContent(pageId);
  }

  @Get('db-entries/:dbId')
  async getDBEntries(@Param('dbId') dbId: string): Promise<DatabaseObjectResponse[]> {
    return this.notionDBService.getDBEntries(dbId);
  }

  @Get('export-db-pages/:dbId')
  async exportDBPages(@Param('dbId') dbId: string): Promise<any> {
    const entries = await this.notionDBService.getDBEntries(dbId);
    console.log('entries', entries);
    for (const entry of entries) {
      const pageContent = await this.notionService.getNotionPageContent(entry.id);
      console.log('pageContent', pageContent);
      const result = await this.notionDBService.upsertNotionPage({
        db_id: dbId,
        page_id: entry.id,
        title: pageContent.page.title,
        blocks: pageContent.page.blocks,
      });
      console.log('result', result);
    }

    return entries;
  }

  @Get('get-db-page-content/:pageId')
  @ApiQuery({
    name: 'exportType',
    enum: ExportType,
    required: false,
    description: 'The format to export the page content in',
  })
  async getDBPageContent(@Param('pageId') pageId: string, @Query('exportType') exportType: ExportType): Promise<any> {
    const pageContent = await this.notionDBService.getMongoDBPageContent(pageId);
    console.log('pageContent', pageContent);
    if (exportType === ExportType.HTML) {
      const html = renderPageContentToHtml(pageContent);
      console.log('html', html);
      return html;
    } else if (exportType === ExportType.MARKDOWN) {
      const markdown = renderPageContentToMarkdown(pageContent);
      console.log('markdown', markdown);
      return markdown;
    } else if (exportType === ExportType.PLAIN_TEXT) {
      const plainText = extractPagePlainText(pageContent);
      console.log('plainText', plainText);
      return plainText;
    } else if (exportType === ExportType.SIMPLE_BLOCKS) {
      return pageContent;
    }
  }
}
