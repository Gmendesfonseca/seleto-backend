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
import { StepService } from './interfaces/step.service.interface';
import { CreateStepDto, UpdateStepDto, StepQueryDto } from './dto/step.dto';

@Controller('steps')
export class StepController {
  private readonly logger = new Logger(StepController.name);

  constructor(private readonly stepService: StepService) {}

  @Get()
  async findAll(@Query() filters: StepQueryDto) {
    this.logger.debug('StepController.findAll: Called', { filters });
    return this.stepService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.debug('StepController.findOne: Called', { id });
    return this.stepService.findOne(id);
  }

  @Post()
  async create(@Body() createStepDto: CreateStepDto) {
    this.logger.debug('StepController.create: Called', { createStepDto });
    return this.stepService.create(createStepDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateStepDto: UpdateStepDto) {
    this.logger.debug('StepController.update: Called', { id, updateStepDto });
    return this.stepService.update(id, updateStepDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    this.logger.debug('StepController.remove: Called', { id });
    await this.stepService.remove(id);
  }

  @Get('template/:templateId')
  async findByTemplate(@Param('templateId') templateId: string) {
    this.logger.debug('StepController.findByTemplate: Called', { templateId });
    return this.stepService.findByTemplate(templateId);
  }

  @Put('template/:templateId/reorder')
  async reorderSteps(@Param('templateId') templateId: string, @Body('stepIds') stepIds: string[]) {
    this.logger.debug('StepController.reorderSteps: Called', { templateId, stepIds });
    return this.stepService.reorderSteps(templateId, stepIds);
  }
}
