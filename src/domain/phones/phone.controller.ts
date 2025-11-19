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

  constructor(private readonly phoneService: PhoneServiceInterface) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPhoneDto: CreatePhoneDto) {
    this.logger.debug('PhoneController.create: Called');
    return this.phoneService.create(createPhoneDto);
  }

  @Get()
  async findAll(
    @Query('personId') personId?: string,
    @Query('type') type?: PhoneType,
    @Query('isPrimary') isPrimary?: boolean,
  ) {
    this.logger.debug('PhoneController.findAll: Called');
    return this.phoneService.findAll({ personId, type, isPrimary });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.debug('PhoneController.findOne: Called');
    return this.phoneService.findOne(id);
  }

  @Get('person/:personId')
  async findByPerson(@Param('personId') personId: string) {
    this.logger.debug('PhoneController.findByPerson: Called');
    return this.phoneService.findByPerson(personId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePhoneDto: UpdatePhoneDto) {
    this.logger.debug('PhoneController.update: Called');
    return this.phoneService.update(id, updatePhoneDto);
  }

  @Patch(':id/set-primary')
  async setPrimary(@Param('id') id: string, @Body('personId') personId: string) {
    this.logger.debug('PhoneController.setPrimary: Called');
    return this.phoneService.setPrimary(id, personId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    this.logger.debug('PhoneController.remove: Called');
    await this.phoneService.remove(id);
  }
}
