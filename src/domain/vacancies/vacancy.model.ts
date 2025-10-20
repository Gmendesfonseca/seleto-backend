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
import { Company } from '../users/user.model';
import { Application } from '../applications/application.model';

export enum VacancyStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  DRAFT = 'draft',
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

  @Column({
    type: DataType.ENUM(...Object.values(VacancyStatus)),
    allowNull: false,
    defaultValue: VacancyStatus.DRAFT,
  })
  status: VacancyStatus;

  @Column({ type: DataType.STRING(100), allowNull: true })
  area: string;

  @ForeignKey(() => Company)
  @Column({ type: DataType.UUID, allowNull: false })
  company_id: string;

  @BelongsTo(() => Company)
  company: Company;

  @HasMany(() => Application, { foreignKey: 'vacancy_id' })
  applications: Application[];

  @Column({ type: DataType.DATE, allowNull: false })
  created_at: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  updated_at: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  deleted_at: Date;
}
