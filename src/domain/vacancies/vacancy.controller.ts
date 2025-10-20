import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { VacancyService } from './interfaces/vacancy.service.interface';
import { CreateVacancyDto, UpdateVacancyDto, VacancyQueryDto } from './dto/vacancy.dto';

@Controller('vacancies')
export class VacancyController {
  private readonly logger = new Logger(VacancyController.name);

  constructor(private readonly vacancyService: VacancyService) {}

  @Get()
  async findAll(@Query() filters: VacancyQueryDto) {
    this.logger.debug('VacancyController.findAll: Called', { filters });
    return this.vacancyService.findAll(filters);
  }

  @Get('published')
  async findPublished() {
    this.logger.debug('VacancyController.findPublished: Called');
    return this.vacancyService.findPublished();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.debug('VacancyController.findOne: Called', { id });
    return this.vacancyService.findOne(id);
  }

  @Post()
  async create(@Body() createVacancyDto: CreateVacancyDto) {
    this.logger.debug('VacancyController.create: Called', { createVacancyDto });
    return this.vacancyService.create(createVacancyDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateVacancyDto: UpdateVacancyDto) {
    this.logger.debug('VacancyController.update: Called', { id, updateVacancyDto });
    return this.vacancyService.update(id, updateVacancyDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    this.logger.debug('VacancyController.remove: Called', { id });
    await this.vacancyService.remove(id);
  }

  @Put(':id/publish')
  async publish(@Param('id') id: string) {
    this.logger.debug('VacancyController.publish: Called', { id });
    return this.vacancyService.publishVacancy(id);
  }

  @Put(':id/close')
  async close(@Param('id') id: string) {
    this.logger.debug('VacancyController.close: Called', { id });
    return this.vacancyService.closeVacancy(id);
  }

  @Get('company/:companyId')
  async findByCompany(@Param('companyId') companyId: string) {
    this.logger.debug('VacancyController.findByCompany: Called', { companyId });
    return this.vacancyService.findByCompany(companyId);
  }
}
