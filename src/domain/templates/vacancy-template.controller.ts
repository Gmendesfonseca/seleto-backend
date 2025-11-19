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
import { VacancyTemplateServiceInterface } from './interfaces/vacancy-template.service.interface';
import {
  CreateVacancyTemplateDto,
  UpdateVacancyTemplateDto,
  VacancyTemplateQueryDto,
} from './dto/vacancy-template.dto';

@Controller('vacancy-templates')
export class VacancyTemplateController {
  private readonly logger = new Logger(VacancyTemplateController.name);

  constructor(private readonly service: VacancyTemplateServiceInterface) {}

  @Get()
  async index(@Query() filters: VacancyTemplateQueryDto) {
    this.logger.debug('VacancyTemplateController.index: Called', { filters });
    return this.service.findAll(filters);
  }

  @Get(':id')
  async show(@Param('id') id: string) {
    this.logger.debug('VacancyTemplateController.show: Called', { id });
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() createVacancyTemplateDto: CreateVacancyTemplateDto) {
    this.logger.debug('VacancyTemplateController.create: Called', { createVacancyTemplateDto });
    return this.service.create(createVacancyTemplateDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateVacancyTemplateDto: UpdateVacancyTemplateDto,
  ) {
    this.logger.debug('VacancyTemplateController.update: Called', { id, updateVacancyTemplateDto });
    return this.service.update(id, updateVacancyTemplateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async destroy(@Param('id') id: string) {
    this.logger.debug('VacancyTemplateController.destroy: Called', { id });
    await this.service.remove(id);
  }

  @Get('company/:companyId')
  async showByCompany(@Param('companyId') companyId: string) {
    this.logger.debug('VacancyTemplateController.showByCompany: Called', { companyId });
    return this.service.findByCompany(companyId);
  }

  @Get('company/:companyId/default')
  async showDefault(@Param('companyId') companyId: string) {
    this.logger.debug('VacancyTemplateController.showDefault: Called', { companyId });
    return this.service.findDefault(companyId);
  }

  @Put(':id/set-default')
  async setAsDefault(@Param('id') id: string) {
    this.logger.debug('VacancyTemplateController.setAsDefault: Called', { id });
    return this.service.setAsDefault(id);
  }
}
