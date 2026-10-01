import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './modules/seed/seed.service';
import { Logger } from '@nestjs/common';

async function runSeed() {
  const logger = new Logger('SeedCLI');
  logger.log('Starting seed CLI for Turso / libSQL...');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['log', 'error', 'warn'] });
  const seedService = app.get(SeedService);
  await seedService.seedDemoData();
  logger.log('Turso / libSQL demo database seeded successfully.');
  await app.close();
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('Seed CLI failed:', err);
  process.exit(1);
});
