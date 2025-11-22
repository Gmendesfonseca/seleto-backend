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
  Patch,
} from '@nestjs/common';
import { PhoneServiceInterface } from './interfaces/phone.service.interface';
import { CreatePhoneDto, UpdatePhoneDto } from './dto/phone.dto';
import { PhoneType } from './phone.model';

@Controller('phones')
export class PhoneController {
  private readonly logger = new Logger(PhoneController.name);

  constructor(private readonly service: PhoneServiceInterface) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async store(@Body() createPhoneDto: CreatePhoneDto) {
    this.logger.debug('Store: Called');
    return this.service.create(createPhoneDto);
  }

  @Get()
  async index(
    @Query('personId') personId?: string,
    @Query('type') type?: PhoneType,
    @Query('isPrimary') isPrimary?: boolean,
  ) {
    this.logger.debug('Index: Called');
    return this.service.findAll({ personId, type, isPrimary });
  }

  @Get(':id')
  async show(@Param('id') id: string) {
    this.logger.debug('Show: Called');
    return this.service.findOne(id);
  }

  @Get('person/:personId')
  async showByPerson(@Param('personId') personId: string) {
    this.logger.debug('ShowByPerson: Called');
    return this.service.findByPerson(personId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePhoneDto: UpdatePhoneDto) {
    this.logger.debug('Update: Called');
    return this.service.update(id, updatePhoneDto);
  }

  @Patch(':id/set-primary')
  async setPrimary(@Param('id') id: string, @Body('personId') personId: string) {
    this.logger.debug('SetPrimary: Called');
    return this.service.setPrimary(id, personId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    this.logger.debug('Remove: Called');
    await this.service.remove(id);
  }
}
