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

@Controller('companies')
export class CompanyController {
  private readonly logger = new Logger(CompanyController.name);

  constructor(private readonly companyService: CompanyService) {}

  @Get()
  async findAll(@Query() pagination: PaginationParams, @Query() search?: SearchParams) {
    this.logger.debug('CompanyController.findAll: Called', { pagination, search });
    return this.companyService.findAll(pagination, search);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    this.logger.debug('CompanyController.findById: Called', { id });
    return this.companyService.findById(id);
  }

  @Post()
  async create(@Body() createCompanyRequest: CreateCompanyRequest) {
    this.logger.debug('CompanyController.create: Called', { createCompanyRequest });
    return this.companyService.create(createCompanyRequest);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCompanyRequest: UpdateCompanyRequest) {
    this.logger.debug('CompanyController.update: Called', { id, updateCompanyRequest });
    return this.companyService.update(id, updateCompanyRequest);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    this.logger.debug('CompanyController.delete: Called', { id });
    await this.companyService.delete(id);
  }

  @Put(':id/status')
  async setActiveStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    this.logger.debug('CompanyController.setActiveStatus: Called', { id, isActive });
    await this.companyService.setActiveStatus(id, isActive);
  }

  @Get('check/exists/:name')
  async checkExists(@Param('name') name: string) {
    this.logger.debug('CompanyController.checkExists: Called', { name });
    const exists = await this.companyService.existsByName(name);
    return { exists };
  }
}
