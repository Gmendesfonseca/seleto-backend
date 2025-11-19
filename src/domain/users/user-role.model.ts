import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Role } from '../roles/role.model';

@Table({ tableName: 'user_roles', underscored: true, paranoid: false })
export class UserRole extends Model<UserRole> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Role)
  @Column({ type: DataType.UUID, allowNull: false })
  roleId: string;

  @BelongsTo(() => Role)
  role: Role;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt: Date;
}
