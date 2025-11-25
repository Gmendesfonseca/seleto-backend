import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  HasMany,
} from 'sequelize-typescript';
import { Company } from '../companies/company.model';
import { Application } from '../applications/application.model';
import { CandidateVacancyMatch } from '../matching/candidate-vacancy-match.model';
import { VacancyBenefit } from './vacancy-benefit.model';
import { VacancyRequirement } from './vacancy-requirement.model';
import { VacancyResponsibility } from './vacancy-responsibility.model';
import { VacancyResponsible } from './vacancy-responsible.model';
import { VacancyCompetenceRequirement } from '../competences/vacancy-competence-requirement.model';
import { DateTime } from 'luxon';
import { VacancyStep } from './vacancy-step.model';

export enum VacancyStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  PAUSED = 'paused',
  CLOSED = 'closed',
  EXPIRED = 'expired',
}

export enum VacancyType {
  CONTRACT = 'contract',
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  TEMPORARY = 'temporary',
  INTERNSHIP = 'internship',
  APPRENTICESHIP = 'apprenticeship',
}

export enum ContractType {
  CLT = 'clt',
  PJ = 'pj',
  FREELANCE = 'freelance',
  INTERN = 'intern',
  APPRENTICESHIP = 'apprenticeship',
  TEMPORARY = 'temporary',
}

export enum WorkModeType {
  ONSITE = 'onsite',
  REMOTE = 'remote',
  HYBRID = 'hybrid',
}

export enum ExperienceLevel {
  ENTRY = 'entry',
  JUNIOR = 'junior',
  MID = 'mid',
  SENIOR = 'senior',
  LEAD = 'lead',
}

@Table({ tableName: 'vacancies', underscored: true, paranoid: true })
export class Vacancy extends Model<Vacancy> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  title: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  location: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: true, field: 'salary_min' })
  salaryMin: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: true, field: 'salary_max' })
  salaryMax: number;

  @Column({ type: DataType.STRING(3), allowNull: true, defaultValue: 'BRL' })
  currency: string;

  @Column({
    type: DataType.ENUM(...Object.values(VacancyType)),
    allowNull: false,
  })
  type: VacancyType;

  @Column({
    type: DataType.ENUM(...Object.values(ContractType)),
    allowNull: false,
  })
  contract: ContractType;

  @Column({
    type: DataType.ENUM(...Object.values(WorkModeType)),
    allowNull: false,
  })
  work_mode: WorkModeType;

  @Column({
    type: DataType.ENUM(...Object.values(ExperienceLevel)),
    allowNull: false,
  })
  level: ExperienceLevel;

  @Column({
    type: DataType.ENUM(...Object.values(VacancyStatus)),
    allowNull: false,
    defaultValue: VacancyStatus.DRAFT,
  })
  status: VacancyStatus;

  @Column({ type: DataType.DATE, allowNull: true, field: 'publication_date' })
  publicationDate: DateTime;

  @Column({ type: DataType.DATE, allowNull: true, field: 'expiration_date' })
  expirationDate: DateTime;
  @Column({ type: DataType.STRING(100), allowNull: true })
  area: string;

  @ForeignKey(() => Company)
  @Column({ type: DataType.UUID, allowNull: false })
  company_id: string;

  @BelongsTo(() => Company)
  company: Company;

  @HasMany(() => VacancyStep)
  steps: VacancyStep[];

  @HasMany(() => Application, { foreignKey: 'vacancy_id' })
  applications: Application[];

  @HasMany(() => VacancyBenefit, { foreignKey: 'vacancy_id' })
  benefits: VacancyBenefit[];

  @HasMany(() => VacancyRequirement, { foreignKey: 'vacancy_id' })
  requirements: VacancyRequirement[];

  @HasMany(() => VacancyResponsibility, { foreignKey: 'vacancy_id' })
  responsibilities: VacancyResponsibility[];

  @HasMany(() => VacancyResponsible, { foreignKey: 'vacancy_id' })
  responsibles: VacancyResponsible[];

  @HasMany(() => CandidateVacancyMatch, { foreignKey: 'vacancy_id' })
  candidateMatches: CandidateVacancyMatch[];

  @HasMany(() => VacancyCompetenceRequirement, { foreignKey: 'vacancy_id' })
  competence_requirements: VacancyCompetenceRequirement[];

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DateTime.now() })
  created_at: DateTime;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DateTime.now() })
  updated_at: DateTime;

  @Column({ type: DataType.DATE, allowNull: true })
  deleted_at: DateTime;
}
