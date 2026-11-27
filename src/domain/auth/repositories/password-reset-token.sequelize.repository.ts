import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PasswordResetToken } from '../models/password-reset-token.model';
import { PasswordResetTokenRepository } from './password-reset-token.repository.interface';
import { Op } from 'sequelize';
import { DateTime } from 'luxon';

@Injectable()
export class PasswordResetTokenSequelizeRepository implements PasswordResetTokenRepository {
  private readonly logger = new Logger(PasswordResetTokenSequelizeRepository.name);

  constructor(
    @InjectModel(PasswordResetToken)
    private readonly passwordResetTokenModel: typeof PasswordResetToken,
  ) {}

  async create(userId: string, token: string, expiresAt: DateTime): Promise<PasswordResetToken> {
    this.logger.debug('PasswordResetTokenSequelizeRepository.create: Called');
    return this.passwordResetTokenModel.create({
      user_id: userId,
      token,
      expiresAt: expiresAt.toJSDate(),
      used: false,
    } as any);
  }

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    this.logger.debug('PasswordResetTokenSequelizeRepository.findByToken: Called');
    return this.passwordResetTokenModel.findOne({ where: { token } });
  }

  async findByUserId(userId: string): Promise<PasswordResetToken[]> {
    this.logger.debug('PasswordResetTokenSequelizeRepository.findByUserId: Called');
    return this.passwordResetTokenModel.findAll({ where: { user_id: userId } });
  }

  async markAsUsed(id: string): Promise<void> {
    this.logger.debug('PasswordResetTokenSequelizeRepository.markAsUsed: Called');
    const token = await this.passwordResetTokenModel.findByPk(id);
    if (token) {
      await token.update({ used: true });
    }
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('PasswordResetTokenSequelizeRepository.delete: Called');
    await this.passwordResetTokenModel.destroy({ where: { id } });
  }

  async deleteByUserId(userId: string): Promise<void> {
    this.logger.debug('PasswordResetTokenSequelizeRepository.deleteByUserId: Called');
    await this.passwordResetTokenModel.destroy({ where: { user_id: userId } });
  }

  async deleteExpired(): Promise<void> {
    this.logger.debug('PasswordResetTokenSequelizeRepository.deleteExpired: Called');
    await this.passwordResetTokenModel.destroy({
      where: {
        expiresAt: {
          [Op.lt]: new Date(),
        },
      },
    });
  }

  async isTokenValid(token: string): Promise<boolean> {
    this.logger.debug('PasswordResetTokenSequelizeRepository.isTokenValid: Called');
    const passwordResetToken = await this.passwordResetTokenModel.findOne({
      where: {
        token,
        used: false,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
    });
    return passwordResetToken !== null;
  }
}
