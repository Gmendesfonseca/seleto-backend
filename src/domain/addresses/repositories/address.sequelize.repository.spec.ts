import { Address } from '../address.model';
import { AddressSequelizeRepository } from './address.sequelize.repository';

describe('AddressSequelizeRepository', () => {
  const model = {
    create: jest.fn(),
    findAll: jest.fn(),
  };
  const repository = new AddressSequelizeRepository(model as unknown as typeof Address);

  beforeEach(() => jest.clearAllMocks());

  it('persists the owning userId on create', async () => {
    model.create.mockResolvedValue({ id: 'addr-1' });

    await repository.create({
      userId: 'user-1',
      street: 'Main St',
      number: '10',
      city: 'Sao Paulo',
      state: 'SP',
      country: 'BR',
      postalCode: '01000-000',
    });

    expect(model.create).toHaveBeenCalledWith({
      userId: 'user-1',
      street: 'Main St',
      number: '10',
      complement: null,
      city: 'Sao Paulo',
      state: 'SP',
      country: 'BR',
      postalCode: '01000-000',
      isPrimary: false,
    });
  });

  it('filters by userId in findAll and findByUser', async () => {
    model.findAll.mockResolvedValue([]);

    await repository.findAll({ userId: 'user-1', city: 'Rio' });
    await repository.findByUser('user-2');

    expect(model.findAll).toHaveBeenNthCalledWith(1, { where: { userId: 'user-1', city: 'Rio' } });
    expect(model.findAll).toHaveBeenNthCalledWith(2, { where: { userId: 'user-2' } });
  });
});
