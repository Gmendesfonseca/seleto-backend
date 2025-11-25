import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthServiceInterface, SignInResponse, SignUpDto } from './interfaces';
import { UsersServiceInterface } from '../users/interfaces';
import { SecretServiceInterface } from '../secret/interface/secret.service.interface';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import { CompanyServiceInterface } from '../companies/interfaces/company.service.interface';
import { PersonServiceInterface } from '../persons/interfaces/person.service.interface';
import { UserType } from 'src/shared/utils/constants';
import { PhoneServiceInterface, PhoneType } from '../phones';
import { Jwt } from 'src/shared/interfaces';

@Injectable()
export class AuthService implements AuthServiceInterface {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersServiceInterface,
    private readonly secretService: SecretServiceInterface,
    private readonly mailerService: MailerService,
    private readonly companyService: CompanyServiceInterface,
    private readonly personService: PersonServiceInterface,
    private readonly phoneService: PhoneServiceInterface,
  ) {}

  async signIn(email: string, password: string): Promise<SignInResponse> {
    this.logger.debug('AuthService.signIn: Called');

    const payload = {} as Jwt;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    payload['sub'] = user.id;
    payload['username'] = user.username;

    if (user.type === UserType.COMPANY) {
      const company = await this.companyService.findByUserId(user.id);
      if (!company) {
        throw new NotFoundException('Company not found');
      }
      payload['companyId'] = company.id;
      payload['profileId'] = company.id;
      payload['profile'] = company;
    } else if (user.type === UserType.PERSON) {
      const person = await this.personService.findByUserId(user.id);
      if (!person) {
        throw new NotFoundException('Person not found');
      }
      payload['companyId'] = null;
      payload['profileId'] = person.id;
      payload['profile'] = person;
    }

    payload['config'] = {
      auth2f: false,
      default_interface: 'LIGHT',
      default_language: 'pt',
      default_timezone: 'UTC',
      master: false,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' }); // TODO: remove expiration time
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const expiresIn = 3600;

    return {
      accessToken,
      refreshToken,
      expiresIn,
      user: {
        id: user.id,
        username: user.username,
        profileId: payload.profileId,
        email: user.email,
        type: user.type,
        status: user.status || 'ACTIVE',
      },
    };
  }

  async signUp({
    username,
    password,
    email,
    type,
    name,
    cnpj,
    cpf,
    phone,
  }: SignUpDto): Promise<void> {
    this.logger.debug('AuthService.signUp: Called');

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await this.hashPassword(password);

    const user = await this.usersService.create({
      type,
      name,
      email,
      username,
      password: hashedPassword,
    });

    if (type === UserType.COMPANY) {
      await this.companyService.create({ cnpj: cnpj!, userId: user.id });
    } else if (type === UserType.PERSON) {
      await this.personService.create({
        cpf: cpf!,
        userId: user.id,
      });
    }

    if (phone)
      await this.phoneService.create({
        number: phone,
        userId: user.id,
        type: PhoneType.WORK,
        isPrimary: true,
      });

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Bem vindo ao Seleto!',
        template: 'welcome',
        context: { username },
      });
    } catch (error) {
      this.logger.warn('Failed to send welcome email', error);
    }
  }

  async forgotPassword(email: string): Promise<void> {
    this.logger.debug('AuthService.forgotPassword: Called');

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const secretKey = this.secretService.generateSecret();

    await this.secretService.createSecret({
      secret: secretKey,
      type: 'PASSWORD',
      userId: user.id,
    });

    await this.mailerService.sendMail({
      to: email,
      subject: 'Solicitação de Redefinição de Senha',
      template: 'password-reset',
      context: { secretKey, username: user.username },
    });
  }

  async checkSecretKey(secretKey: string): Promise<boolean> {
    this.logger.debug('AuthService.checkSecretKey: Called');

    const isValid = await this.secretService.validateSecret({
      secret: secretKey,
      type: 'PASSWORD',
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid secret key');
    }

    return true;
  }

  async resetPassword(secretKey: string, newPassword: string): Promise<void> {
    this.logger.debug('AuthService.resetPassword: Called');

    const isValid = await this.secretService.validateSecret({
      secret: secretKey,
      type: 'PASSWORD',
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid secret key');
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await this.usersService.updatePasswordBySecret(secretKey, hashedPassword);

    await this.secretService.deleteSecret(secretKey);
  }

  async refreshToken(inputRefreshToken: string): Promise<SignInResponse> {
    this.logger.debug('AuthService.refreshToken: Called');

    try {
      const decoded = this.jwtService.verify(inputRefreshToken);

      const user = await this.usersService.findById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const payload = {} as Jwt;
      payload['sub'] = user.id;
      payload['username'] = user.username;

      if (user.type === UserType.COMPANY) {
        const company = await this.companyService.findByUserId(user.id);
        if (!company) {
          throw new NotFoundException('Company not found');
        }
        payload['companyId'] = company.id;
        payload['profileId'] = company.id;
        payload['profile'] = company;
      } else if (user.type === UserType.PERSON) {
        const person = await this.personService.findByUserId(user.id);
        if (!person) {
          throw new NotFoundException('Person not found');
        }
        payload['companyId'] = null;
        payload['profileId'] = person.id;
        payload['profile'] = person;
      }

      payload['config'] = {
        auth2f: false,
        default_interface: 'LIGHT',
        default_language: 'pt',
        default_timezone: 'UTC',
        master: false,
      };

      const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
      const expiresIn = 3600;

      return {
        accessToken,
        refreshToken,
        expiresIn,
        user: {
          id: user.id,
          username: user.username,
          profileId: payload.profileId,
          email: user.email,
          type: user.type,
          status: user.status || 'ACTIVE',
        },
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Hash password using bcrypt with salt rounds
   * @param password - Plain text password to hash
   * @returns Promise<string> - Hashed password
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash using bcrypt
   * @param password - Plain text password
   * @param hash - Hashed password to compare against
   * @returns Promise<boolean> - True if password matches
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async logout(userId: string): Promise<void> {
    this.logger.debug('AuthService.logout: Called', { userId });
    // In a stateless JWT implementation, logout is typically handled on the client side
    // by removing the token. However, we can add token blacklisting or other mechanisms
    // if needed in the future. For now, this is a no-op that allows the endpoint to exist.
  }
}
