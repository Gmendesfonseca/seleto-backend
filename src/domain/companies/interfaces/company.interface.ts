export interface Company {
  id: string;
  name: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
