import { Column, DataType, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Competence } from './competence.model';
import { DateTime } from 'luxon';

export enum CompetenceCategoryType {
  TECHNICAL_SKILL = 'technical_skill',
  SOFT_SKILL = 'soft_skill',
  LANGUAGE = 'language',
  CERTIFICATION = 'certification',
  TOOL = 'tool',
  FRAMEWORK = 'framework',
  METHODOLOGY = 'methodology',
  DOMAIN_KNOWLEDGE = 'domain_knowledge',
}

@Table({ tableName: 'competence_categories', underscored: true, paranoid: false })
export class CompetenceCategory extends Model<CompetenceCategory> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @Column({ type: DataType.STRING(100), allowNull: false, unique: true })
  name: string;

  @Column({
    type: DataType.ENUM(...Object.values(CompetenceCategoryType)),
    allowNull: false,
  })
  type: CompetenceCategoryType;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @HasMany(() => Competence, { foreignKey: 'category_id' })
  competences: Competence[];

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt: DateTime;
}
