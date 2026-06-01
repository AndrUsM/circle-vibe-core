import { forwardRef, Module } from '@nestjs/common';
import { UserService, UserAuthService } from './service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { FileServiceModule } from '../../core/services';
import { AuthModule } from '../auth';

@Module({
  imports: [FileServiceModule, forwardRef(() => AuthModule)],
  providers: [UserService, UserAuthService, UserRepository],
  controllers: [UserController],
  exports: [UserService, UserAuthService, UserRepository],
})
export class UsersModule {}
