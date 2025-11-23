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

@Table({ tableName: 'person_competences', underscored: true, paranoid: true })
export class PersonCompetence extends Model<PersonCompetence> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @ForeignKey(() => Person)
  @Column({ type: DataType.UUID, allowNull: false })
  personId: string;

  @BelongsTo(() => Person)
  person: Person;

  @Column({ type: DataType.STRING(255), allowNull: false, field: 'competence_name' })
  competenceName: string;

  @Column({ type: DataType.INTEGER, allowNull: false, field: 'proficiency_level' })
  proficiencyLevel: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string | null;

  @Column({ type: DataType.INTEGER, allowNull: false })
  yearsOfExperience: number;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: true })
  deletedAt: DateTime | null;
}
