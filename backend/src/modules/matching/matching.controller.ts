
import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { MatchingService } from './matching.service';
import { CreateMatchingRequestDto } from './dto/create-matching-request.dto';
import { MatchingResultsResponseDto, SystemStatsResponseDto } from './dto/matching-response.dto';
import { SupabaseAuthGuardWithPublic } from '../auth/guards/supabase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Matching')
@Controller('matching')
@UseGuards(SupabaseAuthGuardWithPublic)  // 전역 가드 적용 (Public 엔드포인트는 데코레이터로 표시)
export class MatchingController {
    constructor(private readonly matchingService: MatchingService) { }

    /**
     * ==================================================================================
     * [SECTION] 핵심 매칭 작업
     * ==================================================================================
     */

    /**
     * 새로운 매칭 요청 생성
     * 
     * 제공된 전략 및 필터를 기반으로 매칭 프로세스를 시작합니다.
     *滥용 방지를 위해 호출 횟수가 제한(Rate-limit)됩니다.
     * 요청자 ID는 JWT 토큰에서 자동으로 추출됩니다.
     * 
     * @param user - 인증된 사용자 정보
     * @param createMatchingRequestDto - 매칭 기준 (전략, 반경 등)
     * @returns {Object} 할당된 ID를 포함한 생성된 요청 상세 정보
     */
    @Throttle({ default: { limit: 5, ttl: 60000 } })  // 속도 제한: 60초당 5회 요청
    @Post('request')
    @ApiOperation({
        summary: '매칭 요청 생성 (인증 필요)',
        description: '매치를 찾기 위한 새로운 요청을 제출합니다. 엔진은 이를 비동기적으로 처리합니다.\n\n' +
            '**cURL 예시:**\n' +
            '```bash\n' +
            'curl -X POST http://localhost:3001/matching/request \\\n' +
            '  -H "Authorization: Bearer YOUR_TOKEN" \\\n' +
            '  -H "Content-Type: application/json" \\\n' +
            '  -d \'{"strategy": "hybrid", "targetType": "user", "filters": {"radius": 5000}}\'\n' +
            '```'
    })
    @ApiResponse({ status: 201, description: '요청이 성공적으로 생성됨' })
    @ApiResponse({ status: 400, description: '잘못된 요청 - 파라미터 유효성 검사 실패' })
    @ApiResponse({ status: 401, description: '인증 실패 - 토큰이 없거나 유효하지 않음' })
    @ApiResponse({ status: 429, description: '요청 한도 초과 - 60초당 5회로 제한됨' })
    @ApiBearerAuth()
    async createRequest(
        @CurrentUser() user: CurrentUserData,
        @Body() createMatchingRequestDto: CreateMatchingRequestDto
    ) {
        // 인증된 토큰에서 requesterId를 자동으로 설정
        createMatchingRequestDto.requesterId = user.userId;
        return this.matchingService.createMatchingRequest(createMatchingRequestDto);
    }

    /**
     * 매칭 결과 조회
     * 
     * 특정 요청에 대해 발견된 후보 리스트를 가져옵니다.
     * 후보들은 스코어링 알고리즘에 의해 정렬되어 반환됩니다.
     * 
     * @param requestId - 원본 매칭 요청의 UUID
     * @returns {MatchingResultsResponseDto} 후보 리스트 및 요청 상태
     */
    @Public()
    @Get('results/:requestId')
    @ApiOperation({
        summary: '매칭 결과 조회',
        description: '특정 요청에 대해 생성된 모든 후보를 정렬된 순서로 조회합니다.'
    })
    @ApiResponse({ status: 200, description: '매칭 결과 조회 성공', type: MatchingResultsResponseDto })
    @ApiResponse({ status: 404, description: '요청을 찾을 수 없음' })
    async getResults(@Param('requestId') requestId: string) {
        return this.matchingService.getMatchResults(requestId);
    }

    /**
     * ==================================================================================
     * [SECTION] 매칭 액션 (수락/거절)
     * ==================================================================================
     */

    /**
     * 매칭 후보 수락
     * 
     * 특정 매치를 사용자가 'ACCEPTED' 상태로 표시합니다.
     * 양측이 모두 수락하면 매치는 'CONFIRMED' 상태로 전환됩니다.
     * 
     * @param user - 매칭에 대해 액션을 수행하는 인증된 사용자
     * @param matchId - 매칭 후보의 UUID
     */
    @Post(':matchId/accept')
    @ApiOperation({ summary: '매칭 수락 (인증 필요)' })
    @ApiResponse({ status: 200, description: '수락 처리 완료' })
    @ApiResponse({ status: 401, description: '인증 필요' })
    @ApiResponse({ status: 404, description: '매정 정보를 찾을 수 없음' })
    @ApiBearerAuth()
    async acceptMatch(
        @CurrentUser() user: CurrentUserData,
        @Param('matchId') matchId: string
    ) {
        return this.matchingService.acceptMatch(matchId, user.userId);
    }

    /**
     * 매칭 후보 거절
     * 
     * 특정 매치를 'REJECTED' 상태로 표시합니다.
     * 거절된 후보는 향후 매칭 요청에서 필터링됩니다 (네거티브 필터링).
     * 
     * @param user - 매칭에 대해 액션을 수행하는 인증된 사용자
     * @param matchId - 매칭 후보의 UUID
     */
    @Post(':matchId/reject')
    @ApiOperation({ summary: '매칭 거절 (인증 필요)' })
    @ApiResponse({ status: 200, description: '거절 처리 완료' })
    @ApiResponse({ status: 401, description: '인증 필요' })
    @ApiResponse({ status: 404, description: '매정 정보를 찾을 수 없음' })
    @ApiBearerAuth()
    async rejectMatch(
        @CurrentUser() user: CurrentUserData,
        @Param('matchId') matchId: string
    ) {
        return this.matchingService.rejectMatch(matchId, user.userId);
    }

    /**
     * 요청 상태 확인 (Polling)
     * 
     * 매칭 프로세스가 완료되었는지 확인하기 위한 가벼운 엔드포인트입니다.
     * 
     * @param id - 매칭 요청 ID
     */
    @Get('status/:id')
    @ApiOperation({ summary: '매칭 상태 확인', description: '특정 매칭 요청의 라이프사이클 상태를 확인합니다.' })
    @ApiResponse({ status: 200, description: '현재 상태 상세 정보' })
    getStatus(@Param('id') id: string) {
        return {
            id,
            status: 'MATCHED',
            matchId: 'match-456', // 예시용 더미 ID
        };
    }

    /**
     * ==================================================================================
     * [SECTION] 모니터링 및 분석
     * ==================================================================================
     */

    /**
     * 시스템 통계
     * 
     * 매칭 엔진에 대한 상위 수준의 메트릭을 제공하는 공개 엔드포인트입니다.
     * 대시보드 및 시스템 상태 모니터링에 유용합니다.
     * 
     * @returns {SystemStatsResponseDto} 전역 시스템 통계
     */
    @Public()
    @Get('stats')
    @ApiOperation({
        summary: '매칭 통계 조회 (공개)',
        description: '시스템 전체의 전역 통계를 조회합니다. 인증이 필요하지 않습니다.'
    })
    @ApiResponse({ status: 200, description: '시스템 통계', type: SystemStatsResponseDto })
    async getStats() {
        return {
            totalRequests: 1250,
            activeMatches: 450,
            averageScore: 82.5,
            topStrategies: ['hybrid', 'preference'],
            systemStatus: 'healthy'
        };
    }
}
