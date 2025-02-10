import { Injectable } from '@nestjs/common';
import { parseNotionBlocks } from 'src/notion-module/notion-text-extraction/block-to-properties';
import { NotionService } from 'src/notion-module/services/notion.service';

// TODO: Creo que no estoy exportando el servicio de conversaciones
import { ConversationAiService, buildInitialConversation } from '@dataclouder/conversation-card-nestjs';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { NotionWritesService } from 'src/notion-module/services/notion-writes.service';

@Injectable()
export class NotionConversationService {
  constructor(
    private readonly notionService: NotionService,
    private readonly notionWritesService: NotionWritesService,
    private conversationAiService: ConversationAiService,
    private httpService: HttpService
  ) {}

  async initAgentConversationTask(agentId: string, db_id: string) {
    const agentConversationCard = await this.conversationAiService.getConversationById(agentId);
    // 1) Extraer el prompt del agente. creo que la funcion de prompt builder debería funcionar.
    const chatMessages = buildInitialConversation(agentConversationCard);
    const response = await this.callPythonAgent(chatMessages);

    // guardar la conversacion en la base de datos de notion.
    const notionResponse = await this.notionWritesService.createNewPageIntoDatabase(db_id, response.content);

    console.log(notionResponse);
    // const db = await this.notionService.getNotionDatabase(db_id);

    return response;
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
}
