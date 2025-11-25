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
import { SecretType } from './interface/secret.interface';
import { DateTime } from 'luxon';
@Table({ tableName: 'secrets', underscored: true, paranoid: true })
export class Secret extends Model<Secret> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  secret: string;

  @Column({
    type: DataType.ENUM('EMAIL', 'PASSWORD'),
    allowNull: true,
  })
  type: SecretType;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: true })
  deletedAt: DateTime | null;
}
