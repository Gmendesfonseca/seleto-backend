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
import { PersonServiceInterface } from './interfaces/person.service.interface';
import {
  CreatePersonDto,
  UpdatePersonDto,
  PersonQueryDto,
  AddCompetenceDto,
  AddWorkExperienceDto,
  AddEducationDto,
} from './dto/person.dto';

@Controller('persons')
export class PersonController {
  private readonly logger = new Logger(PersonController.name);

  constructor(private readonly service: PersonServiceInterface) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPersonDto: CreatePersonDto) {
    this.logger.debug('PersonController.create: Called');
    return this.service.create(createPersonDto);
  }

  @Get()
  async findAll(@Query() query: PersonQueryDto) {
    this.logger.debug('PersonController.findAll: Called');
    return this.service.findAll({
      competences: query.competences,
      location: query.location,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.debug('PersonController.findOne: Called');
    return this.service.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePersonDto: UpdatePersonDto) {
    this.logger.debug('PersonController.update: Called');
    return this.service.update(id, updatePersonDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    this.logger.debug('PersonController.remove: Called');
    await this.service.remove(id);
  }

  @Post(':id/competences')
  async addCompetence(@Param('id') id: string, @Body() addCompetenceDto: AddCompetenceDto) {
    this.logger.debug('PersonController.addCompetence: Called');
    return this.service.addCompetence(id, addCompetenceDto);
  }

  @Delete(':id/competences/:competenceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCompetence(@Param('id') id: string, @Param('competenceId') competenceId: string) {
    this.logger.debug('PersonController.removeCompetence: Called');
    await this.service.removeCompetence(id, competenceId);
  }

  @Post(':id/work-experiences')
  async addWorkExperience(
    @Param('id') id: string,
    @Body() addWorkExperienceDto: AddWorkExperienceDto,
  ) {
    this.logger.debug('PersonController.addWorkExperience: Called');
    return this.service.addWorkExperience(id, addWorkExperienceDto);
  }

  @Delete(':id/work-experiences/:experienceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeWorkExperience(@Param('id') id: string, @Param('experienceId') experienceId: string) {
    this.logger.debug('PersonController.removeWorkExperience: Called');
    await this.service.removeWorkExperience(id, experienceId);
  }

  @Post(':id/education')
  async addEducation(@Param('id') id: string, @Body() addEducationDto: AddEducationDto) {
    this.logger.debug('PersonController.addEducation: Called');
    return this.service.addEducation(id, addEducationDto);
  }

  @Delete(':id/education/:educationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeEducation(@Param('id') id: string, @Param('educationId') educationId: string) {
    this.logger.debug('PersonController.removeEducation: Called');
    await this.service.removeEducation(id, educationId);
  }
}
