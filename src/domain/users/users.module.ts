import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepositoryInterface } from './interfaces/user.repository.interface';
import { UserSequelizeRepository } from './repositories/user.sequelize.repository';
import { SequelizeModule } from '@nestjs/sequelize';
import { User, Person, Company } from './user.model';
import { UsersServiceInterface } from './interfaces/user.service.interface';
import { MailerModule } from '../mailers/mailer.module';
import { SecretsModule } from '../secret/secret.module';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Person, Company]),
    ConfigModule,
    MailerModule,
    SecretsModule,
  ],
  providers: [
    {
      provide: UsersRepositoryInterface,
      useClass: UserSequelizeRepository,
    },
    {
      provide: UsersServiceInterface,
      useClass: UsersService,
    },
  ],
  controllers: [UsersController],
  exports: [
    {
      provide: UsersServiceInterface,
      useClass: UsersService,
    },
  ],
})
export class UsersModule {}
