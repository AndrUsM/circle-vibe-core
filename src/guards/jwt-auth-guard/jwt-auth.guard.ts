import * as jwt from 'jsonwebtoken';
import { isTokenExpired } from '@circle-vibe/shared';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { HashedTokenParams } from 'src/modules/auth/types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request & HashedTokenParams = context
      .switchToHttp()
      .getRequest();

    const token = (request.headers['authorization'] as string) ?? null;

    if (!token) throw new UnauthorizedException('No authorization header');

    try {
      const decoded = jwt.decode(token) as jwt.JwtPayload & HashedTokenParams;
      request.userId = decoded?.userId;

      return decoded?.exp ? !isTokenExpired(decoded?.exp) : false;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
