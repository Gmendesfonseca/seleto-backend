import { Module } from '@nestjs/common';
import { CompetenceController } from './competence.controller';

@Module({ controllers: [CompetenceController] })
export class CompetenceModule {}
