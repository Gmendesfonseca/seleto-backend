export abstract class ProcessTemplatesRepository {
  abstract findAll(filters?: {
    limit?: number;
    offset?: number;
    search?: string;
    isDefault?: boolean;
  }): Promise<{
    templates: any[];
    total: number;
    limit: number;
    offset: number;
  }>;
  abstract findOne(id: string): Promise<any>;
  abstract create(template: any): Promise<any>;
  abstract update(id: string, template: any): Promise<any>;
  abstract delete(id: string): Promise<void>;
  abstract duplicate(id: string, name?: string): Promise<any>;
}
