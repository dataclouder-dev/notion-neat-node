import { Injectable } from '@nestjs/common';
import { Client } from '@notionhq/client';
import { ExportResults, MediumStory } from './notion.types';
import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

type NotionPageContent = {
  success: boolean;
  page: any;
  error?: string;
  title?: string;
  blocks?: BlockObjectResponse[];
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

  async getNotionPageBlocks(pageId: string) {
    try {
      const pageResponse = await this.notion.pages.retrieve({
        page_id: pageId,
      });

      const blocksResponse = await this.notion.blocks.children.list({
        block_id: pageId,
      });

      return {
        success: true,
        page: {
          ...pageResponse,
          blocks: blocksResponse.results,
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

  async getNotionPageBlocksFormatted(pageId: string): Promise<NotionPageContent> {
    try {
      const pageResponse = await this.notion.pages.retrieve({
        page_id: pageId,
      });

      const blocksResponse = await this.notion.blocks.children.list({
        block_id: pageId,
      });
      const title = (pageResponse as any).properties?.Name?.title[0]?.plain_text;
      // Extract just the essential page info and content
      const pageContent = {
        title: title || 'Untitled',
        blocks: blocksResponse.results.map((block: BlockObjectResponse) => ({
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
}
