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
import { Vacancy } from '../vacancies/vacancy.model';

@Table({ tableName: 'candidate_vacancy_matches', underscored: true, paranoid: false })
export class CandidateVacancyMatch extends Model<CandidateVacancyMatch> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @ForeignKey(() => Person)
  @Column({ type: DataType.UUID, allowNull: false })
  person_id: string;

  @BelongsTo(() => Person)
  person: Person;

  @ForeignKey(() => Vacancy)
  @Column({ type: DataType.UUID, allowNull: false })
  vacancy_id: string;

  @BelongsTo(() => Vacancy)
  vacancy: Vacancy;

  // Match score (0-100)
  @Column({ type: DataType.DECIMAL(5, 2), allowNull: false })
  match_score: number;

  // Detailed scoring breakdown (JSONB for flexibility)
  @Column({ type: DataType.JSONB, allowNull: true })
  score_breakdown: {
    competence_match: number;
    experience_match: number;
    education_match: number;
    location_match: number;
    salary_match: number;
  };

  // Matched competences count
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  matched_competences_count: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  required_competences_count: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  total_competences_count: number;

  // Cache timestamp for re-calculation
  @Column({ type: DataType.DATE, allowNull: false })
  calculated_at: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  created_at: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  updated_at: Date;
}
