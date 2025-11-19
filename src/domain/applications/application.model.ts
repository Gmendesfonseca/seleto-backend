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

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Table({ tableName: 'applications', underscored: true, paranoid: true })
export class Application extends Model<Application> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @ForeignKey(() => Person)
  @Column({ type: DataType.UUID, allowNull: false })
  applicant_id: string;

  @BelongsTo(() => Person)
  applicant: Person;

  @ForeignKey(() => Vacancy)
  @Column({ type: DataType.UUID, allowNull: false })
  vacancy_id: string;

  @BelongsTo(() => Vacancy)
  vacancy: Vacancy;

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
  created_at: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  updated_at: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  deleted_at: Date;
}
