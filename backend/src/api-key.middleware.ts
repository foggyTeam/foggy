import { Request, Response, NextFunction } from 'express';
import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { CustomException } from './exceptions/custom-exception';
import { getErrorMessages } from './errorMessages';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (process.env.NODE_ENV !== 'development') {
      const apiKey = req.headers['x-api-key'];
      if (apiKey !== process.env.VERIFICATION_KEY) {
        throw new CustomException(
          getErrorMessages({ general: 'API' }),
          HttpStatus.CONFLICT,
        );
      }
    }
    next();
  }
}
