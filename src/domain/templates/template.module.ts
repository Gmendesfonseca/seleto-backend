import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { VacancyTemplate } from './vacancy-template.model';

@Module({
  imports: [SequelizeModule.forFeature([VacancyTemplate])],
})
export class TemplateModule {}
