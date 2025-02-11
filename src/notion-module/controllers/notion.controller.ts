import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

import { DatabaseObjectResponse, CreatePageParameters } from '@notionhq/client/build/src/api-endpoints';

import { extractPagePlainText, renderPageContentToHtml, renderPageContentToMarkdown } from '../functions/notion.transforms';
import { NotionWritesService } from '../services/notion-writes.service';
import { ExportType } from '../models/enums';
import { NotionService } from '../services/notion.service';
import { NotionDBService } from '../services/notion-db.service';

@Controller('api/notion')
export class NotionController {
  constructor(
    private readonly notionService: NotionService,
    private readonly notionDBService: NotionDBService,
    private readonly notionWritesService: NotionWritesService
  ) {}

  /**
   * Retrieves a list of all Notion databases accessible with the current integration token.
   *
   * @route GET /notion/list-databases
   * @returns {Promise<Array>} A list of database objects containing:
   *  - id: The unique identifier of the database
   *  - title: The title of the database
   *  - properties: The schema/properties defined for the database
   *  - url: The URL to access the database in Notion
   *  - created_time: When the database was created
   *  - last_edited_time: When the database was last modified
   *
   * @throws {UnauthorizedException} If the integration token is invalid
   * @throws {NotFoundException} If no databases are accessible
   */
  @Get('list-databases')
  @ApiOperation({
    summary: 'List accessible Notion databases',
    description: 'Retrieves all Notion databases that are accessible with the current integration token',
  })
  @ApiResponse({
    status: 200,
    description: 'List of accessible databases',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'db_123456' },
          title: { type: 'array', items: { type: 'object' } },
          properties: { type: 'object' },
          url: { type: 'string', example: 'https://notion.so/...' },
          created_time: { type: 'string', format: 'date-time' },
          last_edited_time: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid integration token' })
  @ApiResponse({ status: 404, description: 'No accessible databases found' })
  async listDatabases() {
    return await this.notionService.listAccessibleDatabases();
  }

  // 🌹 List pages

  @Get('list-pages')
  @ApiOperation({
    summary: 'List accessible Notion pages',
    description: 'Retrieves all Notion pages that are accessible with the current integration token',
  })
  @ApiResponse({
    status: 200,
    description: 'List of accessible pages',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'page_123456' },
          created_time: { type: 'string', format: 'date-time' },
          last_edited_time: { type: 'string', format: 'date-time' },
          url: { type: 'string', example: 'https://notion.so/...' },
          parent: {
            type: 'object',
            properties: {
              type: { type: 'string', example: 'workspace' },
              workspace: { type: 'boolean' },
            },
          },
          properties: {
            type: 'object',
            properties: {
              title: {
                type: 'array',
                items: { type: 'object' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid integration token' })
  @ApiResponse({ status: 404, description: 'No accessible pages found' })
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

  @ApiOperation({
    summary: 'Get a page content from MongoDB in a specific format',
    description: 'Note, first you need to export the page content from Notion to MongoDB',
  })
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
      const html = renderPageContentToHtml(pageContent.blocks, pageContent.title);
      console.log('html', html);
      return html;
    } else if (exportType === ExportType.MARKDOWN) {
      const markdown = renderPageContentToMarkdown(pageContent.blocks, pageContent.title);
      console.log('markdown', markdown);
      return markdown;
    } else if (exportType === ExportType.PLAIN_TEXT) {
      const plainText = extractPagePlainText(pageContent.blocks, pageContent.title);
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

  @ApiOperation({
    summary: 'Extract dictionary data from a Notion page',
    description:
      'Retrieves content from a Notion page and converts it into a key-value dictionary format where titles are keys and text content are values',
  })
  @ApiParam({
    name: 'pageId',
    description: 'The ID of the Notion page to extract data from',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Dictionary data successfully extracted',
    schema: {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
      example: {
        'Title 1': 'Content text 1',
        'Title 2': 'Content text 2',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid page ID' })
  @ApiResponse({ status: 404, description: 'Notion page not found' })
  @Get('extract-dict-data/:pageId')
  async extractNotionDictData(@Param('pageId') pageId: string) {
    // TODO: Este metodo en realidad no necesita conversciones/agentscards asi mover a notion-module
    return await this.notionService.extractNotionDictData(pageId);
  }

  @ApiOperation({
    summary: '💡 Use for test right now. fix it, Append markdown to a database entry',
    description: 'Appends markdown to a database entry',
  })
  @Get('append-markdown-to-db-entry/:dbId')
  async appendMarkdownToDBEntry(@Param('dbId') dbId: string): Promise<any> {
    const databaseId = '195ec05d-c75e-80a4-83fe-e499a47f37dc';

    const properties: CreatePageParameters['properties'] = {
      Name: {
        title: [
          {
            text: {
              content: 'My New Entry check it out',
            },
          },
        ],
      },
    };

    const page = await this.notionWritesService.createDatabaseEntry(databaseId, properties);

    const markdown = `
# Compadres

Este es mi primer post with **compradres** y *camadrejas* .

## Subheading

- List item 1
- List item 2
- List item 3

[Link to Google](https://www.google.com)
      `;

    const pageId = page.page.id;
    await this.notionWritesService.appendMarkdownToPage(pageId, markdown);
    console.log('page', page);

    return page;
  }
}
