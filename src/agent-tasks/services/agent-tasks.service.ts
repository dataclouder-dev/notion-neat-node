import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { CreatePageParameters } from '@notionhq/client/build/src/api-endpoints';
// @dataclouder libs
import { FiltersConfig, IQueryResponse, MongoService } from '@dataclouder/dc-mongo';
import { NotionService, NotionWritesService, renderPageContentToMarkdown } from '@dataclouder/notion';
import { buildInitialConversation, ChatRole, AgentCardService, IAgentCard, ChatMessage } from '@dataclouder/conversation-card-nestjs';
// local
import { AgentTaskEntity, AgentTaskDocument } from '../schemas/agent-task.schema';
import { AgentTaskType, IAgentJob, IAgentTask, ISourceTask } from '../models/classes';
import { AgentJobService } from './agent-job.service';
import { SourcesLLMService } from './agent-sources.service';
import { AppException } from 'src/common/app-exception';
@Injectable()
export class AgentTasksService {
  constructor(
    @InjectModel(AgentTaskEntity.name)
    private agentTaskModel: Model<AgentTaskDocument>,
    private conversationAiService: AgentCardService,
    private httpService: HttpService,
    private notionWritesService: NotionWritesService,
    private notionService: NotionService,
    private agentJobService: AgentJobService,
    private mongoService: MongoService,
    private sourcesLLMService: SourcesLLMService
  ) {}

  async findAll() {
    return this.agentTaskModel.find().exec();
  }

  async findOne(id: string): Promise<AgentTaskEntity> {
    return await this.agentTaskModel.findById(id).lean().exec();
  }

  async create(createAgentTaskDto: IAgentTask) {
    const createdTask = new this.agentTaskModel(createAgentTaskDto);
    return createdTask.save();
  }

  async queryUsingFiltersConfig(filterConfig: FiltersConfig): Promise<IQueryResponse> {
    return await this.mongoService.queryUsingFiltersConfig(filterConfig, this.agentTaskModel);
  }

  async save(createAgentTaskDto: IAgentTask) {
    const id = createAgentTaskDto.id || createAgentTaskDto._id;
    if (createAgentTaskDto?.agentCard?.id) {
      // TODO: fix this to only get assets
      const agentCard = await this.conversationAiService.getConversationById(createAgentTaskDto.agentCard.id);
      const { assets, title } = agentCard;
      createAgentTaskDto.agentCard = { id: createAgentTaskDto.agentCard.id, assets, title, name: agentCard?.characterCard?.data?.name };
    }

    if (id) {
      return this.update(id, createAgentTaskDto);
    } else {
      delete createAgentTaskDto._id;
      delete createAgentTaskDto.id;
      const createdTask = new this.agentTaskModel(createAgentTaskDto);
      return createdTask.save();
    }
  }

  async update(id: string, updateAgentTaskDto: any) {
    return this.agentTaskModel.findByIdAndUpdate(id, updateAgentTaskDto, { new: true }).exec();
  }

  async delete(id: string) {
    return this.agentTaskModel.findByIdAndDelete(id).exec();
  }

  async callPythonAgent(chatMessages: ChatMessage[], task: IAgentTask): Promise<{ content: string; role: string; metadata: any }> {
    const request = {
      messages: chatMessages,
      modelName: task.modelName,
      provider: task.provider,
      type: task.taskType,
      additionalProp1: {},
    };
    const serverUrl = process.env.PYTHON_SERVER_URL;
    const url = `${serverUrl}/api/conversation/agent/chat`;
    console.log('Sending agent request: ', request.provider, request.modelName, request.type);
    try {
      const response = await firstValueFrom(this.httpService.post(url, request));
      console.log('Agent Service response: ', response.data.content.slice(0, 100));
      return response.data;
    } catch (error) {
      console.error('Error calling Python agent: ', error);
      throw new AppException({ error_message: 'Error calling Python web service agent: ' + error.message, explanation: error.response.data });
    }
  }

  private async getNotionStringFromSources(sources: ISourceTask[]): Promise<string> {
    let infoFromSources = '';
    if (sources.length > 0) {
      for (const source of sources) {
        console.log(source);
        infoFromSources += `<Text from ${source.name}>\n\n`;
        const notionResponse = await this.notionService.getNotionPageBlocksFormatted(source.id);
        console.log(notionResponse);
        const markdown = renderPageContentToMarkdown(notionResponse.page.blocks, notionResponse.page.title);
        console.log(markdown);
        infoFromSources += markdown;
      }
    }
    return infoFromSources;
  }

