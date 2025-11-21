import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface RequestWithCompany extends Request {
  companyId?: string;
}

@Injectable()
export class CompanyContextMiddleware implements NestMiddleware {
  use(req: RequestWithCompany, res: Response, next: NextFunction) {
    const companyId = req.headers['companyid'] as string | undefined;

    if (companyId) {
      req.companyId = companyId;
    }

    next();
  }
}
