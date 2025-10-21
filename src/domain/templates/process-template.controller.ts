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
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ProcessTemplateService } from './interfaces/process-template.service.interface';
import { Authorized } from 'src/shared/decorators/authorization.decorator';

@Controller('process-templates')
export class ProcessTemplateController {
  private readonly logger = new Logger(ProcessTemplateController.name);

  constructor(private readonly processTemplateService: ProcessTemplateService) {}

  @Get()
  @Authorized()
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('category') category?: string,
    @Query('isDefault') isDefault?: boolean,
    @Query('search') search?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    this.logger.debug('ProcessTemplateController.findAll: Called', {
      companyId,
      category,
      isDefault,
      search,
      limit,
      offset,
    });
    return this.processTemplateService.findAll({
      companyId,
      category,
      isDefault,
      search,
      limit,
      offset,
    });
  }

  @Get('defaults')
  @Authorized()
  async getDefaults() {
    this.logger.debug('ProcessTemplateController.getDefaults: Called');
    return this.processTemplateService.getDefaults();
  }

  @Get(':id')
  @Authorized()
  async findOne(@Param('id') id: string) {
    this.logger.debug('ProcessTemplateController.findOne: Called', { id });
    return this.processTemplateService.findOne(id);
  }

  @Post()
  @Authorized()
  async create(@Body() createTemplateDto: any) {
    this.logger.debug('ProcessTemplateController.create: Called', { createTemplateDto });
    return this.processTemplateService.create(createTemplateDto);
  }

  @Put(':id')
  @Authorized()
  async update(@Param('id') id: string, @Body() updateTemplateDto: any) {
    this.logger.debug('ProcessTemplateController.update: Called', { id, updateTemplateDto });
    return this.processTemplateService.update(id, updateTemplateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Authorized()
  async remove(@Param('id') id: string) {
    this.logger.debug('ProcessTemplateController.remove: Called', { id });
    await this.processTemplateService.remove(id);
  }

  @Post(':id/duplicate')
  @Authorized()
  async duplicate(@Param('id') id: string, @Body('name') name?: string) {
    this.logger.debug('ProcessTemplateController.duplicate: Called', { id, name });
    return this.processTemplateService.duplicate(id, name);
  }
}
