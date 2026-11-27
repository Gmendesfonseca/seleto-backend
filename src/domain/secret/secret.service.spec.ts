import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { SecretService } from './secret.service';
import { Secret } from './secret.model';

describe('SecretService', () => {
  let service: SecretService;

  const secretModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecretService, { provide: getModelToken(Secret), useValue: secretModel }],
    }).compile();

    service = module.get(SecretService);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('generateSecret', () => {
    it('returns a different url-safe value on every call', () => {
      const values = new Set(Array.from({ length: 50 }, () => service.generateSecret()));

      expect(values.size).toBe(50);
      values.forEach((value) => expect(value).toMatch(/^[a-z0-9]{20,}$/));
    });

    it('does not rely on Math.random', () => {
      const random = jest.spyOn(Math, 'random');

      service.generateSecret();

      expect(random).not.toHaveBeenCalled();
    });
  });

  describe('validateSecret', () => {
    it('looks the secret up by value and type', async () => {
      secretModel.findOne.mockResolvedValue({ id: 's-1' });

      await expect(service.validateSecret({ secret: 'abc', type: 'PASSWORD' })).resolves.toBe(true);

      expect(secretModel.findOne).toHaveBeenCalledWith({
        where: { secret: 'abc', type: 'PASSWORD' },
      });
    });

    it('returns false when no secret of that type exists', async () => {
      secretModel.findOne.mockResolvedValue(null);

      await expect(service.validateSecret({ secret: 'abc', type: 'EMAIL' })).resolves.toBe(false);
    });
  });

  describe('createSecret', () => {
    it('persists the secret with its type and owner', async () => {
      await service.createSecret({ secret: 'abc', type: 'PASSWORD', userId: 'user-1' });

      expect(secretModel.create).toHaveBeenCalledWith({
        secret: 'abc',
        type: 'PASSWORD',
        userId: 'user-1',
      });
    });
  });

  describe('deleteSecret', () => {
    it('destroys the secret by value', async () => {
      await service.deleteSecret('abc');

      expect(secretModel.destroy).toHaveBeenCalledWith({ where: { secret: 'abc' } });
    });
  });

  describe('getUserIdBySecret', () => {
    it('returns the owner of a matching secret', async () => {
      secretModel.findOne.mockResolvedValue({ userId: 'user-1' });

      await expect(service.getUserIdBySecret('abc', 'EMAIL')).resolves.toBe('user-1');

      expect(secretModel.findOne).toHaveBeenCalledWith({
        where: { secret: 'abc', type: 'EMAIL' },
      });
    });

    it('returns null when the secret is unknown', async () => {
      secretModel.findOne.mockResolvedValue(null);

      await expect(service.getUserIdBySecret('abc', 'EMAIL')).resolves.toBeNull();
    });
  });
});
