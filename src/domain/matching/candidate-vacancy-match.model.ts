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
  @Column({ type: DataType.UUID, allowNull: false, field: 'person_id' })
  personId: string;

  @BelongsTo(() => Person)
  person: () => Person;

  @ForeignKey(() => Vacancy)
  @Column({ type: DataType.UUID, allowNull: false, field: 'vacancy_id' })
  vacancyId: string;

  @BelongsTo(() => Vacancy)
  vacancy: Vacancy;

  // Match score (0-100)
  @Column({ type: DataType.DECIMAL(5, 2), allowNull: false, field: 'match_score' })
  matchScore: number;

  // Detailed scoring breakdown (JSONB for flexibility)
  @Column({ type: DataType.JSONB, allowNull: true, field: 'score_breakdown' })
  scoreBreakdown: {
    competence_match: number;
    experience_match: number;
    education_match: number;
    location_match: number;
    salary_match: number;
  };

  // Matched competences count
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'matched_competences_count',
  })
  matchedCompetencesCount: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'required_competences_count',
  })
  requiredCompetencesCount: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'total_competences_count',
  })
  totalCompetencesCount: number;

  // Cache timestamp for re-calculation
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'calculated_at',
    defaultValue: DataType.NOW,
  })
  calculatedAt: Date;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  updatedAt: Date;
}
