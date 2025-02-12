import { Injectable } from '@nestjs/common';
import { Client } from '@notionhq/client';
import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { ExportResults } from '../models/notion.types';
import { parseNotionBlocks } from '../notion-text-extraction/block-to-properties';
import {
  extractPagePlainText,
  renderPageContentToHtml,
  renderPageContentToMarkdown,
  transformPropertyKeys,
} from '../functions/notion.transforms';
import { ExportType } from '../models/enums';
import { NotionDBPage } from '../models/classes';

export type SimpleBlock = {
  type: string;
  content: string;
  has_children: boolean;
  id: string;
};

export type NotionPageContent = {
  success: boolean;
  page: any;
  error?: string;
  title?: string;
  blocks?: SimpleBlock[];
};
@Injectable()
export class NotionService {
  private notion: Client;

  constructor() {
    console.log('process.env.NOTION_KEY', process.env.NOTION_KEY);
    this.notion = new Client({
      auth: process.env.NOTION_KEY,
    });
  }

  /**
   * Extracts data from a Notion page and transforms it into a dictionary format
   * @param pageId - The ID of the Notion page to extract data from
   * @returns A dictionary where title2 is the key and paragraph is the value
   */
  async extractNotionDictData(pageId: string) {
    // receive a pageId, extract the page content and return a dictionary where title2 is the key and the paragraph is the value
    const pageAndBlocks = await this.getNotionPageBlocks(pageId);
    const properties = parseNotionBlocks(pageAndBlocks.page.blocks);
    const finalProperties = transformPropertyKeys(properties);
    return finalProperties;
  }

  /**
   * Processes and exports entries from a Notion database that have 'Ready to Export' status
   * @returns Promise<ExportResults> containing the success status, entries, and count
   */
  async processAndExportEntries(): Promise<ExportResults> {
    try {
      const response = await this.notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID,
        filter: {
          property: 'Status',
          status: {
            equals: 'Ready to Export',
          },
        },
      });

      const entries = response.results.map((page: any) => ({
        id: page.id,
        title: page.properties.Title?.title[0]?.plain_text || 'Untitled',
        content: page.properties.Content?.rich_text[0]?.plain_text || '',
        status: page.properties.Status?.status?.name || 'Unknown',
        createdTime: page.created_time,
      }));

