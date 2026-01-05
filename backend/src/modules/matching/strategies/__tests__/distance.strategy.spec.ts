import { DistanceStrategy } from '../distance.strategy';
import { MatchableEntity } from '../../entities/matchable-entity.interface';

describe('DistanceStrategy', () => {
    let strategy: DistanceStrategy;

    beforeEach(() => {
        strategy = new DistanceStrategy();
    });

    const createEntity = (id: string, lat: number, lng: number, distance?: number, rating?: number): MatchableEntity => ({
        id,
        type: 'user',
        profile: {
            location: [lat, lng],
            distance: distance, // distance in meters
            averageRating: rating
        }
    });

    it('should return 100 when distance is very close (PostGIS pre-calculated)', () => {
        const requester = createEntity('req', 37.5665, 126.9780);
        const candidate = createEntity('can', 37.5666, 126.9781, 100, 5); // 100m, 5 rating

        // distance <= 0.5km -> 100 score + (5 rating -> 50 score)
        // (100 * 0.8) + (50 * 0.2) = 80 + 10 = 90 (Wait, rating score is rating * 10)
        // (100 * 0.8) + (50 * 0.2) = 90
        expect(strategy.score(requester, candidate)).toBe(90);
    });

    it('should return 50 score for distance 10km (PostGIS pre-calculated)', () => {
        const requester = createEntity('req', 37.5665, 126.9780);
        const candidate = createEntity('can', 37.6665, 127.0780, 10000, 5); // 10km, 5 rating

        // 10km -> 50 score
        // (50 * 0.8) + (50 * 0.2) = 40 + 10 = 50
        expect(strategy.score(requester, candidate)).toBe(50);
    });

    it('should fallback to Haversine calculation if distance is missing', () => {
        // Seoul City Hall to Gangnam Station is roughly 10km
        const seoulCityHall = createEntity('req', 37.5665, 126.9780);
        const gangnamStation = createEntity('can', 37.4979, 127.0276, undefined, 5);

        const score = strategy.score(seoulCityHall, gangnamStation);
        expect(score).toBeGreaterThan(0);
        expect(score).toBeLessThan(100);
    });

    it('should respect rating weight', () => {
        const requester = createEntity('req', 37.5665, 126.9780);
        const candidateHighRating = createEntity('high', 37.5665, 126.9780, 100, 10); // 100m, 10 rating
        const candidateLowRating = createEntity('low', 37.5665, 126.9780, 100, 1);   // 100m, 1 rating

        const highMatch = strategy.score(requester, candidateHighRating);
        const lowMatch = strategy.score(requester, candidateLowRating);

        expect(highMatch).toBeGreaterThan(lowMatch);
    });
});
