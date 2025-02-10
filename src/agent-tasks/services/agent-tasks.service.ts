import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AgentTaskEntity, AgentTaskDocument } from '../schemas/agent-task.schema';
import { AgentTask } from '../models/classes';
import { buildInitialConversation, ConversationAiService } from '@dataclouder/conversation-card-nestjs';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { NotionWritesService } from 'src/notion-module/services/notion-writes.service';

@Injectable()
export class AgentTasksService {
  constructor(
    @InjectModel(AgentTaskEntity.name)
    private agentTaskModel: Model<AgentTaskDocument>,
    private conversationAiService: ConversationAiService,
    private httpService: HttpService,
    private notionWritesService: NotionWritesService
  ) {}

  async findAll() {
    return this.agentTaskModel.find().exec();
  }

  async findOne(id: string) {
    return this.agentTaskModel.findById(id).exec();
  }

  async create(createAgentTaskDto: AgentTask) {
    const createdTask = new this.agentTaskModel(createAgentTaskDto);
    return createdTask.save();
  }

  async save(createAgentTaskDto: AgentTask) {
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
    const { idAgentCard, taskType } = task;
    console.log(idAgentCard, taskType);
    const agentCard = await this.conversationAiService.getConversationById(idAgentCard);

    const chatMessages = buildInitialConversation(agentCard);
    const response = await this.callPythonAgent(chatMessages);
    console.log(response);

    const notionResponse = await this.notionWritesService.createNewPageIntoDatabase({
      databaseId: task.idNotionDB,
      title: task.name,
      contentMarkdown: response.content,
    });
    console.log(notionResponse);

    return response;
  }
}
