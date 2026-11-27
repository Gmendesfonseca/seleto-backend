import { Relation } from '../../shared/types/relation';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Company } from '../companies/company.model';
import { DateTime } from 'luxon';

@Table({ tableName: 'competences', underscored: true, paranoid: true })
export class Competence extends Model<Competence> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  name: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string | null;

  // Null for the global catalog; set only on legacy company-owned rows.
  @ForeignKey(() => Company)
  @Column({ type: DataType.UUID, allowNull: true })
  company_id: string | null;

  @BelongsTo(() => Company)
  company: Relation<Company>;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: true })
  deletedAt: DateTime | null;
}
