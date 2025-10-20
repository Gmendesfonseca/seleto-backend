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
import { VacancyTemplateService } from './interfaces/vacancy-template.service.interface';
import {
  CreateVacancyTemplateDto,
  UpdateVacancyTemplateDto,
  VacancyTemplateQueryDto,
} from './dto/vacancy-template.dto';

@Controller('vacancy-templates')
export class VacancyTemplateController {
  private readonly logger = new Logger(VacancyTemplateController.name);

  constructor(private readonly vacancyTemplateService: VacancyTemplateService) {}

  @Get()
  async findAll(@Query() filters: VacancyTemplateQueryDto) {
    this.logger.debug('VacancyTemplateController.findAll: Called', { filters });
    return this.vacancyTemplateService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.debug('VacancyTemplateController.findOne: Called', { id });
    return this.vacancyTemplateService.findOne(id);
  }

  @Post()
  async create(@Body() createVacancyTemplateDto: CreateVacancyTemplateDto) {
    this.logger.debug('VacancyTemplateController.create: Called', { createVacancyTemplateDto });
    return this.vacancyTemplateService.create(createVacancyTemplateDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateVacancyTemplateDto: UpdateVacancyTemplateDto,
  ) {
    this.logger.debug('VacancyTemplateController.update: Called', { id, updateVacancyTemplateDto });
    return this.vacancyTemplateService.update(id, updateVacancyTemplateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    this.logger.debug('VacancyTemplateController.remove: Called', { id });
    await this.vacancyTemplateService.remove(id);
  }

  @Get('company/:companyId')
  async findByCompany(@Param('companyId') companyId: string) {
    this.logger.debug('VacancyTemplateController.findByCompany: Called', { companyId });
    return this.vacancyTemplateService.findByCompany(companyId);
  }

  @Get('company/:companyId/default')
  async findDefault(@Param('companyId') companyId: string) {
    this.logger.debug('VacancyTemplateController.findDefault: Called', { companyId });
    return this.vacancyTemplateService.findDefault(companyId);
  }

  @Put(':id/set-default')
  async setAsDefault(@Param('id') id: string) {
    this.logger.debug('VacancyTemplateController.setAsDefault: Called', { id });
    return this.vacancyTemplateService.setAsDefault(id);
  }
}
