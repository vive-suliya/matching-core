import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseService } from './database/supabase.service';

import { MetricsService } from './modules/monitoring/metrics.service';

/**
 * AppController 유닛 테스트
 */
describe('AppController', () => {
  let appController: AppController;

  const mockMetricsService = {
    getMetrics: jest.fn().mockResolvedValue('metrics_data'),
  };

  // 헬스 체크를 위한 SupabaseClient 모킹
  const mockSupabaseClient = {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'test-user' },
            error: null,
          }),
        }),
      }),
    }),
  };

  const mockSupabaseService = {
    getClient: jest.fn().mockReturnValue(mockSupabaseClient),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('루트 엔드포인트 (getHello)', () => {
    it('서버 기본 정보를 반환해야 함', () => {
      const response = appController.getHello();
      expect(response).toHaveProperty('name', 'Matching Core Engine');
      expect(response).toHaveProperty('status', 'operational');
    });
  });

  describe('헬스 체크 (getHealth)', () => {
    it('시스템 상태 및 DB 연결 정보를 반환해야 함', async () => {
      const response = await appController.getHealth();
      expect(response).toHaveProperty('status', 'ok');
      expect(response.checks.database).toHaveProperty('status', 'healthy');
    });
  });
});
