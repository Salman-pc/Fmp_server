import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateHaversineDistance, isValidCoordinates } from '../utils/distance.js';

test('Distance Utility - isValidCoordinates', () => {
  assert.equal(isValidCoordinates(10.0, 76.3), true);
  assert.equal(isValidCoordinates(-90.0, 180.0), true);
  assert.equal(isValidCoordinates(91.0, 76.3), false);
  assert.equal(isValidCoordinates(10.0, 181.0), false);
  assert.equal(isValidCoordinates('invalid', 76.3), false);
});

test('Distance Utility - calculateHaversineDistance', () => {
  // Test distance between Lulu Mall Kochi (10.0261, 76.3082) and nearby point (~100m away)
  const lat1 = 10.0261;
  const lon1 = 76.3082;
  const lat2 = 10.0269;
  const lon2 = 76.3082;

  const distance = calculateHaversineDistance(lat1, lon1, lat2, lon2);
  assert.ok(distance > 80 && distance < 110, `Expected ~89m, got ${distance}m`);
});

test('Distance Utility - Same point distance is 0', () => {
  const dist = calculateHaversineDistance(10.0, 76.0, 10.0, 76.0);
  assert.equal(dist, 0);
});
