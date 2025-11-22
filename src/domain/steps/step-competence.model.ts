import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Step } from './step.model';
import { Competence } from '../competences/competence.model';

@Table({ tableName: 'step_competences', underscored: true, paranoid: false })
export class StepCompetence extends Model<StepCompetence> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @ForeignKey(() => Step)
  @Column({ type: DataType.UUID, allowNull: false })
  stepId: string;

  @BelongsTo(() => Step)
  step: Step;

  @ForeignKey(() => Competence)
  @Column({ type: DataType.UUID, allowNull: false })
  competenceId: string;

  @BelongsTo(() => Competence)
  competence: Competence;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt: DateTime;
}
