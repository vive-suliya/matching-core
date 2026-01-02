
import { ApiProperty } from '@nestjs/swagger';

export class EntityPreviewDto {
    @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
    id: string;

    @ApiProperty({ example: 'user' })
    type: string;

    @ApiProperty({ example: 'Alice' })
    name: string;

    @ApiProperty({ example: 'https://example.com/avatar.png', required: false })
    avatarUrl?: string;

    @ApiProperty({ example: [37.5665, 126.9780], required: false })
    location?: [number, number];
}

export class MatchMetadataDto {
    @ApiProperty({ example: 1200, description: 'Distance in meters', required: false })
    distance?: number;

    @ApiProperty({ example: 'Matching focus on proximity and sports interests.', required: false })
    explanation?: string;

    @ApiProperty({ example: 85, description: 'Percentage of category match', required: false })
    preferenceMatch?: number;
}

export class MatchResultDto {
    @ApiProperty({ example: 'match_123' })
    id: string;

    @ApiProperty({ type: EntityPreviewDto })
    entityA: EntityPreviewDto;

    @ApiProperty({ type: EntityPreviewDto })
    entityB: EntityPreviewDto;

    @ApiProperty({ example: 88.5 })
    score: number;

    @ApiProperty({ example: 'proposed' })
    status: string;

    @ApiProperty({ type: MatchMetadataDto })
    metadata: MatchMetadataDto;

    @ApiProperty({ example: '2026-01-01T00:00:00Z' })
    createdAt: string;
}

export class MatchingResultsResponseDto {
    @ApiProperty({ example: 'completed' })
    status: string;

    @ApiProperty({ type: [MatchResultDto] })
    results: MatchResultDto[];
}

export class SystemStatsResponseDto {
    @ApiProperty({ example: 1250 })
    totalRequests: number;

    @ApiProperty({ example: 450 })
    activeMatches: number;

    @ApiProperty({ example: 82.5 })
    averageScore: number;

    @ApiProperty({ example: ['hybrid', 'preference'] })
    topStrategies: string[];

    @ApiProperty({ example: 'healthy' })
    systemStatus: string;
}
