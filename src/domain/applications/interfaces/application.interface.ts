export interface Application {
  id: string;
  applicantId: string;
  vacancyId: string;
  status: ApplicationStatus;
  resume?: string;
  coverLetter?: string;
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationFilters {
  applicantId?: string;
  vacancyId?: string;
  status?: ApplicationStatus;
  dateFrom?: string;
  dateTo?: string;
}

export const ApplicationStatus = {
  PENDING: 'pending',
  REVIEWING: 'reviewing',
  INTERVIEW: 'interview',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
} as const;

export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus];
