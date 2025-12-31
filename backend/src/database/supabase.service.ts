import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private client: SupabaseClient;

    constructor(private configService: ConfigService) {
        const url = this.configService.get<string>('supabase.url');
        const key = this.configService.get<string>('supabase.key');

        // Only create client if credentials are present
        if (url && key) {
            this.client = createClient(url, key);
        } else {
            console.warn('Supabase credentials not found. SupabaseService will not work.');
        }
    }

    getClient(): SupabaseClient {
        return this.client;
    }
}
