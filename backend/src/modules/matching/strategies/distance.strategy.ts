
import { BaseMatchingStrategy } from './base.strategy';
import { MatchableEntity } from '../entities/matchable-entity.interface';

export class DistanceStrategy extends BaseMatchingStrategy {
    name = 'distance';

    score(requester: MatchableEntity, candidate: MatchableEntity): number {
        // Check if location data exists
        if (!requester.profile.location || !candidate.profile.location) {
            return 0;
        }

        // Calculate distance (Haversine formula)
        const distance = this.calculateDistance(
            requester.profile.location,
            candidate.profile.location,
        );

        // Distance based score (closer is better)
        // Example: <1km = 100, <5km = 80, <10km = 50, <20km = 30, else 10
        let distanceScore = 0;
        if (distance <= 1) distanceScore = 100;
        else if (distance <= 5) distanceScore = 80;
        else if (distance <= 10) distanceScore = 50;
        else if (distance <= 20) distanceScore = 30;
        else distanceScore = 10;

        // Optional: Rating Score
        const ratingScore = candidate.profile.averageRating
            ? candidate.profile.averageRating * 10
            : 50;

        // Final Score (Weighted Average)
        const finalScore = distanceScore * 0.7 + ratingScore * 0.3;

        return Math.round(finalScore * 100) / 100; // Round to 2 decimal places
    }

    private calculateDistance(
        loc1: [number, number],
        loc2: [number, number],
    ): number {
        if (!loc1 || !loc2) return Infinity;

        const [lat1, lon1] = loc1;
        const [lat2, lon2] = loc2;

        const R = 6371; // Earth Radius (km)
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) *
            Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance;
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }
}
