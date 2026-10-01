import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { DatabaseService } from './database/database.service';
import { SeedService } from './modules/seed/seed.service';

async function bootstrap() {
  const logger = new Logger('FreelancerOS-API');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-organization-id'],
  });

  // OpenAPI Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('FreelancerOS API')
    .setDescription('Operating system for independent creative freelancers & studios')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.init();

  // Initialize demo data if database is empty
  const dbService = app.get(DatabaseService);
  const seedService = app.get(SeedService);
  const existingOrg = await dbService.db.query.organizations.findFirst();
  if (!existingOrg) {
    logger.log('Empty database detected on boot. Seeding initial demo content...');
    await seedService.seedDemoData();
  }

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  logger.log(`FreelancerOS API server running at http://0.0.0.0:${port}/api`);
  logger.log(`OpenAPI documentation available at http://localhost:${port}/api/docs`);
}

bootstrap();
