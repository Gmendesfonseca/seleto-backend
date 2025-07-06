import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class PaginationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const options = {
      limit: parseInt(req.query.limit as string, 10) || 10,
      page: parseInt(req.query.page as string, 10) || 1,
    };

    if (options.limit > 30) {
      throw new BadRequestException('Limit must be less than or equal to 30');
    }

    next();
  }
}
