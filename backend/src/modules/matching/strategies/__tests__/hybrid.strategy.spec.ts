import { HybridStrategy } from '../hybrid.strategy';
import { MatchableEntity } from '../../entities/matchable-entity.interface';
import { StrategySettings } from '../../dto/strategy-settings.dto';

describe('HybridStrategy', () => {
    let strategy: HybridStrategy;

    beforeEach(() => {
        strategy = new HybridStrategy();
    });

    const createEntity = (id: string, lat: number, lng: number, categories: string[], distance?: number, matchScore?: number): MatchableEntity => ({
        id,
        type: 'user',
        profile: {
            display_name: `User ${id}`,
            location: [lat, lng],
            categories,
            distance,
            category_match_score: matchScore
        }
    });

    const mockSettings: StrategySettings = {
        useDistance: true,
        usePreference: true,
        distanceWeight: 0.7,
        preferenceWeight: 0.3,
        enableExplanation: true,
        enableNegativeFilter: false
    };

    it('should combine distance and preference scores correctly', () => {
        const requester = createEntity('req', 37.5665, 126.9780, ['sports', 'gaming']);
        const candidates = [
            // Close (90 score), 50% category match (50 score)
            // (90 * 0.7) + (50 * 0.3) = 63 + 15 = 78
            createEntity('can1', 37.5666, 126.9781, ['sports'], 100),
        ];

        const results = strategy.execute(requester, candidates, mockSettings);

        expect(results.length).toBe(1);
        expect(results[0].score).toBe(78);
    });

    it('should generate an explanation when enabled', () => {
        const requester = createEntity('req', 37.5665, 126.9780, ['sports', 'gaming']);
        const candidates = [
            createEntity('can1', 37.5666, 126.9781, ['sports'], 100),
        ];

        const results = strategy.execute(requester, candidates, mockSettings);

        expect(results[0].metadata.explanation).toBeDefined();
        expect(results[0].metadata.explanation).toContain('sports');
        expect(results[0].metadata.explanation).toContain('0.1km');
    });

    it('should sort results by final score descending', () => {
        const requester = createEntity('req', 37.5665, 126.9780, ['sports', 'gaming']);
        const candidates = [
            createEntity('can_far', 37.9999, 127.9999, ['sports', 'gaming'], 50000), // Far, match
            createEntity('can_close', 37.5666, 126.9781, ['sports', 'gaming'], 100),  // Close, match
        ];

        const results = strategy.execute(requester, candidates, mockSettings);

        expect(results[0].entities[1].id).toBe('can_close');
        expect(results[0].score).toBeGreaterThan(results[1].score);
    });

    it('should respect custom weights', () => {
        const requester = createEntity('req', 37.5665, 126.9780, ['sports']);
        const candidates = [
            createEntity('can', 37.5666, 126.9781, ['gaming'], 100), // Close, no match
        ];

        // 100% distance weight
        const distanceOnlySettings = { ...mockSettings, distanceWeight: 1.0, preferenceWeight: 0.0 };
        const res1 = strategy.execute(requester, candidates, distanceOnlySettings);

        // 100% preference weight
        const preferenceOnlySettings = { ...mockSettings, distanceWeight: 0.0, preferenceWeight: 1.0 };
        const res2 = strategy.execute(requester, candidates, preferenceOnlySettings);

        expect(res1[0].score).toBeGreaterThan(0); // Distance score
        expect(res2[0].score).toBe(0);           // No category match
    });
});
