import { PreferenceStrategy } from '../preference.strategy';
import { MatchableEntity } from '../../entities/matchable-entity.interface';

describe('PreferenceStrategy', () => {
    let strategy: PreferenceStrategy;

    beforeEach(() => {
        strategy = new PreferenceStrategy();
    });

    const createEntity = (id: string, categories: string[]): MatchableEntity => ({
        id,
        type: 'user',
        profile: { categories }
    });

    it('should return 0 when requester has no categories', () => {
        const requester = createEntity('1', []);
        const candidate = createEntity('2', ['sports']);
        expect(strategy.score(requester, candidate)).toBe(0);
    });

    it('should return 0 when candidate has no categories', () => {
        const requester = createEntity('1', ['sports']);
        const candidate = createEntity('2', []);
        expect(strategy.score(requester, candidate)).toBe(0);
    });

    it('should return 100 when all categories match exactly', () => {
        const requester = createEntity('1', ['sports', 'gaming']);
        const candidate = createEntity('2', ['sports', 'gaming']);
        expect(strategy.score(requester, candidate)).toBe(100);
    });

    it('should return 100 when candidate has all requester categories plus more', () => {
        const requester = createEntity('1', ['sports', 'gaming']);
        const candidate = createEntity('2', ['sports', 'gaming', 'travel']);
        expect(strategy.score(requester, candidate)).toBe(100);
    });

    it('should return 50 when requester has 2 categories and candidate has only 1 matching', () => {
        const requester = createEntity('1', ['sports', 'gaming']);
        const candidate = createEntity('2', ['sports', 'study']);
        expect(strategy.score(requester, candidate)).toBe(50);
    });

    it('should return 100 when requester has 1 category and it matches', () => {
        const requester = createEntity('1', ['sports']);
        const candidate = createEntity('2', ['sports', 'gaming']);
        expect(strategy.score(requester, candidate)).toBe(100);
    });

    it('should handle case-sensitive matches (current impl is case-sensitive)', () => {
        const requester = createEntity('1', ['Sports']);
        const candidate = createEntity('2', ['sports']);
        expect(strategy.score(requester, candidate)).toBe(0);
    });
});
