import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { Socket } from 'socket.io';
import { Observable } from 'rxjs';

import {SocketAuthParams} from './params';
import { AuthService } from 'src/modules/auth/auth.service';


@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const token = this.#getTokenFromSocket(client);
    const personalToken = (client.handshake.auth as SocketAuthParams)?.personalToken ;

    const { isValid } = this.authService.parseJWT(token, personalToken);

    if (!token || !isValid || !personalToken) {
      return false;
    }

    return isValid;
  }

  #getTokenFromSocket(socket: Socket): string {
    return socket.handshake.auth?.token || socket.handshake.headers?.authorization;
  }
}