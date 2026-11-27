import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { UsersService } from './users.service';
import { UserRepositoryInterface } from './interfaces';
import { User } from './user.model';
import { SecretServiceInterface } from '../secret/interface/secret.service.interface';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UserRepositoryInterface>;
  let configService: { get: jest.Mock };
  let mailerService: { sendMail: jest.Mock };
  let secretService: jest.Mocked<SecretServiceInterface>;

  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'John Doe',
    username: 'johndoe',
    email: 'john.doe@example.com',
    password: 'hashedPassword123',
    status: 'ACTIVE',
    type: 'PERSON',
  } as User;

  beforeEach(async () => {
    configService = { get: jest.fn() };
    mailerService = { sendMail: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepositoryInterface,
          useValue: {
            findOne: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        { provide: ConfigService, useValue: configService },
        { provide: MailerService, useValue: mailerService },
        {
          provide: SecretServiceInterface,
          useValue: {
            generateSecret: jest.fn(),
            createSecret: jest.fn(),
            validateSecret: jest.fn(),
            deleteSecret: jest.fn(),
            getUserIdBySecret: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(UsersService);
    repository = module.get(UserRepositoryInterface);
    secretService = module.get(SecretServiceInterface);
  });

  describe('lookups', () => {
    it('findById queries the repository by id', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      await expect(service.findById(mockUser.id)).resolves.toBe(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({ id: mockUser.id });
    });

    it('findById returns null for an unknown id', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findById('missing')).resolves.toBeNull();
    });

    it('findByEmail queries the repository by email', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      await expect(service.findByEmail(mockUser.email)).resolves.toBe(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({ email: mockUser.email });
    });

    it('findByCredentials queries by email and password together', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      await service.findByCredentials({ email: mockUser.email, password: 'hashed' });

      expect(repository.findOne).toHaveBeenCalledWith({
        email: mockUser.email,
        password: 'hashed',
      });
    });

    it('findAll forwards the filters and returns users with total', async () => {
      const page = { users: [mockUser], total: 1 };
      repository.findAll.mockResolvedValue(page);

      await expect(service.findAll({ status: 'ACTIVE', page: 2, limit: 5 })).resolves.toBe(page);
      expect(repository.findAll).toHaveBeenCalledWith({ status: 'ACTIVE', page: 2, limit: 5 });
    });
  });

  describe('activate', () => {
    it('sets the user status to ACTIVE', async () => {
      await service.activate({ id: mockUser.id, secret: 's' });

      expect(repository.update).toHaveBeenCalledWith(mockUser.id, { status: 'ACTIVE' });
    });
  });

  describe('updateUsername', () => {
    it('updates the username of an existing user', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      await service.updateUsername({ id: mockUser.id, username: 'newname' });

      expect(repository.update).toHaveBeenCalledWith(mockUser.id, { username: 'newname' });
    });

    it('throws NotFoundException and does not update when the user is missing', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.updateUsername({ id: 'missing', username: 'x' })).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('updatePasswordBySecret', () => {
    it('resolves the user from the PASSWORD secret and stores the hashed password', async () => {
      secretService.getUserIdBySecret.mockResolvedValue(mockUser.id);

      await service.updatePasswordBySecret('secret-key', 'new-hash');

      expect(secretService.getUserIdBySecret).toHaveBeenCalledWith('secret-key', 'PASSWORD');
      expect(repository.update).toHaveBeenCalledWith(mockUser.id, { password: 'new-hash' });
    });

    it('throws UnauthorizedException and changes nothing when the secret is unknown', async () => {
      secretService.getUserIdBySecret.mockResolvedValue(null);

      await expect(service.updatePasswordBySecret('bad', 'new-hash')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('drops undefined fields before updating', async () => {
      const updated = { ...mockUser, username: 'renamed' } as User;
      repository.findOne.mockResolvedValue(mockUser);
      repository.update.mockResolvedValue(updated);

      const result = await service.update(mockUser.id, { username: 'renamed', email: undefined });

      expect(repository.update).toHaveBeenCalledWith(mockUser.id, { username: 'renamed' });
      expect(result).toBe(updated);
    });

    it('returns the user unchanged when there is nothing to update', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      await expect(service.update(mockUser.id, { username: undefined })).resolves.toBe(mockUser);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the user is missing', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('missing', { username: 'x' })).rejects.toThrow(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('requestChangeEmail', () => {
    it('stores an EMAIL secret and mails a confirmation link to the new address', async () => {
      repository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(mockUser);
      secretService.generateSecret.mockReturnValue('generated-secret');
      configService.get.mockReturnValue('https://front.test');

      await service.requestChangeEmail({ id: mockUser.id, email: 'new@example.com' });

      expect(repository.findOne).toHaveBeenNthCalledWith(1, { email: 'new@example.com' });
      expect(repository.findOne).toHaveBeenNthCalledWith(2, { id: mockUser.id });
      expect(secretService.createSecret).toHaveBeenCalledWith({
        secret: 'generated-secret',
        type: 'EMAIL',
        userId: mockUser.id,
      });
      expect(configService.get).toHaveBeenCalledWith('FRONT_URL');
      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: 'new@example.com',
        subject: 'Change your email',
        template: './change-email',
        context: { link: 'https://front.test/change-email/generated-secret' },
      });
    });

    it('rejects an email that is already in use without creating a secret', async () => {
      repository.findOne.mockResolvedValueOnce(mockUser);

      await expect(
        service.requestChangeEmail({ id: mockUser.id, email: mockUser.email }),
      ).rejects.toThrow('Email already in use');
      expect(secretService.createSecret).not.toHaveBeenCalled();
      expect(mailerService.sendMail).not.toHaveBeenCalled();
    });

    it('rejects an unknown user without creating a secret', async () => {
      repository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

      await expect(
        service.requestChangeEmail({ id: 'missing', email: 'new@example.com' }),
      ).rejects.toThrow('User not found');
      expect(secretService.createSecret).not.toHaveBeenCalled();
    });
  });

  describe('changeEmail', () => {
    it('updates the email and consumes the secret when it is valid', async () => {
      secretService.validateSecret.mockResolvedValue(true);

      await service.changeEmail({ id: mockUser.id, secret: 's', email: 'new@example.com' });

      expect(secretService.validateSecret).toHaveBeenCalledWith({ secret: 's', type: 'EMAIL' });
      expect(repository.update).toHaveBeenCalledWith(mockUser.id, { email: 'new@example.com' });
      expect(secretService.deleteSecret).toHaveBeenCalledWith('s');
    });

    it('throws UnauthorizedException and changes nothing when the secret is invalid', async () => {
      secretService.validateSecret.mockResolvedValue(false);

      await expect(
        service.changeEmail({ id: mockUser.id, secret: 'bad', email: 'new@example.com' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(repository.update).not.toHaveBeenCalled();
      expect(secretService.deleteSecret).not.toHaveBeenCalled();
    });

    it('keeps the secret and reports a generic failure when the update fails', async () => {
      secretService.validateSecret.mockResolvedValue(true);
      repository.update.mockRejectedValue(new Error('unique violation'));

      await expect(
        service.changeEmail({ id: mockUser.id, secret: 's', email: 'new@example.com' }),
      ).rejects.toThrow('Failed to update email');
      expect(secretService.deleteSecret).not.toHaveBeenCalled();
    });
  });

  describe('create and delete', () => {
    it('create forwards the input to the repository', async () => {
      const input = {
        email: 'a@b.com',
        password: 'hash',
        username: 'ab',
        name: 'A B',
        type: 'PERSON',
      };
      repository.create.mockResolvedValue(mockUser);

      await expect(service.create(input)).resolves.toBe(mockUser);
      expect(repository.create).toHaveBeenCalledWith(input);
    });

    it('delete removes the user by id', async () => {
      await service.delete(mockUser.id);

      expect(repository.delete).toHaveBeenCalledWith(mockUser.id);
    });
  });
});
