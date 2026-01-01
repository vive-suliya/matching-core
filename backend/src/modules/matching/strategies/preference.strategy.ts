import { Match, MatchableEntity } from '../entities/matchable-entity.interface';
import { BaseMatchingStrategy } from './base.strategy';

export class PreferenceStrategy extends BaseMatchingStrategy {
    name = 'preference';

    score(requester: MatchableEntity, candidate: MatchableEntity): number {
        const requesterCats = requester.profile?.categories || [];
        const candidateCats = candidate.profile?.categories || [];

        if (requesterCats.length === 0 || candidateCats.length === 0) {
            return 0;
        }

        const common = requesterCats.filter((cat: string) => candidateCats.includes(cat));
        const score = (common.length / requesterCats.length) * 100;

        return Math.min(score, 100);
    }

    execute(requester: MatchableEntity, candidates: MatchableEntity[], settings?: any): Match[] {
        return candidates
            .map(candidate => {
                const pScore = candidate.profile?.category_match_score !== undefined
                    ? Number(candidate.profile.category_match_score)
                    : this.score(requester, candidate);

                let explanation = '';
                if (settings?.enableExplanation) {
                    explanation = `공통 관심사 기반으로 ${pScore.toFixed(0)}% 일치합니다.`;
                }

                return {
                    entities: [requester, candidate],
                    score: pScore,
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
}
