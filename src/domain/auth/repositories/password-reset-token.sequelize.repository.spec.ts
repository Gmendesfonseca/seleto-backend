import { DateTime } from 'luxon';
import { PasswordResetTokenSequelizeRepository } from './password-reset-token.sequelize.repository';
import { PasswordResetToken } from '../models/password-reset-token.model';

describe('PasswordResetTokenSequelizeRepository', () => {
  const model = {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn(),
  };
  let repository: PasswordResetTokenSequelizeRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new PasswordResetTokenSequelizeRepository(
      model as unknown as typeof PasswordResetToken,
    );
  });

  it('persists an unused token with a JS date expiry and the owner in user_id', async () => {
    const expiresAt = DateTime.fromISO('2030-01-01T00:00:00Z');
    model.create.mockResolvedValue({ id: 't-1' });

    await repository.create('user-1', 'token-value', expiresAt);

    expect(model.create).toHaveBeenCalledWith({
      user_id: 'user-1',
      token: 'token-value',
      expiresAt: expiresAt.toJSDate(),
      used: false,
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

  it('marks an existing token as used', async () => {
    const update = jest.fn();
    model.findByPk.mockResolvedValue({ update });

    await repository.markAsUsed('t-1');

    expect(update).toHaveBeenCalledWith({ used: true });
  });

  it('does nothing when marking an unknown token as used', async () => {
    model.findByPk.mockResolvedValue(null);

    await expect(repository.markAsUsed('missing')).resolves.toBeUndefined();
  });

  it('treats a token as valid only when an unused, non-expired row exists', async () => {
    model.findOne.mockResolvedValueOnce({ id: 't-1' }).mockResolvedValueOnce(null);

    await expect(repository.isTokenValid('live')).resolves.toBe(true);
    await expect(repository.isTokenValid('gone')).resolves.toBe(false);

    const { where } = model.findOne.mock.calls[0][0];
    expect(where).toMatchObject({ token: 'live', used: false });
  });
});
