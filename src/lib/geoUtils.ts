/**
 * Centralized Geodata & Financial Logic
 */

export interface Coordinates {
    lat: number;
    lng: number;
}

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates Haversine distance between two points in KM with a 30% road-buffer.
 */
export function calculateDistance(p1: Coordinates, p2: Coordinates): number {
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLon = (p2.lng - p1.lng) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = EARTH_RADIUS_KM * c;
    return distanceKm * 1.3; // Road correction factor
}

/**
 * Estimates fare based on distance and standard rates
 */
export function calculateEstimatedFare(distanceKm: number): number {
    const BASE_FARE = 50;
    const RATE_PER_KM = 15;
    const MINIMUM_FARE = 100;
    const fare = BASE_FARE + (distanceKm * RATE_PER_KM);
    return Math.max(MINIMUM_FARE, Math.round(fare));
}

/**
 * Parses Postgres Point string into Coordinates object
 * Example: "POINT(77.209 28.6139)" -> { lat: 28.6139, lng: 77.209 }
 */
export function parsePostgresPoint(pointStr: string | null): Coordinates | null {
    if (!pointStr) return null;
    const match = pointStr.match(/POINT\(([-.\d]+)\s([-.\d]+)\)/);
    if (!match) return null;
    return {
        lat: parseFloat(match[2]),
        lng: parseFloat(match[1])
    };
}

/**
 * Formats coordinates into Postgres Point string
 */
export function formatPostgresPoint(coords: Coordinates): string {
    return `POINT(${coords.lng} ${coords.lat})`;
}
