import { Injectable } from '@nestjs/common';
import { Client } from '@notionhq/client';
import { CreatePageParameters } from '@notionhq/client/build/src/api-endpoints';
import { markdownToBlocks } from '@tryfabric/martian';

const defaultProperties: CreatePageParameters['properties'] = {
  Name: { title: [{ text: { content: 'New Entry' } }] },
  Date: { date: { start: new Date().toISOString() } },
};

@Injectable()
export class NotionWritesService {
  private notion: Client;

  constructor() {
    this.notion = new Client({
      auth: process.env.NOTION_KEY,
    });
  }

  /**
   * Appends a text block to an existing Notion page
   * @param pageId - The ID of the Notion page to append text to
   * @param text - The text content to append
   * @returns An object containing success status and either the created block or error message
   */
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

  /**
   * Creates a new Notion page with specified title and basic paragraph content
   * @param params - Object containing page creation parameters
   * @param params.parentPageId - The ID of the parent page where the new page will be created
   * @param params.title - The title of the new page
   * @param params.content - The content of the new page
   * @param params.coverUrl - Optional URL for the page cover image
   * @param params.iconUrl - Optional URL for the page icon
   * @returns An object containing success status and either the created page or error message
   */
  async createNewPage(params: { parentPageId: string; title: string; content: string; coverUrl?: string; iconUrl?: string }) {
    try {
      const pageObject: CreatePageParameters = {
        parent: { page_id: params.parentPageId },
        properties: {
          title: {
            title: [{ text: { content: params.title } }],
          },
        },
        children: [
          {
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content: params.content } }],
            },
          },
        ],
      };

      // Add cover if provided
      if (params.coverUrl) {
        pageObject.cover = {
          type: 'external',
          external: {
            url: params.coverUrl,
          },
        };
      }

      // Add icon if provided
      if (params.iconUrl) {
        pageObject.icon = {
          type: 'external',
          external: {
            url: params.iconUrl,
          },
        };
      }

      const response = await this.notion.pages.create(pageObject);
      return { success: true, page: response };
    } catch (error) {
      console.error('Error creating new Notion page:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Creates a new empty entry/page in a Notion database
   * @param params - Object containing database entry creation parameters
   * @param params.databaseId - The ID of the Notion database
   * @param params.properties - Optional custom properties for the database entry
   * @param params.title - Optional title for the entry (defaults to 'New Entry')
   * @param params.children - Optional array of block children
   * @param params.coverUrl - Optional URL for the page cover image
   * @param params.iconUrl - Optional URL for the page icon
   * @returns An object containing success status and either the created page or error message
   */
  async createDatabaseEntry(params: {
    databaseId: string;
    properties?: CreatePageParameters['properties'];
    title?: string;
    children?: any[];
    coverUrl?: string;
    iconUrl?: string;
  }) {
    const properties = params.properties ?? defaultProperties;

    try {
      const pageObject: CreatePageParameters = {
        parent: {
          database_id: params.databaseId,
        },
        properties: properties,
        children: params.children ?? [],
      };

      // Add cover if provided
      if (params.coverUrl) {
        pageObject.cover = {
          type: 'external',
          external: {
            url: params.coverUrl,
          },
        };
      }

      // Add icon if provided
      if (params.iconUrl) {
        pageObject.icon = {
          type: 'external',
          external: {
            url: params.iconUrl,
          },
        };
      }

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

  /**
   * Updates the content of an existing Notion page by replacing all existing content
   * @param pageId - The ID of the Notion page to update
   * @param content - The new content to replace existing content
   * @returns An object containing success status and either the updated block or error message
   */
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

  /**
   * Appends markdown content to an existing Notion page
   * @param pageId - The ID of the Notion page to append markdown to
   * @param markdown - The markdown content to append
   * @returns An object containing success status and either the created blocks or error message
   */
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

  /**
   * Creates a new page in a Notion database with markdown content
   * @param data - Object containing database ID, title, and markdown content
   * @param data.databaseId - The ID of the target Notion database
   * @param data.title - The title for the new page
   * @param data.contentMarkdown - The markdown content for the new page
   * @returns An object containing success status and either the created page or error message
   */
  async createPageWithContentIntoDatabase(data: { databaseId: string; title: string; contentMarkdown: string }) {
    const page = await this.createDatabaseEntry({
      databaseId: data.databaseId,
      title: data.title,
      children: [{ type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: data.contentMarkdown } }] } }],
    });
    await this.appendMarkdownToPage(page.page.id, data.contentMarkdown);
    return page;
  }

  /**
   * Creates a new inline database in a Notion page
   * @param pageId - The ID of the parent page where the database will be created
   * @param title - The title of the database
   * @param properties - The database properties/columns configuration
   * @returns An object containing success status and either the created database or error message
   */
  async createInlineDatabase(
    pageId: string,
    title: string,
    properties: Record<string, any> = {
      Name: {
        title: {},
      },
    }
  ) {
    try {
      const response = await this.notion.databases.create({
        is_inline: true,
        parent: {
          type: 'page_id',
          page_id: pageId,
        },
        title: [
          {
            type: 'text',
            text: {
              content: title,
            },
          },
        ],
        properties: properties,
      });

      return {
        success: true,
        database: response,
      };
    } catch (error) {
      console.error('Error creating inline database:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // async createInlineDatabaseAtEnd(pageId: string, title: string) {
  //   try {
  //     // Append the database directly to the page
  //     const response = await this.notion.blocks.children.append({
  //       block_id: pageId,
  //       children: [
  //         {
  //           type: 'database',
  //           child_database: {
  //             title: title,
  //             properties: {
  //               Name: {
  //                 title: {},
  //               },
  //             },
  //           },
  //         },
  //       ],
  //     } );

  //     return {
  //       success: true,
  //       database: response,
  //     };
  //   } catch (error) {
  //     console.error('Error creating inline database:', error);
  //     return {
  //       success: false,
  //       error: error.message,
  //     };
  //   }
  // }
}
