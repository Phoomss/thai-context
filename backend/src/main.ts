import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Enable Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // 2. Enable Open CORS for Hackathon Integration
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 3. Setup Swagger / OpenAPI 3.0 Documentation
  const config = new DocumentBuilder()
    .setTitle('🇹🇭 THAI CONTEXT API')
    .setDescription('Official Backend REST APIs for Contextual Word Discovery, Lexical Evolution & Grounded AI')
    .setVersion('1.0.0')
    .addTag('Search', 'Meaning-first & Keyword search engine')
    .addTag('Words', 'Word detail, 3-Era Evolution & Context Comparison')
    .addTag('Dialects', 'Thai regional dialect exploration & cultural maps')
    .addTag('Feedback', 'User relevance feedback metrics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  
  logger.log(`====================================================`);
  logger.log(`🚀 THAI CONTEXT Backend is running on port: ${port}`);
  logger.log(`📑 Swagger Documentation: http://localhost:${port}/api/docs`);
  logger.log(`🔍 Health Check Endpoint: http://localhost:${port}/health`);
  logger.log(`====================================================`);
}

bootstrap();
