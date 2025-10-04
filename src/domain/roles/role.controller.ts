import { Controller, Delete, Get, Logger, Post, Put } from '@nestjs/common';
import { RoleService } from './interfaces/role.service.interface';
import { RoleFilters } from './interfaces/role.interface';
import { CreateRoleDto } from './dto/role.dto';

@Controller('roles')
export class RoleController {
  private readonly logger = new Logger(RoleController.name);

  constructor(private readonly service: RoleService) {}

  @Get()
  public async list(filters?: RoleFilters) {
    this.logger.debug('List: called', { filters });
    return this.service.findAll(filters);
  }

  @Get(':id')
  public async show(id: string) {
    this.logger.debug('Show: called', { id });
    return this.service.findOne(id);
  }

  @Post()
  public async store(dto: CreateRoleDto) {
    this.logger.debug('Store: called', { dto });
    return this.service.create(dto);
  }

  @Put(':id')
  public async update(id: string, name: string) {
    this.logger.debug('Update: called', { id, name });
    return this.service.update(id, { name });
  }

  @Delete(':id')
  public async destroy(id: string) {
    this.logger.debug('Destroy: called', { id });
    return this.service.remove(id);
  }
}
