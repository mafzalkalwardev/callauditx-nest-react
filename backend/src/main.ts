import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InMemoryDB } from './in-memory-db';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  // Initialize in-memory database
  await InMemoryDB.init();

  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: '*', // For local dev
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Serve static upload files
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`CallAuditX backend running on: http://localhost:${port}`);
}
bootstrap();
