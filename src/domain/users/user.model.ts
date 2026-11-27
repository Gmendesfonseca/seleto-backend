import { Relation } from '../../shared/types/relation';
import { Column, DataType, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { UserInterface } from './interfaces';
import { DateTime } from 'luxon';
import { Phone } from '../phones/phone.model';
import { Address } from '../addresses/address.model';

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

  @HasOne(() => Phone, { foreignKey: 'user_id' })
  phone: Relation<Phone>;

  @HasOne(() => Address, { foreignKey: 'user_id' })
  address: Relation<Address>;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  isVerified: boolean;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: true })
  deletedAt: DateTime | null;
}
