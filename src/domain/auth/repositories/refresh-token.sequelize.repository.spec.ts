import { RefreshTokenSequelizeRepository } from './refresh-token.sequelize.repository';
import { RefreshToken } from '../models/refresh-token.model';

describe('RefreshTokenSequelizeRepository', () => {
  const model = {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn(),
  };
  let repository: RefreshTokenSequelizeRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new RefreshTokenSequelizeRepository(model as unknown as typeof RefreshToken);
  });

  it('persists the owner in the user_id column', async () => {
    const expiresAt = new Date('2030-01-01T00:00:00Z');
    model.create.mockResolvedValue({ id: 't-1' });

    await repository.create('user-1', 'token-value', expiresAt);

    expect(model.create).toHaveBeenCalledWith({
      user_id: 'user-1',
      token: 'token-value',
      expiresAt,
    });
  });

  it('finds the tokens of a user through the user_id column', async () => {
    model.findAll.mockResolvedValue([]);

    await repository.findByUserId('user-1');

    expect(model.findAll).toHaveBeenCalledWith({ where: { user_id: 'user-1' } });
  });

  it('deletes the tokens of a user through the user_id column', async () => {
    await repository.deleteByUserId('user-1');

    expect(model.destroy).toHaveBeenCalledWith({ where: { user_id: 'user-1' } });
  });

  it('treats a token as valid only when a non-expired row exists', async () => {
    model.findOne.mockResolvedValueOnce({ id: 't-1' }).mockResolvedValueOnce(null);

    await expect(repository.isTokenValid('live')).resolves.toBe(true);
    await expect(repository.isTokenValid('gone')).resolves.toBe(false);

    const { where } = model.findOne.mock.calls[0][0];
    expect(where.token).toBe('live');
    expect(Object.getOwnPropertySymbols(where.expiresAt)).toHaveLength(1);
  });
});
