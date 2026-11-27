import { Relation } from '../../shared/types/relation';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Company } from '../companies/company.model';
import { DateTime } from 'luxon';
import { VacancyTemplate } from '../templates/vacancy-template.model';

export const StepType = {
  APPLICATION: 'application',
  SCREENING: 'screening',
  INTERVIEW: 'interview',
  TECHNICAL_TEST: 'technical_test',
  BACKGROUND_CHECK: 'background_check',
  OFFER: 'offer',
  ONBOARDING: 'onboarding',
  CUSTOM: 'custom',
} as const;
export type StepType = (typeof StepType)[keyof typeof StepType];

@Table({ tableName: 'steps', underscored: true, paranoid: true })
export class Step extends Model<Step> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  name: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string | null;

  @Column({ type: DataType.ENUM(...Object.values(StepType)), allowNull: false })
  type: StepType;

  @Column({ type: DataType.STRING, allowNull: false })
  estimatedDuration: string;

  @ForeignKey(() => VacancyTemplate)
  @Column({ type: DataType.STRING, allowNull: true })
  template_id: string | null;

  @ForeignKey(() => Company)
  @Column({ type: DataType.UUID, allowNull: false })
  company_id: string;

  @BelongsTo(() => Company)
  company: Relation<Company>;

  @BelongsTo(() => VacancyTemplate)
  template: Relation<VacancyTemplate>;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  createdAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  updatedAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: true })
  deletedAt: DateTime;
}
