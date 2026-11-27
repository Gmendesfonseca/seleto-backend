import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { applyGlobalPrefix } from '../src/infrastructure/config/global-prefix';
import { createOpenApiDocument } from '../src/infrastructure/config/swagger';

// preview mode builds the module graph without running providers, so no database is needed.
async function main(): Promise<void> {
  const app = await NestFactory.create(AppModule, { preview: true, logger: false });
  applyGlobalPrefix(app);
  const document = await createOpenApiDocument(app);
  writeFileSync(join(__dirname, '..', 'openapi.json'), JSON.stringify(document, null, 2) + '\n');
  await app.close();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
