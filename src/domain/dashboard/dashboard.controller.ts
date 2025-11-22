import {
  Controller,
  Get,
  Logger,
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
  public async stats(@Req() { companyId }: RequestWithCompany, @Query() filters?: any) {
    this.logger.debug('Stats: called', { filters });
    return this.service.getStats({ ...filters, companyId });
  }

  @Get('recent-applications')
  @HttpCode(HttpStatus.OK)
  @Authorized()
  public async recentApplications(
    @Req() request: RequestWithCompany,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    this.logger.debug('RecentApplications: called', { limit, companyId: request.companyId });
    return this.service.getRecentApplications(limit, request.companyId);
  }

  @Get('top-vacancies')
  @HttpCode(HttpStatus.OK)
  @Authorized()
  public async topVacancies(
    @Req() request: RequestWithCompany,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    this.logger.debug('TopVacancies: called', { limit, companyId: request.companyId });
    return this.service.getTopVacancies(limit, request.companyId);
  }

  @Get('applications-by-status')
  @HttpCode(HttpStatus.OK)
  @Authorized()
  public async applicationsByStatus(@Req() request: RequestWithCompany) {
    this.logger.debug('ApplicationsByStatus: called', { companyId: request.companyId });
    return this.service.getApplicationsByStatus(request.companyId);
  }

  @Get('monthly-applications')
  @HttpCode(HttpStatus.OK)
  @Authorized()
  public async monthlyApplications(
    @Req() request: RequestWithCompany,
    @Query('months', new DefaultValuePipe(6), ParseIntPipe) months?: number,
  ) {
    this.logger.debug('MonthlyApplications: called', { months, companyId: request.companyId });
    return this.service.getMonthlyApplications(months, request.companyId);
  }
}
