import { Controller, Delete, Get, Logger, Post, Put } from '@nestjs/common';
import { ApplicationServiceInterface } from './interfaces/application.service.interface';
import { ApplicationFilters } from './interfaces/application.interface';
import { CreateApplicationDto } from './dto/create.dto';
import { UpdateApplicationDto } from './dto/update.dto';

@Controller('applications')
export class ApplicationController {
  private readonly logger = new Logger(ApplicationController.name);

  constructor(private readonly service: ApplicationServiceInterface) {}

  @Get()
  public async list(filters?: ApplicationFilters) {
    this.logger.debug('List: called', { filters });
    return this.service.findAll(filters);
  }

  @Get(':id')
  public async show(id: string) {
    this.logger.debug('Show: called', { id });
    return this.service.findOne(id);
  }

  @Post()
  public async store(dto: CreateApplicationDto) {
    this.logger.debug('Store: called', dto);
    return this.service.create(dto);
  }

  @Put(':id')
  public async update(id: string, dto: UpdateApplicationDto) {
    this.logger.debug('Update: called', { id, dto });
    return this.service.update(id, dto);
  }

  @Delete(':id')
  public async destroy(id: string) {
    this.logger.debug('Destroy: called', { id });
    return this.service.remove(id);
  }
}
