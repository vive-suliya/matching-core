import { Match, MatchableEntity } from '../entities/matchable-entity.interface';

/**
 * 매칭 전략 인터페이스
 * 모든 매칭 알고리즘이 구현해야 하는 기본 구조를 정의합니다.
 */
export interface MatchingStrategy {
    name: string;
    /**
     * 매칭 실행 메서드
     * @param requester 매칭을 요청한 주체
     * @param candidates 검색된 후보군
     * @param settings 추가 전략 설정
     */
    execute(requester: MatchableEntity, candidates: MatchableEntity[], settings?: any): Match[];
}

/**
 * 기본 매칭 전략 추상 클래스
 * 공통적인 매칭 로직(점수 계산 기반 정렬, 설명 생성 등)을 포함합니다.
 */
export abstract class BaseMatchingStrategy implements MatchingStrategy {
    abstract name: string;

    /**
     * 두 엔티티 간의 점수를 계산하는 추상 메서드
     * 각 구체적인 전략 클래스에서 실제 알고리즘을 구현합니다.
     */
    abstract score(
        requester: MatchableEntity,
        candidate: MatchableEntity,
    ): number;

    /**
     * 매칭 실행 (기본 구현)
     * 1. 모든 후보에 대해 점수를 매깁니다.
     * 2. 점수 높은 순으로 정렬합니다.
     * 3. 상위 결과를 반환합니다.
     */
    execute(
        requester: MatchableEntity,
        candidates: MatchableEntity[],
        settings?: any,
    ): Match[] {
        return candidates
            .map(candidate => {
                const finalScore = this.score(requester, candidate);

                // 매칭 사유 생성 (Explanation Toggle이 활성화된 경우)
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

    /**
     * 사용자에게 보여줄 매칭 사유 생성 (폴백 구현)
     */
    protected generateExplanation(requester: MatchableEntity, candidate: MatchableEntity, score: number): string {
        return `매칭 점수: ${score.toFixed(1)}%`;
    }
}
