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
import { StepService } from './interfaces/step.service.interface';
import { CreateStepDto, UpdateStepDto, StepQueryDto } from './dto/step.dto';
import { RequestWithCompany } from 'src/shared/middlewares/company-context.middleware';

@Controller('steps')
export class StepController {
  private readonly logger = new Logger(StepController.name);

  constructor(private readonly service: StepService) {}

  @Get()
  async index(@Query() filters: StepQueryDto) {
    this.logger.debug('Index: Called', { filters });
    return this.service.findAll(filters);
  }

  @Get(':id')
  async show(@Param('id') id: string) {
    this.logger.debug('Show: Called', { id });
    return this.service.findOne(id);
  }

  @Post()
  async store(@Body() dto: Omit<CreateStepDto, 'companyId'>, @Req() req: RequestWithCompany) {
    this.logger.debug('Store: Called', { dto });
    return this.service.create({ ...dto, companyId: req.companyId ?? '' });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateStepDto: UpdateStepDto) {
    this.logger.debug('Update: Called', { id, updateStepDto });
    return this.service.update(id, updateStepDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    this.logger.debug('Remove: Called', { id });
    await this.service.remove(id);
  }

  @Get('template/:templateId')
  async findByTemplate(@Param('templateId') templateId: string) {
    this.logger.debug('FindByTemplate: Called', { templateId });
    return this.service.findByTemplate(templateId);
  }

  @Post('reorder')
  async reorderSteps(@Body() payload: { templateId: string; stepIds: string[] }) {
    this.logger.debug('ReorderSteps: Called', { payload });
    return this.service.reorderSteps(payload.templateId, payload.stepIds);
  }

  @Put('template/:templateId/reorder')
  async reorderStepsByTemplate(
    @Param('templateId') templateId: string,
    @Body('stepIds') stepIds: string[],
  ) {
    this.logger.debug('ReorderStepsByTemplate: Called', { templateId, stepIds });
    return this.service.reorderSteps(templateId, stepIds);
  }
}
