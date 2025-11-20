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
import { User } from '../users/user.model';

@Table({ tableName: 'vacancy_responsibles', underscored: true, paranoid: false })
export class VacancyResponsible extends Model<VacancyResponsible> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @ForeignKey(() => Vacancy)
  @Column({ type: DataType.UUID, allowNull: false })
  vacancyId: string;

  @BelongsTo(() => Vacancy)
  vacancy: () => Vacancy;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt: Date;
}
