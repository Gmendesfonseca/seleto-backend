import { Module } from '@nestjs/common';
import { Secret } from './secret.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { SecretServiceInterface } from './interface/secret.service.interface';
import { SecretService } from './secret.service';

@Module({
  imports: [SequelizeModule.forFeature([Secret])],
  providers: [
    {
      provide: SecretServiceInterface,
      useClass: SecretService,
    },
  ],
  exports: [
    {
      provide: SecretServiceInterface,
      useClass: SecretService,
    },
  ],
})
export class SecretsModule {}
