import { BelongsTo, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { User } from '../users/user.model';

@Table({ tableName: 'companies', underscored: true, paranoid: true })
export class Company extends Model<Company> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @Column({ type: DataType.STRING(20), allowNull: false, unique: true })
  cnpj: string;

  @Column({ type: DataType.UUID, allowNull: false })
  user_id: string;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  deletedAt: Date | null;

  @BelongsTo(() => User)
  user: User;
}
