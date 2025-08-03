import { Test, TestingModule } from '@nestjs/testing';
import { UserConfirmationService } from './user-confirmation.service';

describe('UserConfirmationService', () => {
  let service: UserConfirmationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserConfirmationService],
    }).compile();

    service = module.get<UserConfirmationService>(UserConfirmationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
