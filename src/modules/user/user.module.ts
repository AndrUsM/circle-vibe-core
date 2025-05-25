import { Module } from '@nestjs/common';
import { UserService } from './user.service';

@Module({
  imports: [UserService],
  providers: [UserService],
})
export class UsersModule {}
