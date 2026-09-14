import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { CorrelationIdInterceptor } from './common/interceptors/correlation-id.interceptor';
import { RateLimiterGuard } from './common/guards/rate-limiter.guard';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Security Headers Middleware
  app.use((req: any, res: any, next: () => void) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    exposedHeaders: ['X-Request-Id', 'Retry-After'],
  });

  // Global Interceptors & Guards
  app.useGlobalInterceptors(new CorrelationIdInterceptor());
  app.useGlobalGuards(new RateLimiterGuard());

  // Global Validation & Exception Handling
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    })
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger Documentation Setup at /api/docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('THAI CONTEXT API')
    .setDescription(
      'THAI CONTEXT: Semantic Thai Language Intelligence Platform Backend API ("ไม่ต้องรู้คำ ก็รู้ว่าควรใช้คำไหน")'
    )
    .setVersion('1.0.0')
    .addTag('Health', 'System health checks')
    .addTag('Search', 'Keyword, Meaning-first, and Context-aware search')
    .addTag('Dictionary', 'Official dictionary word details, multi-edition evolution, and change detection')
    .addTag('Compare', 'Nuanced word comparison with grounded evidence')
    .addTag('Evolution', 'Word history across editions (2542, 2554, 2569)')
    .addTag('Dialect', 'Regional dialect explorer & standard-to-dialect mappings')
    .addTag('AI Assistant', 'Grounded RAG Assistant & Hallucination Guard')
    .addTag('Feedback', 'Search and recommendation feedback')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`🚀 THAI CONTEXT Core API running on http://localhost:${port}`);
  logger.log(`📚 Swagger documentation available at http://localhost:${port}/api/docs`);
}

bootstrap();
