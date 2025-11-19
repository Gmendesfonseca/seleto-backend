import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Company } from './company.model';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { CompanySequelizeRepository } from './repositories/company.sequelize.repository';
import { CompanyRepository } from './repositories/company.repository.interface';
import { CompanyServiceInterface } from './interfaces/company.service.interface';

@Module({
  imports: [SequelizeModule.forFeature([Company])],
  controllers: [CompanyController],
  providers: [
    {
      provide: CompanyRepository,
      useClass: CompanySequelizeRepository,
    },
    {
      provide: CompanyServiceInterface,
      useClass: CompanyService,
    },
  ],
  exports: [CompanyServiceInterface, CompanyRepository, SequelizeModule],
})
export class CompanyModule {}
