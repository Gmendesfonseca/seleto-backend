import {
  Controller,
  Get,
  Param,
  Query,
  Logger,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { RecruitmentServiceInterface } from './interfaces/recruitment.service.interface';
import { Authorized } from 'src/shared/decorators/authorization.decorator';

@Controller('recruitment-processes')
export class RecruitmentController {
  private readonly logger = new Logger(RecruitmentController.name);

  constructor(private readonly service: RecruitmentServiceInterface) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Authorized()
  public async getProcesses(
    @Query('status') status?: string,
    @Query('companyId') companyId?: string,
    @Query('recruiterId') recruiterId?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    this.logger.debug('GetProcesses: called', { status, companyId, recruiterId, limit, offset });
    return this.service.findAll({ status, companyId, recruiterId, limit, offset });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Authorized()
  public async getProcess(@Param('id') id: string) {
    this.logger.debug('GetProcess: called', { id });
    return this.service.findOne(id);
  }
}

@Controller('activities')
export class ActivitiesController {
  private readonly logger = new Logger(ActivitiesController.name);

  constructor(private readonly service: RecruitmentServiceInterface) {}

  @Get('recent')
  @HttpCode(HttpStatus.OK)
  @Authorized()
  public async getRecentActivities(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('companyId') companyId?: string,
  ) {
    this.logger.debug('GetRecentActivities: called', { limit, companyId });
    return this.service.getRecentActivities(limit, companyId);
  }
}