      return {
        success: true,
        entries,
        count: entries.length,
      };
    } catch (error) {
      console.error('Error fetching Notion data:', error);
      return {
        success: false,
        error: error.message,
        entries: [],
        count: 0,
      };
    }
  }

  /**
   * Retrieves all blocks from a Notion page without their children
   * @param pageId - The ID of the Notion page
   * @returns Promise containing an array of BlockObjectResponse
   */
  async getAllBlocksFlat(pageId: string): Promise<BlockObjectResponse[]> {
    let allBlocks: BlockObjectResponse[] = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
      const response = await this.notion.blocks.children.list({
        block_id: pageId,
        start_cursor: startCursor,
        page_size: 100,
      });

      allBlocks = [...allBlocks, ...(response.results as BlockObjectResponse[])];
      hasMore = response.has_more;
      startCursor = response.next_cursor;
    }

    return allBlocks;
  }

  /**
   * Recursively retrieves all blocks and their children from a Notion page
   * @param pageId - The ID of the Notion page
   * @returns Promise containing an array of BlockObjectResponse including nested children
   */
  async getAllBlocksWithChildren(pageId: string): Promise<BlockObjectResponse[]> {
    const blocks: BlockObjectResponse[] = [];

    // Get all blocks for the page
    const pageBlocks = await this.getAllBlocksFlat(pageId);

    // Process each block and its children recursively
    for (const block of pageBlocks) {
      blocks.push(block);

      // If the block has children, fetch them recursively
      if (block.has_children) {
        const childBlocks = await this.getAllBlocksWithChildren(block.id);
        blocks.push(...childBlocks);
      }
    }

    return blocks;
  }

  /**
   * Retrieves a Notion page and all its blocks
   * @param pageId - The ID of the Notion page
   * @returns Object containing success status, page data, and blocks
   */
  async getNotionPageBlocks(pageId: string) {
    try {
      const pageResponse = await this.notion.pages.retrieve({
        page_id: pageId,
      });

      const allBlocks = await this.getAllBlocksWithChildren(pageId);

      return {
        success: true,
        page: {
          ...pageResponse,
          blocks: allBlocks,
        },
      };
    } catch (error) {
      console.error('Error fetching Notion page:', error);
      return {
        success: false,
        error: error.message,
        page: null,
      };
    }
  }

  /**
   * Retrieves a Notion page with blocks formatted in a simplified structure
   * @param pageId - The ID of the Notion page
   * @returns Promise<NotionPageContent> containing formatted page content
   */
  async getNotionPageBlocksFormatted(pageId: string): Promise<NotionPageContent> {
    // regresa la pagina, pero los bloques estan procesados en mi formato para almacenar facilmente y procesar contenido, en vez de tener todas las propiedades
    try {
      const pageResponse = await this.notion.pages.retrieve({ page_id: pageId });

      const blocksResponse = await this.getAllBlocksFlat(pageId);
      // const title = (pageResponse as any).properties?.Name?.title[0]?.plain_text;
      const title = (pageResponse as any).properties?.title?.title[0]?.plain_text;
      // Extract just the essential page info and content
      const pageContent = {
        title: title || 'Untitled',
        blocks: blocksResponse.map((block: BlockObjectResponse) => ({
          type: block.type,
          content: this.extractBlockContent(block),
          has_children: block.has_children,
          id: block.id,
        })),
      };

      return {
        success: true,
        page: pageContent,
      };
    } catch (error) {
      console.error('Error fetching Notion page content:', error);
      return {
        success: false,
        error: error.message,
        page: null,
      };
    }
  }

  /**
   * Extracts content from a Notion block based on its type
   * @param block - The Notion block to extract content from
   * @returns Extracted content as string or object for to_do blocks
   */
  private extractBlockContent(block: any) {
    switch (block.type) {
      case 'paragraph':
        return block.paragraph?.rich_text?.map(text => text.plain_text).join('') || '';
      case 'heading_1':
      case 'heading_2':
      case 'heading_3':
        return block[block.type]?.rich_text?.map(text => text.plain_text).join('') || '';
      case 'bulleted_list_item':
      case 'numbered_list_item':
        return block[block.type]?.rich_text?.map(text => text.plain_text).join('') || '';
      case 'to_do':
        return {
          text: block.to_do?.rich_text?.map(text => text.plain_text).join('') || '',
          checked: block.to_do?.checked || false,
        };
      case 'child_page':
        return block.child_page?.title || '';
      case 'child_database':
        return block.child_database?.title || '';
      default:
        return '';
    }
  }

  /**
   * Lists all databases accessible to the integration
   * @param filter - Whether to return filtered (simplified) database information
   * @returns Object containing success status, databases array, and count
   */
  async listAccessibleDatabases(filter: boolean = true) {
    try {
      // Search for all databases the integration has access to
      const response = await this.notion.search({
        filter: {
          property: 'object',
          value: 'database',
        },
      });

      const databases = response.results.map((database: any) => {
        if (filter) {
          return {
            id: database.id,
            title: database.title?.[0]?.plain_text || 'Untitled',
            created_time: database.created_time,
            url: database.url,
          };
        }
        return database;
      });

      return {
        success: true,
        databases,
        count: databases.length,
      };
    } catch (error) {
      console.error('Error listing databases:', error);
      return {
        success: false,
        error: error.message,
        databases: [],
        count: 0,
      };
    }
  }

  /**
   * Lists all pages accessible to the integration
   * @returns Object containing success status, pages array, and count
   */
  async listAccessiblePages() {
    try {
      // Search for all pages the integration has access to
      const response = await this.notion.search({
        filter: {
          property: 'object',
          value: 'page',
        },
      });

      const pages = response.results.map((page: any) => ({
        id: page.id,
        title: page.properties?.title?.title[0]?.plain_text || page.properties?.Name?.title[0]?.plain_text || 'Untitled',
        created_time: page.created_time,
        last_edited_time: page.last_edited_time,
        url: page.url,
      }));

      return {
        success: true,
        pages,
        count: pages.length,
      };
    } catch (error) {
      console.error('Error listing pages:', error);
      return {
        success: false,
        error: error.message,
        pages: [],
        count: 0,
      };
    }
  }

  /**
   * Converts Notion page content to a specified format
   * @param pageContent - The NotionDBPage content to convert
   * @param exportType - The desired export format (HTML, MARKDOWN, PLAIN_TEXT, or SIMPLE_BLOCKS)
   * @returns Formatted content in the specified export type
   */
  async getNotionContentInFormat(pageContent: NotionDBPage, exportType: ExportType) {
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
}
