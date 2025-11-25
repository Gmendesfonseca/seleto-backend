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

@Table({ tableName: 'refresh_tokens', underscored: true, paranoid: false })
export class RefreshToken extends Model<RefreshToken> {
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

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt: DateTime;
}
