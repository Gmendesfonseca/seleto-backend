import { Column, DataType, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { UserType, UserStatus } from 'src/shared/utils/constants';
import { UserInterface } from './interfaces';
import { Person } from '../persons/models/person.model';
import { Company } from '../companies/models/company.model';

@Table({ tableName: 'users', underscored: true, paranoid: true })
class User extends Model<User> implements UserInterface {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
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

  @Column({ type: DataType.ENUM, values: Object.values(UserType) })
  type: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  isVerified: boolean;

  @HasOne(() => Company)
  company: Company | null;

  @HasOne(() => Person)
  person: Person | null;
}

export { User };
