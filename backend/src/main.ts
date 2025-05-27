import { NestFactory } from '@nestjs/core';
import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationExceptionFilter } from './filters/validation-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        return new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: errors,
          },
          HttpStatus.BAD_REQUEST,
        );
      },
    }),
  );
  app.useGlobalFilters(new ValidationExceptionFilter());

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>('FRONTEND_URI'),
    methods: 'GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS',
    credentials: true,
    allowedHeaders: ['x-api-key', 'x-user-id'],
  });

  const config = new DocumentBuilder()
    .setTitle('Foggy API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'API Key for external services',
      },
      'x-api-key',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-user-id',
        in: 'header',
        description: 'User ID for authentication',
      },
      'x-user-id',
    )
    .addSecurityRequirements('x-api-key', [])
    .addSecurityRequirements('x-user-id', [])
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      apisSorter: 'alpha',
      tagsSorter: 'order',
      filter: true,
      persistAuthorization: true,
      operationsSorter: (a, b) => {
        const order = ['post', 'get', 'patch', 'put', 'delete'];
        const methodA = a.get('method');
        const methodB = b.get('method');
        return order.indexOf(methodA) - order.indexOf(methodB);
      },
    },
  });

  await app.listen(configService.get<number>('BACKEND_PORT'));
}

bootstrap();
