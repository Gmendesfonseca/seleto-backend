import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { User } from '../users/user.model';
import { CandidateVacancyMatch } from '../matching/candidate-vacancy-match.model';

@Table({ tableName: 'persons', underscored: true, paranoid: true })
export class Person extends Model<Person> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @Column({ type: DataType.STRING(20), allowNull: false, unique: true })
  cpf: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  user_id: string;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: true })
  deletedAt: Date | null;

  @BelongsTo(() => User)
  user: User;

  @HasMany(() => CandidateVacancyMatch, { foreignKey: 'person_id' })
  vacancy_matches: CandidateVacancyMatch[];
}
