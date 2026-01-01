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
    @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
    @IsString()
    requesterId: string;

    @ApiProperty({ enum: RequesterType })
    @IsEnum(RequesterType)
    requesterType: RequesterType;

    @ApiProperty({ enum: TargetType })
    @IsEnum(TargetType)
    targetType: TargetType;

    @ApiProperty({ enum: MatchingStrategy, default: MatchingStrategy.DISTANCE })
    @IsEnum(MatchingStrategy)
    @IsOptional()
    strategy?: MatchingStrategy = MatchingStrategy.DISTANCE;

    @ApiProperty({ type: MatchingFiltersDto })
    @ValidateNested()
    @Type(() => MatchingFiltersDto)
    filters: MatchingFiltersDto;

    @ApiProperty({ type: StrategySettingsDto, required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => StrategySettingsDto)
    settings?: StrategySettingsDto;
}
