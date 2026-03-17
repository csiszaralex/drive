import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AppConfigService } from 'src/configs/app-config.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly configService: AppConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const pass = request.headers['x-admin-pass'];

    if (!pass || pass !== this.configService.get('ADMIN_PASS')) {
      throw new UnauthorizedException('Érvénytelen vagy hiányzó admin jelszó.');
    }
    return true;
  }
}
