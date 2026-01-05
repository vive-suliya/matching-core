
import { Module } from '@nestjs/common';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';
import { MatchingCleanupService } from './matching-cleanup.service';

@Module({
    controllers: [MatchingController],
    providers: [MatchingService, MatchingCleanupService],
})
export class MatchingModule { }
