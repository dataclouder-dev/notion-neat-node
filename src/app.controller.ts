import { Controller, Get, Header, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  constructor() {}

  @Get('favicon.ico')
  getFavicon(@Res() response: Response) {
    return response.status(204).send();
  }

  @Get()
  @Header('content-type', 'text/html')
  getHello(): string {
    return `
    <h1>Bievenido al proyecto / Welcome </h1>
    <ul>
          <li><a href="/public/index.html"> Main Page </a></li>

      <li><a href="/docs"> Swagger Documentation </a></li>
    </ul>
    `;
  }
}
