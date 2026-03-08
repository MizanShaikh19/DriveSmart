import { calculateDistance, calculateEstimatedFare } from './geoUtils';

const p1 = { lat: 28.6139, lng: 77.2090 }; // New Delhi
const p2 = { lat: 19.0760, lng: 72.8777 }; // Mumbai

console.log('--- GeoUtils Verification ---');

// Distance check
const dist = calculateDistance(p1, p2);
console.log(`Distance New Delhi -> Mumbai: ${dist.toFixed(2)} KM (Expected ~1400-1500 with buffer)`);

if (dist > 1400 && dist < 1600) {
    console.log('✅ Distance calculation within expected road-buffer range.');
} else {
    console.log('❌ Distance calculation outside expected range.');
}

// Fare check
const fare = calculateEstimatedFare(10); // 10km
console.log(`Fare for 10KM: ₹${fare} (Expected: 50 + 10*15 = 200)`);

if (fare === 200) {
    console.log('✅ Fare calculation correct.');
} else {
    console.log('❌ Fare calculation incorrect.');
}

const minFare = calculateEstimatedFare(1); // 1km
console.log(`Min Fare for 1KM: ₹${minFare} (Expected: 100)`);

if (minFare === 100) {
    console.log('✅ Minimum fare guard working.');
} else {
    console.log('❌ Minimum fare guard failed.');
}
