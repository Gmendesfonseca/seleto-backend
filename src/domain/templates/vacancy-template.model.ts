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
import { Company } from '../companies/company.model';
import { Step } from '../steps/step.model';

@Table({ tableName: 'vacancy_templates', underscored: true, paranoid: true })
export class VacancyTemplate extends Model<VacancyTemplate> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  name: string;

  @ForeignKey(() => Company)
  @Column({ type: DataType.UUID, allowNull: false })
  company_id: string;

  @BelongsTo(() => Company)
  company: Company;

  @HasMany(() => Step, { foreignKey: 'template_id' })
  steps: Step[];

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_default' })
  is_default: boolean;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' })
  is_active: boolean;

  @Column({ type: DataType.DATE, allowNull: false })
  created_at: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  updated_at: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  deleted_at: Date;
}
