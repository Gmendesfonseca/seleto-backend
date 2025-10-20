import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { RefreshToken } from '../models/refresh-token.model';
import { RefreshTokenRepository } from './refresh-token.repository.interface';
import { Op } from 'sequelize';

@Injectable()
export class RefreshTokenSequelizeRepository implements RefreshTokenRepository {
  private readonly logger = new Logger(RefreshTokenSequelizeRepository.name);

  constructor(
    @InjectModel(RefreshToken)
    private readonly refreshTokenModel: typeof RefreshToken,
  ) {}

  async create(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    this.logger.debug('RefreshTokenSequelizeRepository.create: Called');
    return this.refreshTokenModel.create({
      userId,
      token,
      expiresAt,
    } as any);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    this.logger.debug('RefreshTokenSequelizeRepository.findByToken: Called');
    return this.refreshTokenModel.findOne({ where: { token } });
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    this.logger.debug('RefreshTokenSequelizeRepository.findByUserId: Called');
    return this.refreshTokenModel.findAll({ where: { userId } });
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('RefreshTokenSequelizeRepository.delete: Called');
    await this.refreshTokenModel.destroy({ where: { id } });
  }

  async deleteByUserId(userId: string): Promise<void> {
    this.logger.debug('RefreshTokenSequelizeRepository.deleteByUserId: Called');
    await this.refreshTokenModel.destroy({ where: { userId } });
  }

  async deleteExpired(): Promise<void> {
    this.logger.debug('RefreshTokenSequelizeRepository.deleteExpired: Called');
    await this.refreshTokenModel.destroy({
      where: {
        expiresAt: {
          [Op.lt]: new Date(),
        },
      },
    });
  }

  async isTokenValid(token: string): Promise<boolean> {
    this.logger.debug('RefreshTokenSequelizeRepository.isTokenValid: Called');
    const refreshToken = await this.refreshTokenModel.findOne({
      where: {
        token,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
    });
    return refreshToken !== null;
  }
}
