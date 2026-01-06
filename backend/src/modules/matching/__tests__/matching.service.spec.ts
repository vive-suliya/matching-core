import { Test, TestingModule } from '@nestjs/testing';
import { MatchingService } from '../matching.service';
import { SupabaseService } from '../../../database/supabase.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateMatchingRequestDto, MatchingStrategy, RequesterType, TargetType } from '../dto/create-matching-request.dto';
import { InternalServerErrorException } from '@nestjs/common';

describe('MatchingService', () => {
    let service: MatchingService;
    let mockSupabaseClient: any;

    const mockCacheManager = {
        get: jest.fn(),
        set: jest.fn(),
    };

    beforeEach(async () => {
        // Mock Supabase Client Chain
        const mockSingle = jest.fn();
        const mockSelect = jest.fn().mockReturnValue({ single: mockSingle, order: jest.fn().mockReturnValue({ data: [] }), limit: jest.fn().mockReturnValue({ data: [] }) });
        const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
        const mockUpdate = jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ select: mockSelect }) });
        const mockEq = jest.fn().mockReturnValue({ single: mockSingle, select: mockSelect });
        const mockFrom = jest.fn().mockReturnValue({
            insert: mockInsert,
            select: mockSelect,
            update: mockUpdate, // Update mock added
            eq: mockEq,         // Eq mock added
        });
        const mockRpc = jest.fn();

        mockSupabaseClient = {
            from: mockFrom,
            rpc: mockRpc,
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

            // Setup mock implementation
            mockSupabaseClient.from().insert().select().single.mockResolvedValue({
                data: mockRequestData,
                error: null,
            });

            // Mock getEntity to avoid actual logic for now if possible, or just let it fail/mock inside
            // Since processMatching is async (fire & forget), errors there won't fail this test unless we await it.
            // But createMatchingRequest calls processMatching without await.

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
        // Since getCandidates is private, we test it through createMatchingRequest 
        // OR we can use 'any' casting to access it for unit testing.

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

        it('should throw InternalServerErrorException on RPC error', async () => {
            mockSupabaseClient.rpc.mockResolvedValue({
                data: null,
                error: { message: 'DB Error' },
            });

            const getCandidates = (service as any).getCandidates.bind(service);
            const request = {
                requester_id: 'user-1',
                target_type: 'user',
                filters: { location: [37.5665, 126.9780] },
            };

            await expect(getCandidates(request, {})).rejects.toThrow(InternalServerErrorException);
        });
    });
});
