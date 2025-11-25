import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  PrimaryKey,
} from 'sequelize-typescript';
import { Person } from '../persons/person.model';
import { Vacancy } from '../vacancies/vacancy.model';
import { ApplicationStatus } from './interfaces/application.interface';
import { DateTime } from 'luxon';

@Table({ tableName: 'applications', underscored: true, paranoid: true })
export class Application extends Model<Application> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @ForeignKey(() => Person)
  @Column({ type: DataType.UUID, allowNull: false, field: 'applicant_id' })
  applicantId: string;

  @BelongsTo(() => Person)
  applicant: () => Person;

  @ForeignKey(() => Vacancy)
  @Column({ type: DataType.UUID, allowNull: false, field: 'vacancy_id' })
  vacancyId: string;

  @BelongsTo(() => Vacancy)
  vacancy: () => Vacancy;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    comment: 'File path or URL to the resume',
  })
  resume: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  cover_letter: string;

  @Column({
    type: DataType.ENUM(...Object.values(ApplicationStatus)),
    allowNull: false,
    defaultValue: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: true })
  deletedAt: DateTime;
}
