import { Test, TestingModule } from '@nestjs/testing';
import { MatchingService } from '../matching.service';
import { SupabaseService } from '../../../database/supabase.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateMatchingRequestDto, MatchingStrategy, RequesterType, TargetType } from '../dto/create-matching-request.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { MetricsService } from '../../monitoring/metrics.service';

/**
 * MatchingService 유닛 테스트
 */
describe('MatchingService', () => {
    let service: MatchingService;
    let mockSupabaseClient: any;
    let mockSupabaseBuilder: any;

    const mockMetricsService = {
        matchingRequestCounter: { inc: jest.fn() },
        matchingDurationHistogram: { observe: jest.fn() },
    };

    const mockCacheManager = {
        get: jest.fn(),
        set: jest.fn(),
    };

    const originalEnv = process.env;

    // 환경 변수 설정 (개발 모드 폴백 테스트를 위해)
    beforeAll(() => {
        jest.resetModules();
        process.env = { ...originalEnv, NODE_ENV: 'development' };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    beforeEach(async () => {
        // 강력한 재귀적 모의 라이브러리 빌더 (Chaining 지원)
        mockSupabaseBuilder = {
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({ data: [], error: null }), // 기본 Promise 반환
            single: jest.fn().mockResolvedValue({ data: {}, error: null }), // 기본 Promise 반환
        };

        mockSupabaseClient = {
            from: jest.fn().mockReturnValue(mockSupabaseBuilder),
            rpc: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MatchingService,
                {
                    provide: SupabaseService,
                    useValue: {
                        getClient: jest.fn().mockReturnValue(mockSupabaseClient),
                    },
                },
                {
                    provide: CACHE_MANAGER,
                    useValue: mockCacheManager,
                },
                {
                    provide: MetricsService,
                    useValue: mockMetricsService,
                },
            ],
        }).compile();

        service = module.get<MatchingService>(MatchingService);
    });

    it('서비스가 정의되어 있어야 함', () => {
        expect(service).toBeDefined();
    });

    /**
     * [테스트 세그먼트] 매칭 요청 생성
     */
    describe('createMatchingRequest (매칭 요청 생성)', () => {
        it('요청을 생성하고 비동기 처리를 시작해야 함', async () => {
            const mockRequestData = {
                id: 'test-req-id',
                requester_id: 'user-1',
                requester_type: 'user',
                target_type: 'team',
                strategy: 'hybrid',
                status: 'active',
                settings: {},
            };

            mockSupabaseBuilder.single.mockResolvedValue({
                data: mockRequestData,
                error: null,
            });

            const dto: CreateMatchingRequestDto = {
                requesterId: 'user-1',
                requesterType: RequesterType.USER,
                targetType: TargetType.TEAM,
                strategy: MatchingStrategy.HYBRID,
                filters: { location: [37.5665, 126.9780] as [number, number], radius: 5000, categories: [] },
            };

            const result = await service.createMatchingRequest(dto);

            expect(result).toBeDefined();
            expect(result.id).toBe('test-req-id');
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('matching_requests');
        });
    });

    /**
     * [테스트 세그먼트] 후보군 검색 (getCandidates)
     */
    describe('getCandidates (후보군 검색)', () => {
        it('PostGIS RPC 함수를 호출해야 함', async () => {
            const mockCandidates = [
                { id: 'c1', distance: 1000, categories: ['sports'], location: { coordinates: [126.9780, 37.5665] } },
            ];

            mockSupabaseClient.rpc.mockResolvedValue({
                data: mockCandidates,
                error: null,
            });

            const getCandidates = (service as any).getCandidates.bind(service);
            const request = {
                requester_id: 'user-1',
                target_type: 'user',
                filters: { location: [37.5665, 126.9780], radius: 5000, categories: ['sports'] },
            };
            const settings = { enableNegativeFilter: true };

            const result = await getCandidates(request, settings);

            expect(result).toHaveLength(1);
            expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('get_candidates_v2', expect.objectContaining({
                p_radius: 5000,
                p_use_negative_filter: true,
            }));
        });

        it('개발 모드에서 RPC 에러 발생 시 모의 후보군을 반환해야 함', async () => {
            mockSupabaseClient.rpc.mockResolvedValue({
                data: null,
                error: { message: 'DB Error' },
            });

            // 폴백 모드에서도 실패 시뮬레이션
            mockSupabaseBuilder.limit.mockResolvedValue({ data: null, error: { message: 'Fallback Error' } });

            const getCandidates = (service as any).getCandidates.bind(service);
            const request = {
                requester_id: 'user-1',
                target_type: 'user',
                filters: { location: [37.5665, 126.9780] },
            };

            const result = await getCandidates(request, {});

            // 개발 모드에서는 모의 데이터 생성으로 폴백되어야 함
            expect(result).toHaveLength(5);
        });
    });
});
