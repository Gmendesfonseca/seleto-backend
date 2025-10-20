import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Permission } from './permission.model';

@Module({
  imports: [SequelizeModule.forFeature([Permission])],
})
export class PermissionModule {}
