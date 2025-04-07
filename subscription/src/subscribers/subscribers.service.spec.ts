import { Test, TestingModule } from '@nestjs/testing';
import { SubscribersService } from './subscribers.service';
import { PrismaModule } from '../prisma/prisma.module';

describe('SubscribersService', () => {
  let service: SubscribersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [SubscribersService],
    }).compile();

    service = module.get<SubscribersService>(SubscribersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
