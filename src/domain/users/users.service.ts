import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import {
  UsersServiceInterface,
  UpdateUsernameInput,
  UserInterface,
  UserRepositoryInterface,
  ActivateInput,
  ChangeEmailInput,
  RequestChangeEmailInput,
} from './interfaces';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { SecretServiceInterface } from 'src/domain/secret/interface/secret.service.interface';

@Injectable()
export class UsersService implements UsersServiceInterface {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly secretService: SecretServiceInterface,
    private readonly repository: UserRepositoryInterface,
  ) {}

  async findById(id: string): Promise<UserInterface | null> {
    this.logger.debug('UserService.findOne: Called');
    return this.repository.findOne({ id });
  }

  async findAll(filters?: any): Promise<{ users: UserInterface[]; total: number }> {
    this.logger.debug('UserService.findAll: Called');
    return this.repository.findAll(filters);
  }

  async findByEmail(email: string): Promise<UserInterface | null> {
    this.logger.debug('UserService.findByEmail: Called');
    return this.repository.findOne({ email });
  }

  async findByCredentials({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<UserInterface | null> {
    this.logger.debug('UserService.findOneByCredentials: Called');
    return this.repository.findOne({
      email,
      password,
    });
  }

  async activate(input: ActivateInput): Promise<void> {
    this.logger.debug('UserService.activate: Called');
    await this.repository.update(input.id, { status: 'ACTIVE' });
  }

  async updateUsername({ id, username }: UpdateUsernameInput): Promise<void> {
    this.logger.debug('UserService.updateUsername: Called');
    const user = await this.repository.findOne({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.repository.update(id, { username });
  }

  async updatePasswordBySecret(secretKey: string, hashedPassword: string): Promise<void> {
    this.logger.debug('UserService.updatePasswordBySecret: Called');

    const id = await this.secretService.getUserIdBySecret(secretKey, 'PASSWORD');

    if (!id) {
      throw new UnauthorizedException('Invalid or expired secret key');
    }

    await this.repository.update(id, {
      password: hashedPassword,
    });

    this.logger.debug(`Password updated successfully for user: ${id}`);
  }

  async update(id: string, input: any): Promise<UserInterface> {
    this.logger.debug('UserService.update: Called');
    const user = await this.repository.findOne({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData = Object.entries(input)
      .filter(([_, value]) => value !== undefined)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    if (Object.keys(updateData).length === 0) {
      return user;
    }

    return this.repository.update(id, updateData);
  }

  async requestChangeEmail({ email, id }: RequestChangeEmailInput): Promise<void> {
    this.logger.debug('UserService.updateEmail: Called');
    const hasUser = await this.repository.findOne({ email });
    if (hasUser) {
      throw new UnauthorizedException('Email already in use');
    }
    const user = await this.repository.findOne({ id });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const secret = this.secretService.generateSecret();
    await this.secretService.createSecret({
      secret,
      type: 'EMAIL',
      userId: user.id,
    });
    await this.mailerService.sendMail({
      to: email,
      subject: 'Change your email',
      template: './change-email',
      context: {
        link: `${this.configService.get('FRONT_URL')}/change-email/${secret}`,
      },
    });
  }

  async changeEmail({ secret, email, id }: ChangeEmailInput): Promise<void> {
    this.logger.debug('UserService.changeEmail: Called');
    const isValid = await this.secretService.validateSecret({ secret, type: 'EMAIL' });
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired secret');
    }

    try {
      await this.repository.update(id, {
        email,
      });
      await this.secretService.deleteSecret(secret);
    } catch (error) {
      this.logger.error('Failed to update email:', error.message);
      throw new Error('Failed to update email');
    }
  }

  async create(input: any): Promise<UserInterface> {
    this.logger.debug('UserService.createUser: Called');
    return this.repository.create(input);
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('UserService.remove: Called');
    await this.repository.delete(id);
  }
}
