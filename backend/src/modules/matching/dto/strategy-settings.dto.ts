import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { z } from 'zod';

export class StrategySettingsDto {
    @ApiProperty({ default: true, description: '거리 기반 매칭 활성화 여부' })
    @IsBoolean()
    @IsOptional()
    useDistance?: boolean = true;

    @ApiProperty({ default: true, description: '관심사 기반 매칭 활성화 여부' })
    @IsBoolean()
    @IsOptional()
    usePreference?: boolean = true;

    @ApiProperty({ default: 0.7, description: '거리 점수 가중치 (0.0 ~ 1.0)' })
    @IsNumber()
    @Min(0)
    @Max(1)
    @IsOptional()
    distanceWeight?: number = 0.7;

    @ApiProperty({ default: 0.3, description: '관심사 점수 가중치 (0.0 ~ 1.0)' })
    @IsNumber()
    @Min(0)
    @Max(1)
    @IsOptional()
    preferenceWeight?: number = 0.3;

    @ApiProperty({ default: true, description: '매칭 사유 제공 여부' })
    @IsBoolean()
    @IsOptional()
    enableExplanation?: boolean = true;

    @ApiProperty({ default: true, description: '한번 거절한 유저 제외 여부' })
    @IsBoolean()
    @IsOptional()
    enableNegativeFilter?: boolean = true;
}

// Zod schema for runtime validation and type safety
export const StrategySettingsSchema = z.object({
    useDistance: z.boolean().default(true),
    usePreference: z.boolean().default(true),
    distanceWeight: z.number().min(0).max(1).default(0.7),
    preferenceWeight: z.number().min(0).max(1).default(0.3),
    enableExplanation: z.boolean().default(true),
    enableNegativeFilter: z.boolean().default(true),
}).refine((data) => {
    // 가중치 합이 1이 되어야 함 (둘 다 활성화된 경우)
    if (data.useDistance && data.usePreference) {
        return Math.abs(data.distanceWeight + data.preferenceWeight - 1.0) < 0.001;
    }
    return true;
}, {
    message: "Distance weight and Preference weight must sum up to 1.0",
    path: ["distanceWeight"],
});

export type StrategySettings = z.infer<typeof StrategySettingsSchema>;
