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
  });

  const config = new DocumentBuilder()
    .setTitle('Foggy API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(configService.get<number>('BACKEND_PORT'));
}

bootstrap();
