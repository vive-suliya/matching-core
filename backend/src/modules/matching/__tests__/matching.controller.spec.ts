import { Test, TestingModule } from '@nestjs/testing';
import { MatchingController } from '../matching.controller';
import { MatchingService } from '../matching.service';
import { MatchingStrategy } from '../dto/create-matching-request.dto';
import { CurrentUserData } from '../../auth/decorators/current-user.decorator';

/**
 * MatchingController 테스트
 * 
 * 컨트롤러와 서비스 계층 간의 상호작용을 검증합니다.
 * 주로 파라미터 전달 및 인증 정보 통합에 중점을 둡니다.
 */
describe('MatchingController', () => {
    let controller: MatchingController;
    let service: MatchingService;

    // 서비스 모킹(Mock) 구현
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

    it('컨트롤러가 정의되어 있어야 함', () => {
        expect(controller).toBeDefined();
    });

    /**
     * [테스트 세그먼트] 매칭 요청 생성
     * 인증된 사용자 ID가 DTO에 올바르게 주입되는지 확인합니다.
     */
    describe('createRequest (매칭 요청 생성)', () => {
        it('인증된 사용자 ID를 포함하여 service.createMatchingRequest를 호출해야 함', async () => {
            const dto = {
                strategy: MatchingStrategy.HYBRID,
                filters: {
                    location: { lat: 37.5, lng: 127.0 },
                    radius: 1000
                },
                targetType: 'user' as const,
                requesterType: 'user' as const
            };

            // @CurrentUser() 가드에 의해 주입될 모의 사용자 데이터
            const mockUser: CurrentUserData = { userId: 'u1', email: 'test@example.com' };

            mockMatchingService.createMatchingRequest.mockResolvedValue({
                id: 'req-1',
                requesterId: 'u1',
                ...dto
            });

            // 모의 사용자와 DTO로 컨트롤러 메서드 호출
            const result = await controller.createRequest(mockUser, dto as any);

            expect(result.id).toBe('req-1');
            expect(result.requesterId).toBe('u1');

            // 서비스가 올바른 파라미터와 함께 호출되었는지 확인
            expect(service.createMatchingRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    requesterId: 'u1', // ID 주입 검증
                    strategy: MatchingStrategy.HYBRID
                })
            );
        });
    });

    /**
     * [테스트 세그먼트] 결과 조회
     * 요청 ID를 통한 매칭 결과 조회 로직을 확인합니다.
     */
    describe('getResults (결과 조회)', () => {
        it('요청 ID에 해당하는 서비스 결과를 반환해야 함', async () => {
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
     * [테스트 세그먼트] 매칭 수락
     * 수행자(Actor) 식별을 포함한 수락 로직을 확인합니다.
     */
    describe('acceptMatch (매칭 수락)', () => {
        it('매칭 ID와 수행자 ID를 포함하여 service.acceptMatch를 호출해야 함', async () => {
            const mockUser: CurrentUserData = { userId: 'u1', email: 'test@example.com' };

            mockMatchingService.acceptMatch.mockResolvedValue({
                id: 'm1',
                status: 'accepted'
            });

            const result = await controller.acceptMatch(mockUser, 'm1');

            expect(result.status).toBe('accepted');
            expect(service.acceptMatch).toHaveBeenCalledWith('m1', 'u1');
        });
    });

    /**
     * [테스트 세그먼트] 매칭 거절
     * 수행자(Actor) 식별을 포함한 거절 로직을 확인합니다.
     */
    describe('rejectMatch (매칭 거절)', () => {
        it('매칭 ID와 수행자 ID를 포함하여 service.rejectMatch를 호출해야 함', async () => {
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
