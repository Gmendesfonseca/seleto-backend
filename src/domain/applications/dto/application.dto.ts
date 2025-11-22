import { ApplicationStatus } from '../interfaces/application.interface';

export class ApplicationResponseDto {
  id: string;

  applicantId: string;

  vacancyId: string;

  status: ApplicationStatus;

  resume?: string;

  coverLetter?: string;

  appliedAt: Date;

  createdAt: DateTime;

  updatedAt: DateTime;
}