  async execute(id: string) {
    const task: IAgentTask = await this.findOne(id);

    if (!task) {
      throw new Error('Task not found');
    }
    let infoFromSources = null;
    if (task?.sources?.length > 0) {
      const sources = await this.sourcesLLMService.findManyByIds(task.sources.map(source => source.id));
      for (const source of sources) {
        infoFromSources += `\n\n<Text from ${source.name}>\n\n`;
        infoFromSources += source.content;
      }
      console.log('-> Getting info from sources: ', infoFromSources.slice(0, 100), '...');
    }

    const results = [];

    if (task.agentCards.length == 0) {
      const chatMessages = [];
      if (infoFromSources) {
        chatMessages.push({
          role: ChatRole.System,
          content: 'This is the information from the sources: \n\n' + infoFromSources,
        });
      }
      chatMessages.push({ role: ChatRole.User, content: task.description });

      const response = await this.callPythonAgent(chatMessages, task);

      const job: IAgentJob = {
        task: { id: task.id, name: task.name },
        messages: chatMessages,
        response: response,
        sources: task.sources,
        infoFromSources: infoFromSources,
      };

      const jobCreated = await this.agentJobService.create(job);

      if (task.taskType === AgentTaskType.POST_NOTION) {
        const notionResponse = await this.notionWritesService.createPageWithContentIntoDatabase({
          databaseId: task.notionOutput.id,
          title: task.name,
          contentMarkdown: response.content,
          iconUrl: task?.agentCard?.assets?.image?.url || '',
          properties: {
            Name: { title: [{ text: { content: task.name } }] },
            Date: { date: { start: new Date().toISOString() } },
            Agent: { rich_text: [{ text: { content: task?.agentCard?.title ?? 'AI' } }] },
          },
        });
      }

      return { job: jobCreated, response: response };
    } else {
      for (const agentCardMinimal of task.agentCards) {
        const agentCard: IAgentCard = await this.conversationAiService.getConversationById(agentCardMinimal.id);
        const chatMessages = buildInitialConversation(agentCard);

        if (infoFromSources) {
          chatMessages.push({
            role: ChatRole.System,
            content: 'This is the information from the sources: \n\n' + infoFromSources,
          });
        }

        chatMessages.push({ role: ChatRole.User, content: task.description });

        if (agentCard.characterCard?.data?.post_history_instructions) {
          chatMessages.push({ role: ChatRole.System, content: agentCard.characterCard.data.post_history_instructions });
        }

        const response = await this.callPythonAgent(chatMessages, task);

        const notionResponse = await this.notionWritesService.createPageWithContentIntoDatabase({
          databaseId: task.notionOutput.id,
          title: task.name,
          contentMarkdown: response.content,
          iconUrl: agentCardMinimal?.assets?.image?.url || '',
          properties: {
            Name: { title: [{ text: { content: task.name } }] },
            Date: { date: { start: new Date().toISOString() } },
            Agent: { rich_text: [{ text: { content: agentCardMinimal?.title ?? 'AI' } }] },
          },
        });
        console.log('page added: ', notionResponse?.page?.id);

        const job: IAgentJob = {
          task: { id: task.id, name: task.name },
          agentCard: { id: agentCard.id, assets: agentCard.assets, title: agentCard.title, name: agentCard?.characterCard?.data?.name },
          messages: chatMessages,
          response: response,
          sources: task.sources,
          infoFromSources: infoFromSources,
        };

        const jobCreated = await this.agentJobService.create(job);
        console.log('finished job for: ', jobCreated?.task?.name);
        results.push(jobCreated);
      }
    }
    return results;
  }

  private async createNotionAgentPageAndAddContent(task: IAgentTask, agentCard: IAgentCard, mdContent: string) {
    const results = [];

    const properties: CreatePageParameters['properties'] = {
      Name: { title: [{ text: { content: `${task.name} - ${agentCard.characterCard?.data?.name}` } }] },
      Date: { date: { start: new Date().toISOString() } },
      Agent: { rich_text: [{ text: { content: agentCard?.title ?? 'AI' } }] },
    };

    const notionPage = await this.notionWritesService.createDatabaseEntry({
      databaseId: task.notionOutput.id,
      title: task.name,
      children: [],
      iconUrl: agentCard.assets.image.url,
      properties: properties,
    });
    this.notionWritesService.appendMarkdownToPage(notionPage.page.id, mdContent);

    return notionPage;
  }
}
