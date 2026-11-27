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
import { AddressServiceInterface } from './interfaces/address.service.interface';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Controller('addresses')
export class AddressController {
  private readonly logger = new Logger(AddressController.name);

  constructor(private readonly service: AddressServiceInterface) {}

  @Get()
  async index(
    @Query('userId') userId?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('country') country?: string,
    @Query('isPrimary') isPrimary?: boolean,
  ) {
    this.logger.debug('Index: Called', {
      userId,
      city,
      state,
      country,
      isPrimary,
    });
    return this.service.findAll({ userId, city, state, country, isPrimary });
  }

  @Get(':id')
  async show(@Param('id') id: string) {
    this.logger.debug('Show: Called');
    return this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async store(@Body() dto: CreateAddressDto) {
    this.logger.debug('Store: Called');
    return this.service.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAddressDto) {
    this.logger.debug('Update: Called');
    return this.service.update(id, dto);
  }

  @Patch(':id/set-primary')
  async setPrimary(@Param('id') id: string) {
    this.logger.debug('SetPrimary: Called');
    return this.service.setPrimary(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    this.logger.debug('Remove: Called');
    await this.service.remove(id);
  }
}
