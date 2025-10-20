import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Phone } from './phone.model';
import { PhoneController } from './phone.controller';
import { PhoneServiceImpl } from './phone.service';
import { PhoneSequelizeRepository } from './repositories/phone.sequelize.repository';
import { PhoneRepository } from './repositories/phone.repository.interface';
import { PhoneService } from './interfaces/phone.service.interface';

@Module({
  imports: [SequelizeModule.forFeature([Phone])],
  controllers: [PhoneController],
  providers: [
    {
      provide: PhoneRepository,
      useClass: PhoneSequelizeRepository,
    },
    {
      provide: PhoneService,
      useClass: PhoneServiceImpl,
    },
  ],
  exports: [PhoneService],
})
export class PhoneModule {}
