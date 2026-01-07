
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
import { MetricsService } from '../monitoring/metrics.service';

@Injectable()
export class MatchingService {
    private strategies: Map<string, BaseMatchingStrategy>;
    private readonly logger = new Logger(MatchingService.name);
    private readonly isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

    constructor(
        private readonly supabase: SupabaseService,
        private readonly metricsService: MetricsService,
        @Optional() @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {
        this.strategies = new Map([
            [MatchingStrategy.DISTANCE, new DistanceStrategy()],
            [MatchingStrategy.PREFERENCE, new PreferenceStrategy()],
            [MatchingStrategy.HYBRID, new HybridStrategy()],
        ]);
    }

    /**
     * Supabase 클라이언트를 안전하게 가져오는 헬퍼 메서드
     * Supabase가 설정되지 않은 경우 모의(Mock) 클라이언트를 반환합니다 (개발/테스트 복원력).
     */
    private get client() {
        const client = this.supabase.getClient();
        if (!client) {
            // 복원력을 위한 최소한의 모의 클라이언트 반환
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

    /**
     * ==================================================================================
     * [SECTION] 요청 라이프사이클 관리
     * ==================================================================================
     */

    /**
     * 매칭 요청 생성
     * 
     * 매칭 프로세스의 진입점입니다.
     * 1. 요청을 유효성 검사하고 데이터베이스에 저장합니다.
     * 2. 비동기 매칭 프로세스를 트리거합니다 (Fire & Forget).
     * 
     * @param dto - 요청 상세 정보 (전략, 필터 등)
     * @returns {Object} 생성된 요청 객체
     */
    async createMatchingRequest(dto: CreateMatchingRequestDto) {
        console.log(`[MatchingService] Creating request for ${dto.requesterId} (${dto.requesterType})`);

        // 1. 요청을 DB에 저장
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
            // DB 스키마가 없는 데모/개발용 폴백: 모의 데이터 반환
            console.error('[MatchingService] DB Error or Missing Config, returning mock:', error?.message || 'No request data returned');
            const mockRequest = {
                id: 'mock-req-' + Math.random().toString(36).substr(2, 9),
                ...dto,
                requester_id: dto.requesterId,
                requester_type: dto.requesterType,
                status: 'active',
                settings: dto.settings || { useDistance: true, usePreference: true, distanceWeight: 0.7, preferenceWeight: 0.3 }
            };
            // 모의 데이터인 경우에도 processMatching 트리거
            this.processMatching(mockRequest.id, mockRequest).catch(err => console.error(err));
            return mockRequest;
        }

        console.log(`[MatchingService] Request saved to DB: ${request.id}`);

        // 2. 비동기적으로 매칭 처리 (MVP를 위해 Fire & Forget 방식 사용)
        this.processMatching(request.id, request).catch(err => console.error(err));

        return request;
    }

    /**
     * 핵심 매칭 로직 (비동기 워커)
     * 
     * 매칭 파이프라인을 실행합니다:
     * 1. 요청자 엔티티 조회
     * 2. 후보군 찾기 (PostGIS 필터)
     * 3. 점수 계산 (전략 실행)
     * 4. 상위 매칭 결과 저장
     * 
     * @param requestId - 처리할 요청의 ID
     * @param mockData - 최적화/테스트를 위한 선택적 사전 로드 데이터
     */
    private async processMatching(requestId: string, mockData?: any) {
        console.log(`[MatchingService] Processing matching for ${requestId}...`);
        const startTime = Date.now();
        let strategyName = 'unknown';

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

            // 2 & 3. 속도를 위해 요청자와 후보군을 병렬로 조회
            const settings = StrategySettingsSchema.parse(request.settings || {});

            const [requester, candidates] = await Promise.all([
                this.getEntity(request.requester_id, request.requester_type),
                this.getCandidates(request, settings)
            ]);

            // 시뮬레이션: 플레이그라운드 일관성을 위해 필터를 직접 적용
            if (request.filters?.categories) {
                requester.profile.categories = request.filters.categories;
            }
            if (request.filters?.location) {
                requester.profile.location = request.filters.location;
            }

            // 4. 전략 선택 및 실행
            strategyName = request.strategy || 'distance';
            const strategy = this.strategies.get(strategyName) || this.strategies.get('distance');
            if (!strategy) {
                throw new Error(`Unknown strategy: ${strategyName}`);
            }

            const matches = strategy.execute(requester, candidates, settings);
            console.log(`[MatchingService] Strategy executed in parallel mode, matches: ${matches.length}`);

            // 5. 매칭 결과를 DB에 저장
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
                    // 캐시 실패 시 폴백
                    if (this.cacheManager) {
                        await this.cacheManager.set(`results:${requestId}`, matches);
                    }
                } else {
                    console.log(`[MatchingService] Successfully saved ${matches.length} matches to DB`);
                }
            } else {
                console.log(`[MatchingService] No matches found for ${requestId}`);
            }

            // 6. 요청을 완료 상태로 표시
            await this.client
                .from('matching_requests')
                .update({ status: 'completed' })
                .eq('id', requestId);

            // 메트릭 기록 (Success)
            this.metricsService.matchingRequestCounter.inc({ strategy: strategyName, status: 'success' });
            this.metricsService.matchingDurationHistogram.observe({ strategy: strategyName }, (Date.now() - startTime) / 1000);

        } catch (e) {
            console.error('[MatchingService] Matching Process Error:', e);
            await this.client
                .from('matching_requests')
                .update({ status: 'failed' })
                .eq('id', requestId);

            // 메트릭 기록 (Error)
            this.metricsService.matchingRequestCounter.inc({ strategy: strategyName, status: 'error' });
        }
    }

    /**
     * ==================================================================================
     * [SECTION] 데이터 조회 및 PostGIS 통합
     * ==================================================================================
     */

    /**
     * PostGIS 위치 정보 파싱
     * GeoJSON 또는 배열 형식을 [lat, lng] 튜플로 변환합니다.
     */
    private parseLocation(loc: any): [number, number] | undefined {
        if (!loc) return undefined;
        // PostGIS GeoJSON 형식: { type: "Point", coordinates: [lng, lat] }
        if (loc.coordinates && Array.isArray(loc.coordinates)) {
            return [loc.coordinates[1], loc.coordinates[0]];
        }
        // 배열 형식에 대한 폴백 [lat, lng]
        if (Array.isArray(loc) && loc.length === 2) {
            return loc as [number, number];
        }
        return undefined;
    }

    /**
     * 엔티티 상세 정보 조회
     * 데이터베이스에서 사용자 또는 팀 프로필을 가져옵니다.
     */
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

    /**
     * PostGIS를 사용한 후보군 검색
     * 
     * 반경 내의 엔티티를 효율적으로 찾고 기준(카테고리, 네거티브 필터)에 따라 필터링하기 위해
     * 저장 프로시저(RPC) 'get_candidates_v2'를 호출합니다.
     */
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

    /**
     * 후보군 검색에 실패했을 때의 폴백 (GIS 미사용)
     * PostGIS RPC가 실패하거나 사용할 수 없을 때 사용됩니다. 상위 50개의 엔티티를 반환합니다.
     */
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
        // 개발 환경이거나 특별히 활성화된 경우에만 모의 데이터 제공
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

    /**
     * ==================================================================================
     * [SECTION] 결과 조회 및 액션
     * ==================================================================================
     */

    /**
     * 매칭 결과 가져오기
     * DB에서 계산된 매칭 결과를 가져오고 엔티티 상세 정보(이름, 아바타)를 보강합니다.
     * 성능 향상을 위해 5분간 결과를 캐싱합니다.
     */
    async getMatchResults(requestId: string) {
        // 1. 캐시 확인
        if (this.cacheManager) {
            const cached: any = await this.cacheManager.get(`results:${requestId}`);
            if (cached) {
                console.log(`[MatchingService] Returning CACHED results for ${requestId}`);
                return cached;
            }
        }

        // 2. 요청 상태 확인
        const { data: request } = await this.client
            .from('matching_requests')
            .select('status')
            .eq('id', requestId)
            .single();

        const status = request?.status || 'active';

        // 3. 매칭 결과 조회
        const { data: matches, error } = await this.client
            .from('matches')
            .select('*')
            .eq('request_id', requestId);

        // 4. 모의 데이터 로직 처리 (데모 요청용)
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
            const response = { status: 'completed', results: mockResults };

            // 캐시에 저장 (300초 = 5분)
            if (this.cacheManager) {
                await this.cacheManager.set(`results:${requestId}`, response, 300000);
            }
            return response;
        }

        if (error || !matches) {
            if (error) console.error(`[MatchingService] Error fetching matches: ${error.message}`);
            return { status, results: [] };
        }

        console.log(`[MatchingService] Found ${matches.length} matches in DB`);

        // 프로필 정보로 매칭 결과 보강
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

        const finalResponse = {
            status,
            results,
        };

        // 5. 캐시에 저장 (5분 TTL)
        if (this.cacheManager && status === 'completed') {
            await this.cacheManager.set(`results:${requestId}`, finalResponse, 300000);
        }

        return finalResponse;
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

    /**
     * 매칭 수락
     * 상태를 'accepted'로 업데이트합니다. 이 구현은 상호 수락 로직
     * (상대방도 수락했는지 확인)을 처리하도록 확장될 수 있습니다.
     */
    async acceptMatch(matchId: string, actorId: string) {
        const { data } = await this.client
            .from('matches')
            .update({ status: 'accepted', updated_at: new Date().toISOString() })
            .eq('id', matchId)
            .select()
            .single();

        return data || { id: matchId, status: 'accepted' };
    }

    /**
     * 매칭 거절
     * 상태를 'rejected'로 업데이트합니다. 향후 네거티브 필터링에 사용됩니다.
     */
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
