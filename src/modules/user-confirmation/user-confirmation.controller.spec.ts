import { Test, TestingModule } from '@nestjs/testing';
import { UserConfirmationController } from './user-confirmation.controller';

describe('UserConfirmationController', () => {
  let controller: UserConfirmationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserConfirmationController],
    }).compile();

    controller = module.get<UserConfirmationController>(UserConfirmationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
