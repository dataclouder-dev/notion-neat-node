import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AgentTaskEntity, AgentTaskDocument } from '../schemas/agent-task.schema';
import { IAgentJob, IAgentTask } from '../models/classes';
import { buildInitialConversation, ChatRole, ConversationAiService } from '@dataclouder/conversation-card-nestjs';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { NotionWritesService } from 'src/notion-module/services/notion-writes.service';
import { NotionService } from 'src/notion-module/services/notion.service';
import { ExportType } from 'src/notion-module/models/enums';
import { renderPageContentToHtml, renderPageContentToMarkdown } from 'src/notion-module/functions/notion.transforms';
import { AgentJobService } from './agent-job.service';

@Injectable()
export class AgentTasksService {
  constructor(
    @InjectModel(AgentTaskEntity.name)
    private agentTaskModel: Model<AgentTaskDocument>,
    private conversationAiService: ConversationAiService,
    private httpService: HttpService,
    private notionWritesService: NotionWritesService,
    private notionService: NotionService,
    private agentJobService: AgentJobService
  ) {}

  async findAll() {
    return this.agentTaskModel.find().exec();
  }

  async findOne(id: string) {
    return await this.agentTaskModel.findById(id).lean().exec();
  }

  async create(createAgentTaskDto: IAgentTask) {
    const createdTask = new this.agentTaskModel(createAgentTaskDto);
    return createdTask.save();
  }

  async save(createAgentTaskDto: IAgentTask) {
    const id = createAgentTaskDto.id || createAgentTaskDto._id;
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

  async callPythonAgent(chatMessages: any): Promise<{ content: string; role: string; metadata: any }> {
    const request = {
      messages: chatMessages,
      modelName: '',
      provider: '',
      type: '',
      additionalProp1: {},
    };
    const url = 'https://python-server-514401908603.us-central1.run.app/api/conversation/agent/chat';
    const response = await firstValueFrom(this.httpService.post(url, request));
    console.log(response);
    return response.data;
  }

  async execute(id: string) {
    const task = await this.findOne(id);
    if (!task) {
      throw new Error('Task not found');
    }
    const { idAgentCard, taskType, sources } = task;

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
    console.log(idAgentCard, taskType);
    const agentCard = await this.conversationAiService.getConversationById(idAgentCard);

    const chatMessages = buildInitialConversation(agentCard);
    chatMessages.push({
      role: ChatRole.System,
      content: 'This is the information from the sources: \n\n' + infoFromSources,
    });

    const response = await this.callPythonAgent(chatMessages);
    console.log(response);

    const notionResponse = await this.notionWritesService.createNewPageIntoDatabase({
      databaseId: task.idNotionDB,
      title: task.name,
      contentMarkdown: response.content,
    });

    const job: IAgentJob = {
      idTask: task.id,
      idAgentCard: idAgentCard,
      messages: chatMessages,
      response: response,
    };

    const jobCreated = await this.agentJobService.create(job);
    console.log(jobCreated);
    // const job = await this.agentJobService.create({
    //   agentId: idAgentCard,
    //   idTask: id,
    //   status: 'completed',
    // });
    console.log(notionResponse);

    return response;
  }
}
