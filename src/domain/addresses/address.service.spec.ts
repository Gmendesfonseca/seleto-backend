import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DateTime } from 'luxon';
import { AddressService } from './address.service';
import { AddressRepository } from './repositories/address.repository.interface';
import { Address } from './interfaces/address.interface';

const makeAddress = (overrides: Partial<Address> = {}): Address => ({
  id: 'addr-1',
  userId: 'user-1',
  street: 'Main St',
  number: '10',
  complement: null,
  city: 'Sao Paulo',
  state: 'SP',
  country: 'BR',
  postalCode: '01000-000',
  isPrimary: false,
  createdAt: DateTime.fromISO('2024-01-01T00:00:00Z'),
  updatedAt: DateTime.fromISO('2024-01-01T00:00:00Z'),
  ...overrides,
});

describe('AddressService', () => {
  let service: AddressService;
  let repository: jest.Mocked<AddressRepository>;

  beforeEach(async () => {
    repository = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByUser: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<AddressRepository>;

    const module = await Test.createTestingModule({
      providers: [AddressService, { provide: AddressRepository, useValue: repository }],
    }).compile();

    service = module.get(AddressService);
  });

  describe('findAll', () => {
    it('wraps the repository result in a paginated envelope and forwards filters', async () => {
      const addresses = [makeAddress(), makeAddress({ id: 'addr-2' })];
      repository.findAll.mockResolvedValue(addresses);

      const result = await service.findAll({ userId: 'user-1', city: 'Sao Paulo' });

      expect(repository.findAll).toHaveBeenCalledWith({ userId: 'user-1', city: 'Sao Paulo' });
      expect(result).toEqual({
        data: addresses,
        meta: { total: 2, currentPage: 1, lastPage: 1, perPage: 2 },
      });
    });
  });

  describe('update', () => {
    it('updates an existing address and returns the repository result', async () => {
      const updated = makeAddress({ street: 'New St' });
      repository.findOne.mockResolvedValue(makeAddress());
      repository.update.mockResolvedValue(updated);

      await expect(service.update('addr-1', { street: 'New St' })).resolves.toBe(updated);
      expect(repository.update).toHaveBeenCalledWith('addr-1', { street: 'New St' });
    });

    it('throws NotFoundException and does not update when the address is missing', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('missing', { street: 'x' })).rejects.toThrow(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes an existing address', async () => {
      repository.findOne.mockResolvedValue(makeAddress());

      await service.remove('addr-1');

      expect(repository.delete).toHaveBeenCalledWith('addr-1');
    });

    it('throws NotFoundException and does not delete when the address is missing', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });

  describe('setPrimary', () => {
    it('unsets the other primary addresses of the same user and marks the target as primary', async () => {
      const target = makeAddress({ id: 'addr-1' });
      const otherPrimary = makeAddress({ id: 'addr-2', isPrimary: true });
      const otherNonPrimary = makeAddress({ id: 'addr-3', isPrimary: false });
      const promoted = makeAddress({ id: 'addr-1', isPrimary: true });
      repository.findOne.mockResolvedValue(target);
      repository.findByUser.mockResolvedValue([target, otherPrimary, otherNonPrimary]);
      repository.update.mockResolvedValue(promoted);

      const result = await service.setPrimary('addr-1');

      expect(repository.findByUser).toHaveBeenCalledWith('user-1');
      expect(repository.update).toHaveBeenCalledTimes(2);
      expect(repository.update).toHaveBeenNthCalledWith(1, 'addr-2', { isPrimary: false });
      expect(repository.update).toHaveBeenNthCalledWith(2, 'addr-1', { isPrimary: true });
      expect(result).toBe(promoted);
    });

    it('throws NotFoundException when the address is missing', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.setPrimary('missing')).rejects.toThrow(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });
});
