import { IsEnum, IsObject, IsOptional, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { StrategySettingsDto } from './strategy-settings.dto';

export enum RequesterType {
    USER = 'user',
    TEAM = 'team',
}

export enum TargetType {
    USER = 'user',
    TEAM = 'team',
}

export enum MatchingStrategy {
    DISTANCE = 'distance',
    PREFERENCE = 'preference',
    SKILL = 'skill',
    HYBRID = 'hybrid',
}

export class MatchingFiltersDto {
    @ApiProperty({ example: [37.5665, 126.9780], description: 'Location [lat, lng]', required: false })
    @IsOptional()
    location?: [number, number];

    @ApiProperty({ example: 5000, description: 'Radius in meters', required: false })
    @IsOptional()
    radius?: number;

    @ApiProperty({ example: ['sports', 'soccer'], required: false })
    @IsOptional()
    categories?: string[];

    @ApiProperty({ required: false })
    @IsOptional()
    preferences?: Record<string, any>;
}

export class CreateMatchingRequestDto {
    @ApiProperty({
        description: '요청자 ID (인증 토큰에서 자동 주입되므로 생략 가능)',
        example: '550e8400-e29b-41d4-a716-446655440000',
        required: false
    })
    @IsString()
    @IsOptional()
    requesterId?: string;

    @ApiProperty({
        enum: RequesterType,
        description: '요청자 타입 (개인/팀)',
        example: 'user'
    })
    @IsEnum(RequesterType)
    requesterType: RequesterType;

    @ApiProperty({
        enum: TargetType,
        description: '매칭 대상 타입',
        example: 'team'
    })
    @IsEnum(TargetType)
    targetType: TargetType;

    @ApiProperty({
        enum: MatchingStrategy,
        default: MatchingStrategy.HYBRID,
        description: '매칭 전략 (거리 기반, 성향 기반, 하이브리드)',
        example: 'hybrid'
    })
    @IsEnum(MatchingStrategy)
    @IsOptional()
    strategy?: MatchingStrategy = MatchingStrategy.HYBRID;

    @ApiProperty({
        type: MatchingFiltersDto,
        description: '매칭 필터 조건'
    })
    @ValidateNested()
    @Type(() => MatchingFiltersDto)
    filters: MatchingFiltersDto;

    @ApiProperty({
        type: StrategySettingsDto,
        required: false,
        description: '매칭 전략 세부 설정 (가중치 등)'
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => StrategySettingsDto)
    settings?: StrategySettingsDto;
}
