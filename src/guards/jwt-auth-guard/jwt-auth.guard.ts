import * as jwt from 'jsonwebtoken';
import { isTokenExpired } from '@circle-vibe/shared';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { HashedTokenParams } from 'src/modules/auth/types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request & HashedTokenParams = context.switchToHttp().getRequest();

    const authHeader = request.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException('No authorization header');

    const token = authHeader;
    if (!token) throw new UnauthorizedException('Token missing');

    if (isTokenExpired(token)) {
      throw new UnauthorizedException('Token expired');
    }

    try {
      const decoded = jwt.decode(token) as jwt.JwtPayload & HashedTokenParams;
      request.userId = decoded?.userId;

      return decoded?.exp ? !isTokenExpired(decoded?.exp) : false;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}