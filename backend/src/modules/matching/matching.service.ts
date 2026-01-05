
import { Injectable, Inject, Optional, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { SupabaseService } from '../../database/supabase.service';
import { CreateMatchingRequestDto, MatchingStrategy } from './dto/create-matching-request.dto';
import { DistanceStrategy } from './strategies/distance.strategy';
import { PreferenceStrategy } from './strategies/preference.strategy';
import { HybridStrategy } from './strategies/hybrid.strategy';
import { BaseMatchingStrategy } from './strategies/base.strategy';
import { MatchableEntity, Match } from './entities/matchable-entity.interface';
import { StrategySettings, StrategySettingsSchema } from './dto/strategy-settings.dto';
import { z } from 'zod';

@Injectable()
export class MatchingService {
    private strategies: Map<string, BaseMatchingStrategy>;
    private readonly logger = new Logger(MatchingService.name);
    private readonly isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

    constructor(
        private readonly supabase: SupabaseService,
        @Optional() @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {
        this.strategies = new Map([
            [MatchingStrategy.DISTANCE, new DistanceStrategy()],
            [MatchingStrategy.PREFERENCE, new PreferenceStrategy()],
            [MatchingStrategy.HYBRID, new HybridStrategy()],
        ]);
    }

    private get client() {
        const client = this.supabase.getClient();
        if (!client) {
            // Return a minimal mock with 'from' method that returns an object with methods
            return {
                from: () => ({
                    insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) }) }),
                    select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }), order: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } }), limit: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } }) }) }),
                    update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) }) }) }),
                })
            } as any;
        }
        return client;
    }

    async createMatchingRequest(dto: CreateMatchingRequestDto) {
        console.log(`[MatchingService] Creating request for ${dto.requesterId} (${dto.requesterType})`);
        // 1. Save Request to DB
        const { data: request, error } = await this.client
            .from('matching_requests')
            .insert({
                requester_id: dto.requesterId,
                requester_type: dto.requesterType,
                target_type: dto.targetType,
                strategy: dto.strategy,
                filters: dto.filters,
                settings: dto.settings,
                status: 'active',
            })
            .select()
            .single();

        if (error || !request) {
            // Fallback for demo/dev without DB schema: return mock
            console.error('[MatchingService] DB Error or Missing Config, returning mock:', error?.message || 'No request data returned');
            const mockRequest = {
                id: 'mock-req-' + Math.random().toString(36).substr(2, 9),
                ...dto,
                requester_id: dto.requesterId,
                requester_type: dto.requesterType,
                status: 'active',
                settings: dto.settings || { useDistance: true, usePreference: true, distanceWeight: 0.7, preferenceWeight: 0.3 }
            };
            // Trigger processMatching even with mock
            this.processMatching(mockRequest.id, mockRequest).catch(err => console.error(err));
            return mockRequest;
        }

        console.log(`[MatchingService] Request saved to DB: ${request.id}`);

        // 2. Process Matching Asynchronously (Fire & Forget for MVP)
        this.processMatching(request.id, request).catch(err => console.error(err));

        return request;
    }

    private async processMatching(requestId: string, mockData?: any) {
        console.log(`[MatchingService] Processing matching for ${requestId}...`);
        try {
            let request = mockData;

            if (!request) {
                const { data } = await this.client
                    .from('matching_requests')
                    .select('*')
                    .eq('id', requestId)
                    .single();
                request = data;
            }

            if (!request) {
                console.warn(`[MatchingService] Request ${requestId} not found`);
                return;
            }

            // 2 & 3. Fetch Requester and Candidates in parallel for speed
            const settings = StrategySettingsSchema.parse(request.settings || {});

            const [requester, candidates] = await Promise.all([
                this.getEntity(request.requester_id, request.requester_type),
                this.getCandidates(request, settings)
            ]);

            // 시뮬레이션을 위해 플레이그라운드 필터 반영
            if (request.filters?.categories) {
                requester.profile.categories = request.filters.categories;
            }
            if (request.filters?.location) {
                requester.profile.location = request.filters.location;
            }

            // 4. Execute Strategy
            const strategy = this.strategies.get(request.strategy) || this.strategies.get('distance');
            if (!strategy) {
                throw new Error(`Unknown strategy: ${request.strategy}`);
            }

            const matches = strategy.execute(requester, candidates, settings);
            console.log(`[MatchingService] Strategy executed in parallel mode, matches: ${matches.length}`);

            // 5. Save Matches to DB
            if (matches.length > 0) {
                const matchRecords = matches.map(match => ({
                    request_id: requestId,
                    entity_a_id: match.entities[0].id,
                    entity_a_type: match.entities[0].type,
                    entity_b_id: match.entities[1].id,
                    entity_b_type: match.entities[1].type,
                    score: match.score,
                    status: match.status,
                    metadata: match.metadata,
                }));

                const { error: insertError } = await this.client.from('matches').insert(matchRecords);

                if (insertError) {
                    console.error(`[MatchingService] Failed to save matches: ${insertError.message}`);
                    // If DB fails, cache in memory for Demo (if cache exists)
                    if (this.cacheManager) {
                        await this.cacheManager.set(`results:${requestId}`, matches);
                    }
                } else {
                    console.log(`[MatchingService] Successfully saved ${matches.length} matches to DB`);
                }
            } else {
                console.log(`[MatchingService] No matches found for ${requestId}`);
            }

            // 6. Mark Request as Completed
            await this.client
                .from('matching_requests')
                .update({ status: 'completed' })
                .eq('id', requestId);

        } catch (e) {
            console.error('[MatchingService] Matching Process Error:', e);
            await this.client
                .from('matching_requests')
                .update({ status: 'failed' })
                .eq('id', requestId);
        }
    }

    private parseLocation(loc: any): [number, number] | undefined {
        if (!loc) return undefined;
        // PostGIS GeoJSON Format: { type: "Point", coordinates: [lng, lat] }
        if (loc.coordinates && Array.isArray(loc.coordinates)) {
            return [loc.coordinates[1], loc.coordinates[0]];
        }
        // Fallback for array format [lat, lng]
        if (Array.isArray(loc) && loc.length === 2) {
            return loc as [number, number];
        }
        return undefined;
    }

    private async getEntity(id: string, type: 'user' | 'team'): Promise<MatchableEntity> {
        const table = type === 'user' ? 'users' : 'teams';
        const { data } = await this.client
            .from(table)
            .select('*')
            .eq('id', id)
            .single();

        if (!data) {
            if (this.isDevelopment) {
                this.logger.warn(`Entity ${id} not found, returning mock data`);
                return {
                    id,
                    type,
                    profile: { location: [37.5665, 126.9780] }
                };
            }
            throw new NotFoundException(`Entity ${id} (${type}) not found`);
        }

        const location = this.parseLocation(data.location);
        if (!location) {
            this.logger.warn(`Invalid location for entity ${id}, using default`);
        }

        return {
            id: data.id,
            type,
            profile: { ...data, location },
        };
    }

    private async getCandidates(
        request: any,
        settings: StrategySettings
    ): Promise<MatchableEntity[]> {
        console.log(`[MatchingService] Fetching candidates for ${request.target_type}...`);

        const lat = request.filters?.location?.[0] || 37.5665;
        const lng = request.filters?.location?.[1] || 126.9780;
        const radius = request.filters?.radius || 5000;
        const requiredCategories = request.filters?.categories || [];

        try {
            const { data, error } = await this.client.rpc('get_candidates_v2', {
                p_lat: lat,
                p_lng: lng,
                p_radius: radius,
                p_target_type: request.target_type,
                p_use_negative_filter: settings.enableNegativeFilter,
                p_requester_id: request.requester_id,
                p_required_categories: requiredCategories
            });

            if (error) {
                this.logger.error(`PostGIS RPC Error: ${error.message}`, error.stack);
                throw new InternalServerErrorException(`PostGIS RPC failed: ${error.message}`);
            }

            if (!data || data.length === 0) {
                this.logger.log(`No candidates found in radius ${radius}m for ${request.requester_id}`);
                return this.isDevelopment ? this.getMockCandidates(request) : [];
            }

            this.logger.log(`Found ${data.length} candidates using PostGIS RPC`);
            return data.map(entity => ({
                id: entity.id,
                type: request.target_type,
                profile: {
                    ...entity,
                    location: this.parseLocation(entity.location),
                    distance: entity.distance
                },
            }));
        } catch (error) {
            this.logger.error(`getCandidates failed: ${error.message}`);

            if (this.isDevelopment) {
                this.logger.warn('Attempting fallback to legacy search in development mode');
                try {
                    return await this.fallbackGetCandidates(request);
                } catch (fallbackError) {
                    this.logger.error(`Fallback failed: ${fallbackError.message}`);
                    return this.getMockCandidates(request);
                }
            }

            throw error;
        }
    }

    private async fallbackGetCandidates(request: any): Promise<MatchableEntity[]> {
        const table = request.target_type === 'user' ? 'users' : 'teams';
        const { data, error } = await this.client.from(table).select('*').limit(50);

        if (error) throw error;
        if (!data || data.length === 0) return this.getMockCandidates(request);

        return data.map(entity => ({
            id: entity.id,
            type: request.target_type,
            profile: {
                ...entity,
                location: this.parseLocation(entity.location) || [37.5665, 126.9780]
            },
        }));
    }

    private getMockCandidates(request: any): MatchableEntity[] {
        // Only provide mocks in development or if specifically enabled
        const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
        if (!isDev) {
            console.warn('[MatchingService] Skipping mock data in non-dev environment');
            return [];
        }

        console.log(`[MatchingService] Returning mock candidates for ${request.target_type}`);
        return Array.from({ length: 5 }).map((_, i) => ({
            id: `candidate-${i}`,
            type: request.target_type,
            profile: {
                display_name: `Candidate ${i + 1}`,
                name: `Candidate ${i + 1}`,
                location: [37.5665 + (Math.random() - 0.5) * 0.1, 126.9780 + (Math.random() - 0.5) * 0.1],
                categories: ['sports', 'gaming']
            }
        }));
    }

    async getMatchResults(requestId: string) {
        // 1. Check Request Status
        const { data: request } = await this.client
            .from('matching_requests')
            .select('status')
            .eq('id', requestId)
            .single();

        const status = request?.status || 'active';

        // 2. Fetch Matches
        const { data: matches, error } = await this.client
            .from('matches')
            .select('*')
            .eq('request_id', requestId);

        // 3. Handle Mock Logic
        if ((error || !matches || matches.length === 0) && requestId.startsWith('mock-')) {
            console.log(`[MatchingService] Returning mock results for ${requestId}`);
            const mockResults = Array.from({ length: 3 }).map((_, i) => ({
                id: `match-${i}`,
                entityA: { id: 'requester-mock', type: 'user', name: 'Mock Requester' },
                entityB: { id: `candidate-${i}`, name: `Candidate ${i + 1}`, type: 'user' },
                score: 85 - i * 5,
                status: 'proposed',
                metadata: { distance: 1.2 + i * 0.5 },
                createdAt: new Date().toISOString()
            }));
            return { status: 'completed', results: mockResults };
        }

        if (error || !matches) {
            if (error) console.error(`[MatchingService] Error fetching matches: ${error.message}`);
            return { status, results: [] };
        }

        console.log(`[MatchingService] Found ${matches.length} matches in DB`);

        const results = await Promise.all(
            matches.map(async (match) => {
                const entityA = await this.getEntityDetails(match.entity_a_id, match.entity_a_type);
                const entityB = await this.getEntityDetails(match.entity_b_id, match.entity_b_type);

                return {
                    id: match.id,
                    entityA,
                    entityB,
                    score: match.score,
                    status: match.status,
                    metadata: match.metadata,
                    createdAt: match.created_at,
                    expiresAt: match.expires_at,
                };
            })
        );

        return {
            status,
            results,
        };
    }

    private async getEntityDetails(id: string, type: string): Promise<any> {
        const table = type === 'user' ? 'users' : 'teams';
        const { data } = await this.client
            .from(table)
            .select('*')
            .eq('id', id)
            .single();

        if (!data) {
            return { id, type, name: `Mock ${type} ${id.substr(0, 4)}` };
        }

        const location = this.parseLocation(data.location);

        return {
            id: data.id,
            type,
            name: data.display_name || data.name || data.username,
            avatarUrl: data.avatar_url,
            location,
        };
    }

    async acceptMatch(matchId: string, actorId: string) {
        const { data } = await this.client
            .from('matches')
            .update({ status: 'accepted', updated_at: new Date().toISOString() })
            .eq('id', matchId)
            .select()
            .single();

        return data || { id: matchId, status: 'accepted' };
    }

    async rejectMatch(matchId: string, actorId: string) {
        const { data } = await this.client
            .from('matches')
            .update({ status: 'rejected', updated_at: new Date().toISOString() })
            .eq('id', matchId)
            .select()
            .single();

        return data || { id: matchId, status: 'rejected' };
    }
}
