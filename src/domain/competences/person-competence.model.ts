import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Person } from '../persons/person.model';
import { Competence } from './competence.model';

export enum ProficiencyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

@Table({ tableName: 'person_competences', underscored: true, paranoid: false })
export class PersonCompetence extends Model<PersonCompetence> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @ForeignKey(() => Person)
  @Column({ type: DataType.UUID, allowNull: false })
  person_id: string;

  @BelongsTo(() => Person)
  person: Person;

  @ForeignKey(() => Competence)
  @Column({ type: DataType.UUID, allowNull: false })
  competence_id: string;

  @BelongsTo(() => Competence)
  competence: Competence;

  @Column({
    type: DataType.ENUM(...Object.values(ProficiencyLevel)),
    allowNull: false,
    defaultValue: ProficiencyLevel.INTERMEDIATE,
  })
  proficiency_level: ProficiencyLevel;

  @Column({ type: DataType.INTEGER, allowNull: true })
  years_of_experience: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  // Link to where this competence was acquired (optional)
  @Column({ type: DataType.UUID, allowNull: true })
  source_experience_id: string; // References person_experiences.id

  @Column({ type: DataType.UUID, allowNull: true })
  source_formation_id: string; // References person_formations.id

  @Column({ type: DataType.DATE, allowNull: false })
  created_at: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  updated_at: Date;
}
