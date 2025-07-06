import { Column, DataType, Table, Model } from 'sequelize-typescript';
import { SecretInterface, SecretType } from './interface/secret.interface';

@Table({ tableName: 'secrets', underscored: true, paranoid: true })
export class Secret extends Model<Secret> implements SecretInterface {
  @Column({ type: DataType.UUID, primaryKey: true, autoIncrement: true })
  id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  secret: string;

  @Column({ type: DataType.ENUM, values: ['EMAIL', 'PASSWORD'] })
  type: SecretType;

  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  @Column({ type: DataType.NUMBER, allowNull: false })
  createdAt: number;

  @Column({ type: DataType.NUMBER, allowNull: false })
  deletedAt: number;
}
