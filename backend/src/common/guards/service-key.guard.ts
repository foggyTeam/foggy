import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class SyncServiceGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const serviceKey = request.headers['x-service-key'];
    const validKey = process.env.SYNC_VERIFICATION_KEY;

    if (!serviceKey || serviceKey !== validKey) {
      throw new UnauthorizedException('Invalid or missing x-service-key');
    }

    return true;
  }
}
