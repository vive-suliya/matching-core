
import { BaseMatchingStrategy } from './base.strategy';
import { Match, MatchableEntity } from '../entities/matchable-entity.interface';
import { PreferenceStrategy } from './preference.strategy';

export class DistanceStrategy extends BaseMatchingStrategy {
    name = 'distance';
    private preferenceStrategy = new PreferenceStrategy();

    /**
     * ==================================================================================
     * [SECTION] 점수 계산
     * ==================================================================================
     */

    /**
     * 점수 계산
     * 
     * 주로 물리적 거리를 기반으로 점수를 계산합니다.
     * 거리가 가까울수록 훨씬 더 높은 점수를 받습니다.
     * 
     * 로직:
     * 1. PostGIS에서 미리 계산된 거리가 있는지 확인합니다 (우선됨).
     * 2. DB 거리가 없는 경우 하버사인(Haversine) 공식을 사용합니다.
     * 3. 거리에 대해 비선형 감쇠 함수를 적용합니다 (지수적 감소).
     * 4. 평가/평판에 대해 작은 가중치(20%)를 추가합니다.
     * 
     * @param requester - 매칭을 요청하는 엔티티
     * @param candidate - 잠재적 매칭 후보
     * @returns {number} 점수 (0-100)
     */
    score(requester: MatchableEntity, candidate: MatchableEntity): number {
        // 1. 거리 가져오기 (성능을 위해 가능하면 DB에서 계산된 값 사용)
        let distance = candidate.profile.distance !== undefined ? candidate.profile.distance / 1000 : undefined;

        // 2. 폴백 계산 (하버사인)
        if (distance === undefined) {
            if (!requester.profile.location || !candidate.profile.location) {
                return 0; // 위치 정보가 없으면 거리 매칭 불가능
            }
            distance = this.calculateDistance(
                requester.profile.location,
                candidate.profile.location,
            );
        }

        // 3. 거리 스코어링 규칙 (단계 함수)
        // 가까울수록 좋음. 0.5km 이내는 만점.
        let distanceScore = 0;
        if (distance <= 0.5) distanceScore = 100;
        else if (distance <= 1) distanceScore = 95;
        else if (distance <= 3) distanceScore = 85;
        else if (distance <= 5) distanceScore = 70;
        else if (distance <= 10) distanceScore = 50;
        else if (distance <= 20) distanceScore = 30;
        else distanceScore = 10;

        // 4. 평가 보너스 (20% 가중치)
        // 평점이 높은 엔티티는 조금 멀더라도 약간의 보너스를 받습니다.
        const ratingScore = candidate.profile.averageRating
            ? candidate.profile.averageRating * 10
            : 70; // 기본 평점

        // 최종 가중 평균 점수
        const finalScore = distanceScore * 0.8 + ratingScore * 0.2;

        return Math.round(finalScore * 100) / 100;
    }

    /**
     * 후보 측정 및 순위 지정
     * 
     * 모든 후보를 순회하며 점수를 매기고 상위 50개의 매칭 결과를 반환합니다.
     */
    execute(requester: MatchableEntity, candidates: MatchableEntity[], settings?: any): Match[] {
        return candidates
            .map(candidate => {
                const finalScore = this.score(requester, candidate);

                // 메타데이터/디버그를 위한 선호도 일치 점수 계산
                const pScore = candidate.profile?.category_match_score !== undefined
                    ? Number(candidate.profile.category_match_score)
                    : this.preferenceStrategy.score(requester, candidate);

                let explanation = '';
                if (settings?.enableExplanation) {
                    const dist = candidate.profile?.distance ? (candidate.profile.distance / 1000).toFixed(1) + 'km' : 'unknown';
                    explanation = `거리가 약 ${dist}로 매우 가깝습니다.`;
                }

                return {
                    entities: [requester, candidate],
                    score: finalScore,
                    status: 'proposed' as const,
                    metadata: {
                        distance: candidate.profile?.distance,
                        explanation: explanation,
                        preferenceMatch: pScore
                    },
                };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 50);
    }

    /**
     * ==================================================================================
     * [SECTION] 지리 연산 유틸리티
     * ==================================================================================
     */

    /**
     * 하버사인 공식
     * 구 위에서 두 지점 사이의 대원 거리를 계산합니다.
     */
    private calculateDistance(
        loc1: [number, number],
        loc2: [number, number],
    ): number {
        if (!loc1 || !loc2) return Infinity;

        const [lat1, lon1] = loc1;
        const [lat2, lon2] = loc2;

        const R = 6371; // 지구 반지름 (km)
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) *
            Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance;
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }
}
