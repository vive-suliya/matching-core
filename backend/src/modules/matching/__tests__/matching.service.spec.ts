import { Test, TestingModule } from '@nestjs/testing';
import { MatchingService } from '../matching.service';
import { SupabaseService } from '../../../database/supabase.service';
import { MatchingStrategy } from '../dto/create-matching-request.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('MatchingService Integration', () => {
    let service: MatchingService;
    let supabaseService: SupabaseService;

    const mockSupabaseClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
        rpc: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MatchingService,
                {
                    provide: SupabaseService,
                    useValue: {
                        getClient: () => mockSupabaseClient,
                    },
                },
                {
                    provide: CACHE_MANAGER,
                    useValue: {
                        get: jest.fn(),
                        set: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<MatchingService>(MatchingService);
        supabaseService = module.get<SupabaseService>(SupabaseService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createMatchingRequest', () => {
        it('should insert a request and return its ID', async () => {
            const dto = {
                requester_id: 'user-1',
                requester_type: 'user',
                target_type: 'user',
                strategy: MatchingStrategy.DISTANCE,
                filters: { location: [37.5, 127.0], radius: 5000 },
                settings: { distanceWeight: 0.8, preferenceWeight: 0.2 }
            };

            mockSupabaseClient.insert.mockResolvedValue({ data: { id: 'req-123' }, error: null });

            // Mock background processing
            jest.spyOn(service as any, 'processMatching').mockImplementation(() => Promise.resolve());

            const result = await service.createMatchingRequest(dto as any);
            expect(result.id).toBeDefined();
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('matching_requests');
        });
    });

    describe('getMatchResults', () => {
        it('should return matches for a given request', async () => {
            mockSupabaseClient.select.mockResolvedValueOnce({ data: { status: 'completed' }, error: null });
            mockSupabaseClient.select.mockResolvedValueOnce({
                data: [
                    { id: 'm1', entity_a_id: 'u1', entity_b_id: 'u2', score: 95, status: 'proposed' }
                ],
                error: null
            });

            // Mock getEntityDetails
            jest.spyOn(service as any, 'getEntityDetails').mockImplementation((id) => Promise.resolve({ id, name: 'Test' }));

            const results = await service.getMatchResults('req-123');
            expect(results.status).toBe('completed');
            expect(results.results.length).toBe(1);
            expect(results.results[0].score).toBe(95);
        });
    });
});
