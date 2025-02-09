import { Injectable } from '@nestjs/common';
import { Client } from '@notionhq/client';
import { DbEntries, SelectColor } from './types';
import { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotionDBPageEntity, NotionDBPageDocument } from './entities/notion-db-page.entity';
import { NotionDBPage } from './models/classes';

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

  async saveDBPage(dbId: string, pageId: string, json: any): Promise<NotionDBPageDocument> {
    const notionDBPage = new this.notionDBPageModel({ db_id: dbId, page_id: pageId, json });
    return await notionDBPage.save();
  }

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

  async getDBEntries(dbId: string): Promise<DatabaseObjectResponse[]> {
    // const notionClient = new Client({ auth: process.env.NOTION_KEY });
    const response = await this.notionClient.databases.query({ database_id: dbId });
    console.log('response', response);
    return response.results as DatabaseObjectResponse[];
  }

  async getMongoDBPageContent(pageId: string): Promise<NotionDBPage> {
    return this.notionDBPageModel.findOne({ page_id: pageId });
  }

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
