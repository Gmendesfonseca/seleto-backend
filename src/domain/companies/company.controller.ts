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
import { CompanyServiceInterface } from './interfaces/company.service.interface';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { PaginationParams, SearchParams } from '../../shared/interfaces/entities';
import { Authorized } from 'src/shared/decorators/authorization.decorator';

@Controller('companies')
export class CompanyController {
  private readonly logger = new Logger(CompanyController.name);

  constructor(private readonly service: CompanyServiceInterface) {}

  @Get()
  @Authorized()
  async index(@Query() pagination: PaginationParams, @Query() search?: SearchParams) {
    this.logger.debug('CompanyController.index: Called', { pagination, search });
    return this.service.findAll(pagination, search);
  }

  @Get(':id')
  @Authorized()
  async show(@Param('id') id: string) {
    this.logger.debug('CompanyController.show: Called', { id });
    return this.service.findById(id);
  }

  @Get(':id/vacancies')
  @Authorized()
  async indexVacancies(
    @Param('id') id: string,
    @Query('status') status?: string,
    @Query('area') area?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    this.logger.debug('IndexVacancies: Called', { id, status, area });
    return this.service.findVacancies(id, { status, area, page, limit });
  }

  @Get(':id/statistics')
  @Authorized()
  async showStatistics(@Param('id') id: string) {
    this.logger.debug('ShowStatistics: Called', { id });
    return this.service.statistics(id);
  }

  @Get(':id/addresses')
  @Authorized()
  async indexAddresses(@Param('id') id: string) {
    this.logger.debug('CompanyController.indexAddresses: Called', { id });
    // This will be handled by the address service
    return [];
  }

  @Post()
  @Authorized()
  async create(@Body() dto: CreateCompanyDto) {
    this.logger.debug('CompanyController.create: Called', { dto });
    return this.service.create(dto);
  }

  @Put(':id')
  @Authorized()
  async update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    this.logger.debug('CompanyController.update: Called', { id, dto });
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Authorized()
  async delete(@Param('id') id: string) {
    this.logger.debug('CompanyController.delete: Called', { id });
    await this.service.delete(id);
  }

  @Put(':id/status')
  @Authorized()
  async updateStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    this.logger.debug('CompanyController.updateStatus: Called', { id, isActive });
    await this.service.setActiveStatus(id, isActive);
  }
}
