import { DateTime } from 'luxon';
import { ApplicationStatus } from '../interfaces/application.interface';

export class ApplicationResponseDto {
  id: string;
  applicantId: string;
  vacancyId: string;
  status: ApplicationStatus;
  resume?: string;
  coverLetter?: string;
  createdAt: DateTime;
  updatedAt: DateTime;
}
