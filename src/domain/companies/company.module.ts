import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Company } from '../users/user.model';
import { CompanyController } from './company.controller';
import { CompanyServiceImpl } from './company.service';
import { CompanySequelizeRepository } from './repositories/company.sequelize.repository';
import { CompanyRepository } from './repositories/company.repository.interface';
import { CompanyService } from './interfaces/company.service.interface';

@Module({
  imports: [SequelizeModule.forFeature([Company])],
  controllers: [CompanyController],
  providers: [
    {
      provide: CompanyRepository,
      useClass: CompanySequelizeRepository,
    },
    {
      provide: CompanyService,
      useClass: CompanyServiceImpl,
    },
  ],
  exports: [CompanyService],
})
export class CompanyModule {}
