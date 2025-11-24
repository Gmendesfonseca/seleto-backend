import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { User } from '../users/user.model';
import { DateTime } from 'luxon';

export enum PhoneType {
  MOBILE = 'mobile',
  HOME = 'home',
  WORK = 'work',
}

@Table({ tableName: 'phones', underscored: true, paranoid: true })
export class Phone extends Model<Phone> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false, field: 'user_id' })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  @Column({ type: DataType.STRING(20), allowNull: false })
  number: string;

  @Column({
    type: DataType.ENUM,
    values: Object.values(PhoneType),
    allowNull: false,
    defaultValue: PhoneType.MOBILE,
  })
  type: PhoneType;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isPrimary: boolean;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: true })
  deletedAt: Date;
}
