import { Test, TestingModule } from '@nestjs/testing';
import { MatchingController } from '../matching.controller';
import { MatchingService } from '../matching.service';
import { MatchingStrategy } from '../dto/create-matching-request.dto';

describe('MatchingController', () => {
    let controller: MatchingController;
    let service: MatchingService;

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

    describe('createRequest', () => {
        it('should call service.createMatchingRequest', async () => {
            const dto = {
                requester_id: 'u1',
                requester_type: 'user',
                target_type: 'user',
                strategy: MatchingStrategy.HYBRID,
                filters: { location: [37, 127], radius: 1000 }
            };
            mockMatchingService.createMatchingRequest.mockResolvedValue({ id: 'req-1' });

            const result = await controller.createRequest(dto as any);
            expect(result.id).toBe('req-1');
            expect(service.createMatchingRequest).toHaveBeenCalledWith(dto);
        });
    });

    describe('getResults', () => {
        it('should return service results', async () => {
            mockMatchingService.getMatchResults.mockResolvedValue({ status: 'completed', results: [] });
            const result = await controller.getResults('req-1');
            expect(result.status).toBe('completed');
            expect(service.getMatchResults).toHaveBeenCalledWith('req-1');
        });
    });

    describe('acceptMatch', () => {
        it('should call service.acceptMatch', async () => {
            mockMatchingService.acceptMatch.mockResolvedValue({ status: 'accepted' });
            const result = await controller.acceptMatch('m1', { actorId: 'u1' });
            expect(result.status).toBe('accepted');
            expect(service.acceptMatch).toHaveBeenCalledWith('m1', 'u1');
        });
    });
});
