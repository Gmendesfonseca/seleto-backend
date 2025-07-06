import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasOne,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { GroupUser, UserStatus } from 'src/shared/utils/constants';
import { UserInterface } from './interfaces';

@Table({ tableName: 'users', underscored: true, paranoid: true })
class User extends Model<User> implements UserInterface {
  @Column({ type: DataType.UUID, primaryKey: true, autoIncrement: true })
  id: string;

  @Column({ unique: true })
  email: string;

  @Column
  password: string;

  @Column({ allowNull: false, unique: true })
  username: string;

  @Column({
    type: DataType.ENUM,
    values: Object.values(UserStatus),
    defaultValue: 'BLOCKED',
  })
  status: string;

  @Column({ type: DataType.ENUM, values: Object.values(GroupUser) })
  type: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  isVerified: boolean;

  @HasOne(() => Company)
  company: Company | null;

  @HasOne(() => Person)
  person: Person | null;
}

@Table({ tableName: 'companies', underscored: true, paranoid: true })
class Company extends Model<Company> {
  @PrimaryKey
  @Column({ type: DataType.UUID })
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

@Table({
  tableName: 'persons',
  underscored: true,
  paranoid: false,
  timestamps: false,
})
class Person extends Model<Person> {
  @PrimaryKey
  @Column({ type: DataType.UUID })
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

export { User, Company, Person };
