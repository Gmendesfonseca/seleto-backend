import { Injectable, Logger } from '@nestjs/common';
import {
  CreateSecretInput,
  SecretServiceInterface,
  ValidateSecretInput,
} from './interface/secret.service.interface';
import { SecretType } from './interface/secret.interface';
import { InjectModel } from '@nestjs/sequelize';
import { Secret } from './secret.model';

@Injectable()
export class SecretService implements SecretServiceInterface {
  private readonly logger = new Logger(SecretService.name);

  constructor(@InjectModel(Secret) private secretModel: typeof Secret) {}

  public generateSecret(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  public async validateSecret(input: ValidateSecretInput): Promise<boolean> {
    this.logger.debug('SecretService.validateSecret: Called');
    const secret = await this.secretModel.findOne({
      where: { secret: input.secret },
    });
    return Boolean(secret);
  }

  public async createSecret(input: CreateSecretInput): Promise<void> {
    this.logger.debug('SecretService.createSecret: Called');
    await this.secretModel.create({
      secret: input.secret,
      type: input.type,
      userId: input.userId,
    } as Secret);
  }

  public async deleteSecret(secret: string): Promise<void> {
    this.logger.debug('SecretService.deleteSecret: Called');
    await this.secretModel.destroy({
      where: { secret },
    });
  }

  public async getUserIdBySecret(secret: string, type: SecretType): Promise<string | null> {
    this.logger.debug('SecretService.getUserIdBySecret: Called');
    const secretRecord = await this.secretModel.findOne({
      where: { secret, type },
    });
    return secretRecord ? secretRecord.userId : null;
  }
}
