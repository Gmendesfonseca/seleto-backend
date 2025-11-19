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
import { Company } from '../companies/company.model';

@Table({ tableName: 'addresses', underscored: true, paranoid: true })
export class Address extends Model<Address> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @ForeignKey(() => Person)
  @Column({ type: DataType.UUID, allowNull: true })
  personId: string | null;

  @BelongsTo(() => Person)
  person: Person | null;

  @ForeignKey(() => Company)
  @Column({ type: DataType.UUID, allowNull: true })
  companyId: string | null;

  @BelongsTo(() => Company)
  company: Company | null;

  @Column({ type: DataType.STRING(255), allowNull: false })
  street: string;

  @Column({ type: DataType.STRING(20), allowNull: false })
  number: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  complement: string | null;

  @Column({ type: DataType.STRING(100), allowNull: false })
  city: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  state: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  country: string;

  @Column({ type: DataType.STRING(20), allowNull: false })
  postalCode: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isPrimary: boolean;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  deletedAt: Date;
}
