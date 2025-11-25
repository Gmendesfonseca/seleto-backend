import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { User } from '../../users/user.model';
import { DateTime } from 'luxon';

@Table({ tableName: 'password_reset_tokens', underscored: true, paranoid: false })
export class PasswordResetToken extends Model<PasswordResetToken> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  user_id: string;

  @BelongsTo(() => User)
  user: User;

  @Column({ type: DataType.STRING(500), allowNull: false, unique: true })
  token: string;

  @Column({ type: DataType.DATE, allowNull: false, field: 'expires_at' })
  expiresAt: DateTime;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  used: boolean;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: DateTime;
}
