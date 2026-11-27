import { NotFoundException } from '@nestjs/common';
import { VacancyRepository } from './interfaces/vacancy.repository.interface';

// A vacancy of another company answers 404 so its existence is not disclosed.
export async function assertVacancyBelongsTo(
  vacancies: VacancyRepository,
  vacancyId: string,
  companyId: string | null,
): Promise<void> {
  const vacancy = await vacancies.findOne(vacancyId);
  if (!vacancy || !companyId || vacancy.company_id !== companyId) {
    throw new NotFoundException('Vacancy not found');
  }
}
