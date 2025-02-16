import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiOperation, ApiResponse, ApiParam, ApiTags } from '@nestjs/swagger';

import { DatabaseObjectResponse, CreatePageParameters } from '@notionhq/client/build/src/api-endpoints';

import { extractPagePlainText, renderPageContentToHtml, renderPageContentToMarkdown } from '../functions/notion.transforms';
import { NotionWritesService } from '../services/notion-writes.service';
import { NotionExportType } from '../models/enums';
import { NotionPageContent, NotionService } from '../services/notion.service';
import { NotionDBService } from '../services/notion-db.service';
import { NotionDBPage } from '../models/classes';

@Controller('api/notion')
@ApiTags('Notion')
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
  @ApiOperation({
    summary: 'Get original Notion Page and Blocks objects',
    description: 'Get data from notion returns original response from SDK',
  })
  async getNotionPageBlocks(@Param('pageId') pageId: string): Promise<any> {
    return this.notionService.getNotionPageBlocks(pageId);
  }

  @Get('page-and-blocks-formatted/:pageId')
  @ApiOperation({
    summary: 'Get a page content directly from Notion in minimal format, only text and block type',
    description: 'Note, this is a direct call to Notion, so it may take longer to respond',
  })
  async getNotionPageBlocksFormatted(@Param('pageId') pageId: string): Promise<NotionPageContent> {
    return this.notionService.getNotionPageBlocksFormatted(pageId);
  }

  @Get('db-entries/:dbId')
  @ApiOperation({
    summary: 'Pass the dbId and get all entries from the database',
  })
  async getDBEntries(@Param('dbId') dbId: string): Promise<DatabaseObjectResponse[]> {
    return this.notionDBService.getDBEntries(dbId);
  }

  @Get('export-pages-into-db/:dbId')
  @ApiOperation({
    summary: 'Pass the dbId and export all pages into the database minimal format',
    description: 'Once you have the data in the mongodb will be easy to process it',
  })
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
    summary: 'Get a page content from Notion in specific format',
    description: 'can tranform to html, markdown, plain text or simple blocks',
  })
  @Get('page-in-specific-format/:pageId')
  @ApiQuery({
    name: 'exportType',
    enum: NotionExportType,
    required: false,
    description: 'The format to export the page content in',
  })
  async getPageContentInFormat(
    @Param('pageId') pageId: string,
    @Query('exportType') exportType: NotionExportType = NotionExportType.PLAIN_TEXT
  ): Promise<any> {
    const pageContent = await this.notionService.getNotionPageBlocksFormatted(pageId);
    const content = await this.transformNotionMinamalPageInFormat(pageContent.page, exportType);
    return { content, type: exportType };
  }

  @ApiOperation({
    summary: 'Get a page content that was previously saved into MongoDB in specific format',
    description: 'Note, first you need to export the page content from Notion to MongoDB',
  })
  @Get('page-from-db-in-specific-format/:pageId')
  @ApiQuery({
    name: 'exportType',
    enum: NotionExportType,
    required: false,
    description: 'The format to export the page content in',
  })
  async getDBPageContent(@Param('pageId') pageId: string, @Query('exportType') exportType: NotionExportType): Promise<any> {
    const pageContent = await this.notionDBService.getMongoDBPageContent(pageId);
    console.log('pageContent', pageContent);
    return this.transformNotionMinamalPageInFormat(pageContent, exportType);
  }

  private async transformNotionMinamalPageInFormat(pageContent: NotionDBPage, exportType: NotionExportType): Promise<any> {
    if (exportType === NotionExportType.HTML) {
      const html = renderPageContentToHtml(pageContent.blocks, pageContent.title);
      console.log('html', html);
      return html;
    } else if (exportType === NotionExportType.MARKDOWN) {
      const markdown = renderPageContentToMarkdown(pageContent.blocks, pageContent.title);
      console.log('markdown', markdown);
      return markdown;
    } else if (exportType === NotionExportType.PLAIN_TEXT) {
      const plainText = extractPagePlainText(pageContent.blocks, pageContent.title);
      console.log('plainText', plainText);
      return plainText;
    } else if (exportType === NotionExportType.SIMPLE_BLOCKS) {
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

    const page = await this.notionWritesService.createDatabaseEntry({
      databaseId,
      properties,
    });

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

  @Get('create-new-page')
  async createNewPage() {
    const cardImg =
      'https://firebasestorage.googleapis.com/v0/b/notion-neat-dev.firebasestorage.app/o/conversation-cards%2F67abc07dedb31b871ec04a71%2Fcarlos.webp?alt=media&token=59e22f4d-92af-40e8-8fd5-1e48bc910cee';

    const bannerImg =
      'https://firebasestorage.googleapis.com/v0/b/notion-neat-dev.firebasestorage.app/o/conversation-cards%2Fcarlos.webp?alt=media&token=530c8d96-cecd-43de-bddd-9ab0be317e4a';

    const notionResponse = await this.notionWritesService.createNewPage({
      parentPageId: '195ec05dc75e807e8085ffdb14575a90',
      title: 'testing New Page chamb 2',
      content: 'This is my new page content',
      coverUrl: bannerImg,
      iconUrl: cardImg,
    });

    const dbResult = await this.notionWritesService.createInlineDatabase(notionResponse.page.id, 'Tasks_DB_Outcomes');
    console.log('dbResult', dbResult);

    return notionResponse;
  }
}
