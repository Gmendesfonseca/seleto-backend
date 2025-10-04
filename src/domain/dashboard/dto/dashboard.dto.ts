import {
  RecentApplication,
  TopVacancy,
  ApplicationStatusCount,
  MonthlyApplicationCount,
} from '../interfaces/dashboard.interface';

export class DashboardQueryDto {
  companyId?: string;
  dateFrom?: string;
  dateTo?: string;
  period?: 'week' | 'month' | 'quarter' | 'year';
}

export class DashboardStatsResponseDto {
  totalApplications: number;
  totalVacancies: number;
  totalCompanies: number;
  totalUsers: number;
  recentApplications: RecentApplication[];
  topVacancies: TopVacancy[];
  applicationsByStatus: ApplicationStatusCount[];
  monthlyApplications: MonthlyApplicationCount[];
}

export class RecentApplicationResponseDto {
  id: string;
  applicantName: string;
  vacancyTitle: string;
  companyName: string;
  status: string;
  appliedAt: Date;
}

export class TopVacancyResponseDto {
  id: string;
  title: string;
  companyName: string;
  applicationCount: number;
  publishedAt: Date;
}

export class ApplicationStatusCountResponseDto {
  status: string;
  count: number;
  percentage: number;
}

export class MonthlyApplicationCountResponseDto {
  month: string;
  year: number;
  count: number;
}
