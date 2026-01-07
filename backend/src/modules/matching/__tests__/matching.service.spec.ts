import { Test, TestingModule } from '@nestjs/testing';
import { MatchingService } from '../matching.service';
import { SupabaseService } from '../../../database/supabase.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateMatchingRequestDto, MatchingStrategy, RequesterType, TargetType } from '../dto/create-matching-request.dto';
import { InternalServerErrorException } from '@nestjs/common';

describe('MatchingService', () => {
    let service: MatchingService;
    let mockSupabaseClient: any;
    let mockSupabaseBuilder: any;

    const mockCacheManager = {
        get: jest.fn(),
        set: jest.fn(),
    };

    const originalEnv = process.env;

    beforeAll(() => {
        jest.resetModules();
        process.env = { ...originalEnv, NODE_ENV: 'development' };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    beforeEach(async () => {
        // Robust Recursive Mock Builder
        mockSupabaseBuilder = {
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({ data: [], error: null }), // Default Promise return
            single: jest.fn().mockResolvedValue({ data: {}, error: null }), // Default Promise return
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
            ],
        }).compile();

        service = module.get<MatchingService>(MatchingService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createMatchingRequest', () => {
        it('should create request and trigger background processing', async () => {
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

    describe('getCandidates (private method test via public interface logic)', () => {
        it('should call PostGIS RPC function', async () => {
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

        it('should return mock candidates on RPC error in dev mode', async () => {
            mockSupabaseClient.rpc.mockResolvedValue({
                data: null,
                error: { message: 'DB Error' },
            });

            // Ensure fallback also simulates failure
            mockSupabaseBuilder.limit.mockResolvedValue({ data: null, error: { message: 'Fallback Error' } });

            const getCandidates = (service as any).getCandidates.bind(service);
            const request = {
                requester_id: 'user-1',
                target_type: 'user',
                filters: { location: [37.5665, 126.9780] },
            };

            const result = await getCandidates(request, {});

            // Should fall back to mock generation in Dev mode
            expect(result).toHaveLength(5);
        });
    });
});
