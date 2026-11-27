import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import metadata from '../../metadata';

type PropertyMetadata = Record<string, unknown>;
type ModelEntry = [Promise<unknown>, Record<string, Record<string, PropertyMetadata>>];
type PluginMetadata = { '@nestjs/swagger': { models: ModelEntry[]; controllers: unknown[] } };

const DATE_PROPERTY = /(At|Date)$/;

// The CLI plugin cannot resolve luxon's DateTime and leaves those properties untyped, which
// Swagger rejects. Describe them as ISO date-time strings; any other untyped property still fails.
async function withLuxonDates(): Promise<PluginMetadata> {
  const loaded = (await metadata()) as PluginMetadata;
  for (const [, classes] of loaded['@nestjs/swagger'].models) {
    for (const properties of Object.values(classes)) {
      for (const [property, meta] of Object.entries(properties)) {
        if (meta.type || meta.enum || !DATE_PROPERTY.test(property)) continue;
        meta.type = String;
        meta.format = 'date-time';
      }
    }
  }
  return loaded;
}

export async function createOpenApiDocument(app: INestApplication): Promise<OpenAPIObject> {
  await SwaggerModule.loadPluginMetadata(withLuxonDates);
  const config = new DocumentBuilder()
    .setTitle('Seleto API')
    .setDescription('Recruitment and selection platform (ATS)')
    .setVersion('1.0')
    .addBearerAuth()
    .addSecurityRequirements('bearer')
    .build();
  return SwaggerModule.createDocument(app, config);
}
