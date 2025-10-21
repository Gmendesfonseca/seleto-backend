import {
  Controller,
  Delete,
  Get,
  Logger,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { ApplicationServiceInterface } from './interfaces/application.service.interface';
import { ApplicationFilters } from './interfaces/application.interface';
import { CreateApplicationDto } from './dto/create.dto';
import { UpdateApplicationDto } from './dto/update.dto';
import { ApplicationQueryDto } from './dto/query.dto';
import { Authorized } from 'src/shared/decorators/authorization.decorator';

@Controller('applications')
export class ApplicationController {
  private readonly logger = new Logger(ApplicationController.name);

  constructor(private readonly service: ApplicationServiceInterface) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Authorized()
  public async list(@Query(ValidationPipe) queryDto: ApplicationQueryDto) {
    this.logger.debug('List: called', { queryDto });
    const filters: ApplicationFilters = {
      applicantId: queryDto.applicantId,
      vacancyId: queryDto.vacancyId,
      status: queryDto.status,
      dateFrom: queryDto.dateFrom,
      dateTo: queryDto.dateTo,
    };
    return this.service.findAll(filters);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Authorized()
  public async show(@Param('id') id: string) {
    this.logger.debug('Show: called', { id });
    return this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Authorized()
  public async store(@Body(ValidationPipe) dto: CreateApplicationDto) {
    this.logger.debug('Store: called', dto);
    return this.service.create(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Authorized()
  public async update(@Param('id') id: string, @Body(ValidationPipe) dto: UpdateApplicationDto) {
    this.logger.debug('Update: called', { id, dto });
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Authorized()
  public async destroy(@Param('id') id: string) {
    this.logger.debug('Destroy: called', { id });
    return this.service.remove(id);
  }
}

@Controller('applicants')
export class ApplicantController {
  private readonly logger = new Logger(ApplicantController.name);

  constructor(private readonly service: ApplicationServiceInterface) {}

  @Get(':applicantId/applications')
  @HttpCode(HttpStatus.OK)
  @Authorized()
  public async getApplicationsByApplicant(@Param('applicantId') applicantId: string) {
    this.logger.debug('GetApplicationsByApplicant: called', { applicantId });
    const filters: ApplicationFilters = { applicantId };
    return this.service.findAll(filters);
  }
}
