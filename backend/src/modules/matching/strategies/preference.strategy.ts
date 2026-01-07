import { Match, MatchableEntity } from '../entities/matchable-entity.interface';
import { BaseMatchingStrategy } from './base.strategy';

export class PreferenceStrategy extends BaseMatchingStrategy {
    name = 'preference';

    /**
     * 선호도 점수 계산
     * 
     * 요청자와 후보자 간의 공통 카테고리(관심사/태그)를 기반으로 점수를 계산합니다.
     * 자카드 유사도(Jaccard Similarity) 변형 방식으로 일치율을 측정합니다.
     * 
     * @param requester - 매칭을 요청하는 엔티티
     * @param candidate - 잠재적 매칭 후보
     * @returns {number} 점수 (0-100)
     */
    score(requester: MatchableEntity, candidate: MatchableEntity): number {
        const requesterCats = requester.profile?.categories || [];
        const candidateCats = candidate.profile?.categories || [];

        if (requesterCats.length === 0 || candidateCats.length === 0) {
            return 0;
        }

        // 공통 카테고리 추출
        const common = requesterCats.filter((cat: string) => candidateCats.includes(cat));

        // 요청자 카테고리 대비 얼마나 일치하는지 비율 계산
        const score = (common.length / requesterCats.length) * 100;

        return Math.min(score, 100);
    }

    /**
     * 선호도 기반 매칭 실행
     * 
     * 모든 후보의 관심사를 비교하여 점수를 매기고 상위 50명의 매치를 반환합니다.
     */
    execute(requester: MatchableEntity, candidates: MatchableEntity[], settings?: any): Match[] {
        return candidates
            .map(candidate => {
                // DB에서 미리 계산된 카테고리 일치 점수가 있으면 사용 (성능 최적화)
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
