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

export enum DegreeType {
  HIGH_SCHOOL = 'HIGH_SCHOOL',
  TECHNICAL = 'TECHNICAL',
  ASSOCIATE = 'ASSOCIATE',
  BACHELOR = 'BACHELOR',
  MASTER = 'MASTER',
  DOCTORATE = 'DOCTORATE',
  POSTGRADUATE = 'POSTGRADUATE',
  MBA = 'MBA',
  CERTIFICATE = 'CERTIFICATE',
  OTHER = 'OTHER',
}

@Table({ tableName: 'person_formations', underscored: true, paranoid: true })
export class PersonFormation extends Model<PersonFormation> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @ForeignKey(() => Person)
  @Column({ type: DataType.UUID, allowNull: false })
  personId: string;

  @BelongsTo(() => Person)
  person: () => Person;

  @Column({ type: DataType.STRING(255), allowNull: false })
  institutionName: string;

  @Column({
    type: DataType.ENUM(...Object.values(DegreeType)),
    allowNull: false,
  })
  degree: DegreeType;

  @Column({ type: DataType.STRING(255), allowNull: false })
  fieldOfStudy: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string | null;

  @Column({ type: DataType.DATE, allowNull: false })
  startDate: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  endDate: Date | null;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isCurrent: boolean;

  @Column({ type: DataType.DECIMAL(4, 2), allowNull: true })
  grade: number | null;

  @Column({ type: DataType.STRING(255), allowNull: true })
  location: string | null;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: true })
  deletedAt: DateTime | null;
}
