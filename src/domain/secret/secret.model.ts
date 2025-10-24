import { Column, DataType, Table, Model } from 'sequelize-typescript';
import { SecretInterface, SecretType } from './interface/secret.interface';

@Table({ tableName: 'secrets', underscored: true, paranoid: true })
export class Secret extends Model<Secret> implements SecretInterface {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  secret: string;

  @Column({
    type: DataType.ENUM,
    values: ['EMAIL', 'PASSWORD'],
    allowNull: true,
  })
  type: SecretType;

  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  deletedAt: Date;
}
