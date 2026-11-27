import { VacancyStepSequelizeRepository } from './vacancy-step.sequelize.repository';
import { VacancyStep } from '../vacancy-step.model';

describe('VacancyStepSequelizeRepository', () => {
  it('lists the steps of a vacancy ordered by their position', async () => {
    const steps = [{ id: 'a' }, { id: 'b' }] as VacancyStep[];
    const model = { findAll: jest.fn().mockResolvedValue(steps) };
    const repository = new VacancyStepSequelizeRepository(model as unknown as typeof VacancyStep);

    const result = await repository.findByVacancyId('vacancy-1');

    expect(model.findAll).toHaveBeenCalledWith({
      where: { vacancyId: 'vacancy-1' },
      order: [['order', 'ASC']],
    });
    expect(result).toBe(steps);
  });
});
