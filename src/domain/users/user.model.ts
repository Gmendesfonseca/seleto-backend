import { HasOne, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { UserInterface } from './interfaces';
import { Person } from '../persons/person.model';
import { Company } from '../companies/company.model';

@Table({ tableName: 'users', underscored: true, paranoid: true })
export class User extends Model<User> implements UserInterface {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  name: string;

  @Column({ type: DataType.STRING(255), allowNull: false, unique: true })
  email: string;

  @Column({ type: DataType.STRING(100), allowNull: false, unique: true })
  username: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  password: string;

  @Column({
    type: DataType.ENUM('ACTIVE', 'BLOCKED'),
    allowNull: false,
    defaultValue: 'BLOCKED',
  })
  status: string;

  @Column({
    type: DataType.ENUM('PERSON', 'COMPANY'),
    allowNull: false,
    defaultValue: 'PERSON',
  })
  type: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  isVerified: boolean;

  @HasOne(() => Person, { foreignKey: 'user_id' })
  person: Person | null;

  @HasOne(() => Company, { foreignKey: 'user_id' })
  company: Company | null;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  deletedAt: Date | null;
}
