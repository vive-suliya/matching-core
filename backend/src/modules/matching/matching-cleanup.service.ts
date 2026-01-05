import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../../database/supabase.service';

@Injectable()
export class MatchingCleanupService {
    private readonly logger = new Logger(MatchingCleanupService.name);

    constructor(private readonly supabase: SupabaseService) { }

    @Cron(CronExpression.EVERY_HOUR)
    async handleExpiredMatches() {
        this.logger.log('Running cleanup for expired matches...');

        const client = this.supabase.getClient();
        if (!client) {
            this.logger.error('Supabase client not initialized');
            return;
        }

        const { error, count } = await client
            .from('matches')
            .update({ status: 'expired', updated_at: new Date().toISOString() })
            .lt('expires_at', new Date().toISOString())
            .eq('status', 'proposed')
            .select('*');

        if (error) {
            this.logger.error(`Failed to cleanup matches: ${error.message}`);
            return;
        }

        if (count && count > 0) {
            this.logger.log(`Successfully expired ${count} matching records.`);
        } else {
            this.logger.log('No expired matches found.');
        }
    }
}
