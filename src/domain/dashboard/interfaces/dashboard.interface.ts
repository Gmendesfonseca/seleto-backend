import { DateTime } from 'luxon';

export interface DashboardStats {
  totalApplications: number;
  totalVacancies: number;
  topVacancies: TopVacancy[];
  applicationsByStatus: ApplicationStatusCount[];
  monthlyApplications: MonthlyApplicationCount[];
}

export interface RecentApplication {
  id: string;
  applicantName: string;
  vacancyTitle: string;
  companyName: string;
  status: string;
  appliedAt: Date;
}

export interface TopVacancy {
  id: string;
  title: string;
  companyName: string;
  applicationCount: number;
  publishedAt: DateTime | null;
}

export interface ApplicationStatusCount {
  status: string;
  count: number;
  percentage: number;
}

export interface MonthlyApplicationCount {
  month: string;
  year: number;
  count: number;
}

export interface DashboardFilters {
  companyId?: string;
  dateFrom?: string;
  dateTo?: string;
  period?: 'week' | 'month' | 'quarter' | 'year';
}
