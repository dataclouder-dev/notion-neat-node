import { Injectable } from '@nestjs/common';
import { Client } from '@notionhq/client';
import { CreatePageParameters } from '@notionhq/client/build/src/api-endpoints';
import { markdownToBlocks } from '@tryfabric/martian';

@Injectable()
export class NotionWritesService {
  private notion: Client;

  constructor() {
    this.notion = new Client({
      auth: process.env.NOTION_KEY,
    });
  }

  async appendTextToPage(pageId: string, text: string) {
    try {
      const response = await this.notion.blocks.children.append({
        block_id: pageId,
        children: [
          {
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: text,
                  },
                },
              ],
            },
          },
        ],
      });

      return {
        success: true,
        block: response,
      };
    } catch (error) {
      console.error('Error appending text to Notion page:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async createNewPage(parentPageId: string, title: string, content: string) {
    try {
      const response = await this.notion.pages.create({
        parent: {
          page_id: parentPageId,
        },
        properties: {
          title: {
            title: [
              {
                text: {
                  content: title,
                },
              },
            ],
          },
        },
        children: [
          {
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: content,
                  },
                },
              ],
            },
          },
        ],
      });

      return {
        success: true,
        page: response,
      };
    } catch (error) {
      console.error('Error creating new Notion page:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async updatePageContent(pageId: string, content: string) {
    try {
      // First, archive existing content
      const existingBlocks = await this.notion.blocks.children.list({
        block_id: pageId,
      });

      // Delete existing blocks
      for (const block of existingBlocks.results) {
        await this.notion.blocks.delete({
          block_id: block.id,
        });
      }

      // Add new content
      const response = await this.notion.blocks.children.append({
        block_id: pageId,
        children: [
          {
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: content,
                  },
                },
              ],
            },
          },
        ],
      });

      return {
        success: true,
        block: response,
      };
    } catch (error) {
      console.error('Error updating Notion page content:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async appendMarkdownToPage(pageId: string, markdown: string) {
    try {
      // Convert markdown to Notion blocks
      const notionBlocks = markdownToBlocks(markdown);

      // Append the blocks to the page
      const response = await this.notion.blocks.children.append({
        block_id: pageId,
        children: notionBlocks as any,
      });

      return {
        success: true,
        block: response,
      };
    } catch (error) {
      console.error('Error appending markdown to Notion page:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async createDatabaseEntry(databaseId: string, properties: CreatePageParameters['properties'] = null, title: string = 'New Entry') {
    if (!properties) {
      properties = {
        Name: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
      };
    }

    try {
      const pageObject = {
        parent: {
          database_id: databaseId,
        },
        properties: properties,
      };

      const response = await this.notion.pages.create(pageObject);

      return {
        success: true,
        page: response,
      };
    } catch (error) {
      console.error('Error creating database entry:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async createNewPageIntoDatabase(databaseId: string, contentMarkdown: string) {
    const page = await this.createDatabaseEntry(databaseId, null, 'Post from Agent');
    await this.appendMarkdownToPage(page.page.id, contentMarkdown);
    return page;
  }
}
