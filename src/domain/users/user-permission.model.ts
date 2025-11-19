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
import { Permission } from '../permissions/permission.model';

@Table({ tableName: 'user_permissions', underscored: true, paranoid: false })
export class UserPermission extends Model<UserPermission> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Permission)
  @Column({ type: DataType.UUID, allowNull: false })
  permissionId: string;

  @BelongsTo(() => Permission)
  permission: Permission;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt: Date;
}
