import { PluginMetadataGenerator } from '@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator';
import { ReadonlyVisitor } from '@nestjs/swagger/plugin';

// SWC skips TypeScript compiler plugins, so DTO and route metadata for Swagger is generated ahead of time.
new PluginMetadataGenerator().generate({
  visitors: [
    new ReadonlyVisitor({
      introspectComments: true,
      pathToSource: __dirname + '/../src',
      classValidatorShim: true,
    }),
  ],
  outputDir: __dirname + '/../src',
  watch: false,
  tsconfigPath: 'tsconfig.build.json',
});
