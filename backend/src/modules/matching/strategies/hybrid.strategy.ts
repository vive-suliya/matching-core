import { Match, MatchableEntity } from '../entities/matchable-entity.interface';
import { BaseMatchingStrategy } from './base.strategy';
import { DistanceStrategy } from './distance.strategy';
import { PreferenceStrategy } from './preference.strategy';

export class HybridStrategy extends BaseMatchingStrategy {
    name = 'hybrid';
    private distanceStrategy = new DistanceStrategy();
    private preferenceStrategy = new PreferenceStrategy();

    /**
     * Placeholder score method.
     * In Hybrid strategy, scoring logic is embedded in execute() to handle dynamic weights.
     */
    score(requester: MatchableEntity, candidate: MatchableEntity): number {
        return 0;
    }

    /**
     * Execute Hybrid Matching
     * 
     * Combines Distance and Preference scores using a weighted average.
     * Allows dynamic tuning of weights via StrategySettings (e.g., prioritize distance over taste).
     * 
     * Formula: Final = (DistanceScore * Weight_D) + (PreferenceScore * Weight_P)
     * 
     * @param requester - The entity requesting the match
     * @param candidates - List of potential matches
     * @param settings - Configuration including weights (distanceWeight, preferenceWeight)
     * @returns {Match[]} Ranked list of matches
     */
    execute(requester: MatchableEntity, candidates: MatchableEntity[], settings?: any): Match[] {
        const wDistance = settings?.distanceWeight ?? 0.7; // Default: Distance dominant (70%)
        const wPreference = settings?.preferenceWeight ?? 0.3; // Default: Preference secondary (30%)

        return candidates
            .map(candidate => {
                // 1. Calculate Component Scores
                // Use DB pre-calculated scores if available, otherwise calculate on-the-fly
                const dScore = this.distanceStrategy.score(requester, candidate);

                const pScore = candidate.profile?.category_match_score !== undefined
                    ? Number(candidate.profile.category_match_score)
                    : this.preferenceStrategy.score(requester, candidate);

                // 2. Weighted Average
                const finalScore = (dScore * wDistance) + (pScore * wPreference);

                // 3. Generate Explanation (Optional)
                let explanation = '';
                if (settings?.enableExplanation) {
                    explanation = this.generateExplanation(requester, candidate, finalScore, dScore, pScore, wDistance, wPreference);
                }

                return {
                    entities: [requester, candidate],
                    score: Math.round(finalScore * 100) / 100,
                    status: 'proposed' as const,
                    metadata: {
                        distance: candidate.profile?.distance,
                        explanation: explanation,
                        distanceScore: dScore,
                        preferenceMatch: pScore
                    },
                };
            })
            .sort((a, b) => b.score - a.score) // Sort by Final Score Descending
            .slice(0, 10); // Return Top 10
    }

    /**
     * Generate Human-Readable Explanation
     * Creates a summary string explaining why this match was chosen.
     */
    protected generateExplanation(
        requester: MatchableEntity,
        candidate: MatchableEntity,
        score: number,
        dScore?: number,
        pScore?: number,
        wD?: number,
        wP?: number
    ): string {
        const dist = candidate.profile?.distance ? (candidate.profile.distance / 1000).toFixed(1) + 'km' : 'unknown';
        const commonCats = candidate.profile?.common_categories ||
            requester.profile?.categories?.filter((c: string) => candidate.profile?.categories?.includes(c)) || [];

        let msg = `종합 점수 ${score.toFixed(1)}점입니다. `;
        if (commonCats.length > 0) {
            msg += `관심사(${commonCats.join(', ')})가 일치하며, `;
        }
        msg += `거리는 약 ${dist}입니다.`;

        return msg;
    }
}
