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
  Req,
} from '@nestjs/common';
import { DashboardServiceInterface } from './interfaces/dashboard.service.interface';
import { Authorized } from 'src/shared/decorators/authorization.decorator';
import { RequestWithCompany } from 'src/shared/middlewares/company-context.middleware';

@Controller('dashboard')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly service: DashboardServiceInterface) {}

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @Authorized()
  public async stats(@Req() request: RequestWithCompany, @Query() filters?: any) {
    this.logger.debug('Stats: called', { filters });
    return this.service.getStats({ ...filters, companyId: request.companyId });
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
    @Req() request: RequestWithCompany,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.service.getRecentApplications(limit, request.companyId);
  }

  @Get('top-vacancies')
  @HttpCode(HttpStatus.OK)
  @Authorized()
  public async topVacancies(
    @Req() request: RequestWithCompany,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.service.getTopVacancies(limit, request.companyId);
  }

  @Get('applications-by-status')
  @HttpCode(HttpStatus.OK)
  @Authorized()
  public async applicationsByStatus(@Req() request: RequestWithCompany) {
    return this.service.getApplicationsByStatus(request.companyId);
  }

  @Get('monthly-applications')
  @HttpCode(HttpStatus.OK)
  @Authorized()
  public async monthlyApplications(
    @Req() request: RequestWithCompany,
    @Query('months', new DefaultValuePipe(6), ParseIntPipe) months?: number,
  ) {
    return this.service.getMonthlyApplications(months, request.companyId);
  }
}
