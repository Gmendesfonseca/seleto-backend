import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/domain/users/user.model';

@Table({
  tableName: 'persons',
  underscored: true,
  paranoid: false,
  timestamps: false,
})
export class Person extends Model<Person> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @Column
  name: string;

  @Column({ type: DataType.STRING, allowNull: true })
  avatar: string | null;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  userId: string;

  @BelongsTo(() => User)
  user: User;
}
