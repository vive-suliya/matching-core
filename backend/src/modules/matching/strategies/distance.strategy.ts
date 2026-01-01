
import { BaseMatchingStrategy } from './base.strategy';
import { Match, MatchableEntity } from '../entities/matchable-entity.interface';
import { PreferenceStrategy } from './preference.strategy';

export class DistanceStrategy extends BaseMatchingStrategy {
    name = 'distance';
    private preferenceStrategy = new PreferenceStrategy();

    score(requester: MatchableEntity, candidate: MatchableEntity): number {
        // DB에서 미리 계산된 거리가 있다면 사용 (미터 단위 -> 킬로미터 단위 변환)
        let distance = candidate.profile.distance !== undefined ? candidate.profile.distance / 1000 : undefined;

        // 데이터가 없으면 직접 계산 (Fallback)
        if (distance === undefined) {
            if (!requester.profile.location || !candidate.profile.location) {
                return 0;
            }
            distance = this.calculateDistance(
                requester.profile.location,
                candidate.profile.location,
            );
        }

        // Distance based score (closer is better)
        let distanceScore = 0;
        if (distance <= 0.5) distanceScore = 100;
        else if (distance <= 1) distanceScore = 95;
        else if (distance <= 3) distanceScore = 85;
        else if (distance <= 5) distanceScore = 70;
        else if (distance <= 10) distanceScore = 50;
        else if (distance <= 20) distanceScore = 30;
        else distanceScore = 10;

        // Rating Score
        const ratingScore = candidate.profile.averageRating
            ? candidate.profile.averageRating * 10
            : 70;

        // Final Score
        const finalScore = distanceScore * 0.8 + ratingScore * 0.2;

        return Math.round(finalScore * 100) / 100;
    }

    execute(requester: MatchableEntity, candidates: MatchableEntity[], settings?: any): Match[] {
        return candidates
            .map(candidate => {
                const finalScore = this.score(requester, candidate);
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

    private calculateDistance(
        loc1: [number, number],
        loc2: [number, number],
    ): number {
        if (!loc1 || !loc2) return Infinity;

        const [lat1, lon1] = loc1;
        const [lat2, lon2] = loc2;

        const R = 6371; // Earth Radius (km)
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
