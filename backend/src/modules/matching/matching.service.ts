
import { Injectable, Inject, Optional } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { SupabaseService } from '../../database/supabase.service';
import { CreateMatchingRequestDto, MatchingStrategy } from './dto/create-matching-request.dto';
import { DistanceStrategy } from './strategies/distance.strategy';
import { BaseMatchingStrategy } from './strategies/base.strategy';
import { MatchableEntity, Match } from './entities/matchable-entity.interface';

@Injectable()
export class MatchingService {
    private strategies: Map<string, BaseMatchingStrategy>;

    constructor(
        private readonly supabase: SupabaseService,
        @Optional() @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {
        this.strategies = new Map([
            [MatchingStrategy.DISTANCE, new DistanceStrategy()],
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
                status: 'active'
            };
            // Trigger processMatching even with mock
            this.processMatching(mockRequest.id, mockRequest).catch(err => console.error(err));
            return mockRequest;
        }

        console.log(`[MatchingService] Request saved to DB: ${request.id}`);

        // 2. Process Matching Asynchronously (Fire & Forget for MVP)
        this.processMatching(request.id).catch(err => console.error(err));

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

            // 2. Fetch Requester
            const requester = await this.getEntity(request.requester_id, request.requester_type);
            console.log(`[MatchingService] Requester found: ${requester.id}`);

            // 3. Fetch Candidates (with filters)
            const candidates = await this.getCandidates(request);

            // 4. Execute Strategy
            const strategy = this.strategies.get(request.strategy) || this.strategies.get('distance');
            if (!strategy) {
                throw new Error(`Unknown strategy: ${request.strategy}`);
            }

            const matches = strategy.execute(requester, candidates);
            console.log(`[MatchingService] Strategy executed, matches generated: ${matches.length}`);

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
        } catch (e) {
            console.error('[MatchingService] Matching Process Error:', e);
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

        // Mock if no data (for development)
        if (!data) {
            return {
                id,
                type,
                profile: { location: [37.5665, 126.9780] } // Mock location
            };
        }

        const location = this.parseLocation(data.location) || [37.5665, 126.9780];

        return {
            id: data.id,
            type,
            profile: { ...data, location },
        };
    }

    private async getCandidates(request: any): Promise<MatchableEntity[]> {
        console.log(`[MatchingService] Fetching candidates from ${request.target_type === 'user' ? 'users' : 'teams'}...`);
        const table = request.target_type === 'user' ? 'users' : 'teams';
        const { data } = await this.client
            .from(table)
            .select('*')
            .limit(50);

        if (!data || data.length === 0) {
            console.log(`[MatchingService] No data in ${table}, returning mock candidates`);
            // Return Mock Candidates
            return Array.from({ length: 5 }).map((_, i) => ({
                id: `candidate-${i}`,
                type: request.target_type,
                profile: {
                    display_name: `Candidate ${i + 1}`,
                    name: `Candidate ${i + 1}`,
                    location: [
                        37.5665 + (Math.random() - 0.5) * 0.1, // Random nearby location
                        126.9780 + (Math.random() - 0.5) * 0.1
                    ],
                    averageRating: 3 + Math.random() * 2 // Random rating 3~5
                }
            }));
        }

        console.log(`[MatchingService] Found ${data.length} candidates in DB`);
        return data.map(entity => {
            const location = this.parseLocation(entity.location) || [37.5665, 126.9780];
            return {
                id: entity.id,
                type: request.target_type,
                profile: { ...entity, location },
            };
        });
    }

    async getMatchResults(requestId: string): Promise<any[]> {
        console.log(`[MatchingService] Fetching results for ${requestId}...`);
        const { data: matches, error } = await this.client
            .from('matches')
            .select('*')
            .eq('request_id', requestId)
            .order('score', { ascending: false });

        if ((error || !matches || matches.length === 0) && requestId.startsWith('mock-')) {
            console.log(`[MatchingService] Returning mock results for ${requestId}`);
            return Array.from({ length: 3 }).map((_, i) => ({
                id: `match-${i}`,
                entityB: { name: `Candidate ${i + 1}`, type: 'user' },
                score: 85 - i * 5,
                status: 'proposed',
                metadata: { distance: 1.2 + i * 0.5 },
                createdAt: new Date().toISOString()
            }));
        }

        if (error || !matches) {
            if (error) console.error(`[MatchingService] Error fetching matches: ${error.message}`);
            return [];
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

        return results;
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
