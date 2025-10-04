export interface Application {
  id: string;
  applicantId: string;
  vacancyId: string;
  status: ApplicationStatus;
  resume?: string; // File path or URL
  coverLetter?: string;
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  INTERVIEW = 'interview',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

export interface ApplicationFilters {
  applicantId?: string;
  vacancyId?: string;
  status?: ApplicationStatus;
  dateFrom?: string;
  dateTo?: string;
}
