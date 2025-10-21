import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Address } from './address.model';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { AddressSequelizeRepository } from './repositories/address.sequelize.repository';
import { AddressRepository } from './repositories/address.repository.interface';
import { AddressServiceInterface } from './interfaces/address.service.interface';

@Module({
  imports: [SequelizeModule.forFeature([Address])],
  controllers: [AddressController],
  providers: [
    {
      provide: AddressRepository,
      useClass: AddressSequelizeRepository,
    },
    {
      provide: AddressServiceInterface,
      useClass: AddressService,
    },
  ],
  exports: [AddressServiceInterface],
})
export class AddressModule {}
