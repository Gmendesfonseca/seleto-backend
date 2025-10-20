import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RoleController } from './role.controller';
import { Role } from './role.model';
import { Permission } from '../permissions/permission.model';
import { RoleServiceImpl } from './role.service';
import { PermissionServiceImpl } from './permission.service';
import { RoleSequelizeRepository } from './repositories/role.sequelize.repository';
import { PermissionSequelizeRepository } from './repositories/permission.sequelize.repository';
import { RoleRepository, PermissionRepository } from './repositories/role.repository.interface';
import { RoleService, PermissionService } from './interfaces/role.service.interface';

@Module({
  imports: [SequelizeModule.forFeature([Role, Permission])],
  controllers: [RoleController],
  providers: [
    {
      provide: RoleRepository,
      useClass: RoleSequelizeRepository,
    },
    {
      provide: PermissionRepository,
      useClass: PermissionSequelizeRepository,
    },
    {
      provide: RoleService,
      useClass: RoleServiceImpl,
    },
    {
      provide: PermissionService,
      useClass: PermissionServiceImpl,
    },
  ],
  exports: [RoleService, PermissionService],
})
export class RoleModule {}
