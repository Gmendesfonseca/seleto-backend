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
import { Vacancy } from '../vacancies/vacancy.model';
import { Competence } from './competence.model';
import { DateTime } from 'luxon';

export enum RequirementPriority {
  REQUIRED = 'required',
  PREFERRED = 'preferred',
  NICE_TO_HAVE = 'nice_to_have',
}

@Table({ tableName: 'vacancy_competence_requirements', underscored: true, paranoid: false })
export class VacancyCompetenceRequirement extends Model<VacancyCompetenceRequirement> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @ForeignKey(() => Vacancy)
  @Column({ type: DataType.UUID, allowNull: false })
  vacancy_id: string;

  @BelongsTo(() => Vacancy)
  vacancy: () => Vacancy;

  @ForeignKey(() => Competence)
  @Column({ type: DataType.UUID, allowNull: false })
  competence_id: string;

  @BelongsTo(() => Competence)
  competence: Relation<Competence>;

  @Column({
    type: DataType.ENUM(...Object.values(RequirementPriority)),
    allowNull: false,
    defaultValue: RequirementPriority.PREFERRED,
  })
  priority: RequirementPriority;

  @Column({ type: DataType.INTEGER, allowNull: true })
  minimum_years_experience: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  weight: number; // For matching algorithm (0-100)

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt: DateTime;
}
