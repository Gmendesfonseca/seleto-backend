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

@Table({ tableName: 'vacancy_requirements', underscored: true, paranoid: false })
export class VacancyRequirement extends Model<VacancyRequirement> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @ForeignKey(() => Vacancy)
  @Column({ type: DataType.UUID, allowNull: false, field: 'vacancy_id' })
  vacancyId: string;

  @BelongsTo(() => Vacancy)
  vacancy: () => Vacancy;

  @Column({ type: DataType.TEXT, allowNull: false })
  requirement: string;

  @Column({ type: DataType.DATE, allowNull: false })
  created_at: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  updated_at: Date;
}
