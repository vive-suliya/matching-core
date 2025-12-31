import { Match, MatchableEntity } from '../entities/matchable-entity.interface';

export interface MatchingStrategy {
    name: string;
    execute(requester: MatchableEntity, candidates: MatchableEntity[]): Match[];
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
    ): Match[] {
        return candidates
            .map(candidate => ({
                entities: [requester, candidate],
                score: this.score(requester, candidate),
                status: 'proposed' as const,
                metadata: {},
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10); // Top 10
    }
}
