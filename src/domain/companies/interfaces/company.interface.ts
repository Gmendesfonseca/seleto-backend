export interface Company {
  id: string;
  name: string;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
