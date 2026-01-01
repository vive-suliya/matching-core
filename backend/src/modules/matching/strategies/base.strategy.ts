import { Match, MatchableEntity } from '../entities/matchable-entity.interface';

export interface MatchingStrategy {
    name: string;
    execute(requester: MatchableEntity, candidates: MatchableEntity[], settings?: any): Match[];
}

export abstract class BaseMatchingStrategy implements MatchingStrategy {
    abstract name: string;

    abstract score(
        requester: MatchableEntity,
        candidate: MatchableEntity,
    ): number;

    execute(
        requester: MatchableEntity,
        candidates: MatchableEntity[],
        settings?: any,
    ): Match[] {
        return candidates
            .map(candidate => {
                const finalScore = this.score(requester, candidate);

                // 매칭 사유 생성 (Explanation Toggle)
                let explanation = '';
                if (settings?.enableExplanation) {
                    explanation = this.generateExplanation(requester, candidate, finalScore);
                }

                return {
                    entities: [requester, candidate],
                    score: finalScore,
                    status: 'proposed' as const,
                    metadata: {
                        distance: candidate.profile?.distance,
                        explanation: explanation
                    },
                };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
    }

    protected generateExplanation(requester: MatchableEntity, candidate: MatchableEntity, score: number): string {
        return `Matching score: ${score.toFixed(1)}%`;
    }
}
