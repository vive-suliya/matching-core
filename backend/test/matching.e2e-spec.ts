import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { SupabaseService } from './../src/database/supabase.service';

describe('Matching System (e2e)', () => {
    let app: INestApplication;

    // Mock Supabase with improved chaining
    const mockSupabaseBuilder: any = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { id: 'test-id' }, error: null }),
    };

    const mockSupabaseClient = {
        from: jest.fn().mockReturnValue(mockSupabaseBuilder),
        rpc: jest.fn().mockResolvedValue({ data: [], error: null }),
    };

    const mockSupabaseService = {
        getClient: jest.fn().mockReturnValue(mockSupabaseClient),
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(SupabaseService)
            .useValue(mockSupabaseService)
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    /**
     * [E2E] 시스템 상태 확인
     */
    it('/health (GET) - 시스템 상태 확인', () => {
        return request(app.getHttpServer())
            .get('/health')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty('status', 'ok');
            });
    });

    /**
     * [E2E] 지표 확인
     */
    it('/metrics (GET) - Prometheus 지표 출력 확인', () => {
        return request(app.getHttpServer())
            .get('/metrics')
            .expect(200)
            .expect((res) => {
                expect(res.text).toContain('matching_requests_total');
            });
    });

    /**
     * [E2E] 비인가 접근 테스트
     */
    it('/matching/request (POST) - 토큰 없이 접근 시 401 반환해야 함', () => {
        return request(app.getHttpServer())
            .post('/matching/request')
            .send({ strategy: 'distance' })
            .expect(401);
    });

    /**
     * [E2E] 매칭 결과 조회
     */
    it('/matching/results/:id (GET) - 결과 조회 확인', async () => {
        const response = await request(app.getHttpServer())
            .get('/matching/results/req-123')
            .expect(200);

        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('results');
    });
});
