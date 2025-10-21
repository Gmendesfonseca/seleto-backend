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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAddressDto: CreateAddressDto) {
    this.logger.debug('AddressController.create: Called');
    return this.service.create(createAddressDto);
  }

  @Get()
  async findAll(
    @Query('personId') personId?: string,
    @Query('companyId') companyId?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('country') country?: string,
    @Query('isPrimary') isPrimary?: boolean,
  ) {
    this.logger.debug('AddressController.findAll: Called');
    return this.service.findAll({ personId, companyId, city, state, country, isPrimary });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.debug('AddressController.findOne: Called');
    return this.service.findOne(id);
  }

  @Get('person/:personId')
  async findByPerson(@Param('personId') personId: string) {
    this.logger.debug('AddressController.findByPerson: Called');
    return this.service.findByPerson(personId);
  }

  @Get('company/:companyId')
  async findByCompany(@Param('companyId') companyId: string) {
    this.logger.debug('AddressController.findByCompany: Called');
    return this.service.findByCompany(companyId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
    this.logger.debug('AddressController.update: Called');
    return this.service.update(id, updateAddressDto);
  }

  @Patch(':id/set-primary')
  async setPrimary(
    @Param('id') id: string,
    @Body('ownerId') ownerId: string,
    @Body('ownerType') ownerType: 'person' | 'company',
  ) {
    this.logger.debug('AddressController.setPrimary: Called');
    return this.service.setPrimary(id, ownerId, ownerType);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    this.logger.debug('AddressController.remove: Called');
    await this.service.remove(id);
  }
}
