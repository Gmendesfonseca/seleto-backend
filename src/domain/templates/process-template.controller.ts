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
  Req,
} from '@nestjs/common';
import { ProcessTemplateServiceInterface } from './interfaces/process-template.service.interface';
import { Authorized } from 'src/shared/decorators/authorization.decorator';
import { RequestWithCompany } from 'src/shared/middlewares/company-context.middleware';

@Controller('process-templates')
export class ProcessTemplateController {
  private readonly logger = new Logger(ProcessTemplateController.name);

  constructor(private readonly service: ProcessTemplateServiceInterface) {}

  @Get()
  @Authorized()
  async index(
    @Req() request: RequestWithCompany,
    @Query('companyId') companyId?: string,
    @Query('category') category?: string,
    @Query('isDefault') isDefault?: boolean,
    @Query('search') search?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    this.logger.debug('Index: Called', {
      companyId,
      category,
      isDefault,
      search,
      limit,
      offset,
    });
    return this.service.findAll({
      companyId: companyId ?? request.companyId,
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
    this.logger.debug('GetDefaults: Called');
    return this.service.getDefaults();
  }

  @Get(':id')
  @Authorized()
  async findOne(@Param('id') id: string) {
    this.logger.debug('FindOne: Called', { id });
    return this.service.findOne(id);
  }

  @Post()
  @Authorized()
  async store(@Body() createTemplateDto: any, @Req() request: RequestWithCompany) {
    this.logger.debug('Store: Called', { createTemplateDto });
    return this.service.create({ ...createTemplateDto, companyId: request.companyId });
  }

  @Put(':id')
  @Authorized()
  async update(@Param('id') id: string, @Body() updateTemplateDto: any) {
    this.logger.debug('Update: Called', { id, updateTemplateDto });
    return this.service.update(id, updateTemplateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Authorized()
  async remove(@Param('id') id: string) {
    this.logger.debug('Remove: Called', { id });
    await this.service.remove(id);
  }

  @Post(':id/duplicate')
  @Authorized()
  async duplicate(@Param('id') id: string, @Body('name') name?: string) {
    this.logger.debug('Duplicate: Called', { id, name });
    return this.service.duplicate(id, name);
  }
}
