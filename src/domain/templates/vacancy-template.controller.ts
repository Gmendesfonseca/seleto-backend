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
  Req,
} from '@nestjs/common';
import { VacancyTemplateServiceInterface } from './interfaces/vacancy-template.service.interface';
import {
  CreateVacancyTemplateDto,
  UpdateVacancyTemplateDto,
  VacancyTemplateQueryDto,
} from './dto/vacancy-template.dto';
import { RequestWithCompany } from 'src/shared/middlewares/company-context.middleware';

@Controller('vacancy-templates')
export class VacancyTemplateController {
  private readonly logger = new Logger(VacancyTemplateController.name);

  constructor(private readonly service: VacancyTemplateServiceInterface) {}

  @Get()
  async index(@Query() filters: VacancyTemplateQueryDto, @Req() request: RequestWithCompany) {
    this.logger.debug('Index: Called', { filters });
    return this.service.findAll({ ...filters, companyId: request.companyId });
  }

  @Get(':id')
  async show(@Param('id') id: string) {
    this.logger.debug('Show: Called', { id });
    return this.service.findOne(id);
  }

  @Post()
  async store(@Body() dto: CreateVacancyTemplateDto) {
    this.logger.debug('Store: Called', { dto });
    return this.service.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateVacancyTemplateDto: UpdateVacancyTemplateDto,
  ) {
    this.logger.debug('Update: Called', { id, updateVacancyTemplateDto });
    return this.service.update(id, updateVacancyTemplateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async destroy(@Param('id') id: string) {
    this.logger.debug('Destroy: Called', { id });
    await this.service.remove(id);
  }

  @Get('company/:companyId')
  async showByCompany(@Param('companyId') companyId: string) {
    this.logger.debug('ShowByCompany: Called', { companyId });
    return this.service.findByCompany(companyId);
  }

  @Get('company/:companyId/default')
  async showDefault(@Param('companyId') companyId: string) {
    this.logger.debug('ShowDefault: Called', { companyId });
    return this.service.findDefault(companyId);
  }

  @Put(':id/set-default')
  async setAsDefault(@Param('id') id: string) {
    this.logger.debug('SetAsDefault: Called', { id });
    return this.service.setAsDefault(id);
  }
}
