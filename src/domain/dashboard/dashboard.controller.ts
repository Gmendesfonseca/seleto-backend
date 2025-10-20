import {
  Controller,
  Get,
  Logger,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { DashboardServiceInterface } from './interfaces/dashboard.service.interface';
import { Authorized } from 'src/shared/decorators/authorization.decorator';

@Controller('dashboard')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly service: DashboardServiceInterface) {}

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @Authorized()
  public async stats(@Query() filters?: any) {
    this.logger.debug('Stats: called', { filters });
    return this.service.getStats(filters);
  }

  @Get('company/:companyId/stats')
  @HttpCode(HttpStatus.OK)
  @Authorized()
  public async companyStats(@Param('companyId') companyId: string, @Query() filters?: any) {
    this.logger.debug('CompanyStats: called', { companyId, filters });
    return this.service.getCompanyStats(companyId, filters);
  }

  @Get('recent-applications')
  @HttpCode(HttpStatus.OK)
  @Authorized()
  public async recentApplications(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('companyId') companyId?: string,
  ) {
    return this.service.getRecentApplications(limit, companyId);
  }

  @Get('top-vacancies')
  @HttpCode(HttpStatus.OK)
  @Authorized()
  public async topVacancies(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('companyId') companyId?: string,
  ) {
    return this.service.getTopVacancies(limit, companyId);
  }

  @Get('applications-by-status')
  @HttpCode(HttpStatus.OK)
  @Authorized()
  public async applicationsByStatus(@Query('companyId') companyId?: string) {
    return this.service.getApplicationsByStatus(companyId);
  }

  @Get('monthly-applications')
  @HttpCode(HttpStatus.OK)
  @Authorized()
  public async monthlyApplications(
    @Query('months', new DefaultValuePipe(6), ParseIntPipe) months?: number,
    @Query('companyId') companyId?: string,
  ) {
    return this.service.getMonthlyApplications(months, companyId);
  }
}
