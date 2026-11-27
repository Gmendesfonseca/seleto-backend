import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { CompetenceServiceInterface } from './interfaces/competence.service.interface';
import {
  CompetenceQueryDto,
  CompetenceResponseDto,
  CreateCompetenceDto,
  UpdateCompetenceDto,
} from './dto/competence.dto';

@Controller('competences')
export class CompetenceController {
  private readonly logger = new Logger(CompetenceController.name);

  constructor(private readonly service: CompetenceServiceInterface) {}

  @Get()
  public async index(@Query() filters: CompetenceQueryDto): Promise<CompetenceResponseDto[]> {
    this.logger.debug('Index: called', { filters });
    return this.service.findAll(filters);
  }

  @Get(':id')
  public async show(@Param('id', ParseUUIDPipe) id: string): Promise<CompetenceResponseDto> {
    this.logger.debug('Show: called', { id });
    const competence = await this.service.findOne(id);
    if (!competence) {
      throw new NotFoundException(`Competence with id ${id} not found`);
    }
    return competence;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async store(
    @Body() dto: CreateCompetenceDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CompetenceResponseDto> {
    this.logger.debug('Store: called');
    const competence = await this.service.create(dto);
    res.location(`${res.req.originalUrl.split('?')[0]}/${competence.id}`);
    return competence;
  }

  @Put(':id')
  public async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompetenceDto,
  ): Promise<CompetenceResponseDto> {
    this.logger.debug('Update: called', { id });
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async destroy(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    this.logger.debug('Destroy: called', { id });
    await this.service.remove(id);
  }
}
