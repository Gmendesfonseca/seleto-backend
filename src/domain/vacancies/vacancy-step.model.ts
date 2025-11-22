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

@Table({ tableName: 'vacancy_steps', underscored: true, paranoid: false })
export class VacancyStep extends Model<VacancyStep> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @ForeignKey(() => Vacancy)
  @Column({ type: DataType.UUID, allowNull: false })
  vacancyId: string;

  @BelongsTo(() => Vacancy)
  vacancy: () => Vacancy;

  @ForeignKey(() => Step)
  @Column({ type: DataType.UUID, allowNull: false })
  stepId: string;

  @BelongsTo(() => Step)
  step: Step;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  order: number;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt: Date;
}
