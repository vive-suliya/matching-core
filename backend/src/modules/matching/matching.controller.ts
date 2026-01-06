
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
@UseGuards(SupabaseAuthGuardWithPublic)  // 전체 컨트롤러에 인증 적용
export class MatchingController {
    constructor(private readonly matchingService: MatchingService) { }

    @Throttle({ default: { limit: 5, ttl: 60000 } })  // 60초에 5개 요청만 허용
    @Post('request')
    @ApiOperation({
        summary: 'Create a matching request (인증 필요)',
        description: 'Submit a new request to find a match. Requires authentication.'
    })
    @ApiResponse({ status: 201, description: 'Request created successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
    @ApiBearerAuth()
    async createRequest(
        @CurrentUser() user: CurrentUserData,
        @Body() createMatchingRequestDto: CreateMatchingRequestDto
    ) {
        // 인증된 사용자 ID를 자동으로 설정
        createMatchingRequestDto.requesterId = user.userId;
        return this.matchingService.createMatchingRequest(createMatchingRequestDto);
    }

    @Get('status/:id')
    @ApiOperation({ summary: 'Get matching status', description: 'Check the status of a specific matching request.' })
    @ApiResponse({ status: 200, description: 'Current status details' })
    getStatus(@Param('id') id: string) {
        return {
            id,
            status: 'MATCHED',
            matchId: 'match-456',
        };
    }
    @Get('results/:requestId')
    @ApiOperation({
        summary: 'Get matching results',
        description: 'Retrieves all matches generated for a specific request. Status can be "active", "completed", or "failed".'
    })
    @ApiResponse({ status: 200, description: 'Matching results', type: MatchingResultsResponseDto })
    async getResults(@Param('requestId') requestId: string) {
        return this.matchingService.getMatchResults(requestId);
    }

    @Post(':matchId/accept')
    @ApiOperation({ summary: 'Accept a match (인증 필요)' })
    @ApiBearerAuth()
    async acceptMatch(
        @CurrentUser() user: CurrentUserData,
        @Param('matchId') matchId: string
    ) {
        // 인증된 사용자 ID를 자동으로 사용
        return this.matchingService.acceptMatch(matchId, user.userId);
    }

    @Post(':matchId/reject')
    @ApiOperation({ summary: 'Reject a match (인증 필요)' })
    @ApiBearerAuth()
    async rejectMatch(
        @CurrentUser() user: CurrentUserData,
        @Param('matchId') matchId: string
    ) {
        // 인증된 사용자 ID를 자동으로 사용
        return this.matchingService.rejectMatch(matchId, user.userId);
    }

    @Public()  // 통계는 공개 엔드포인트
    @Get('stats')
    @ApiOperation({
        summary: 'Get matching statistics (공개)',
        description: 'Retrieve global system-wide stats for performance monitoring. No authentication required.'
    })
    @ApiResponse({ status: 200, description: 'System statistics', type: SystemStatsResponseDto })
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
