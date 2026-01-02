import { Match, MatchableEntity } from '../entities/matchable-entity.interface';
import { BaseMatchingStrategy } from './base.strategy';
import { DistanceStrategy } from './distance.strategy';
import { PreferenceStrategy } from './preference.strategy';

export class HybridStrategy extends BaseMatchingStrategy {
    name = 'hybrid';
    private distanceStrategy = new DistanceStrategy();
    private preferenceStrategy = new PreferenceStrategy();

    score(requester: MatchableEntity, candidate: MatchableEntity): number {
        // This will be called by BaseMatchingStrategy.execute if no settings provided,
        // but Hybrid usually needs weights.
        return 0;
    }

    execute(requester: MatchableEntity, candidates: MatchableEntity[], settings?: any): Match[] {
        const wDistance = settings?.distanceWeight ?? 0.7;
        const wPreference = settings?.preferenceWeight ?? 0.3;

        return candidates
            .map(candidate => {
                // DB에서 계산된 점수가 있으면 우선 사용, 없으면 전략 클래스로 계산
                const dScore = this.distanceStrategy.score(requester, candidate);
                const pScore = candidate.profile?.category_match_score !== undefined
                    ? Number(candidate.profile.category_match_score)
                    : this.preferenceStrategy.score(requester, candidate);

                const finalScore = (dScore * wDistance) + (pScore * wPreference);

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
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
    }

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
