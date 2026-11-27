import { Relation } from '../../shared/types/relation';
import { DateTime } from 'luxon';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Role } from './role.model';
import { Permission } from '../permissions/permission.model';

@Table({ tableName: 'role_permissions', underscored: true, paranoid: false })
export class RolePermission extends Model<RolePermission> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @ForeignKey(() => Role)
  @Column({ type: DataType.UUID, allowNull: false })
  roleId: string;

  @BelongsTo(() => Role)
  role: Relation<Role>;

  @ForeignKey(() => Permission)
  @Column({ type: DataType.UUID, allowNull: false })
  permissionId: string;

  @BelongsTo(() => Permission)
  permission: Relation<Permission>;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: DateTime;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt: DateTime;
}
