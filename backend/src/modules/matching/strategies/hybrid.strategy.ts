import { Match, MatchableEntity } from '../entities/matchable-entity.interface';
import { BaseMatchingStrategy } from './base.strategy';
import { DistanceStrategy } from './distance.strategy';
import { PreferenceStrategy } from './preference.strategy';

export class HybridStrategy extends BaseMatchingStrategy {
    name = 'hybrid';
    private distanceStrategy = new DistanceStrategy();
    private preferenceStrategy = new PreferenceStrategy();

    /**
     * 임시 점수 메서드.
     * 하이브리드 전략에서 점수 로직은 동적 가중치를 처리하기 위해 execute() 내부에 포함되어 있습니다.
     */
    score(requester: MatchableEntity, candidate: MatchableEntity): number {
        return 0;
    }

    /**
     * 하이브리드 매칭 실행
     * 
     * 거리 점수와 선호도 점수를 가중 평균을 사용하여 결합합니다.
     * StrategySettings를 통해 가중치를 동적으로 조정할 수 있습니다 (예: 취향보다 거리를 우선시).
     * 
     * 공식: 최종 점수 = (거리 점수 * 거리 가중치) + (선호도 점수 * 선호도 가중치)
     * 
     * @param requester - 매칭을 요청하는 엔티티
     * @param candidates - 잠재적 매칭 후보 리스트
     * @param settings - 가중치를 포함한 설정 (distanceWeight, preferenceWeight)
     * @returns {Match[]} 순위가 지정된 매칭 결과 리스트
     */
    execute(requester: MatchableEntity, candidates: MatchableEntity[], settings?: any): Match[] {
        const wDistance = settings?.distanceWeight ?? 0.7; // 기본값: 거리 우선 (70%)
        const wPreference = settings?.preferenceWeight ?? 0.3; // 기본값: 선호도 보조 (30%)

        return candidates
            .map(candidate => {
                // 1. 개별 점수 계산
                // 가능하면 DB에서 미리 계산된 점수를 사용하고, 그렇지 않으면 즉석에서 계산합니다.
                const dScore = this.distanceStrategy.score(requester, candidate);

                const pScore = candidate.profile?.category_match_score !== undefined
                    ? Number(candidate.profile.category_match_score)
                    : this.preferenceStrategy.score(requester, candidate);

                // 2. 가중 평균 계산
                const finalScore = (dScore * wDistance) + (pScore * wPreference);

                // 3. 설명 생성 (선택 사항)
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
            .sort((a, b) => b.score - a.score) // 최종 점수 내림차순 정렬
            .slice(0, 10); // 상위 10개 반환
    }

    /**
     * 사람이 읽을 수 있는 설명 생성
     * 이 매치가 선택된 이유를 설명하는 요약 문자열을 만듭니다.
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
