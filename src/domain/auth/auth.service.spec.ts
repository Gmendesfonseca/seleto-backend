import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { SignUpDto } from './interfaces';
import { UsersServiceInterface } from '../users/interfaces';
import { SecretServiceInterface } from '../secret/interface/secret.service.interface';
import { CompanyServiceInterface } from '../companies/interfaces/company.service.interface';
import { PersonServiceInterface } from '../persons/interfaces/person.service.interface';
import { PhoneServiceInterface, PhoneType } from '../phones';
import { UserType } from 'src/shared/utils/constants';

jest.mock('bcrypt');

describe('AuthService', () => {
  const usersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updatePasswordBySecret: jest.fn(),
  };
  const secretService = {
    generateSecret: jest.fn(),
    validateSecret: jest.fn(),
    createSecret: jest.fn(),
    deleteSecret: jest.fn(),
  };
  const jwtService = { sign: jest.fn(), verify: jest.fn() };
  const mailerService = { sendMail: jest.fn() };
  const companyService = { findByUserId: jest.fn(), create: jest.fn() };
  const personService = { findByUserId: jest.fn(), create: jest.fn() };
  const phoneService = { create: jest.fn() };

  let service: AuthService;

  const personUser = {
    id: 'user-1',
    email: 'jane@example.com',
    username: 'jane',
    password: 'hashed:test-password',
    type: UserType.PERSON,
    status: 'ACTIVE',
  };
  const companyUser = { ...personUser, id: 'user-2', type: UserType.COMPANY };
  const person = { id: 'person-1', cpf: '12345678901' };
  const company = { id: 'company-1', cnpj: '12345678000199' };

  const expectedConfig = {
    auth2f: false,
    default_interface: 'LIGHT',
    default_language: 'pt',
    default_timezone: 'UTC',
    master: false,
  };

  beforeEach(() => {
    jest.resetAllMocks();
    (bcrypt.hash as jest.Mock).mockImplementation(async (value: string) => `hashed:${value}`);
    (bcrypt.compare as jest.Mock).mockImplementation(
      async (value: string, hash: string) => hash === `hashed:${value}`,
    );
    jwtService.sign.mockImplementation(
      (_payload: unknown, options: { expiresIn: string }) => `token-${options.expiresIn}`,
    );

    service = new AuthService(
      jwtService as unknown as JwtService,
      usersService as unknown as UsersServiceInterface,
      secretService as unknown as SecretServiceInterface,
      mailerService as unknown as MailerService,
      companyService as unknown as CompanyServiceInterface,
      personService as unknown as PersonServiceInterface,
      phoneService as unknown as PhoneServiceInterface,
    );
  });

  describe('signIn', () => {
    it('signs a person session with the person profile in the token payload', async () => {
      usersService.findByEmail.mockResolvedValue(personUser);
      personService.findByUserId.mockResolvedValue(person);

      const result = await service.signIn('jane@example.com', 'test-password');

      expect(bcrypt.compare).toHaveBeenCalledWith('test-password', personUser.password);
      const expectedPayload = {
        sub: 'user-1',
        username: 'jane',
        companyId: null,
        profileId: 'person-1',
        profile: person,
        config: expectedConfig,
      };
      expect(jwtService.sign).toHaveBeenNthCalledWith(1, expectedPayload, { expiresIn: '1d' });
      expect(jwtService.sign).toHaveBeenNthCalledWith(2, expectedPayload, { expiresIn: '7d' });
      expect(result).toEqual({
        accessToken: 'token-1d',
        refreshToken: 'token-7d',
        expiresIn: 3600,
        user: {
          id: 'user-1',
          username: 'jane',
          profileId: 'person-1',
          email: 'jane@example.com',
          type: 'PERSON',
          status: 'ACTIVE',
        },
      });
    });

    it('signs a company session scoped to the company id', async () => {
      usersService.findByEmail.mockResolvedValue(companyUser);
      companyService.findByUserId.mockResolvedValue(company);

      const result = await service.signIn('jane@example.com', 'test-password');

      expect(companyService.findByUserId).toHaveBeenCalledWith('user-2');
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: 'company-1',
          profileId: 'company-1',
          profile: company,
        }),
        { expiresIn: '1d' },
      );
      expect(result.user.profileId).toBe('company-1');
    });

    it('defaults the status to ACTIVE when the user has none', async () => {
      usersService.findByEmail.mockResolvedValue({ ...personUser, status: undefined });
      personService.findByUserId.mockResolvedValue(person);

      const result = await service.signIn('jane@example.com', 'test-password');

      expect(result.user.status).toBe('ACTIVE');
    });

    it('rejects an unknown email without checking any password', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.signIn('nobody@example.com', 'test-password')).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('rejects a wrong password with the same error as an unknown email', async () => {
      usersService.findByEmail.mockResolvedValue(personUser);

      await expect(service.signIn('jane@example.com', 'wrong-password')).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );

      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('fails when a person user has no person profile', async () => {
      usersService.findByEmail.mockResolvedValue(personUser);
      personService.findByUserId.mockResolvedValue(null);

      await expect(service.signIn('jane@example.com', 'test-password')).rejects.toThrow(
        new NotFoundException('Person not found'),
      );
    });

    it('fails when a company user has no company profile', async () => {
      usersService.findByEmail.mockResolvedValue(companyUser);
      companyService.findByUserId.mockResolvedValue(null);

      await expect(service.signIn('jane@example.com', 'test-password')).rejects.toThrow(
        new NotFoundException('Company not found'),
      );
    });
  });

  describe('signUp', () => {
    const personInput: SignUpDto = {
      name: 'Jane Doe',
      username: 'jane',
      password: 'test-password',
      email: 'jane@example.com',
      type: UserType.PERSON,
      cpf: '12345678901',
      phone: '+5511999999999',
    };

    beforeEach(() => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue({ id: 'user-1' });
    });

    it('creates the user with a hashed password, the person profile, the phone and a welcome email', async () => {
      await service.signUp(personInput);

      expect(bcrypt.hash).toHaveBeenCalledWith('test-password', 12);
      expect(usersService.create).toHaveBeenCalledWith({
        type: 'PERSON',
        name: 'Jane Doe',
        email: 'jane@example.com',
        username: 'jane',
        password: 'hashed:test-password',
      });
      expect(personService.create).toHaveBeenCalledWith({ cpf: '12345678901', userId: 'user-1' });
      expect(companyService.create).not.toHaveBeenCalled();
      expect(phoneService.create).toHaveBeenCalledWith({
        number: '+5511999999999',
        userId: 'user-1',
        type: PhoneType.WORK,
        isPrimary: true,
      });
      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: 'jane@example.com',
        subject: 'Bem vindo ao Seleto!',
        template: 'welcome',
        context: { username: 'jane' },
      });
    });

    it('creates the company profile for company accounts', async () => {
      await service.signUp({
        ...personInput,
        type: UserType.COMPANY,
        cpf: undefined,
        cnpj: '12345678000199',
      });

      expect(companyService.create).toHaveBeenCalledWith({
        cnpj: '12345678000199',
        userId: 'user-1',
      });
      expect(personService.create).not.toHaveBeenCalled();
    });

    it('does not create a phone when none is provided', async () => {
      await service.signUp({ ...personInput, phone: '' });

      expect(phoneService.create).not.toHaveBeenCalled();
    });

    it('rejects an email that is already registered and creates nothing', async () => {
      usersService.findByEmail.mockResolvedValue(personUser);

      await expect(service.signUp(personInput)).rejects.toThrow(
        new ConflictException('User already exists'),
      );

      expect(usersService.create).not.toHaveBeenCalled();
      expect(personService.create).not.toHaveBeenCalled();
    });

    it('still succeeds when the welcome email cannot be sent', async () => {
      mailerService.sendMail.mockRejectedValue(new Error('smtp down'));

      await expect(service.signUp(personInput)).resolves.toBeUndefined();

      expect(personService.create).toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('stores a password secret for the user and emails it', async () => {
      usersService.findByEmail.mockResolvedValue(personUser);
      secretService.generateSecret.mockReturnValue('generated-secret');

      await service.forgotPassword('jane@example.com');

      expect(secretService.createSecret).toHaveBeenCalledWith({
        secret: 'generated-secret',
        type: 'PASSWORD',
        userId: 'user-1',
      });
      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: 'jane@example.com',
        subject: 'Solicitação de Redefinição de Senha',
        template: 'password-reset',
        context: { secretKey: 'generated-secret', username: 'jane' },
      });
    });

    it('fails for an unknown email without creating a secret', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.forgotPassword('nobody@example.com')).rejects.toThrow(
        new NotFoundException('User not found'),
      );

      expect(secretService.createSecret).not.toHaveBeenCalled();
      expect(mailerService.sendMail).not.toHaveBeenCalled();
    });
  });

  describe('checkSecretKey', () => {
    it('validates the key as a PASSWORD secret', async () => {
      secretService.validateSecret.mockResolvedValue(true);

      await expect(service.checkSecretKey('secret-123')).resolves.toBe(true);

      expect(secretService.validateSecret).toHaveBeenCalledWith({
        secret: 'secret-123',
        type: 'PASSWORD',
      });
    });

    it('rejects an invalid key', async () => {
      secretService.validateSecret.mockResolvedValue(false);

      await expect(service.checkSecretKey('bad')).rejects.toThrow(
        new UnauthorizedException('Invalid secret key'),
      );
    });
  });

  describe('resetPassword', () => {
    it('stores the hashed password and consumes the secret', async () => {
      secretService.validateSecret.mockResolvedValue(true);

      await service.resetPassword('secret-123', 'new-test-password');

      expect(usersService.updatePasswordBySecret).toHaveBeenCalledWith(
        'secret-123',
        'hashed:new-test-password',
      );
      expect(secretService.deleteSecret).toHaveBeenCalledWith('secret-123');
    });

    it('rejects an invalid key without touching the password', async () => {
      secretService.validateSecret.mockResolvedValue(false);

      await expect(service.resetPassword('bad', 'new-test-password')).rejects.toThrow(
        new UnauthorizedException('Invalid secret key'),
      );

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(usersService.updatePasswordBySecret).not.toHaveBeenCalled();
      expect(secretService.deleteSecret).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('issues a new session for the user in the refresh token', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1' });
      usersService.findById.mockResolvedValue(personUser);
      personService.findByUserId.mockResolvedValue(person);

      const result = await service.refreshToken('old-refresh-token');

      expect(jwtService.verify).toHaveBeenCalledWith('old-refresh-token');
      expect(usersService.findById).toHaveBeenCalledWith('user-1');
      expect(jwtService.sign).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ sub: 'user-1', profileId: 'person-1', companyId: null }),
        { expiresIn: '1h' },
      );
      expect(jwtService.sign).toHaveBeenNthCalledWith(2, expect.anything(), { expiresIn: '7d' });
      expect(result).toEqual({
        accessToken: 'token-1h',
        refreshToken: 'token-7d',
        expiresIn: 3600,
        user: {
          id: 'user-1',
          username: 'jane',
          profileId: 'person-1',
          email: 'jane@example.com',
          type: 'PERSON',
          status: 'ACTIVE',
        },
      });
    });

    it('rejects a token that fails verification', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(service.refreshToken('expired')).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token'),
      );

      expect(usersService.findById).not.toHaveBeenCalled();
    });

    it('rejects a token whose user no longer exists', async () => {
      jwtService.verify.mockReturnValue({ sub: 'ghost' });
      usersService.findById.mockResolvedValue(null);

      await expect(service.refreshToken('orphan')).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token'),
      );

      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('reports a missing profile as an invalid refresh token', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-2' });
      usersService.findById.mockResolvedValue(companyUser);
      companyService.findByUserId.mockResolvedValue(null);

      await expect(service.refreshToken('token')).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token'),
      );
    });
  });

  describe('logout', () => {
    it('completes without side effects for a stateless session', async () => {
      await expect(service.logout('user-1')).resolves.toBeUndefined();

      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
