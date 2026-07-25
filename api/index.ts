import { NestFactory } from '@nestjs/core';
import { AppModule } from '../packages/backend/src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import type { Request, Response } from 'express';

let expressApp: express.Express | null = null;

async function initApp() {
  if (expressApp) {
    return expressApp;
  }

  const app = express();
  const adapter = new ExpressAdapter(app);
  
  const nestApp = await NestFactory.create(AppModule, adapter, {
    logger: ['error', 'warn', 'log'],
  });

  nestApp.setGlobalPrefix('api/v1');
  nestApp.useGlobalPipes(new ValidationPipe({ transform: true }));
  nestApp.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await nestApp.init();
  expressApp = app;
  return app;
}

export default async (req: Request, res: Response) => {
  const app = await initApp();
  app(req, res);
};
