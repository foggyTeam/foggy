import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';
import { ApiKeyMiddleware } from './api-key.middleware';
import { BoardGateway } from './websocket/board.gateway';
import { ProjectModule } from './projects/projects.module';
import { BoardModule } from './board/board.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, '../../.env'),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        autoIndex: configService.get<string>('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    ProjectModule,
    BoardModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, BoardGateway],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiKeyMiddleware).exclude('websocket/(.*)').forRoutes('*');
  }
}
