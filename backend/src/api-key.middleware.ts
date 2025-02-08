import { Request, Response, NextFunction } from 'express';
import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { CustomException } from './exceptions/custom-exception';
import { getErrorMessages } from './errorMessages';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.VERIFICATION_KEY) {
      console.log(apiKey, 'VERIFICATION_KEY');
      throw new CustomException(
        getErrorMessages({ general: 'API' }),
        HttpStatus.CONFLICT,
      );
    }
    next();
  }
}
