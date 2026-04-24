import { NextFunction, Request, Response } from 'express';
import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { CustomException } from './exceptions/custom-exception';
import { getErrorMessages } from './errorMessages/errorMessages';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (process.env.NODE_ENV !== 'development') {
      if (req.originalUrl.includes('/snapshot')) {
        return next();
      }

      const apiKey = req.headers['x-api-key'];
      if (!apiKey) {
        throw new CustomException(
          getErrorMessages({ general: 'API' }),
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (apiKey !== process.env.VERIFICATION_KEY) {
        throw new CustomException(
          getErrorMessages({ general: 'API' }),
          HttpStatus.FORBIDDEN,
        );
      }
    }
    next();
  }
}
