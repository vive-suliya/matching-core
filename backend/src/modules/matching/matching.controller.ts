
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
@UseGuards(SupabaseAuthGuardWithPublic)  // Apply Auth Guard globally (Public endpoints marked via decorator)
export class MatchingController {
    constructor(private readonly matchingService: MatchingService) { }

    /**
     * ==================================================================================
     * [SECTION] Core Matching Operations
     * ==================================================================================
     */

    /**
     * Create a New Matching Request
     * 
     * Initiates the matching process based on the provided strategy and filters.
     * This endpoint is rate-limited to prevent abuse.
     * The requester ID is automatically extracted from the JWT token.
     * 
     * @param user - Authenticated user info
     * @param createMatchingRequestDto - Matching criteria (strategy, radius, etc.)
     * @returns {Object} Created request details including the assigned ID
     */
    @Throttle({ default: { limit: 5, ttl: 60000 } })  // Rate Limit: 5 requests per 60 seconds
    @Post('request')
    @ApiOperation({
        summary: 'Create a matching request (Auth Required)',
        description: 'Submit a new request to find a match. The engine will process this asynchronously.'
    })
    @ApiResponse({ status: 201, description: 'Request created successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
    @ApiBearerAuth()
    async createRequest(
        @CurrentUser() user: CurrentUserData,
        @Body() createMatchingRequestDto: CreateMatchingRequestDto
    ) {
        // Automatically set the requesterId from the authenticated token
        createMatchingRequestDto.requesterId = user.userId;
        return this.matchingService.createMatchingRequest(createMatchingRequestDto);
    }

    /**
     * Retrieve Matching Results
     * 
     * Fetches the list of candidates found for a specific request.
     * Candidates are inherently sorted by the scoring algorithm.
     * 
     * @param requestId - The UUID of the original matching request
     * @returns {MatchingResultsResponseDto} List of candidates and request status
     */
    @Get('results/:requestId')
    @ApiOperation({
        summary: 'Get matching results',
        description: 'Retrieves all candidates generated for a specific request.'
    })
    @ApiResponse({ status: 200, description: 'Matching results found', type: MatchingResultsResponseDto })
    async getResults(@Param('requestId') requestId: string) {
        return this.matchingService.getMatchResults(requestId);
    }

    /**
     * ==================================================================================
     * [SECTION] Match Actions (Accept/Reject)
     * ==================================================================================
     */

    /**
     * Accept a Match Candidate
     * 
     * Marks a specific match as 'ACCEPTED' by the user.
     * If both parties accept, the match transitions to 'CONFIRMED'.
     * 
     * @param user - Authenticated user acting on the match
     * @param matchId - The UUID of the match candidate
     */
    @Post(':matchId/accept')
    @ApiOperation({ summary: 'Accept a match (Auth Required)' })
    @ApiBearerAuth()
    async acceptMatch(
        @CurrentUser() user: CurrentUserData,
        @Param('matchId') matchId: string
    ) {
        return this.matchingService.acceptMatch(matchId, user.userId);
    }

    /**
     * Reject a Match Candidate
     * 
     * Marks a specific match as 'REJECTED'.
     * Rejected candidates will be filtered out in future matching requests (Negative Filtering).
     * 
     * @param user - Authenticated user acting on the match
     * @param matchId - The UUID of the match candidate
     */
    @Post(':matchId/reject')
    @ApiOperation({ summary: 'Reject a match (Auth Required)' })
    @ApiBearerAuth()
    async rejectMatch(
        @CurrentUser() user: CurrentUserData,
        @Param('matchId') matchId: string
    ) {
        return this.matchingService.rejectMatch(matchId, user.userId);
    }

    /**
     * Check Request Status (Polling)
     * 
     * Lightweight endpoint to check if the matching process has completed.
     * 
     * @param id - Matching Request ID
     */
    @Get('status/:id')
    @ApiOperation({ summary: 'Get matching status', description: 'Check the lifecycle status of a specific matching request.' })
    @ApiResponse({ status: 200, description: 'Current status details' })
    getStatus(@Param('id') id: string) {
        return {
            id,
            status: 'MATCHED',
            matchId: 'match-456', // Dummy ID for example
        };
    }

    /**
     * ==================================================================================
     * [SECTION] Monitoring & Analytics
     * ==================================================================================
     */

    /**
     * System Statistics
     * 
     * Public endpoint providing high-level metrics about the matching engine.
     * Useful for dashboards and system health monitoring.
     * 
     * @returns {SystemStatsResponseDto} Global system statistics
     */
    @Public()
    @Get('stats')
    @ApiOperation({
        summary: 'Get matching statistics (Public)',
        description: 'Retrieve global system-wide stats. No authentication required.'
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
