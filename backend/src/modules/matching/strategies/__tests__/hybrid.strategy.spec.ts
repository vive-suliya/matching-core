import { HybridStrategy } from '../hybrid.strategy';
import { MatchableEntity } from '../../entities/matchable-entity.interface';

describe('HybridStrategy', () => {
    let strategy: HybridStrategy;

    beforeEach(() => {
        strategy = new HybridStrategy();
    });

    describe('execute()', () => {
        it('should combine distance and preference scores with default weights (0.7/0.3)', () => {
            const requester: MatchableEntity = {
                id: '1',
                type: 'user',
                profile: {
                    location: [37.5665, 126.9780],
                    categories: ['sports', 'gaming']
                }
            };

            const candidates: MatchableEntity[] = [{
                id: 'candidate-1',
                type: 'user',
                profile: {
                    distance: 500,  // 0.5km → 100점 (거리)
                    categories: ['sports', 'gaming'],  // 100% 일치 (성향)
                    category_match_score: 100
                }
            }];

            const matches = strategy.execute(requester, candidates);

            // (100 * 0.7) + (100 * 0.3) = 100
            // Note: rating score is also part of distance score (20%)
            // If candidate has no rating, it gets 70.
            // Distance sub-score: 100*0.8 + 70*0.2 = 94.
            // Total: 94 * 0.7 + 100 * 0.3 = 65.8 + 30 = 95.8
            // Let's check with expected logic in hybrid strategy
            // Hybrid strategy calls distanceStrategy.score() internally

            expect(matches[0].score).toBeGreaterThan(90);
        });

        it('should respect custom weight settings', () => {
            const requester: MatchableEntity = {
                id: '1',
                type: 'user',
                profile: {
                    location: [37.5665, 126.9780],
                    categories: ['sports']
                }
            };

            const candidates: MatchableEntity[] = [{
                id: 'candidate-1',
                type: 'user',
                profile: {
                    distance: 500,  // High distance score
                    categories: ['gaming'],  // 0% match
                    category_match_score: 0
                }
            }];

            const settings = { distanceWeight: 0.9, preferenceWeight: 0.1 };
            const matches = strategy.execute(requester, candidates, settings);

            // Should be dominated by distance score (high)
            expect(matches[0].score).toBeGreaterThan(80);

            const settingsPreference = { distanceWeight: 0.1, preferenceWeight: 0.9 };
            const matchesPreference = strategy.execute(requester, candidates, settingsPreference);

            // Should be dominated by preference score (low/zero)
            expect(matchesPreference[0].score).toBeLessThan(50);
        });

        it('should use DB category_match_score if available', () => {
            const requester: MatchableEntity = {
                id: '1',
                type: 'user',
                profile: {
                    location: [37.5665, 126.9780],
                    categories: ['sports', 'gaming']
                }
            };

            const candidates: MatchableEntity[] = [{
                id: 'candidate-1',
                type: 'user',
                profile: {
                    distance: 1000,
                    categories: ['sports'],
                    category_match_score: 75  // DB score used directly
                }
            }];

            const matches = strategy.execute(requester, candidates);

            expect(matches[0].metadata.preferenceMatch).toBe(75);
        });

        it('should fallback to runtime calculation when DB score is missing', () => {
            const requester: MatchableEntity = {
                id: '1',
                type: 'user',
                profile: {
                    location: [37.5665, 126.9780],
                    categories: ['sports', 'gaming']
                }
            };

            const candidates: MatchableEntity[] = [{
                id: 'candidate-1',
                type: 'user',
                profile: {
                    distance: 1000,
                    categories: ['sports']  // 1 out of 2 = 50%
                    // no category_match_score
                }
            }];

            const matches = strategy.execute(requester, candidates);

            // Runtime calc: 50
            expect(matches[0].metadata.preferenceMatch).toBe(50);
        });

        it('should generate detailed explanation with common categories', () => {
            const requester: MatchableEntity = {
                id: '1',
                type: 'user',
                profile: {
                    location: [37.5665, 126.9780],
                    categories: ['sports', 'gaming']
                }
            };

            const candidates: MatchableEntity[] = [{
                id: 'candidate-1',
                type: 'user',
                profile: {
                    distance: 1200,
                    categories: ['sports', 'travel'],
                    common_categories: ['sports']  // DB provided
                }
            }];

            const settings = { enableExplanation: true };
            const matches = strategy.execute(requester, candidates, settings);

            expect(matches[0].metadata.explanation).toContain('sports');
            expect(matches[0].metadata.explanation).toContain('거리');
            expect(matches[0].metadata.explanation).toContain('점');
        });

        it('should include both scores in metadata', () => {
            const requester: MatchableEntity = {
                id: '1',
                type: 'user',
                profile: {
                    location: [37.5665, 126.9780],
                    categories: ['sports']
                }
            };

            const candidates: MatchableEntity[] = [{
                id: 'candidate-1',
                type: 'user',
                profile: {
                    distance: 1000,
                    categories: ['sports'],
                    category_match_score: 100
                }
            }];

            const matches = strategy.execute(requester, candidates);

            expect(matches[0].metadata).toHaveProperty('distanceScore');
            expect(matches[0].metadata).toHaveProperty('preferenceMatch');
            expect(matches[0].metadata.distanceScore).toBeGreaterThan(0);
            expect(matches[0].metadata.preferenceMatch).toBe(100);
        });
    });
});
