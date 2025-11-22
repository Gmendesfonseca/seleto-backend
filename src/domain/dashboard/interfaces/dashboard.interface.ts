import { ApplicationStatus } from 'src/domain/applications';

export interface DashboardStats {
  totalApplications: number;
  totalVacancies: number;
  totalCompanies: number;
  totalUsers: number;
  recentApplications: RecentApplication[];
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
  publishedAt: Date;
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
  applicationStatus?: (typeof ApplicationStatus)[keyof typeof ApplicationStatus];
  companyId?: string;
  dateFrom?: string;
  dateTo?: string;
  period?: 'week' | 'month' | 'quarter' | 'year';
}
