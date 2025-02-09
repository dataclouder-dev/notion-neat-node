import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { NotionService } from './notion.service';
import { ExportResults } from './notion.types';
import { NotionDBService } from './notion-db.service';
import { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { extractPagePlainText, renderPageContentToHtml, renderPageContentToMarkdown } from './notion.transforms';
import { ApiQuery } from '@nestjs/swagger';
import { NotionWritesService } from './notion-writes.service';

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
    private readonly notionDBService: NotionDBService,
    private readonly notionWritesService: NotionWritesService
  ) {}

  @Get('list-databases')
  async listDatabases() {
    return await this.notionService.listAccessibleDatabases();
  }

  @Get('list-pages')
  async listPages() {
    return await this.notionService.listAccessiblePages();
  }

  @Get('page-and-blocks/:pageId')
  async getNotionPageBlocks(@Param('pageId') pageId: string): Promise<any> {
    return this.notionService.getNotionPageBlocks(pageId);
  }

  @Get('page-and-blocks-formatted/:pageId')
  async getNotionPageBlocksFormatted(@Param('pageId') pageId: string): Promise<any> {
    return this.notionService.getNotionPageBlocksFormatted(pageId);
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
      const pageContent = await this.notionService.getNotionPageBlocksFormatted(entry.id);
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

  @Post('write-text-to-page/:pageId')
  async writeTextToPage(@Param('pageId') pageId: string): Promise<any> {
    return this.notionWritesService.updatePageContent(pageId, 'This is my text lets see if it works');
  }

  @Get('append-markdown-to-page/:pageId')
  async appendMarkdownToPage(@Param('pageId') pageId: string): Promise<any> {
    const markdown = `
# Hello World

This is a paragraph with **bold** and *italic* text.

## Subheading

- List item 1
- List item 2
- List item 3

[Link to Google](https://www.google.com)
`;

    return this.notionWritesService.appendMarkdownToPage(pageId, markdown);
  }
}
