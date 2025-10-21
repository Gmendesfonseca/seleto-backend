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
import { CompanyService } from './interfaces/company.service.interface';
import { CreateCompanyRequest, UpdateCompanyRequest } from './dto/company.dto';
import { PaginationParams, SearchParams } from '../../shared/interfaces/entities';
import { Authorized } from 'src/shared/decorators/authorization.decorator';

@Controller('companies')
export class CompanyController {
  private readonly logger = new Logger(CompanyController.name);

  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @Authorized()
  async findAll(@Query() pagination: PaginationParams, @Query() search?: SearchParams) {
    this.logger.debug('CompanyController.findAll: Called', { pagination, search });
    return this.companyService.findAll(pagination, search);
  }

  @Get(':id')
  @Authorized()
  async findById(@Param('id') id: string) {
    this.logger.debug('CompanyController.findById: Called', { id });
    return this.companyService.findById(id);
  }

  @Get(':id/vacancies')
  @Authorized()
  async getCompanyVacancies(
    @Param('id') id: string,
    @Query('status') status?: string,
    @Query('area') area?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    this.logger.debug('CompanyController.getCompanyVacancies: Called', { id, status, area });
    return this.companyService.getVacancies(id, { status, area, page, limit });
  }

  @Get(':id/users')
  @Authorized()
  async getCompanyUsers(
    @Param('id') id: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    this.logger.debug('CompanyController.getCompanyUsers: Called', { id, type, status });
    return this.companyService.getUsers(id, { type, status, page, limit });
  }

  @Get(':id/statistics')
  @Authorized()
  async getCompanyStatistics(@Param('id') id: string) {
    this.logger.debug('CompanyController.getCompanyStatistics: Called', { id });
    return this.companyService.getStatistics(id);
  }

  @Get(':id/addresses')
  @Authorized()
  async getCompanyAddresses(@Param('id') id: string) {
    this.logger.debug('CompanyController.getCompanyAddresses: Called', { id });
    // This will be handled by the address service
    return [];
  }

  @Post()
  @Authorized()
  async create(@Body() createCompanyRequest: CreateCompanyRequest) {
    this.logger.debug('CompanyController.create: Called', { createCompanyRequest });
    return this.companyService.create(createCompanyRequest);
  }

  @Put(':id')
  @Authorized()
  async update(@Param('id') id: string, @Body() updateCompanyRequest: UpdateCompanyRequest) {
    this.logger.debug('CompanyController.update: Called', { id, updateCompanyRequest });
    return this.companyService.update(id, updateCompanyRequest);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Authorized()
  async delete(@Param('id') id: string) {
    this.logger.debug('CompanyController.delete: Called', { id });
    await this.companyService.delete(id);
  }

  @Put(':id/status')
  @Authorized()
  async setActiveStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    this.logger.debug('CompanyController.setActiveStatus: Called', { id, isActive });
    await this.companyService.setActiveStatus(id, isActive);
  }

  @Get('check/exists/:name')
  @Authorized()
  async checkExists(@Param('name') name: string) {
    this.logger.debug('CompanyController.checkExists: Called', { name });
    const exists = await this.companyService.existsByName(name);
    return { exists };
  }
}
