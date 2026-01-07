
import { BaseMatchingStrategy } from './base.strategy';
import { Match, MatchableEntity } from '../entities/matchable-entity.interface';
import { PreferenceStrategy } from './preference.strategy';

export class DistanceStrategy extends BaseMatchingStrategy {
    name = 'distance';
    private preferenceStrategy = new PreferenceStrategy();

    /**
     * ==================================================================================
     * [SECTION] Score Calculation
     * ==================================================================================
     */

    /**
     * Calculate Score
     * 
     * Computes a score primarily based on physical distance.
     * Closer candidates receive significantly higher scores.
     * 
     * Logic:
     * 1. Check for pre-calculated distance from PostGIS (preferred).
     * 2. Fallback to Haversine formula if DB distance is missing.
     * 3. Apply non-linear decay function to distance (exponential drop-off).
     * 4. Add small weight (20%) for rating/reputation.
     * 
     * @param requester - The entity requesting the match
     * @param candidate - The potential match candidate
     * @returns {number} Score (0-100)
     */
    score(requester: MatchableEntity, candidate: MatchableEntity): number {
        // 1. Get Distance (Use DB calculated value if available for performance)
        let distance = candidate.profile.distance !== undefined ? candidate.profile.distance / 1000 : undefined;

        // 2. Fallback Calculation (Haversine)
        if (distance === undefined) {
            if (!requester.profile.location || !candidate.profile.location) {
                return 0; // No location, impossible to match by distance
            }
            distance = this.calculateDistance(
                requester.profile.location,
                candidate.profile.location,
            );
        }

        // 3. Distance Scoring Rule (Step Function)
        // Closer is better. 0.5km is perfect score.
        let distanceScore = 0;
        if (distance <= 0.5) distanceScore = 100;
        else if (distance <= 1) distanceScore = 95;
        else if (distance <= 3) distanceScore = 85;
        else if (distance <= 5) distanceScore = 70;
        else if (distance <= 10) distanceScore = 50;
        else if (distance <= 20) distanceScore = 30;
        else distanceScore = 10;

        // 4. Rating Bonus (20% Weight)
        // High rated entities get a slight boost even if further away
        const ratingScore = candidate.profile.averageRating
            ? candidate.profile.averageRating * 10
            : 70; // Default rating

        // Final Weighted Score
        const finalScore = distanceScore * 0.8 + ratingScore * 0.2;

        return Math.round(finalScore * 100) / 100;
    }

    /**
     * Measure & Rank Candidates
     * 
     * Iterates through all candidates, scores them, and returns the top 50 matches.
     */
    execute(requester: MatchableEntity, candidates: MatchableEntity[], settings?: any): Match[] {
        return candidates
            .map(candidate => {
                const finalScore = this.score(requester, candidate);

                // Calculate preference match score for metadata/debug
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
     * [SECTION] Geometric Utilities
     * ==================================================================================
     */

    /**
     * Haversine Formula
     * Calculates great-circle distance between two points on a sphere.
     */
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
