import { Test, TestingModule } from '@nestjs/testing';
import {
  HealthCheckService,
  MemoryHealthIndicator,
  SequelizeHealthIndicator,
} from '@nestjs/terminus';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let health: { check: jest.Mock };

  beforeEach(async () => {
    health = { check: jest.fn().mockResolvedValue({ status: 'ok' }) };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: health },
        { provide: SequelizeHealthIndicator, useValue: { pingCheck: jest.fn() } },
        { provide: MemoryHealthIndicator, useValue: { checkHeap: jest.fn() } },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('runs the memory and database indicators', async () => {
    await expect(controller.check()).resolves.toEqual({ status: 'ok' });

    expect(health.check).toHaveBeenCalledWith([expect.any(Function), expect.any(Function)]);
  });
});
