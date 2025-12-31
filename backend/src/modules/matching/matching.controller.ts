
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MatchingService } from './matching.service';
import { CreateMatchingRequestDto } from './dto/create-matching-request.dto';

@ApiTags('Matching')
@Controller('matching')
export class MatchingController {
    constructor(private readonly matchingService: MatchingService) { }

    @Post('request')
    @ApiOperation({ summary: 'Create a matching request', description: 'Submit a new request to find a match.' })
    @ApiResponse({ status: 201, description: 'Request created successfully' })
    async createRequest(@Body() createMatchingRequestDto: CreateMatchingRequestDto) {
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
    @ApiOperation({ summary: 'Get matching results' })
    @ApiResponse({ status: 200, description: 'Matching results' })
    async getResults(@Param('requestId') requestId: string) {
        return this.matchingService.getMatchResults(requestId);
    }

    @Post(':matchId/accept')
    @ApiOperation({ summary: 'Accept a match' })
    async acceptMatch(
        @Param('matchId') matchId: string,
        @Body() body: { actorId: string }
    ) {
        return this.matchingService.acceptMatch(matchId, body.actorId);
    }

    @Post(':matchId/reject')
    @ApiOperation({ summary: 'Reject a match' })
    async rejectMatch(
        @Param('matchId') matchId: string,
        @Body() body: { actorId: string }
    ) {
        return this.matchingService.rejectMatch(matchId, body.actorId);
    }
}
