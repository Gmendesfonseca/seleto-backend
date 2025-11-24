import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { DateTime } from 'luxon';
import { User } from '../users/user.model';

@Table({ tableName: 'addresses', underscored: true, paranoid: true })
export class Address extends Model<Address> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: true })
  userId: string;

  @BelongsTo(() => User)
  user: User;

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
  createdAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: true })
  deletedAt: Date;
}
