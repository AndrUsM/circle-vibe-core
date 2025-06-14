import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user';
import { FileService } from 'src/core/services';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserService, FileService],
  exports: [AuthService]
})
export class AuthModule {}
