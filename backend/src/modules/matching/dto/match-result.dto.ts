
import { ApiProperty } from '@nestjs/swagger';

export class MatchEntityDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ enum: ['user', 'team'] })
    type: 'user' | 'team';

    @ApiProperty()
    name: string;

    @ApiProperty({ required: false })
    avatarUrl?: string;

    @ApiProperty({ required: false })
    location?: [number, number];
}

export class MatchResultDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ type: MatchEntityDto })
    entityA: MatchEntityDto;

    @ApiProperty({ type: MatchEntityDto })
    entityB: MatchEntityDto;

    @ApiProperty()
    score: number;

    @ApiProperty({ enum: ['proposed', 'accepted', 'rejected', 'expired'] })
    status: string;

    @ApiProperty()
    metadata: Record<string, any>;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    expiresAt: Date;
}
