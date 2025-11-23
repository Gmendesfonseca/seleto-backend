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
import { VacancyServiceInterface } from './interfaces/vacancy.service.interface';
import { CreateVacancyDto, UpdateVacancyDto, VacancyQueryDto } from './dto/vacancy.dto';
import { RequestWithCompany } from '../../shared/middlewares/company-context.middleware';

@Controller('vacancies')
export class VacancyController {
  private readonly logger = new Logger(VacancyController.name);

  constructor(private readonly service: VacancyServiceInterface) {}

  @Get()
  async index(@Query() dto: VacancyQueryDto, @Req() request: RequestWithCompany) {
    this.logger.debug('Index: Called', { dto });
    const companyId = request.companyId;
    return this.service.findAll({ ...dto, companyId });
  }

  @Get('published')
  async findPublished() {
    this.logger.debug('FindPublished: Called');
    return this.service.findPublished();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.debug('FindOne: Called', { id });
    return this.service.findOne(id);
  }

  @Post()
  async store(@Body() dto: CreateVacancyDto) {
    this.logger.debug('Create: Called', { dto });
    return this.service.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateVacancyDto) {
    this.logger.debug('Update: Called', { id, dto });
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    this.logger.debug('Remove: Called', { id });
    await this.service.remove(id);
  }

  @Post(':id/publish')
  async publish(@Param('id') id: string) {
    this.logger.debug('Publish: Called', { id });
    return this.service.publishVacancy(id);
  }

  @Post(':id/close')
  async close(@Param('id') id: string) {
    this.logger.debug('Close: Called', { id });
    return this.service.closeVacancy(id);
  }

  @Get(':id/best-candidates')
  async findBestCandidates(
    @Param('id') id: string,
    @Query('minScore') minScore?: number,
    @Query('limit') limit?: number,
  ) {
    this.logger.debug('FindBestCandidates: Called', { id });
    return this.service.findBestCandidates(id, minScore, limit);
  }

  @Get(':id/best-candidate')
  async getBestCandidate(@Param('id') id: string) {
    this.logger.debug('GetBestCandidate: Called', { id });
    return this.service.getBestCandidate(id);
  }

  // @Get(':vacancyId/applications')
  // async getVacancyApplications(@Param('vacancyId') vacancyId: string) {
  //   this.logger.debug('GetVacancyApplications: Called', { vacancyId });
  //   return this.service.getApplications(vacancyId);
  // }

  // @Post(':vacancyId/apply')
  // async applyToVacancy(@Param('vacancyId') vacancyId: string, @Body() applicationData: any) {
  //   this.logger.debug('ApplyToVacancy: Called', { vacancyId });
  //   return this.service.createApplication(vacancyId, applicationData);
  // }

  // @Get(':id/stats')
  // async getVacancyStats(@Param('id') id: string) {
  //   this.logger.debug('GetVacancyStats: Called', { id });
  //   return this.service.getStats(id);
  // }
}
