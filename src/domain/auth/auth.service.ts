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
import { CompanyService } from '../companies';

@Injectable()
export class AuthService implements AuthServiceInterface {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersServiceInterface,
    private readonly secretService: SecretServiceInterface,
    private readonly mailerService: MailerService,
    private readonly companyService: CompanyService,
    private readonly personService: CompanyService,
  ) {}

  async signIn(email: string, password: string): Promise<SignInResponse> {
    this.logger.debug('AuthService.signIn: Called');

    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, username: user.username };
    const token = this.jwtService.sign(payload);
    const expiration = Date.now() + 3600 * 1000;

    return {
      token,
      expiration,
    };
  }

  async signUp({ username, password, email, type, name }: SignUpDto): Promise<void> {
    this.logger.debug('AuthService.signUp: Called');

    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await this.hashPassword(password);

    await this.usersService.createUser({
      email: username,
      username,
      password: hashedPassword,
      type,
    });

    if (type === 'COMPANY') {
      await this.companyService.create({ name });
    } else if (type === 'PERSON') {
      await this.personService.create({ name });
    }

    try {
      await this.mailerService.sendMail({
        to: username,
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

    const user = await this.usersService.findOneByEmail(email);
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

  async refreshToken(refreshToken: string): Promise<SignInResponse> {
    this.logger.debug('AuthService.refreshToken: Called');

    try {
      const decoded = this.jwtService.verify(refreshToken);

      const user = await this.usersService.findOne(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const payload = { sub: user.id, username: user.username };
      const token = this.jwtService.sign(payload);
      const expiration = Date.now() + 3600 * 1000;

      return {
        token,
        expiration,
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
