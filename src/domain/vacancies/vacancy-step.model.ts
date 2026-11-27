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
import { Vacancy } from './vacancy.model';
import { Step } from '../steps/step.model';
import { DateTime } from 'luxon';

@Table({ tableName: 'vacancy_steps', underscored: true, paranoid: false })
export class VacancyStep extends Model<VacancyStep> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @ForeignKey(() => Vacancy)
  @Column({ type: DataType.UUID, allowNull: false, field: 'vacancy_id' })
  vacancyId: string;

  @BelongsTo(() => Vacancy)
  vacancy: () => Vacancy;

  @ForeignKey(() => Step)
  @Column({ type: DataType.UUID, allowNull: false, field: 'step_id' })
  stepId: string;

  @BelongsTo(() => Step)
  step: Relation<Step>;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  order: number;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt: DateTime;
}
