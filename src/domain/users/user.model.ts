import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { UserInterface } from './interfaces';

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

  @ForeignKey(() => Person)
  @Column({ type: DataType.UUID, allowNull: true })
  person_id: string;

  @ForeignKey(() => Company)
  @Column({ type: DataType.UUID, allowNull: true })
  company_id: string;

  @BelongsTo(() => Person)
  person: Person | null;

  @BelongsTo(() => Company)
  company: Company | null;
}

@Table({ tableName: 'companies', underscored: true, paranoid: true })
export class Company extends Model<Company> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  name: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  address: string | null;
}

@Table({ tableName: 'persons', underscored: true, paranoid: true })
export class Person extends Model<Person> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  name: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  address: string | null;
}
