import { Test, TestingModule } from '@nestjs/testing';
import { MatchingController } from '../matching.controller';
import { MatchingService } from '../matching.service';
import { MatchingStrategy } from '../dto/create-matching-request.dto';
import { CurrentUserData } from '../../auth/decorators/current-user.decorator';

/**
 * MatchingController Tests
 *
 * Verifies the interaction between the controller and the service layer.
 * Focuses on parameter passing and authentication integration.
 */
describe('MatchingController', () => {
    let controller: MatchingController;
    let service: MatchingService;

    // Mock Service Implementation
    const mockMatchingService = {
        createMatchingRequest: jest.fn(),
        getMatchResults: jest.fn(),
        acceptMatch: jest.fn(),
        rejectMatch: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MatchingController],
            providers: [
                {
                    provide: MatchingService,
                    useValue: mockMatchingService,
                },
            ],
        }).compile();

        controller = module.get<MatchingController>(MatchingController);
        service = module.get<MatchingService>(MatchingService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    /**
     * Test Segment: Matching Request Creation
     * Verifies that the authenticated user ID is correctly injected into the DTO.
     */
    describe('createRequest', () => {
        it('should call service.createMatchingRequest with authenticated user ID', async () => {
            const dto = {
                strategy: MatchingStrategy.HYBRID,
                filters: {
                    location: { lat: 37.5, lng: 127.0 },
                    radius: 1000
                },
                targetType: 'user' as const,
                requesterType: 'user' as const
            };

            // Mock authenticated user injected by @CurrentUser() guard
            const mockUser: CurrentUserData = { userId: 'u1', email: 'test@example.com' };

            mockMatchingService.createMatchingRequest.mockResolvedValue({
                id: 'req-1',
                requesterId: 'u1',
                ...dto
            });

            // Call controller with mock user and DTO
            const result = await controller.createRequest(mockUser, dto as any);

            expect(result.id).toBe('req-1');
            expect(result.requesterId).toBe('u1');

            // Verify service called with correct parameters
            expect(service.createMatchingRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    requesterId: 'u1', // Validates ID injection
                    strategy: MatchingStrategy.HYBRID
                })
            );
        });
    });

    /**
     * Test Segment: Result Retrieval
     * Verifies fetching matching results using request ID.
     */
    describe('getResults', () => {
        it('should return service results by request ID', async () => {
            mockMatchingService.getMatchResults.mockResolvedValue({
                status: 'completed',
                results: []
            });

            const result = await controller.getResults('req-1');

            expect(result.status).toBe('completed');
            expect(service.getMatchResults).toHaveBeenCalledWith('req-1');
        });
    });

    /**
     * Test Segment: Match Acceptance
     * Verifies the acceptance logic including actor identification.
     */
    describe('acceptMatch', () => {
        it('should call service.acceptMatch with match ID and actor ID', async () => {
            const mockUser: CurrentUserData = { userId: 'u1', email: 'test@example.com' };

            mockMatchingService.acceptMatch.mockResolvedValue({
                id: 'm1',
                status: 'accepted'
            });

            // Pass mockUser as first argument, matchId as second
            const result = await controller.acceptMatch(mockUser, 'm1');

            expect(result.status).toBe('accepted');
            expect(service.acceptMatch).toHaveBeenCalledWith('m1', 'u1');
        });
    });

    /**
     * Test Segment: Match Rejection
     * Verifies the rejection logic including actor identification.
     */
    describe('rejectMatch', () => {
        it('should call service.rejectMatch with match ID and actor ID', async () => {
            const mockUser: CurrentUserData = { userId: 'u1', email: 'test@example.com' };

            mockMatchingService.rejectMatch.mockResolvedValue({
                id: 'm1',
                status: 'rejected'
            });

            const result = await controller.rejectMatch(mockUser, 'm1');

            expect(result.status).toBe('rejected');
            expect(service.rejectMatch).toHaveBeenCalledWith('m1', 'u1');
        });
    });
});
