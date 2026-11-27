import { Op } from 'sequelize';
import { Company } from '../company.model';
import { CompanySequelizeRepository } from './company.sequelize.repository';

describe('CompanySequelizeRepository.findAll', () => {
  const model = { findAndCountAll: jest.fn() };
  const repository = new CompanySequelizeRepository(model as unknown as typeof Company);
  const rows = [{ id: 'c1' }, { id: 'c2' }];

  beforeEach(() => {
    jest.clearAllMocks();
    model.findAndCountAll.mockResolvedValue({ rows, count: 25 });
  });

  it('returns the rows with pagination meta and offsets by page', async () => {
    const result = await repository.findAll({ page: 3, perPage: 10 });

    expect(model.findAndCountAll).toHaveBeenCalledWith({ where: {}, limit: 10, offset: 20 });
    expect(result).toEqual({
      data: rows,
      meta: { total: 25, currentPage: 3, perPage: 10, lastPage: 3 },
    });
  });

  it('defaults to the first page of 10 and accepts numeric strings from the query string', async () => {
    await repository.findAll({});
    await repository.findAll({ page: '2', perPage: '5' } as never);

    expect(model.findAndCountAll).toHaveBeenNthCalledWith(1, { where: {}, limit: 10, offset: 0 });
    expect(model.findAndCountAll).toHaveBeenNthCalledWith(2, { where: {}, limit: 5, offset: 5 });
  });

  it('filters by cnpj prefix when a search term is given', async () => {
    await repository.findAll({ page: 1, perPage: 10 }, { search: '123' });

    expect(model.findAndCountAll).toHaveBeenCalledWith({
      where: { cnpj: { [Op.like]: '123%' } },
      limit: 10,
      offset: 0,
    });
  });
});
