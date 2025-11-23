import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Person } from './person.model';
import { DateTime } from 'luxon';

@Table({ tableName: 'person_experiences', underscored: true, paranoid: true })
export class PersonExperience extends Model<PersonExperience> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @ForeignKey(() => Person)
  @Column({ type: DataType.UUID, allowNull: false })
  personId: string;

  @BelongsTo(() => Person)
  person: Person;

  @Column({ type: DataType.STRING(255), allowNull: false })
  companyName: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  position: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string | null;

  @Column({ type: DataType.DATE, allowNull: false })
  startDate: DateTime;

  @Column({ type: DataType.DATE, allowNull: true })
  endDate: DateTime | null;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isCurrent: boolean;

  @Column({ type: DataType.STRING(255), allowNull: true })
  location: string | null;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: true })
  deletedAt: DateTime | null;
}
