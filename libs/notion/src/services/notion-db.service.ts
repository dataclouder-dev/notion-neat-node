import { Injectable } from '@nestjs/common';

import { Client } from '@notionhq/client';
import { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { NotionDBPageDocument, NotionDBPageEntity } from '../entities/notion-db-page.entity';
import { NotionDBPage } from '../models/classes';
import { DbEntries, SelectColor } from '../models/types';

/**
 * Service for managing Notion database operations and their MongoDB persistence
 * Handles interactions between Notion API and local MongoDB storage for database pages
 */
@Injectable()
export class NotionDBService {
  private notionClient: Client;

  constructor(
    @InjectModel(NotionDBPageEntity.name)
    private notionDBPageModel: Model<NotionDBPageDocument>
  ) {
    console.log('process.env.NOTION_KEY', process.env.NOTION_KEY);
    this.notionClient = new Client({
      auth: process.env.NOTION_KEY,
    });
  }

  /**
   * Saves a Notion database page to MongoDB
   * @param dbId - The Notion database ID
   * @param pageId - The Notion page ID
   * @param json - The raw JSON data of the page
   * @returns Promise with the saved MongoDB document
   */
  async saveDBPage(dbId: string, pageId: string, json: any): Promise<NotionDBPageDocument> {
    const notionDBPage = new this.notionDBPageModel({ db_id: dbId, page_id: pageId, json });
    return await notionDBPage.save();
  }

  /**
   * Updates an existing page or creates a new one if it doesn't exist
   * @param pageData - Partial page data to update/insert
   * @returns Promise with the updated or newly created MongoDB document
   */
  async upsertNotionPage(pageData: Partial<NotionDBPageEntity>) {
    return await this.notionDBPageModel.findOneAndUpdate(
      { page_id: pageData.page_id }, // search criteria
      pageData, // data to update/insert
      {
        upsert: true, // create if doesn't exist
        new: true, // return the updated/inserted document
      }
    );
  }

  /**
   * Retrieves all entries from a specific Notion database
   * @param dbId - The Notion database ID
   * @returns Promise with an array of DatabaseObjectResponse
   */
  async getDBEntries(dbId: string): Promise<DatabaseObjectResponse[]> {
    const response = await this.notionClient.databases.query({ database_id: dbId });
    console.log('response', response);
    return response.results as DatabaseObjectResponse[];
  }

  /**
   * Retrieves a specific page content from MongoDB
   * @param pageId - The Notion page ID
   * @returns Promise with the NotionDBPage data
   */
  async getMongoDBPageContent(pageId: string): Promise<NotionDBPage> {
    return this.notionDBPageModel.findOne({ page_id: pageId });
  }

  /**
   * Retrieves entries marked as 'Ready' from multiple Notion databases
   * Database IDs are fetched from environment variables
   * @returns Promise with database entries grouped by database ID
   */
  async getEntriesReady(): Promise<DbEntries> {
    // Get multiples db from .evn
    const notionClient = new Client({ auth: process.env.NOTION_KEY });

    const databaseIds = (process.env.NOTION_DB_IDs as string).split(',');

    const dbEntries: DbEntries = {};

    const filter = { property: 'Medium Status', select: { equals: 'Ready' } };

    for (const databaseId of databaseIds) {
      await this.initPropertiesIsNeeded(databaseId);
      const response = await notionClient.databases.query({ database_id: databaseId, filter });
      dbEntries[databaseId] = (response.results || []) as DatabaseObjectResponse[];
    }

    return dbEntries;
  }

  /**
   * Initializes required properties in a Notion database if they don't exist
   * Checks for 'Medium Status' and 'Published' properties
   * @param dbId - The Notion database ID
   */
  async initPropertiesIsNeeded(dbId: string): Promise<void> {
    const notionClient = new Client({ auth: process.env.NOTION_KEY });
    const notionDB = await notionClient.databases.retrieve({ database_id: dbId });
    console.log('notionDB', notionDB);
    if ('Medium Status' in notionDB.properties && 'Published' in notionDB.properties) {
      console.log('DB is ready');
    } else {
      await this.addPropertiesToDatabase(dbId);
    }
  }

  /**
   * Adds required properties to a Notion database
   * Adds 'Published' date field and 'Medium Status' select field with predefined options
   * @param dbId - The Notion database ID
   */
  async addPropertiesToDatabase(dbId: string) {
    const notionClient = new Client({ auth: process.env.NOTION_KEY });

    const update = {
      properties: {
        Published: { date: {} },
        'Medium Status': {
          select: {
            options: [
              {
                name: 'Draft',
                color: 'red' as SelectColor,
              },
              {
                name: 'Ready',
                color: 'blue' as SelectColor,
              },
              {
                name: 'Published',
                color: 'green' as SelectColor,
              },
            ],
          },
        },
      },
    };

    const results = await notionClient.databases.update({ database_id: dbId, ...update });
    console.log('database property was updated', results);
  }
}
