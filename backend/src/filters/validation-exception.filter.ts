import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationError } from 'class-validator';
import { CustomException } from '../exceptions/custom-exception';

@Catch(HttpException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as {
      statusCode: number;
      message: ValidationError[] | string;
      errors?: Record<string, string>;
    };

    if (exception instanceof CustomException) {
      response.status(status).json(exceptionResponse);
    } else if (Array.isArray(exceptionResponse.message)) {
      const formattedErrors = exceptionResponse.message.reduce((acc, error) => {
        if (error.constraints) {
          acc[error.property] = Object.values(error.constraints)[0];
        }
        return acc;
      }, {});

      response.status(status).json({
        statusCode: status,
        errors: formattedErrors,
      });
    } else {
      response.status(status).json({
        statusCode: status,
        message: exception.message,
      });
    }
  }
}
