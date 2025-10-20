import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import {
  UsersServiceInterface,
  UpdateUsernameInput,
  UserInterface,
  UsersRepositoryInterface,
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
    private readonly usersRepository: UsersRepositoryInterface,
  ) {}

  async findOne(id: string): Promise<UserInterface | null> {
    this.logger.debug('UserService.findOne: Called');
    return this.usersRepository.findOne(id);
  }

  async findAll(filters?: any): Promise<{ users: UserInterface[]; total: number }> {
    this.logger.debug('UserService.findAll: Called');
    return this.usersRepository.findAll(filters);
  }

  async findOneByEmail(email: string): Promise<UserInterface | null> {
    this.logger.debug('UserService.findOneByEmail: Called');
    return this.usersRepository.findOneByEmail(email);
  }

  async findOneByCredentials(credentials: {
    email: string;
    password: string;
  }): Promise<UserInterface | null> {
    this.logger.debug('UserService.findOneByCredentials: Called');
    return this.usersRepository.findOneByCredentials(credentials);
  }

  async activate(input: ActivateInput): Promise<void> {
    this.logger.debug('UserService.activate: Called');
    return this.usersRepository.activate(input);
  }

  async updateUsername({ id, username }: UpdateUsernameInput): Promise<void> {
    this.logger.debug('UserService.updateUsername: Called');
    const user = await this.usersRepository.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersRepository.updateUsername({ id, username });
  }

  async requestChangeEmail({ email, id }: RequestChangeEmailInput): Promise<void> {
    this.logger.debug('UserService.updateEmail: Called');
    const isValid = await this.usersRepository.validateEmail({ email });
    if (!isValid) {
      throw new UnauthorizedException('Email already in use');
    }
    const user = await this.usersRepository.findOne(id);
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

  async changeEmail({ secret, ...input }: ChangeEmailInput): Promise<void> {
    this.logger.debug('UserService.changeEmail: Called');
    const isValid = await this.secretService.validateSecret({ secret, type: 'EMAIL' });
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired secret');
    }

    try {
      await this.usersRepository.updateEmail(input);
      await this.secretService.deleteSecret(secret);
    } catch (error) {
      this.logger.error('Failed to update email:', error.message);
      throw new Error('Failed to update email');
    }
  }

  async createUser(input: any): Promise<UserInterface> {
    this.logger.debug('UserService.createUser: Called');
    return this.usersRepository.createUser(input);
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('UserService.remove: Called');
    await this.usersRepository.delete(id);
  }

  async updatePasswordBySecret(secretKey: string, hashedPassword: string): Promise<void> {
    this.logger.debug('UserService.updatePasswordBySecret: Called');

    // Validate the secret key and get the associated userId
    const userId = await this.secretService.getUserIdBySecret(secretKey, 'PASSWORD');

    if (!userId) {
      throw new UnauthorizedException('Invalid or expired secret key');
    }

    // Update the user's password
    await this.usersRepository.updatePassword({
      id: userId,
      password: hashedPassword,
    });

    this.logger.debug(`Password updated successfully for user: ${userId}`);
  }

  async updateUser(id: string, input: any): Promise<UserInterface> {
    this.logger.debug('UserService.updateUser: Called');
    const user = await this.usersRepository.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Filter out undefined values
    const updateData = Object.entries(input)
      .filter(([_, value]) => value !== undefined)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    if (Object.keys(updateData).length === 0) {
      return user;
    }

    return this.usersRepository.update(id, updateData);
  }
}
