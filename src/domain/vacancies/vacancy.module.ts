import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Vacancy } from './vacancy.model';

@Module({
  imports: [SequelizeModule.forFeature([Vacancy])],
})
export class VacancyModule {}
