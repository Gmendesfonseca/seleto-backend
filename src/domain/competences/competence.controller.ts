import { Controller, Delete, Get, HttpCode, HttpStatus, Logger, Post, Put } from '@nestjs/common';
import { CompetenceServiceInterface } from './interfaces/competence.service.interface';
import { CompetenceCategory, CompetenceFilters } from './interfaces/competence.interface';

@Controller('competences')
export class CompetenceController {
  private readonly logger = new Logger(CompetenceController.name);

  constructor(private readonly service: CompetenceServiceInterface) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  public async list(filters?: CompetenceFilters) {
    this.logger.debug('List: called', { filters });
    return this.service.findAll(filters);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  public async show(id: string) {
    this.logger.debug('Show: called', { id });
    return this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async store(name: string, category: CompetenceCategory) {
    this.logger.debug('Store: called', { name, category });
    return this.service.create({ name, category });
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  public async update(id: string, name: string, category?: CompetenceCategory) {
    this.logger.debug('Update: called', { id, name, category });
    return this.service.update(id, { name, category });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async destroy(id: string) {
    this.logger.debug('Destroy: called', { id });
    await this.service.remove(id);
  }
}
