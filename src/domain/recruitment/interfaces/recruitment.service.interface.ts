import { DateTime } from 'luxon';
export interface RecruitmentProcess {
  id: string;
  vacancyId: string;
  status: string;
  steps: any[];
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface RecruitmentFilters {
  status?: string;
  companyId?: string;
  recruiterId?: string;
  limit?: number;
  offset?: number;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  userId: string;
}

export abstract class RecruitmentServiceInterface {
  abstract findAll(filters?: RecruitmentFilters): Promise<{
    processes: RecruitmentProcess[];
    total: number;
    limit: number;
    offset: number;
  }>;
  abstract findOne(id: string): Promise<RecruitmentProcess>;
  abstract getRecentActivities(
    limit?: number,
    companyId?: string,
  ): Promise<{
    activities: Activity[];
    total: number;
  }>;
}
