import { DistanceStrategy } from '../distance.strategy';
import { MatchableEntity } from '../../entities/matchable-entity.interface';

describe('DistanceStrategy', () => {
    let strategy: DistanceStrategy;

    beforeEach(() => {
        strategy = new DistanceStrategy();
    });

    describe('score()', () => {
        it('should return 100 when distance <= 0.5km', () => {
            const requester: MatchableEntity = {
                id: '1',
                type: 'user',
                profile: { location: [37.5665, 126.9780] }
            };
            const candidate: MatchableEntity = {
                id: '2',
                type: 'user',
                profile: {
                    location: [37.5670, 126.9785],
                    distance: 50  // 50m
                }
            };

            const score = strategy.score(requester, candidate);
            // default rating 70, distance 100 -> 100*0.8 + 70*0.2 = 94
            expect(score).toBeGreaterThanOrEqual(94);
        });

        it('should return ~95 when distance <= 1km', () => {
            const requester: MatchableEntity = {
                id: '1',
                type: 'user',
                profile: { location: [37.5665, 126.9780] }
            };
            const candidate: MatchableEntity = {
                id: '2',
                type: 'user',
                profile: { distance: 800 }  // 0.8km
            };

            // 800m -> score calculation logic specific
            const score = strategy.score(requester, candidate);
            expect(score).toBeGreaterThanOrEqual(89);
            expect(score).toBeLessThanOrEqual(95);
        });

        it('should use DB pre-calculated distance if available', () => {
            const requester: MatchableEntity = {
                id: '1',
                type: 'user',
                profile: { location: [37.5665, 126.9780] }
            };
            const candidate: MatchableEntity = {
                id: '2',
                type: 'user',
                profile: {
                    location: [37.5665, 126.9780],  // same location
                    distance: 5000  // DB says 5km
                }
            };

            const score = strategy.score(requester, candidate);
            // distance=5000m (5km) -> low distance score
            // 70 * 0.8 + 70 * 0.2 approx 70 or lower depending on curve
            // Actually checking if it uses 5000 not 0
            // If it used 0 distance (from location), score would be very high (~94)
            // With 5km, score should be much lower.
            expect(score).toBeLessThan(80);
        });

        it('should fallback to Haversine when distance is undefined', () => {
            const requester: MatchableEntity = {
                id: '1',
                type: 'user',
                profile: { location: [37.5665, 126.9780] }
            };
            const candidate: MatchableEntity = {
                id: '2',
                type: 'user',
                profile: { location: [37.5665, 126.9780] }  // no distance prop
            };

            const score = strategy.score(requester, candidate);
            expect(score).toBeGreaterThanOrEqual(94);  // Same location -> high score
        });

        it('should return 0 when location is missing', () => {
            const requester: MatchableEntity = {
                id: '1',
                type: 'user',
                profile: {}
            };
            const candidate: MatchableEntity = {
                id: '2',
                type: 'user',
                profile: { location: [37.5665, 126.9780] }
            };

            const score = strategy.score(requester, candidate);
            expect(score).toBe(0);
        });

        it('should include rating score (20% weight)', () => {
            const requester: MatchableEntity = {
                id: '1',
                type: 'user',
                profile: { location: [37.5665, 126.9780] }
            };
            const candidate: MatchableEntity = {
                id: '2',
                type: 'user',
                profile: {
                    distance: 100,  // 0.1km -> 100 points
                    averageRating: 9  // 9.0 rating -> 90 points
                }
            };

            const score = strategy.score(requester, candidate);
            // 100*0.8 + 90*0.2 = 80 + 18 = 98
            expect(score).toBe(98);
        });

        it('should use default rating (70) when missing', () => {
            const requester: MatchableEntity = {
                id: '1',
                type: 'user',
                profile: { location: [37.5665, 126.9780] }
            };
            const candidate: MatchableEntity = {
                id: '2',
                type: 'user',
                profile: { distance: 100 }
            };

            const score = strategy.score(requester, candidate);
            // 100*0.8 + 70*0.2 = 80 + 14 = 94
            expect(score).toBe(94);
        });
    });

    describe('execute()', () => {
        it('should return top candidates sorted by score', () => {
            const requester: MatchableEntity = {
                id: '1',
                type: 'user',
                profile: { location: [37.5665, 126.9780] }
            };

            const candidates: MatchableEntity[] = Array.from({ length: 10 }).map((_, i) => ({
                id: `candidate-${i}`,
                type: 'user',
                profile: {
                    distance: 1000 + i * 100, // increasing distance
                    location: [37.5665, 126.9780]
                }
            }));

            const matches = strategy.execute(requester, candidates);

            expect(matches.length).toBeGreaterThan(0);
            // First match should have higher or equal score than second
            expect(matches[0].score).toBeGreaterThanOrEqual(matches[1].score);
        });

        it('should generate explanation when enabled', () => {
            const requester: MatchableEntity = {
                id: '1',
                type: 'user',
                profile: { location: [37.5665, 126.9780] }
            };

            const candidates: MatchableEntity[] = [{
                id: 'candidate-1',
                type: 'user',
                profile: { distance: 1200 }
            }];

            const settings = { enableExplanation: true };
            const matches = strategy.execute(requester, candidates, settings);

            expect(matches[0].metadata.explanation).toContain('km');
            expect(matches[0].metadata.explanation).toContain('거리');
        });
    });
});
