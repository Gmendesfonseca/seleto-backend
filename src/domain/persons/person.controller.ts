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
import { PersonService } from './interfaces/person.service.interface';
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

  constructor(private readonly personService: PersonService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPersonDto: CreatePersonDto) {
    this.logger.debug('PersonController.create: Called');
    return this.personService.create(createPersonDto);
  }

  @Get()
  async findAll(@Query() query: PersonQueryDto) {
    this.logger.debug('PersonController.findAll: Called');
    return this.personService.findAll({
      firstName: query.firstName,
      lastName: query.lastName,
      email: query.email,
      competences: query.competences,
      location: query.location,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.debug('PersonController.findOne: Called');
    return this.personService.findOne(id);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    this.logger.debug('PersonController.findByUser: Called');
    return this.personService.findByUser(userId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePersonDto: UpdatePersonDto) {
    this.logger.debug('PersonController.update: Called');
    return this.personService.update(id, updatePersonDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    this.logger.debug('PersonController.remove: Called');
    await this.personService.remove(id);
  }

  @Post(':id/competences')
  async addCompetence(@Param('id') id: string, @Body() addCompetenceDto: AddCompetenceDto) {
    this.logger.debug('PersonController.addCompetence: Called');
    return this.personService.addCompetence(id, addCompetenceDto);
  }

  @Delete(':id/competences/:competenceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCompetence(@Param('id') id: string, @Param('competenceId') competenceId: string) {
    this.logger.debug('PersonController.removeCompetence: Called');
    await this.personService.removeCompetence(id, competenceId);
  }

  @Post(':id/work-experiences')
  async addWorkExperience(
    @Param('id') id: string,
    @Body() addWorkExperienceDto: AddWorkExperienceDto,
  ) {
    this.logger.debug('PersonController.addWorkExperience: Called');
    return this.personService.addWorkExperience(id, addWorkExperienceDto);
  }

  @Delete(':id/work-experiences/:experienceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeWorkExperience(@Param('id') id: string, @Param('experienceId') experienceId: string) {
    this.logger.debug('PersonController.removeWorkExperience: Called');
    await this.personService.removeWorkExperience(id, experienceId);
  }

  @Post(':id/education')
  async addEducation(@Param('id') id: string, @Body() addEducationDto: AddEducationDto) {
    this.logger.debug('PersonController.addEducation: Called');
    return this.personService.addEducation(id, addEducationDto);
  }

  @Delete(':id/education/:educationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeEducation(@Param('id') id: string, @Param('educationId') educationId: string) {
    this.logger.debug('PersonController.removeEducation: Called');
    await this.personService.removeEducation(id, educationId);
  }
}
