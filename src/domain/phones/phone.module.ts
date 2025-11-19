import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Phone } from './phone.model';
import { PhoneController } from './phone.controller';
import { PhoneService } from './phone.service';
import { PhoneSequelizeRepository } from './repositories/phone.sequelize.repository';
import { PhoneRepository } from './repositories/phone.repository.interface';
import { PhoneServiceInterface } from './interfaces/phone.service.interface';

@Module({
  imports: [SequelizeModule.forFeature([Phone])],
  controllers: [PhoneController],
  providers: [
    {
      provide: PhoneRepository,
      useClass: PhoneSequelizeRepository,
    },
    {
      provide: PhoneServiceInterface,
      useClass: PhoneService,
    },
  ],
  exports: [
    {
      provide: PhoneServiceInterface,
      useClass: PhoneService,
    },
  ],
})
export class PhoneModule {}
